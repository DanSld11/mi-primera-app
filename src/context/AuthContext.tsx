import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import supabase from "../services/supabase";
import { logout as logoutService } from "../services/authService";

interface AuthContextType {
  usuario: ReturnType<typeof supabase.auth.getUser> extends Promise<{ data: { user: infer U } }> ? U : never;
  perfil: { id: string; email: string; nombre_completo: string; rol: string; fecha_creacion: string } | null;
  rol: string | null;
  cargando: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  usuario: null,
  perfil: null,
  rol: null,
  cargando: true,
  logout: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [usuario, setUsuario] = useState<AuthContextType["usuario"]>(null);
  const [perfil, setPerfil] = useState<AuthContextType["perfil"]>(null);
  const [cargando, setCargando] = useState(true);
  const montado = useRef(true);

  useEffect(() => {
    montado.current = true;

    // Recuperar sesión inicial explícitamente para mayor rapidez y persistencia
    const recuperarSesionInicial = async () => {
      try {
        console.log("[AuthContext] Intentando recuperar sesión inicial...");
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) throw sessionError;

        if (session?.user && montado.current) {
          console.log("[AuthContext] Sesión encontrada para:", session.user.email);
          setUsuario(session.user as AuthContextType["usuario"]);
          
          const { data: p, error: perfilError } = await supabase.rpc("get_perfil_by_id", { user_id: session.user.id });
          
          if (perfilError) {
            console.error("[AuthContext] Error recuperando perfil RPC:", perfilError);
          } else if (montado.current) {
            setPerfil(p as AuthContextType["perfil"]);
          }
        } else {
          console.log("[AuthContext] No hay sesión previa guardada.");
        }
      } catch (err) {
        console.error("[AuthContext] Error crítico recuperando sesión inicial:", err);
      } finally {
        if (montado.current) setCargando(false);
      }
    };

    recuperarSesionInicial();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!montado.current) return;

        if (session?.user) {
          setUsuario(session.user as AuthContextType["usuario"]);
          const uid = session.user.id;
          try {
            const { data: p, error } = await supabase.rpc("get_perfil_by_id", { user_id: uid });
            if (montado.current) {
              if (error || !p) {
                setPerfil(null);
              } else {
                setPerfil(p as AuthContextType["perfil"]);
              }
            }
          } catch {
            if (montado.current) {
              setPerfil(null);
            }
          }
        } else {
          if (montado.current) {
            setUsuario(null);
            setPerfil(null);
          }
        }
        if (montado.current) setCargando(false);
      }
    );

    return () => {
      montado.current = false;
      clearTimeout(timeout);
      subscription.unsubscribe();
    };
  }, []);

  const logout = async () => {
    try {
      await logoutService();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error("[AuthContext] Error en logout:", msg);
    } finally {
      setUsuario(null);
      setPerfil(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        usuario,
        perfil,
        rol: perfil?.rol ?? null,
        cargando,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe usarse dentro de un AuthProvider");
  }
  return context;
}