import supabase from "./supabase";

interface Estacion {
  id: number;
  nombre: string;
  direccion: string;
  latitud: number;
  longitud: number;
  bicicletasDisponibles: number;
  capacidadTotal: number;
  estado: string;
  created_at?: string;
  distancia?: number;
}

function haversine(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function mapEstacion(row: Record<string, unknown>): Estacion {
  return {
    id: row.id as number,
    nombre: row.nombre as string,
    direccion: row.direccion as string,
    latitud: row.latitud as number,
    longitud: row.longitud as number,
    bicicletasDisponibles: row.bicicletas_disponibles as number,
    capacidadTotal: row.capacidad_total as number,
    estado: row.estado as string,
    created_at: row.created_at as string | undefined,
  };
}

export async function getEstaciones(): Promise<Estacion[]> {
  const { data, error } = await supabase
    .from("estaciones")
    .select("*")
    .order("id", { ascending: true });

  if (error) throw error;
  return (data || []).map(mapEstacion);
}

export async function getEstacionById(id: number): Promise<Estacion> {
  const { data, error } = await supabase
    .from("estaciones")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;
  return mapEstacion(data);
}

export async function getEstacionesCercanas(lat: number, lng: number): Promise<Estacion[]> {
  const { data, error } = await supabase
    .from("estaciones")
    .select("*");

  if (error) throw error;

  const estaciones: Estacion[] = (data || []).map((est: Record<string, unknown>) => {
    const mapped = mapEstacion(est);
    mapped.distancia = haversine(lat, lng, mapped.latitud, mapped.longitud);
    return mapped;
  });

  estaciones.sort((a, b) => a.distancia! - b.distancia!);
  return estaciones;
}

export async function postIncidencia(datos: {
  tipo: string;
  descripcion?: string;
  estacionId?: number | null;
  foto?: string | null;
}): Promise<Record<string, unknown>> {
  const { data, error } = await supabase
    .from("incidencias")
    .insert([
      {
        tipo: datos.tipo,
        descripcion: datos.descripcion || "",
        estacion_id: datos.estacionId || null,
        foto_url: datos.foto || null,
      },
    ])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export default supabase;
export type { Estacion };