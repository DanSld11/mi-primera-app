import supabase from "./supabase";

// Fórmula de Haversine para calcular distancia entre dos puntos (km)
function haversine(lat1, lng1, lat2, lng2) {
  const R = 6371; // Radio de la Tierra en km
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

// Supabase devuelve columnas en snake_case, la app espera camelCase
function mapEstacion(row) {
  if (!row) return null;
  return {
    id: row.id,
    nombre: row.nombre,
    direccion: row.direccion,
    latitud: row.latitud,
    longitud: row.longitud,
    bicicletasDisponibles: row.bicicletas_disponibles,
    capacidadTotal: row.capacidad_total,
    estado: row.estado,
    created_at: row.created_at,
  };
}

// GET /estaciones
export async function getEstaciones() {
  const { data, error } = await supabase
    .from("estaciones")
    .select("*")
    .order("id", { ascending: true });

  if (error) throw error;
  return (data || []).map(mapEstacion);
}

// GET /estaciones/:id
export async function getEstacionById(id) {
  const { data, error } = await supabase
    .from("estaciones")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;
  return mapEstacion(data);
}

// GET /estaciones/cercanas?lat=X&lng=Y
export async function getEstacionesCercanas(lat, lng) {
  const { data, error } = await supabase
    .from("estaciones")
    .select("*");

  if (error) throw error;

  const estaciones = (data || []).map((est) => {
    const mapped = mapEstacion(est);
    mapped.distancia = haversine(lat, lng, mapped.latitud, mapped.longitud);
    return mapped;
  });

  estaciones.sort((a, b) => a.distancia - b.distancia);
  return estaciones;
}

// POST /incidencias
export async function postIncidencia(datos) {
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
