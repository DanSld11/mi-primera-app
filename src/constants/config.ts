// Configuración de Supabase para la app de bicicletas públicas
//
// Las credenciales se leen desde variables de entorno (.env):
//   EXPO_PUBLIC_SUPABASE_URL
//   EXPO_PUBLIC_SUPABASE_ANON_KEY
//
// Para configurar:
// 1. Copia .env.example como .env
// 2. Pega tus credenciales de Supabase (Project Settings > API)
// 3. Ejecuta sql/supabase-setup.sql en el Editor SQL de Supabase

const Config = {
  SUPABASE_URL: process.env.EXPO_PUBLIC_SUPABASE_URL,
  SUPABASE_ANON_KEY: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
} as const;

export default Config;