-- ============================================================
-- Script de configuración de Supabase para App de Bicicletas
-- ============================================================
-- Instrucciones:
-- 1. Ve a tu proyecto en https://supabase.com
-- 2. Entra al SQL Editor (pestaña "SQL Editor")
-- 3. Crea un "New query"
-- 4. Pega TODO este contenido
-- 5. Presiona "Run"
-- ============================================================

-- Tabla de estaciones
CREATE TABLE IF NOT EXISTS estaciones (
  id SERIAL PRIMARY KEY,
  nombre TEXT NOT NULL,
  direccion TEXT NOT NULL,
  latitud NUMERIC NOT NULL,
  longitud NUMERIC NOT NULL,
  bicicletas_disponibles INTEGER NOT NULL DEFAULT 0,
  capacidad_total INTEGER NOT NULL DEFAULT 0,
  estado TEXT NOT NULL CHECK (estado IN ('disponible', 'pocas', 'llena', 'vacia')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de incidencias
CREATE TABLE IF NOT EXISTS incidencias (
  id SERIAL PRIMARY KEY,
  tipo TEXT NOT NULL,
  descripcion TEXT,
  estacion_id INTEGER REFERENCES estaciones(id) ON DELETE SET NULL,
  foto_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Políticas de seguridad RLS (Row Level Security)
ALTER TABLE estaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE incidencias ENABLE ROW LEVEL SECURITY;

-- Política: cualquiera puede leer estaciones
CREATE POLICY "Allow public read estaciones" ON estaciones
  FOR SELECT USING (true);

-- Política: cualquiera puede insertar incidencias
CREATE POLICY "Allow public insert incidencias" ON incidencias
  FOR INSERT WITH CHECK (true);

-- Política: cualquiera puede leer incidencias
CREATE POLICY "Allow public read incidencias" ON incidencias
  FOR SELECT USING (true);

-- Insertar datos iniciales (San Borja, Lima, Perú)
-- Coordenadas verificadas con OpenStreetMap
INSERT INTO estaciones (nombre, direccion, latitud, longitud, bicicletas_disponibles, capacidad_total, estado)
VALUES
  ('Municipalidad de San Borja', 'Av. Joaquín de la Madrid 200, San Borja', -12.1072, -76.9991, 10, 20, 'disponible'),
  ('Pentagonito', 'Av. San Luis 2000, San Borja', -12.0870, -76.9966, 3, 15, 'pocas'),
  ('Museo de la Nación', 'Av. Javier Prado Este 2300, San Borja', -12.0867, -77.0019, 20, 20, 'llena'),
  ('Biblioteca Nacional del Perú', 'Av. Aviación 160, San Borja', -12.0875, -77.0048, 0, 18, 'vacia'),
  ('Centro Comercial La Rambla', 'Av. Javier Prado Este 2050, San Borja', -12.0894, -77.0048, 6, 12, 'disponible'),
  ('Parque de la Felicidad', 'Parque de la Felicidad, San Borja', -12.1015, -76.9890, 8, 22, 'disponible')
ON CONFLICT DO NOTHING;
