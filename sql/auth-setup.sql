-- ============================================================
-- Sistema de Autenticación y Roles - Supabase
-- App de Bicicletas Públicas (San Borja)
-- ============================================================
-- Instrucciones:
-- 1. Ve a tu proyecto en https://supabase.com
-- 2. Entra al SQL Editor (pestaña "SQL Editor")
-- 3. Crea un "New query"
-- 4. Pega TODO este contenido
-- 5. Presiona "Run"
-- ============================================================

-- ============================================================
-- 1. TABLA PERFILES
-- ============================================================
CREATE TABLE IF NOT EXISTS public.perfiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  nombre_completo TEXT,
  rol TEXT NOT NULL DEFAULT 'ciudadano' CHECK (rol IN ('ciudadano', 'administrador')),
  fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- 2. TRIGGER AUTOMÁTICO: crear perfil al registrarse un usuario
-- ============================================================
-- Función que se ejecuta automáticamente cuando un nuevo usuario
-- se registra en auth.users (Supabase Auth)
CREATE OR REPLACE FUNCTION public.crear_perfil_usuario()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER -- Ejecuta con privilegios elevados para poder insertar en public.perfiles
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.perfiles (id, email, nombre_completo, rol)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'nombre_completo', ''),
    'ciudadano'
  );
  RETURN NEW;
END;
$$;

-- Crear el trigger en auth.users (se ejecuta AFTER INSERT)
DROP TRIGGER IF EXISTS trigger_crear_perfil ON auth.users;
CREATE TRIGGER trigger_crear_perfil
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.crear_perfil_usuario();

-- ============================================================
-- 3. ROW LEVEL SECURITY (RLS) - TABLA PERFILES
-- ============================================================
ALTER TABLE public.perfiles ENABLE ROW LEVEL SECURITY;

-- Política: un usuario solo puede leer su propio perfil
DROP POLICY IF EXISTS "Usuarios leen su propio perfil" ON public.perfiles;
CREATE POLICY "Usuarios leen su propio perfil"
  ON public.perfiles
  FOR SELECT
  USING (auth.uid() = id);

-- Política: un usuario solo puede actualizar su propio perfil
DROP POLICY IF EXISTS "Usuarios editan su propio perfil" ON public.perfiles;
CREATE POLICY "Usuarios editan su propio perfil"
  ON public.perfiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- ============================================================
-- 4. ROW LEVEL SECURITY (RLS) - TABLA ESTACIONES
-- ============================================================
ALTER TABLE public.estaciones ENABLE ROW LEVEL SECURITY;

-- Eliminar políticas viejas si existen (las del setup inicial)
DROP POLICY IF EXISTS "Allow public read estaciones" ON public.estaciones;
DROP POLICY IF EXISTS "Cualquiera puede leer estaciones" ON public.estaciones;
DROP POLICY IF EXISTS "Solo admin puede insertar estaciones" ON public.estaciones;
DROP POLICY IF EXISTS "Solo admin puede actualizar estaciones" ON public.estaciones;
DROP POLICY IF EXISTS "Solo admin puede eliminar estaciones" ON public.estaciones;

-- Política: cualquiera puede leer estaciones (incluso sin autenticar)
CREATE POLICY "Cualquiera puede leer estaciones"
  ON public.estaciones
  FOR SELECT
  USING (true);

-- Función auxiliar: verificar si el usuario actual es administrador
CREATE OR REPLACE FUNCTION public.es_administrador()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_rol TEXT;
BEGIN
  SELECT rol INTO user_rol FROM public.perfiles WHERE id = auth.uid();
  RETURN user_rol = 'administrador';
END;
$$;

-- Política: solo administradores pueden insertar estaciones
CREATE POLICY "Solo admin puede insertar estaciones"
  ON public.estaciones
  FOR INSERT
  WITH CHECK (public.es_administrador());

-- Política: solo administradores pueden actualizar estaciones
CREATE POLICY "Solo admin puede actualizar estaciones"
  ON public.estaciones
  FOR UPDATE
  USING (public.es_administrador())
  WITH CHECK (public.es_administrador());

-- Política: solo administradores pueden eliminar estaciones
CREATE POLICY "Solo admin puede eliminar estaciones"
  ON public.estaciones
  FOR DELETE
  USING (public.es_administrador());

-- ============================================================
-- 5. ROW LEVEL SECURITY (RLS) - TABLA INCIDENCIAS
-- ============================================================
ALTER TABLE public.incidencias ENABLE ROW LEVEL SECURITY;

-- Eliminar políticas viejas si existen
DROP POLICY IF EXISTS "Allow public insert incidencias" ON public.incidencias;
DROP POLICY IF EXISTS "Allow public read incidencias" ON public.incidencias;
DROP POLICY IF EXISTS "Ciudadanos pueden insertar incidencias" ON public.incidencias;
DROP POLICY IF EXISTS "Administradores leen todas las incidencias" ON public.incidencias;

-- Política: ciudadanos autenticados pueden insertar incidencias
CREATE POLICY "Ciudadanos pueden insertar incidencias"
  ON public.incidencias
  FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL -- Cualquier usuario autenticado puede insertar
  );

-- Política: administradores pueden leer todas las incidencias
CREATE POLICY "Administradores leen todas las incidencias"
  ON public.incidencias
  FOR SELECT
  USING (public.es_administrador());

-- ============================================================
-- 6. ÍNDICES PARA RENDIMIENTO
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_perfiles_rol ON public.perfiles(rol);
CREATE INDEX IF NOT EXISTS idx_incidencias_created_at ON public.incidencias(created_at DESC);

-- ============================================================
-- 7. VERIFICACIÓN FINAL
-- ============================================================
SELECT 'Tabla perfiles creada' AS status;
SELECT 'Trigger de registro automático activo' AS status;
SELECT 'RLS activado en perfiles, estaciones e incidencias' AS status;
