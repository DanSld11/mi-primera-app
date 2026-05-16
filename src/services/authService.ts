import supabase from "./supabase";
import type { Session } from "./supabase";

interface AuthData {
  session: Session | null;
  user: Session["user"] | null;
}

export async function login(email: string, password: string): Promise<AuthData> {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;
  return data;
}

export async function registro(
  email: string,
  password: string,
  nombreCompleto: string
): Promise<AuthData> {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        nombre_completo: nombreCompleto,
      },
    },
  });

  if (error) throw error;
  return data;
}

export async function logout(): Promise<{ success: boolean }> {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
  return { success: true };
}

interface Perfil {
  id: string;
  email: string;
  nombre_completo: string;
  rol: string;
  fecha_creacion: string;
}

export async function obtenerPerfil(): Promise<Perfil | null> {
  const { data: sessionData } = await supabase.auth.getSession();

  if (!sessionData.session) {
    return null;
  }

  const userId = sessionData.session.user.id;

  const { data: perfil, error } = await supabase
    .from("perfiles")
    .select("id, email, nombre_completo, rol, fecha_creacion")
    .eq("id", userId)
    .single();

  if (error) {
    console.error("[authService] Error al obtener perfil:", error.message);
    return null;
  }

  return perfil;
}

export async function obtenerSesion(): Promise<AuthData> {
  const { data, error } = await supabase.auth.getSession();

  if (error) {
    console.error("[authService] Error al obtener sesión:", error.message);
    return { session: null, user: null };
  }

  return {
    session: data.session,
    user: data.session?.user ?? null,
  };
}

export async function resetearPassword(email: string): Promise<void> {
  const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
    redirectTo: "miprimeraapp://reset-password",
  });

  if (error) throw error;
}

type AuthStateCallback = (event: string, session: Session | null) => void;

export function onAuthStateChange(callback: AuthStateCallback): () => void {
  const { data: subscription } = supabase.auth.onAuthStateChange(callback);
  return subscription.subscription.unsubscribe;
}