-- ============================================================
-- Crear usuario administrador (SQL completo)
-- ============================================================
-- Instrucciones:
-- 1. Reemplaza 'ADMIN_EMAIL_AQUI' con el email real del admin
-- 2. Reemplaza 'ADMIN_PASSWORD_AQUI' con la contraseña deseada (mínimo 6 caracteres)
-- 3. Ejecuta TODO este script en el SQL Editor de Supabase
-- ============================================================

-- PASO 1: Crear el usuario en auth.users (si no existe)
-- Nota: esto usa la extensión auth de Supabase. Si falla, créalo manualmente
-- desde Authentication → Users → Add user, y luego ejecuta solo el PASO 2.
DO $$
DECLARE
    admin_email TEXT := 'ADMIN_EMAIL_AQUI';
    admin_password TEXT := 'ADMIN_PASSWORD_AQUI';
    admin_id UUID;
BEGIN
    -- Intentar obtener el UUID si el usuario ya existe
    SELECT id INTO admin_id FROM auth.users WHERE email = admin_email;
    
    IF admin_id IS NULL THEN
        RAISE EXCEPTION 'Usuario no encontrado. Créalo manualmente en Authentication → Users → Add user, luego ejecuta el PASO 2.';
    END IF;
    
    -- Actualizar el rol a administrador
    UPDATE public.perfiles
    SET rol = 'administrador'
    WHERE id = admin_id;
    
    RAISE NOTICE 'Usuario % ahora es administrador (ID: %)', admin_email, admin_id;
END $$;

-- PASO 2: Verificar que quedó como administrador (ejecutar esto después)
SELECT id, email, nombre_completo, rol, fecha_creacion 
FROM public.perfiles 
WHERE rol = 'administrador';

-- ============================================================
-- ALTERNATIVA MANUAL (si el PASO 1 falla):
-- ============================================================
-- 1. Ve a Supabase Dashboard → Authentication → Users
-- 2. Click "Add user"
-- 3. Ingresa el email y contraseña del administrador
-- 4. Click "Create user"
-- 5. Copia el UUID que aparece en la lista de usuarios
-- 6. Reemplaza 'UUID_AQUI' abajo y ejecuta solo esas líneas:
--
-- UPDATE public.perfiles
-- SET rol = 'administrador'
-- WHERE id = 'UUID_AQUI';
--
-- SELECT id, email, nombre_completo, rol FROM public.perfiles WHERE rol = 'administrador';
