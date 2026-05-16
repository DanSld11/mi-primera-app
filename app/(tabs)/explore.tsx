import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
} from "react-native";
import { useRouter } from "expo-router";
import { useEstacionesRealtime } from "@/src/hooks/useEstacionesRealtime";
import Colors from "@/src/constants/colors";
import { MaterialIcons } from "@expo/vector-icons";

const ESTADO_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  disponible: { label: "Disponible", color: "#065F46", bg: "#D1FAE5" },
  pocas:      { label: "Pocas bicis", color: "#92400E", bg: "#FEF3C7" },
  llena:      { label: "Llena",       color: "#1E40AF", bg: "#DBEAFE" },
  vacia:      { label: "Vacía",       color: "#991B1B", bg: "#FEE2E2" },
};

export default function EstacionesScreen() {
  const router = useRouter();
  const { estaciones, cargando, errorApi, refetch } = useEstacionesRealtime();
  const [errorRender, setErrorRender] = useState<string | null>(null);

  // Un error en el renderizado puede causar la pantalla blanca
  useEffect(() => {
    if (estaciones && estaciones.length === 0 && !cargando && !errorApi) {
      console.log("[EstacionesScreen] No se encontraron estaciones.");
    }
  }, [estaciones, cargando, errorApi]);

  if (cargando) {
    return (
      <View style={styles.centrado}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.cargandoText}>Cargando estaciones...</Text>
      </View>
    );
  }

  if (errorApi || errorRender) {
    return (
      <View style={styles.centrado}>
        <MaterialIcons name="error-outline" size={48} color={Colors.error} />
        <Text style={styles.errorTitle}>Ocurrió un error</Text>
        <Text style={styles.errorText}>{errorApi || errorRender}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => { setErrorRender(null); refetch(); }}>
          <Text style={styles.retryButtonText}>Reintentar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const totalBicis = (estaciones || []).reduce((s, e) => s + (Number(e.bicicletasDisponibles) || 0), 0);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Estaciones</Text>
        <Text style={styles.headerSub}>{(estaciones || []).length} estaciones</Text>
      </View>

      {/* Stats row */}
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statNum}>{(estaciones || []).length}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statNum, { color: "#065F46" }]}>{totalBicis}</Text>
          <Text style={styles.statLabel}>Bicis disponibles</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statNum, { color: "#1E40AF" }]}>
            {(estaciones || []).filter((e) => e.estado === "disponible").length}
          </Text>
          <Text style={styles.statLabel}>Operativas</Text>
        </View>
      </View>

      {/* List */}
      <FlatList
        data={estaciones || []}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => {
          try {
            const estado = item.estado || "desconocido";
            const cfg = ESTADO_CONFIG[estado] ?? { label: "—", color: "#6B7280", bg: "#F3F4F6" };
            
            const bicisDisponibles = Number(item.bicicletasDisponibles || 0);
            const capacidadTotal = Number(item.capacidadTotal || 0);
            
            const pct = capacidadTotal > 0
              ? Math.round((bicisDisponibles / capacidadTotal) * 100)
              : 0;
              
            return (
              <TouchableOpacity
                style={styles.card}
                activeOpacity={0.7}
                onPress={() =>
                  router.push({
                    pathname: "/detalle-estacion",
                    params: { estacion: JSON.stringify({ id: item.id }) },
                  })
                }
              >
                <View style={styles.cardTop}>
                  <View style={styles.cardIconBg}>
                    <MaterialIcons name="directions-bike" size={20} color={Colors.primary} />
                  </View>
                  <View style={styles.cardInfo}>
                    <Text style={styles.cardNombre}>{item.nombre || "Estación sin nombre"}</Text>
                    <Text style={styles.cardDir} numberOfLines={1}>
                      {item.direccion || "Sin dirección registrada"}
                    </Text>
                  </View>
                  <View style={[styles.badge, { backgroundColor: cfg.bg }]}>
                    <Text style={[styles.badgeText, { color: cfg.color }]}>{cfg.label}</Text>
                  </View>
                </View>

                <View style={styles.barBg}>
                  <View
                    style={[
                      styles.barFill,
                      {
                        width: `${Math.min(100, Math.max(pct, 0))}%`,
                        backgroundColor: cfg.color,
                      },
                    ]}
                  />
                </View>

                <View style={styles.cardBottom}>
                  <Text style={styles.cardBicis}>
                    <Text style={{ fontWeight: "700", color: Colors.primary }}>
                      {bicisDisponibles}
                    </Text>
                    {" / "}
                    {capacidadTotal} bicicletas
                  </Text>
                  <MaterialIcons name="chevron-right" size={18} color="#9CA3AF" />
                </View>
              </TouchableOpacity>
            );
          } catch (e) {
            console.error("[EstacionesScreen] Error en item:", e);
            return null;
          }
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F7FA" },

  centrado: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5F7FA",
    padding: 32,
    gap: 8,
  },
  cargandoText: { fontSize: 14, color: "#6B7280", marginTop: 8 },
  errorTitle: { fontSize: 18, fontWeight: "700", color: "#111827", marginTop: 12 },
  errorText:  { fontSize: 14, color: "#6B7280", textAlign: "center", marginBottom: 20 },
  retryButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
  },
  retryButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "600",
  },

  /* Header */
  header: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    flexDirection: "row",
    alignItems: "baseline",
    gap: 8,
  },
  headerTitle: { fontSize: 20, fontWeight: "800", color: "#111827" },
  headerSub:   { fontSize: 13, color: "#6B7280" },

  /* Stats */
  statsRow: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 10,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#fff",
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
  },
  statNum:   { fontSize: 22, fontWeight: "800", color: Colors.primary },
  statLabel: { fontSize: 10, color: "#6B7280", marginTop: 2, textAlign: "center" },

  /* List */
  list: { paddingHorizontal: 16, paddingBottom: 20, gap: 10 },

  /* Card */
  card: {
    backgroundColor: "#fff",
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
  cardTop: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  cardIconBg: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: "rgba(11,110,79,0.08)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  cardInfo:   { flex: 1, marginRight: 8 },
  cardNombre: { fontSize: 14, fontWeight: "700", color: "#111827" },
  cardDir:    { fontSize: 12, color: "#6B7280", marginTop: 1 },

  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  badgeText: { fontSize: 11, fontWeight: "600" },

  barBg: {
    height: 6,
    backgroundColor: "#F3F4F6",
    borderRadius: 3,
    overflow: "hidden",
    marginBottom: 8,
  },
  barFill: { height: "100%", borderRadius: 3 },

  cardBottom: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  cardBicis:  { fontSize: 13, color: "#6B7280" },
});
