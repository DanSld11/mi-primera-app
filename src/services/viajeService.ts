import supabase from "./supabase";
import { getEstacionById } from "./api";

interface Viaje {
  id: number;
  usuario_id: string;
  bicicleta_id: number;
  estacion_origen: number;
  estacion_destino: number | null;
  inicio: string;
  fin: string | null;
  estado: string;
  distancia_km: number | null;
  duracion_minutos: number | null;
  co2_ahorrado_kg: number | null;
  created_at: string;
}

interface EstacionMinima {
  id: number;
  nombre: string;
  direccion: string;
}

const CO2_POR_KM_AUTO = 0.15;

export async function crearViaje(params: {
  usuarioId: string;
  bicicletaId: number;
  estacionOrigenId: number;
}): Promise<Viaje> {
  const { data, error } = await supabase
    .from("viajes")
    .insert([
      {
        usuario_id: params.usuarioId,
        bicicleta_id: params.bicicletaId,
        estacion_origen: params.estacionOrigenId,
        estado: "activo",
      },
    ])
    .select()
    .single();

  if (error) throw error;
  return data as unknown as Viaje;
}

export async function finalizarViaje(params: {
  viajeId: number;
  estacionDestinoId: number;
  distanciaKm: number;
  duracionMinutos: number;
}): Promise<Viaje> {
  const co2 = params.distanciaKm * CO2_POR_KM_AUTO;

  const { data, error } = await supabase
    .from("viajes")
    .update({
      estacion_destino: params.estacionDestinoId,
      fin: new Date().toISOString(),
      estado: "completado",
      distancia_km: Math.round(params.distanciaKm * 100) / 100,
      duracion_minutos: Math.round(params.duracionMinutos),
      co2_ahorrado_kg: Math.round(co2 * 100) / 100,
    })
    .eq("id", params.viajeId)
    .select()
    .single();

  if (error) throw error;
  return data as unknown as Viaje;
}

export async function cancelarViaje(viajeId: number): Promise<void> {
  const { error } = await supabase
    .from("viajes")
    .update({
      estado: "cancelado",
      fin: new Date().toISOString(),
    })
    .eq("id", viajeId);

  if (error) throw error;
}

export async function getViajeActivo(usuarioId: string): Promise<Viaje | null> {
  const { data, error } = await supabase
    .from("viajes")
    .select("*")
    .eq("usuario_id", usuarioId)
    .eq("estado", "activo")
    .maybeSingle();

  if (error) throw error;
  return data as unknown as Viaje | null;
}

export async function getViajeById(viajeId: number): Promise<Viaje & { estacion_origen_data?: EstacionMinima; estacion_destino_data?: EstacionMinima }> {
  const { data, error } = await supabase
    .from("viajes")
    .select("*")
    .eq("id", viajeId)
    .single();

  if (error) throw error;
  return data as unknown as Viaje & { estacion_origen_data?: EstacionMinima; estacion_destino_data?: EstacionMinima };
}

export async function actualizarContadoresEstacion(
  estacionOrigenId: number,
  estacionDestinoId: number
): Promise<void> {
  const origen = await getEstacionById(estacionOrigenId);
  const destino = await getEstacionById(estacionDestinoId);

  const { error: errorOrigen } = await supabase
    .from("estaciones")
    .update({ bicicletas_disponibles: Math.max(0, origen.bicicletasDisponibles - 1) })
    .eq("id", estacionOrigenId);

  if (errorOrigen) throw errorOrigen;

  const { error: errorDestino } = await supabase
    .from("estaciones")
    .update({ bicicletas_disponibles: destino.bicicletasDisponibles + 1 })
    .eq("id", estacionDestinoId);

  if (errorDestino) throw errorDestino;
}

export type { Viaje };