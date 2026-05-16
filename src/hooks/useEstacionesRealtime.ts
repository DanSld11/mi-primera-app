import { useState, useEffect, useCallback } from "react";
import supabase from "../services/supabase";
import { getEstaciones } from "../services/api";
import { useAuth } from "../context/AuthContext";

interface Estacion {
  id: number;
  nombre: string;
  direccion: string;
  latitud: number;
  longitud: number;
  bicicletasDisponibles: number;
  capacidadTotal: number;
  estado: string;
}

export function useEstacionesRealtime() {
  const [estaciones, setEstaciones] = useState<Estacion[]>([]);
  const [cargando, setCargando] = useState(true);
  const [errorApi, setErrorApi] = useState<string | null>(null);
  const [suscrito, setSuscrito] = useState(false);

  const cargarEstaciones = useCallback(async () => {
    try {
      setErrorApi(null);
      const data = await getEstaciones();
      setEstaciones(data);
    } catch (err) {
      console.error("Error cargando estaciones:", err);
      setErrorApi("No se pudo conectar con el servidor");
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargarEstaciones();

    const canal = supabase
      .channel("estaciones-realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "estaciones",
        },
        (payload) => {
          if (payload.eventType === "UPDATE") {
            setEstaciones((prev) =>
              prev.map((e) =>
                e.id === payload.new.id
                  ? {
                      ...e,
                      bicicletasDisponibles: payload.new.bicicletas_disponibles,
                      capacidadTotal: payload.new.capacidad_total,
                      estado: payload.new.estado,
                    }
                  : e
              )
            );
          } else if (payload.eventType === "INSERT") {
            cargarEstaciones();
          } else if (payload.eventType === "DELETE") {
            setEstaciones((prev) => prev.filter((e) => e.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    setSuscrito(true);

    return () => {
      supabase.removeChannel(canal);
      setSuscrito(false);
    };
  }, [cargarEstaciones]);

  const refetch = useCallback(() => {
    cargarEstaciones();
  }, [cargarEstaciones]);

  return {
    estaciones,
    cargando,
    errorApi,
    suscrito,
    refetch,
  };
}

export function useViajeRealtime() {
  const { perfil } = useAuth();
  const [viajeActivo, setViajeActivo] = useState<any>(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    if (!perfil?.id) {
      setCargando(false);
      return;
    }

    const cargarViajeActivo = async () => {
      try {
        const { data } = await supabase
          .from("viajes")
          .select("*")
          .eq("usuario_id", perfil.id)
          .eq("estado", "activo")
          .maybeSingle();

        setViajeActivo(data);
      } catch (err) {
        console.error("Error buscando viaje activo:", err);
      } finally {
        setCargando(false);
      }
    };

    cargarViajeActivo();

    const canal = supabase
      .channel("viajes-realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "viajes",
          filter: `usuario_id=eq.${perfil.id}`,
        },
        (payload) => {
          if (payload.eventType === "INSERT" && payload.new.estado === "activo") {
            setViajeActivo(payload.new);
          } else if (payload.eventType === "UPDATE") {
            if (payload.new.estado !== "activo") {
              setViajeActivo(null);
            } else {
              setViajeActivo(payload.new);
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(canal);
    };
  }, [perfil?.id]);

  return { viajeActivo, cargando };
}