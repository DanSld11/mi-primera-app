/**
 * ============================================================
 * Script: Crear usuario administrador desde Node.js
 * ============================================================
 * Uso:
 *   node scripts/crear-admin.js
 *
 * Requiere:
 *   1. Crear un archivo .env en la raíz del proyecto con:
 *      SUPABASE_URL=https://vsvrfggfblozaelpnbhf.supabase.co
 *      SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key_aqui
 *
 *   2. Obtener la Service Role Key desde:
 *      Supabase Dashboard → Project Settings → API → service_role key
 *
 *   ⚠️  NUNCA compartas la service_role key. Tiene acceso total a la BD.
 * ============================================================
 */

const { createClient } = require("@supabase/supabase-js");

// Lee variables de entorno
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("❌ Error: Debes definir SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY");
  console.error("   Crea un archivo .env en la raíz del proyecto con estas variables.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Configuración del administrador
const ADMIN_EMAIL = "daniel.ardiles@example.com"; // ← Cambia esto por tu email
const ADMIN_PASSWORD = "Admin1234!";              // ← Cambia esto por tu contraseña
const ADMIN_NOMBRE = "Administrador Principal";    // ← Cambia esto por tu nombre

async function crearAdministrador() {
  console.log("🚀 Creando usuario administrador...\n");

  // 1. Crear usuario en Auth
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD,
    email_confirm: true, // Confirma el email automáticamente
    user_metadata: {
      nombre_completo: ADMIN_NOMBRE,
    },
  });

  if (authError) {
    console.error("❌ Error creando usuario en Auth:", authError.message);
    console.error("   Si dice 'User already registered', el email ya existe.");
    console.error("   Salta al paso 2 (cambiar rol) con el UUID existente.");
    process.exit(1);
  }

  const userId = authData.user.id;
  console.log("✅ Usuario creado en Auth:");
  console.log(`   ID: ${userId}`);
  console.log(`   Email: ${authData.user.email}`);
  console.log(`   Nombre: ${ADMIN_NOMBRE}\n`);

  // 2. El trigger ya creó la fila en public.perfiles con rol='ciudadano'
  //    Ahora actualizamos el rol a 'administrador'
  const { data: perfilData, error: perfilError } = await supabase
    .from("perfiles")
    .update({ rol: "administrador" })
    .eq("id", userId)
    .select()
    .single();

  if (perfilError) {
    console.error("❌ Error actualizando rol:", perfilError.message);
    process.exit(1);
  }

  console.log("✅ Rol actualizado a 'administrador':");
  console.log(`   ID: ${perfilData.id}`);
  console.log(`   Email: ${perfilData.email}`);
  console.log(`   Nombre: ${perfilData.nombre_completo}`);
  console.log(`   Rol: ${perfilData.rol}\n`);

  console.log("🎉 ¡Listo! Ya puedes iniciar sesión con:");
  console.log(`   Email: ${ADMIN_EMAIL}`);
  console.log(`   Contraseña: ${ADMIN_PASSWORD}`);
  console.log("\n   Al iniciar sesión, la app te redirigirá automáticamente al panel de administrador.");
}

crearAdministrador().catch((err) => {
  console.error("❌ Error inesperado:", err.message);
  process.exit(1);
});
