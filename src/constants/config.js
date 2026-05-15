// Configuración de Supabase para la app de bicicletas públicas
//
// ┌─────────────────────────────────────────────────────────┐
// │ CÓMO CONECTAR CON SUPABASE                               │
// │                                                          │
// │ 1. Crea una cuenta gratis en https://supabase.com        │
// │ 2. Crea un nuevo proyecto                                │
// │ 3. Ve a Project Settings > API                           │
// │ 4. Copia la "Project URL" y la "anon public" API key     │
// │ 5. Pega esos valores aquí abajo                          │
// │ 6. Ve al Editor SQL en Supabase y ejecuta el archivo     │
// │    sql/supabase-setup.sql para crear las tablas          │
// └─────────────────────────────────────────────────────────┘

const Config = {
  // URL de tu proyecto Supabase
  SUPABASE_URL: "https://vsvrfggfblozaelpnbhf.supabase.co",

  // Clave pública (anon key) de tu proyecto
  // La necesitamos para completar la configuración
  SUPABASE_ANON_KEY: "sb_publishable_cchjwzlsV6EG8BbifvXLLQ_VtWpZzoM",
};

export default Config;
