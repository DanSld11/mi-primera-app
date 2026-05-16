import supabase from "./supabase";

interface ViajeHistorial {
  id: number;
  bicicleta_id: number;
  estacion_origen: number;
  estacion_destino: number | null;
  inicio: string;
  fin: string | null;
  estado: string;
  distancia_km: number | null;
  duracion_minutos: number | null;
  co2_ahorrado_kg: number | null;
  estacion_origen_nombre: string;
  estacion_destino_nombre: string | null;
}

export async function getHistorialViajes(usuarioId: string): Promise<ViajeHistorial[]> {
  const { data, error } = await supabase
    .from("viajes")
    .select("id, bicicleta_id, estacion_origen, estacion_destino, inicio, fin, estado, distancia_km, duracion_minutos, co2_ahorrado_kg")
    .eq("usuario_id", usuarioId)
    .order("inicio", { ascending: false })
    .limit(20);

  if (error) throw error;

  const viajes = data || [];

  const estacionesIds = new Set<number>();
  viajes.forEach((v: Record<string, unknown>) => {
    if (v.estacion_origen) estacionesIds.add(v.estacion_origen as number);
    if (v.estacion_destino) estacionesIds.add(v.estacion_destino as number);
  });

  let estacionesMap: Record<number, string> = {};
  if (estacionesIds.size > 0) {
    const { data: estaciones, error: estError } = await supabase
      .from("estaciones")
      .select("id, nombre")
      .in("id", Array.from(estacionesIds));

    if (!estError && estaciones) {
      estaciones.forEach((e: Record<string, unknown>) => {
        estacionesMap[e.id as number] = e.nombre as string;
      });
    }
  }

  return viajes.map((v: Record<string, unknown>) => ({
    id: v.id as number,
    bicicleta_id: v.bicicleta_id as number,
    estacion_origen: v.estacion_origen as number,
    estacion_destino: v.estacion_destino as number | null,
    inicio: v.inicio as string,
    fin: v.fin as string | null,
    estado: v.estado as string,
    distancia_km: v.distancia_km as number | null,
    duracion_minutos: v.duracion_minutos as number | null,
    co2_ahorrado_kg: v.co2_ahorrado_kg as number | null,
    estacion_origen_nombre: estacionesMap[v.estacion_origen as number] || "Estación desconocida",
    estacion_destino_nombre: v.estacion_destino ? (estacionesMap[v.estacion_destino as number] || "Estación desconocida") : null,
  }));
}

export type { ViajeHistorial };