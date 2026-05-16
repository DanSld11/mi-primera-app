-- ============================================================
-- Migración: agregar columna estado a tabla incidencias
-- ============================================================
-- Ejecutar en SQL Editor de Supabase
-- ============================================================

-- 1. Agregar columna estado con valor por defecto 'pendiente'
ALTER TABLE public.incidencias
ADD COLUMN IF NOT EXISTS estado TEXT NOT NULL DEFAULT 'pendiente'
CHECK (estado IN ('pendiente', 'en revision', 'resuelta'));

-- 2. Actualizar incidencias existentes a 'pendiente'
UPDATE public.incidencias SET estado = 'pendiente' WHERE estado IS NULL;

-- 3. Política RLS para que administradores puedan actualizar incidencias
DROP POLICY IF EXISTS "Administradores actualizan incidencias" ON public.incidencias;
CREATE POLICY "Administradores actualizan incidencias"
  ON public.incidencias
  FOR UPDATE
  USING (public.es_administrador())
  WITH CHECK (public.es_administrador());

-- 4. Verificación
SELECT 'Columna estado agregada a incidencias' AS status;
