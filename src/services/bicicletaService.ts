import supabase from "./supabase";

interface Bicicleta {
  id: number;
  codigo_qr: string;
  estacion_id: number;
  estado: string;
  created_at: string;
}

export async function validarBicicletaQR(
  codigoQR: string,
  estacionId: number
): Promise<{ valida: boolean; bicicleta?: Bicicleta; error?: string }> {
  const { data, error } = await supabase
    .from("bicicletas")
    .select("*")
    .eq("codigo_qr", codigoQR)
    .single();

  if (error || !data) {
    return { valida: false, error: "Código QR no encontrado en el sistema" };
  }

  const bici = data as unknown as Bicicleta;

  if (bici.estado !== "disponible") {
    return { valida: false, error: "Esta bicicleta no está disponible para préstamo" };
  }

  if (bici.estacion_id !== estacionId) {
    return { valida: false, error: "Esta bicicleta no pertenece a esta estación" };
  }

  return { valida: true, bicicleta: bici };
}

export async function getBicicletasPorEstacion(estacionId: number): Promise<Bicicleta[]> {
  const { data, error } = await supabase
    .from("bicicletas")
    .select("*")
    .eq("estacion_id", estacionId)
    .eq("estado", "disponible");

  if (error) throw error;
  return (data || []) as unknown as Bicicleta[];
}

export async function marcarBicicletaEnUso(bicicletaId: number): Promise<void> {
  const { error } = await supabase
    .from("bicicletas")
    .update({ estado: "en_uso" })
    .eq("id", bicicletaId);

  if (error) throw error;
}

export async function marcarBicicletaDisponible(
  bicicletaId: number,
  nuevaEstacionId: number
): Promise<void> {
  const { error } = await supabase
    .from("bicicletas")
    .update({ estado: "disponible", estacion_id: nuevaEstacionId })
    .eq("id", bicicletaId);

  if (error) throw error;
}

export type { Bicicleta };