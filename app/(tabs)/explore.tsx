import { useState, useEffect } from "react";
import { FlatList, StyleSheet, Text, TouchableOpacity, View, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { getEstaciones } from "@/src/services/api";
import Colors from "@/src/constants/colors";

const getEstadoColor = (estado: string) => {
  switch (estado) {
    case "disponible": return Colors.estadoDisponible;
    case "pocas": return Colors.estadoPocas;
    case "llena": return Colors.estadoLlena;
    case "vacia": return Colors.estadoVacia;
    default: return Colors.disabled;
  }
};

const getEstadoLabel = (estado: string) => {
  switch (estado) {
    case "disponible": return "Disponible";
    case "pocas": return "Pocas bicis";
    case "llena": return "Llena";
    case "vacia": return "Vacía";
    default: return "—";
  }
};

export default function EstacionesScreen() {
  const router = useRouter();
  const [estaciones, setEstaciones] = useState<any[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const data = await getEstaciones();
        setEstaciones(data);
      } catch {
        setError("No se pudo conectar con el servidor");
      } finally {
        setCargando(false);
      }
    })();
  }, []);

  if (cargando) {
    return (
      <View style={styles.centrado}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.errorText}>Cargando estaciones...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centrado}>
        <Text style={styles.errorTitulo}>Error</Text>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  const totalBicis = estaciones.reduce((sum, e) => sum + e.bicicletasDisponibles, 0);
  const totalCapacidad = estaciones.reduce((sum, e) => sum + e.capacidadTotal, 0);

  return (
    <View style={styles.container}>
      <View style={styles.resumen}>
        <View style={styles.resumenCard}>
          <Text style={styles.resumenNumero}>{estaciones.length}</Text>
          <Text style={styles.resumenLabel}>Estaciones</Text>
        </View>
        <View style={styles.resumenCard}>
          <Text style={styles.resumenNumero}>{totalBicis}</Text>
          <Text style={styles.resumenLabel}>Bicis disponibles</Text>
        </View>
        <View style={styles.resumenCard}>
          <Text style={styles.resumenNumero}>{totalCapacidad}</Text>
          <Text style={styles.resumenLabel}>Capacidad total</Text>
        </View>
      </View>

      <FlatList
        data={estaciones}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => {
          const porcentaje = Math.round((item.bicicletasDisponibles / item.capacidadTotal) * 100);
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
              <View style={styles.cardHeader}>
                <View style={styles.cardInfo}>
                  <Text style={styles.cardNombre}>{item.nombre}</Text>
                  <Text style={styles.cardDireccion}>{item.direccion}</Text>
                </View>
                <View style={[styles.badge, { backgroundColor: getEstadoColor(item.estado) }]}>
                  <Text style={styles.badgeText}>{getEstadoLabel(item.estado)}</Text>
                </View>
              </View>
              <View style={styles.barraFondo}>
                <View
                  style={[
                    styles.barraRelleno,
                    { width: `${Math.max(porcentaje, 5)}%`, backgroundColor: getEstadoColor(item.estado) },
                  ]}
                />
              </View>
              <Text style={styles.cardBicis}>
                {item.bicicletasDisponibles} de {item.capacidadTotal} bicicletas
              </Text>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  centrado: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: Colors.background, padding: 32 },
  errorTitulo: { fontSize: 20, fontWeight: "700", color: Colors.textPrimary, marginBottom: 8 },
  errorText: { fontSize: 15, color: Colors.textSecondary, marginTop: 8 },
  resumen: { flexDirection: "row", padding: 16, gap: 10 },
  resumenCard: { flex: 1, backgroundColor: Colors.surface, borderRadius: 12, padding: 14, alignItems: "center", shadowColor: Colors.shadow, shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  resumenNumero: { fontSize: 22, fontWeight: "800", color: Colors.primary, marginBottom: 2 },
  resumenLabel: { fontSize: 11, color: Colors.textSecondary, textAlign: "center" },
  list: { paddingHorizontal: 16, paddingBottom: 20 },
  card: { backgroundColor: Colors.surface, borderRadius: 14, padding: 16, marginBottom: 12, shadowColor: Colors.shadow, shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 2 },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 },
  cardInfo: { flex: 1, marginRight: 12 },
  cardNombre: { fontSize: 16, fontWeight: "700", color: Colors.textPrimary, marginBottom: 2 },
  cardDireccion: { fontSize: 13, color: Colors.textSecondary },
  badge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10 },
  badgeText: { color: "#FFFFFF", fontSize: 12, fontWeight: "600" },
  barraFondo: { height: 8, backgroundColor: Colors.border, borderRadius: 4, overflow: "hidden", marginBottom: 8 },
  barraRelleno: { height: "100%", borderRadius: 4 },
  cardBicis: { fontSize: 13, fontWeight: "600", color: Colors.textSecondary },
});
