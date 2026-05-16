import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Colors from "@/src/constants/colors";
import { MaterialIcons } from "@expo/vector-icons";

export default function ResumenViajeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();

  const duracion = Number(params.duracion) || 0;
  const distancia = Number(params.distancia) || 0;
  const co2 = Number(params.co2) || 0;

  const horas = Math.floor(duracion / 60);
  const minutos = duracion % 60;

  const distanciaTexto = distancia < 1
    ? `${Math.round(distancia * 1000)} metros`
    : `${distancia.toFixed(2)} km`;

  const duracionTexto = horas > 0
    ? `${horas}h ${minutos}min`
    : `${minutos} minutos`;

  const arboles = (co2 / 0.022).toFixed(0);
  const casas = (co2 / 0.0005).toFixed(0);

  return (
    <View style={[styles.contenedor, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Resumen del viaje</Text>
      </View>

      <View style={styles.cuerpo}>
        <View style={styles.exitoContainer}>
          <View style={styles.exitoIcono}>
            <MaterialIcons name="check-circle" size={64} color={Colors.estadoDisponible} />
          </View>
          <Text style={styles.exitoTitulo}>Viaje completado</Text>
          <Text style={styles.exitoSubtitulo}>Gracias por usar Bici San Borja</Text>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <MaterialIcons name="timer" size={28} color={Colors.primary} />
            <Text style={styles.statValor}>{duracionTexto}</Text>
            <Text style={styles.statLabel}>Duración</Text>
          </View>

          <View style={styles.statCard}>
            <MaterialIcons name="route" size={28} color={Colors.primary} />
            <Text style={styles.statValor}>{distanciaTexto}</Text>
            <Text style={styles.statLabel}>Distancia</Text>
          </View>
        </View>

        <View style={styles.impactoCard}>
          <Text style={styles.impactoTitulo}>Impacto ecológico</Text>
          <View style={styles.co2Row}>
            <View style={styles.co2Icono}>
              <MaterialIcons name="eco" size={32} color={Colors.estadoDisponible} />
            </View>
            <View style={styles.co2Info}>
              <Text style={styles.co2Valor}>{co2.toFixed(2)} kg CO2</Text>
              <Text style={styles.co2Label}>evitados al ir en bici en vez de auto</Text>
            </View>
          </View>
          <View style={styles.impactoRow}>
            <View style={styles.impactoItem}>
              <MaterialIcons name="park" size={20} color={Colors.estadoDisponible} />
              <Text style={styles.impactoTexto}>
                Equivalente a lo que absorben {arboles} árboles en un día
              </Text>
            </View>
            <View style={styles.impactoItem}>
              <MaterialIcons name="home" size={20} color={Colors.primary} />
              <Text style={styles.impactoTexto}>
                Equivalente al consumo de {casas} hogares por hora
              </Text>
            </View>
          </View>
        </View>

        <TouchableOpacity
          style={styles.botonMapa}
          onPress={() => router.replace("/(tabs)")}
          activeOpacity={0.8}
        >
          <MaterialIcons name="map" size={22} color="#FFFFFF" />
          <Text style={styles.botonMapaTexto}>Volver al mapa</Text>
        </TouchableOpacity>
      </View>
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
  headerTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#111827",
  },
  cuerpo: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 24,
    gap: 20,
  },
  exitoContainer: {
    alignItems: "center",
    gap: 8,
  },
  exitoIcono: {
    marginBottom: 4,
  },
  exitoTitulo: {
    fontSize: 24,
    fontWeight: "800",
    color: "#111827",
  },
  exitoSubtitulo: {
    fontSize: 14,
    color: "#6B7280",
  },
  statsRow: {
    flexDirection: "row",
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 18,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    gap: 6,
  },
  statValor: {
    fontSize: 18,
    fontWeight: "800",
    color: "#111827",
  },
  statLabel: {
    fontSize: 12,
    color: "#6B7280",
  },
  impactoCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 18,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    gap: 14,
  },
  impactoTitulo: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
  },
  co2Row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    backgroundColor: "#D1FAE5",
    borderRadius: 12,
    padding: 14,
  },
  co2Icono: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#10B981",
    justifyContent: "center",
    alignItems: "center",
  },
  co2Info: {
    flex: 1,
  },
  co2Valor: {
    fontSize: 20,
    fontWeight: "800",
    color: "#065F46",
  },
  co2Label: {
    fontSize: 12,
    color: "#065F46",
    marginTop: 2,
  },
  impactoRow: {
    gap: 10,
  },
  impactoItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  impactoTexto: {
    fontSize: 13,
    color: "#6B7280",
    flex: 1,
  },
  botonMapa: {
    flexDirection: "row",
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  botonMapaTexto: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
});