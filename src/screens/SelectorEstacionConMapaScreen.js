import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useEstacionesRealtime } from "@/src/hooks/useEstacionesRealtime";
import { finalizarViaje, actualizarContadoresEstacion } from "@/src/services/viajeService";
import { marcarBicicletaDisponible } from "@/src/services/bicicletaService";
import { useViaje } from "@/src/context/ViajeContext";
import Colors from "@/src/constants/colors";
import { MaterialIcons } from "@expo/vector-icons";

function getMarkerColor(estado) {
  switch (estado) {
    case "disponible": return Colors.estadoDisponible;
    case "pocas": return Colors.estadoPocas;
    case "llena": return Colors.estadoLlena;
    case "vacia": return Colors.estadoVacia;
    default: return Colors.disabled;
  }
}

function getEstadoLabel(estado) {
  switch (estado) {
    case "disponible": return "Disponible";
    case "pocas": return "Pocas bicis";
    case "llena": return "Llena";
    case "vacia": return "Vacía";
    default: return "—";
  }
}

export default function SelectorEstacionConMapaScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();

  const duracion = Number(params.duracion) || 0;
  const distancia = Number(params.distancia) || 0;
  const co2 = Number(params.co2) || 0;

  const { viajeId, bicicletaId, estacionOrigenId, finalizeViaje: finalizeContext } = useViaje();

  const [seleccionada, setSeleccionada] = useState(null);
  const [finalizando, setFinalizando] = useState(false);
  const [error, setError] = useState(null);

  const { estaciones, cargando } = useEstacionesRealtime();

  const handleSeleccionar = async (estacion) => {
    if (estacion.estado === "llena") {
      return;
    }
    setSeleccionada(estacion);
  };

  const handleConfirmar = async () => {
    if (!seleccionada) return;
    setFinalizando(true);
    setError(null);

    try {
      const destinoId = seleccionada.id;

      await finalizarViaje({
        viajeId,
        estacionDestinoId: destinoId,
        distanciaKm: distancia,
        duracionMinutos: duracion,
      });

      await marcarBicicletaDisponible(bicicletaId, destinoId);
      await actualizarContadoresEstacion(estacionOrigenId, destinoId);

      finalizeContext();

      router.replace({
        pathname: "/resumen-viaje",
        params: {
          duracion: String(Math.round(duracion)),
          distancia: String(distancia.toFixed(2)),
          co2: String(co2.toFixed(2)),
          estacionOrigen: String(estacionOrigenId),
          estacionDestino: String(destinoId),
        },
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error al finalizar el viaje";
      setError(msg);
      setFinalizando(false);
    }
  };

  const regionInicial = {
    latitude: -12.0970,
    longitude: -76.9970,
    latitudeDelta: 0.025,
    longitudeDelta: 0.020,
  };

  if (cargando) {
    return (
      <View style={styles.centrado}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.cargandoTexto}>Cargando estaciones...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.contenedor, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <MaterialIcons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <View style={styles.headerText}>
          <Text style={styles.headerTitle}>Devolver bicicleta</Text>
          <Text style={styles.headerSub}>Selecciona una estación en el mapa o lista</Text>
        </View>
      </View>

      <View style={styles.mapaContenedor}>
        <MapView
          style={styles.mapa}
          initialRegion={regionInicial}
          onPress={() => setSeleccionada(null)}
        >
          {estaciones.map((est) => {
            const color = getMarkerColor(est.estado);
            return (
              <Marker
                key={est.id}
                coordinate={{ latitude: est.latitud, longitude: est.longitud }}
                pinColor={color}
                title={est.nombre}
                description={getEstadoLabel(est.estado)}
                onPress={() => est.estado !== "llena" && setSeleccionada(est)}
              />
            );
          })}
        </MapView>
      </View>

      {seleccionada && (
        <View style={styles.seleccionCard}>
          <View style={styles.seleccionInfo}>
            <Text style={styles.seleccionNombre}>{seleccionada.nombre}</Text>
            <Text style={styles.seleccionDir}>{seleccionada.direccion}</Text>
            <View style={[styles.seleccionBadge, { backgroundColor: getMarkerColor(seleccionada.estado) }]}>
              <Text style={styles.seleccionBadgeTexto}>{getEstadoLabel(seleccionada.estado)}</Text>
            </View>
          </View>
          <TouchableOpacity
            style={[styles.botonConfirmar, finalizando && styles.botonDisabled]}
            onPress={handleConfirmar}
            disabled={finalizando}
          >
            {finalizando ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <>
                <MaterialIcons name="check" size={20} color="#FFFFFF" />
                <Text style={styles.botonConfirmarTexto}>Confirmar</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.listaContenedor}>
        <Text style={styles.listaTitulo}>Estaciones cercanas</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.lista}>
          {estaciones.map((est) => {
            const color = getMarkerColor(est.estado);
            const selected = seleccionada?.id === est.id;
            const disabled = est.estado === "llena";

            return (
              <TouchableOpacity
                key={est.id}
                style={[styles.tarjeta, selected && styles.tarjetaSeleccionada, disabled && styles.tarjetaDisabled]}
                onPress={() => handleSeleccionar(est)}
                disabled={disabled}
              >
                <View style={[styles.tarjetaDot, { backgroundColor: color }]} />
                <Text style={styles.tarjetaNombre} numberOfLines={1}>{est.nombre}</Text>
                <Text style={styles.tarjetaBicis}>
                  {est.bicicletasDisponibles}/{est.capacidadTotal} bicis
                </Text>
                {disabled && <Text style={styles.tarjetaLlena}>Llena</Text>}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {error && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorTexto}>{error}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: { flex: 1, backgroundColor: "#F5F7FA" },
  header: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 12, backgroundColor: "#FFFFFF", borderBottomWidth: 1, borderBottomColor: "#E5E7EB", gap: 12 },
  backBtn: { padding: 4 },
  headerText: { flex: 1 },
  headerTitle: { fontSize: 18, fontWeight: "700", color: "#111827" },
  headerSub: { fontSize: 12, color: "#6B7280", marginTop: 2 },
  mapaContenedor: { height: 280, borderBottomWidth: 1, borderBottomColor: "#E5E7EB" },
  mapa: { flex: 1 },
  seleccionCard: { position: "absolute", top: 200, left: 16, right: 16, backgroundColor: "#FFFFFF", borderRadius: 14, padding: 16, flexDirection: "row", alignItems: "center", justifyContent: "space-between", elevation: 8, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 8 },
  seleccionInfo: { flex: 1, marginRight: 12 },
  seleccionNombre: { fontSize: 16, fontWeight: "700", color: "#111827" },
  seleccionDir: { fontSize: 12, color: "#6B7280", marginTop: 2 },
  seleccionBadge: { alignSelf: "flex-start", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, marginTop: 6 },
  seleccionBadgeTexto: { color: "#FFFFFF", fontSize: 11, fontWeight: "600" },
  botonConfirmar: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: Colors.primary, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10 },
  botonConfirmarTexto: { color: "#FFFFFF", fontSize: 14, fontWeight: "600" },
  botonDisabled: { opacity: 0.6 },
  listaContenedor: { paddingTop: 16 },
  listaTitulo: { fontSize: 14, fontWeight: "700", color: "#111827", paddingHorizontal: 16, marginBottom: 8 },
  lista: { paddingHorizontal: 16, gap: 10, paddingBottom: 20 },
  tarjeta: { width: 120, backgroundColor: "#FFFFFF", borderRadius: 10, padding: 10, borderWidth: 1, borderColor: "#E5E7EB" },
  tarjetaSeleccionada: { borderColor: Colors.primary, borderWidth: 2 },
  tarjetaDisabled: { opacity: 0.5 },
  tarjetaDot: { width: 8, height: 8, borderRadius: 4, marginBottom: 6 },
  tarjetaNombre: { fontSize: 13, fontWeight: "600", color: "#111827", marginBottom: 4 },
  tarjetaBicis: { fontSize: 11, color: "#6B7280" },
  tarjetaLlena: { fontSize: 10, fontWeight: "600", color: Colors.estadoLlena, marginTop: 4 },
  centrado: { flex: 1, justifyContent: "center", alignItems: "center" },
  cargandoTexto: { marginTop: 8, fontSize: 14, color: "#6B7280" },
  errorBanner: { position: "absolute", bottom: 100, left: 16, right: 16, backgroundColor: Colors.error, borderRadius: 10, padding: 12 },
  errorTexto: { color: "#FFFFFF", fontSize: 13, textAlign: "center" },
});