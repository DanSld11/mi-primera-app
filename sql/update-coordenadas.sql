-- ============================================================
-- Script de ACTUALIZACIÓN de coordenadas y direcciones
-- ============================================================
-- Ejecutar esto en el SQL Editor de Supabase si ya creaste
-- las tablas anteriormente y necesitas corregir los datos.
--
-- Instrucciones:
-- 1. Ve a tu proyecto en https://supabase.com
-- 2. Entra al SQL Editor
-- 3. Crea un "New query"
-- 4. Pega TODO este contenido
-- 5. Presiona "Run"
-- ============================================================

-- 1. Municipalidad de San Borja
UPDATE estaciones
SET
  direccion = 'Av. Joaquín de la Madrid 200, San Borja',
  latitud = -12.1072,
  longitud = -76.9991
WHERE id = 1;

-- 2. Pentagonito
UPDATE estaciones
SET
  latitud = -12.0870,
  longitud = -76.9966
WHERE id = 2;

-- 3. Museo de la Nación
UPDATE estaciones
SET
  direccion = 'Av. Javier Prado Este 2300, San Borja',
  latitud = -12.0867,
  longitud = -77.0019
WHERE id = 3;

-- 4. Biblioteca Nacional del Perú
UPDATE estaciones
SET
  nombre = 'Biblioteca Nacional del Perú',
  direccion = 'Av. Aviación 160, San Borja',
  latitud = -12.0875,
  longitud = -77.0048
WHERE id = 4;

-- 5. Centro Comercial La Rambla
UPDATE estaciones
SET
  direccion = 'Av. Javier Prado Este 2050, San Borja',
  latitud = -12.0894,
  longitud = -77.0048
WHERE id = 5;

-- 6. Parque de la Felicidad
UPDATE estaciones
SET
  direccion = 'Parque de la Felicidad, San Borja',
  latitud = -12.1015,
  longitud = -76.9890
WHERE id = 6;

-- Verificar los cambios
SELECT id, nombre, direccion, latitud, longitud FROM estaciones ORDER BY id;
