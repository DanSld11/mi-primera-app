import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "@/src/hooks/useAuth";
import { getHistorialViajes } from "@/src/services/historialService";
import Colors from "@/src/constants/colors";
import { MaterialIcons } from "@expo/vector-icons";

function formatDuracion(minutos) {
  if (minutos === null || minutos === undefined) return "—";
  if (minutos < 1) return "< 1 min";
  if (minutos < 60) return `${Math.round(minutos)} min`;
  const h = Math.floor(minutos / 60);
  const m = Math.round(minutos % 60);
  return m > 0 ? `${h}h ${m}min` : `${h}h`;
}

function formatDistancia(km) {
  if (km === null || km === undefined) return "—";
  if (km < 1) return `${Math.round(km * 1000)} m`;
  return `${km.toFixed(2)} km`;
}

function formatDate(isoStr) {
  const date = new Date(isoStr);
  const today = new Date();
  const diffDays = Math.floor((today - date) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Hoy";
  if (diffDays === 1) return "Ayer";
  if (diffDays < 7) return `Hace ${diffDays} días`;
  return date.toLocaleDateString("es-PE", { day: "numeric", month: "short" });
}

export default function HistorialViajesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { perfil } = useAuth();

  const [viajes, setViajes] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    if (!perfil?.id) {
      setCargando(false);
      return;
    }
    (async () => {
      try {
        const data = await getHistorialViajes(perfil.id);
        setViajes(data);
      } catch {
        // silently fail, show empty state
      } finally {
        setCargando(false);
      }
    })();
  }, [perfil?.id]);

  const totalCo2 = viajes.reduce((sum, v) => sum + (v.co2_ahorrado_kg || 0), 0);
  const totalViajes = viajes.filter((v) => v.estado === "completado").length;
  const totalDistancia = viajes.reduce((sum, v) => sum + (v.distancia_km || 0), 0);

  if (cargando) {
    return (
      <View style={styles.centrado}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.cargandoTexto}>Cargando historial...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.contenedor, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mis viajes</Text>
        <Text style={styles.headerSub}>{viajes.length} viajes registrados</Text>
      </View>

      {viajes.length > 0 && (
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <MaterialIcons name="directions-bike" size={20} color={Colors.primary} />
            <Text style={styles.statNum}>{totalViajes}</Text>
            <Text style={styles.statLabel}>Viajes</Text>
          </View>
          <View style={styles.statCard}>
            <MaterialIcons name="route" size={20} color={Colors.primary} />
            <Text style={styles.statNum}>{formatDistancia(totalDistancia)}</Text>
            <Text style={styles.statLabel}>Recorrido</Text>
          </View>
          <View style={styles.statCard}>
            <MaterialIcons name="eco" size={20} color={Colors.estadoDisponible} />
            <Text style={styles.statNum}>{totalCo2.toFixed(2)} kg</Text>
            <Text style={styles.statLabel}>CO2 ahorrado</Text>
          </View>
        </View>
      )}

      {viajes.length === 0 ? (
        <View style={styles.vacio}>
          <MaterialIcons name="directions-bike" size={64} color="#D1D5DB" />
          <Text style={styles.vacioTitulo}>Aún no tienes viajes</Text>
          <Text style={styles.vacioTexto}>
            Escanea una bicicleta en una estación para comenzar tu primer viaje.
          </Text>
          <TouchableOpacity
            style={styles.botonMapa}
            onPress={() => router.replace("/(tabs)")}
          >
            <Text style={styles.botonMapaTexto}>Ir al mapa</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={viajes}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.lista}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => {
            const esActivo = item.estado === "activo";
            const esCompletado = item.estado === "completado";
            const esCancelado = item.estado === "cancelado";

            return (
              <View style={styles.tarjeta}>
                <View style={styles.tarjetaTop}>
                  <View style={[styles.estadoDot, esActivo && styles.estadoDotActivo, esCompletado && styles.estadoDotCompletado, esCancelado && styles.estadoDotCancelado]} />
                  <View style={styles.tarjetaInfo}>
                    <Text style={styles.tarjetaRuta}>
                      {item.estacion_origen_nombre}
                      <Text style={styles.flecha}> → </Text>
                      {item.estacion_destino_nombre || "En curso"}
                    </Text>
                    <Text style={styles.tarjetaFecha}>
                      {formatDate(item.inicio)}
                      {item.duracion_minutos ? ` · ${formatDuracion(item.duracion_minutos)}` : ""}
                    </Text>
                  </View>
                  <View style={[
                    styles.badge,
                    esActivo && styles.badgeActivo,
                    esCompletado && styles.badgeCompletado,
                    esCancelado && styles.badgeCancelado,
                  ]}>
                    <Text style={[styles.badgeText, esActivo && styles.badgeTextActivo, esCompletado && styles.badgeTextCompletado, esCancelado && styles.badgeTextCancelado]}>
                      {esActivo ? "Activo" : esCompletado ? "Completado" : "Cancelado"}
                    </Text>
                  </View>
                </View>

                {esCompletado && (
                  <View style={styles.tarjetaStats}>
                    <View style={styles.tarjetaStat}>
                      <MaterialIcons name="route" size={14} color="#6B7280" />
                      <Text style={styles.tarjetaStatText}>
                        {formatDistancia(item.distancia_km)}
                      </Text>
                    </View>
                    <View style={styles.tarjetaStat}>
                      <MaterialIcons name="eco" size={14} color={Colors.estadoDisponible} />
                      <Text style={styles.tarjetaStatText}>
                        {item.co2_ahorrado_kg ? `${item.co2_ahorrado_kg.toFixed(2)} kg CO2` : "—"}
                      </Text>
                    </View>
                  </View>
                )}
              </View>
            );
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    flex: 1,
    backgroundColor: "#F5F7FA",
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  headerTitle: { fontSize: 20, fontWeight: "800", color: "#111827" },
  headerSub: { fontSize: 13, color: "#6B7280", marginTop: 2 },
  statsRow: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 10,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    gap: 4,
  },
  statNum: { fontSize: 18, fontWeight: "800", color: Colors.primary },
  statLabel: { fontSize: 10, color: "#6B7280", textAlign: "center" },
  lista: {
    paddingHorizontal: 16,
    paddingBottom: 20,
    gap: 10,
  },
  tarjeta: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  tarjetaTop: {
    flexDirection: "row",
    alignItems: "center",
  },
  estadoDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 10,
  },
  estadoDotActivo: { backgroundColor: Colors.estadoDisponible },
  estadoDotCompletado: { backgroundColor: Colors.primary },
  estadoDotCancelado: { backgroundColor: "#9CA3AF" },
  tarjetaInfo: { flex: 1, marginRight: 8 },
  tarjetaRuta: { fontSize: 14, fontWeight: "700", color: "#111827" },
  flecha: { color: Colors.primary, fontWeight: "400" },
  tarjetaFecha: { fontSize: 12, color: "#6B7280", marginTop: 2 },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  badgeActivo: { backgroundColor: "#D1FAE5" },
  badgeCompletado: { backgroundColor: "#DBEAFE" },
  badgeCancelado: { backgroundColor: "#F3F4F6" },
  badgeText: { fontSize: 11, fontWeight: "600", color: "#6B7280" },
  badgeTextActivo: { color: "#065F46" },
  badgeTextCompletado: { color: "#1E40AF" },
  badgeTextCancelado: { color: "#6B7280" },
  tarjetaStats: {
    flexDirection: "row",
    gap: 16,
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
  tarjetaStat: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  tarjetaStatText: {
    fontSize: 12,
    color: "#6B7280",
  },
  centrado: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5F7FA",
  },
  cargandoTexto: {
    marginTop: 8,
    fontSize: 14,
    color: "#6B7280",
  },
  vacio: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
    gap: 12,
  },
  vacioTitulo: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
  },
  vacioTexto: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 20,
  },
  botonMapa: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 8,
  },
  botonMapaTexto: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "600",
  },
});