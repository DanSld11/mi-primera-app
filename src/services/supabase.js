import { createClient } from "@supabase/supabase-js";
import Config from "../constants/config";

// Cliente de Supabase para conectar con la base de datos en la nube
// Necesitas crear un proyecto en https://supabase.com y obtener tus credenciales
const supabaseUrl = Config.SUPABASE_URL;
const supabaseKey = Config.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.warn(
    "[Supabase] SUPABASE_URL o SUPABASE_ANON_KEY no están configurados. " +
      "Ve a src/constants/config.js y agrega tus credenciales de Supabase."
  );
}

const supabase = createClient(supabaseUrl || "", supabaseKey || "");

export default supabase;
