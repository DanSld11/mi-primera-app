import supabase from "./supabase";

export async function getTotalEstaciones(): Promise<number> {
  const { count, error } = await supabase
    .from("estaciones")
    .select("*", { count: "exact", head: true });

  if (error) throw error;
  return count || 0;
}

interface EstacionesPorEstado {
  disponible: number;
  pocas: number;
  llena: number;
  vacia: number;
}

export async function getEstacionesPorEstado(): Promise<EstacionesPorEstado> {
  const { data, error } = await supabase
    .from("estaciones")
    .select("estado");

  if (error) throw error;

  const conteo: EstacionesPorEstado = {
    disponible: 0,
    pocas: 0,
    llena: 0,
    vacia: 0,
  };

  (data || []).forEach((row: { estado: string }) => {
    if (row.estado in conteo) {
      conteo[row.estado as keyof EstacionesPorEstado]++;
    }
  });

  return conteo;
}

export async function getTotalIncidencias(): Promise<number> {
  const { count, error } = await supabase
    .from("incidencias")
    .select("*", { count: "exact", head: true });

  if (error) throw error;
  return count || 0;
}

interface IncidenciaReciente {
  id: number;
  tipo: string;
  descripcion: string;
  estacionId: number;
  estacionNombre: string;
  createdAt: string;
}

export async function getIncidenciasRecientes(limite: number = 5): Promise<IncidenciaReciente[]> {
  const { data, error } = await supabase
    .from("incidencias")
    .select("id, tipo, descripcion, estacion_id, created_at, estaciones(nombre)")
    .order("created_at", { ascending: false })
    .limit(limite);

  if (error) throw error;

  return (data || []).map((inc: Record<string, unknown>) => ({
    id: inc.id as number,
    tipo: inc.tipo as string,
    descripcion: inc.descripcion as string,
    estacionId: inc.estacion_id as number,
    estacionNombre:
      (inc.estaciones as Record<string, string>)?.nombre ||
      (Array.isArray(inc.estaciones) && inc.estaciones[0]?.nombre) ||
      "Sin estación",
    createdAt: inc.created_at as string,
  }));
}

// ============================================================
// CRUD - ESTACIONES
// ============================================================

export async function crearEstacion(datos: {
  nombre: string;
  direccion: string;
  latitud: number;
  longitud: number;
  capacidad_total: number;
  bicicletas_disponibles: number;
  estado: string;
}): Promise<Record<string, unknown>> {
  const { data, error } = await supabase
    .from("estaciones")
    .insert([datos])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function actualizarEstacion(
  id: number,
  datos: {
    nombre: string;
    direccion: string;
    latitud: number;
    longitud: number;
    capacidad_total: number;
    bicicletas_disponibles: number;
    estado: string;
  }
): Promise<Record<string, unknown>> {
  const { data, error } = await supabase
    .from("estaciones")
    .update(datos)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function eliminarEstacion(id: number): Promise<void> {
  const { error } = await supabase.from("estaciones").delete().eq("id", id);
  if (error) throw error;
}

// ============================================================
// CRUD - INCIDENCIAS
// ============================================================

interface Incidencia {
  id: number;
  tipo: string;
  descripcion: string;
  estacionId: number;
  fotoUrl: string | null;
  estado: string;
  createdAt: string;
  estacionNombre: string;
}

export async function getIncidencias(): Promise<Incidencia[]> {
  const { data, error } = await supabase
    .from("incidencias")
    .select("id, tipo, descripcion, estacion_id, foto_url, estado, created_at, estaciones(nombre)")
    .order("created_at", { ascending: false });

  if (error) throw error;

  return (data || []).map((inc: Record<string, unknown>) => ({
    id: inc.id as number,
    tipo: inc.tipo as string,
    descripcion: inc.descripcion as string,
    estacionId: inc.estacion_id as number,
    fotoUrl: (inc.foto_url as string) || null,
    estado: (inc.estado as string) || "pendiente",
    createdAt: inc.created_at as string,
    estacionNombre:
      (inc.estaciones as Record<string, string>)?.nombre ||
      (Array.isArray(inc.estaciones) && inc.estaciones[0]?.nombre) ||
      "Sin estación",
  }));
}

export async function actualizarEstadoIncidencia(
  id: number,
  estado: string
): Promise<Record<string, unknown>> {
  const { data, error } = await supabase
    .from("incidencias")
    .update({ estado })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}