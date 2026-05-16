import React, { useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { useViaje } from "@/src/context/ViajeContext";
import { cancelarViaje } from "@/src/services/viajeService";
import { marcarBicicletaDisponible } from "@/src/services/bicicletaService";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Colors from "@/src/constants/colors";
import { MaterialIcons } from "@expo/vector-icons";
import { TIEMPO_LIMITE_MINUTOS, TIEMPO_ADVERTENCIA_MINUTOS } from "@/src/constants/configViaje";

function formatTiempo(segundos) {
  const h = Math.floor(segundos / 3600);
  const m = Math.floor((segundos % 3600) / 60);
  const s = segundos % 60;
  if (h > 0) {
    return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function formatDistancia(km) {
  if (km < 1) {
    return `${Math.round(km * 1000)} m`;
  }
  return `${km.toFixed(2)} km`;
}

export default function ViajeActivoScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const {
    viajeId,
    bicicletaId,
    estacionOrigenId,
    duracionSegundos,
    distanciaKm,
    isViajeActivo,
    finalizarViaje: finalizarContext,
  } = useViaje();

  const duracionMinutos = duracionSegundos / 60;
  const tiempoExcedido = duracionMinutos > TIEMPO_LIMITE_MINUTOS;
  const tiempoAdvertencia = duracionMinutos > TIEMPO_ADVERTENCIA_MINUTOS && !tiempoExcedido;

  const handleFinalizar = useCallback(() => {
    const duracionMin = Math.round(duracionSegundos / 60);
    const co2 = distanciaKm * 0.15;

    router.replace({
      pathname: "/seleccionar-estacion",
      params: {
        duracion: String(duracionMin),
        distancia: String(distanciaKm.toFixed(2)),
        co2: String(co2.toFixed(2)),
        estacionOrigen: String(estacionOrigenId),
      },
    });
  }, [duracionSegundos, distanciaKm, estacionOrigenId, router]);

  const handleCancelar = useCallback(() => {
    Alert.alert(
      "Cancelar viaje",
      "¿Estás seguro de que deseas cancelar el viaje?",
      [
        { text: "No, continuar", style: "cancel" },
        {
          text: "Sí, cancelar",
          style: "destructive",
          onPress: async () => {
            try {
              await cancelarViaje(viajeId);
              await marcarBicicletaDisponible(bicicletaId, estacionOrigenId);
              finalizarContext();
              router.replace("/(tabs)");
            } catch {
              Alert.alert("Error", "No se pudo cancelar el viaje");
            }
          },
        },
      ]
    );
  }, [viajeId, bicicletaId, estacionOrigenId, finalizarContext, router]);

  if (!isViajeActivo) {
    return (
      <View style={styles.centrado}>
        <MaterialIcons name="directions-bike" size={64} color="#9CA3AF" />
        <Text style={styles.sinViajeTexto}>No tienes un viaje activo</Text>
        <TouchableOpacity style={styles.botonMapa} onPress={() => router.replace("/(tabs)")}>
          <Text style={styles.botonMapaTexto}>Ir al mapa</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.contenedor, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <View style={styles.headerIzq}>
          <View style={styles.pulsoIndicator}>
            <View style={styles.pulsoDot} />
            <Text style={styles.pulsoTexto}>En viaje</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.botonCancelar} onPress={handleCancelar}>
          <Text style={styles.botonCancelarTexto}>Cancelar</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.cuerpo}>
        <View style={styles.cronometroContainer}>
          <Text style={[styles.cronometro, tiempoExcedido && styles.cronometroExcedido, tiempoAdvertencia && styles.cronometroAdvertencia]}>
            {formatTiempo(duracionSegundos)}
          </Text>
          <Text style={styles.cronometroLabel}>tiempo de viaje</Text>
        </View>

        {(tiempoAdvertencia || tiempoExcedido) && (
          <View style={[styles.advertenciaBanner, tiempoExcedido ? styles.advertenciaError : styles.advertenciaAviso]}>
            <MaterialIcons name="warning" size={20} color={tiempoExcedido ? "#FFFFFF" : "#92400E"} />
            <View style={styles.advertenciaTexto}>
              <Text style={[styles.advertenciaTitulo, tiempoExcedido && styles.advertenciaTituloBlanco]}>
                {tiempoExcedido ? "Tiempo límite excedido" : "Advertencia de tiempo"}
              </Text>
              <Text style={[styles.advertenciaSub, tiempoExcedido && styles.advertenciaSubBlanco]}>
                {tiempoExcedido 
                  ? "Por favor, devuelve la bicicleta inmediatamente"
                  : `Te quedan ${Math.max(0, Math.round(TIEMPO_LIMITE_MINUTOS - duracionMinutos))} minutos antes del límite`}
              </Text>
            </View>
          </View>
        )}

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <MaterialIcons name="route" size={24} color={Colors.primary} />
            <Text style={styles.statValor}>{formatDistancia(distanciaKm)}</Text>
            <Text style={styles.statLabel}>Distancia</Text>
          </View>

          <View style={styles.statCard}>
            <MaterialIcons name="eco" size={24} color={Colors.estadoDisponible} />
            <Text style={styles.statValor}>{(distanciaKm * 0.15).toFixed(2)} kg</Text>
            <Text style={styles.statLabel}>CO2 ahorrado</Text>
          </View>
        </View>

        <View style={styles.reglasCard}>
          <Text style={styles.reglasTitulo}>Reglas del préstamo</Text>
          <View style={styles.regla}>
            <MaterialIcons name="schedule" size={18} color="#6B7280" />
            <Text style={styles.reglaTexto}>Devuelve la bici en la misma estación o en cualquier otra</Text>
          </View>
          <View style={styles.regla}>
            <MaterialIcons name="lock" size={18} color="#6B7280" />
            <Text style={styles.reglaTexto}>Asegura la bicicleta bien al anclaje</Text>
          </View>
          <View style={styles.regla}>
            <MaterialIcons name="priority-high" size={18} color="#6B7280" />
            <Text style={styles.reglaTexto}>Reporta cualquier problema de inmediato</Text>
          </View>
        </View>

        <View style={styles.botonesContainer}>
          <TouchableOpacity
            style={styles.botonIncidencia}
            onPress={() =>
              router.push({
                pathname: "/reporte-incidencia",
                params: { estacionId: String(estacionOrigenId) },
              })
            }
            activeOpacity={0.8}
          >
            <MaterialIcons name="report-problem" size={20} color={Colors.warning} />
            <Text style={styles.botonIncidenciaTexto}>Reportar incidencia</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.botonFinalizar}
            onPress={handleFinalizar}
            activeOpacity={0.8}
          >
            <MaterialIcons name="stop" size={24} color="#FFFFFF" />
            <Text style={styles.botonFinalizarTexto}>Finalizar viaje</Text>
          </TouchableOpacity>
        </View>
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  headerIzq: {
    flex: 1,
  },
  pulsoIndicator: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  pulsoDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.estadoDisponible,
  },
  pulsoTexto: {
    fontSize: 14,
    fontWeight: "700",
    color: Colors.estadoDisponible,
  },
  botonCancelar: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.error,
  },
  botonCancelarTexto: {
    color: Colors.error,
    fontSize: 13,
    fontWeight: "600",
  },
  cuerpo: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 20,
    gap: 20,
  },
  cronometroContainer: {
    alignItems: "center",
  },
  cronometro: {
    fontSize: 64,
    fontWeight: "800",
    color: Colors.primary,
    fontVariant: ["tabular-nums"],
  },
  cronometroLabel: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 4,
    textTransform: "uppercase",
    letterSpacing: 2,
  },
  cronometroExcedido: {
    color: Colors.error,
  },
  cronometroAdvertencia: {
    color: Colors.warning,
  },
  advertenciaBanner: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 12,
    gap: 10,
  },
  advertenciaAviso: {
    backgroundColor: "#FEF3C7",
  },
  advertenciaError: {
    backgroundColor: Colors.error,
  },
  advertenciaTexto: {
    flex: 1,
  },
  advertenciaTitulo: {
    fontSize: 14,
    fontWeight: "700",
    color: "#92400E",
  },
  advertenciaTituloBlanco: {
    color: "#FFFFFF",
  },
  advertenciaSub: {
    fontSize: 12,
    color: "#92400E",
    marginTop: 2,
  },
  advertenciaSubBlanco: {
    color: "#FFFFFF",
  },
  statsRow: {
    flexDirection: "row",
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 16,
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
    fontSize: 11,
    color: "#6B7280",
  },
  reglasCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 18,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    gap: 10,
  },
  reglasTitulo: {
    fontSize: 15,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 4,
  },
  regla: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  reglaTexto: {
    fontSize: 13,
    color: "#6B7280",
    flex: 1,
  },
  botonesContainer: {
    gap: 12,
  },
  botonIncidencia: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#FFF7ED",
    borderRadius: 12,
    paddingVertical: 14,
    borderWidth: 1.5,
    borderColor: Colors.warning,
  },
  botonIncidenciaTexto: {
    color: Colors.warning,
    fontSize: 15,
    fontWeight: "600",
  },
  botonFinalizar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
  },
  botonFinalizarTexto: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "700",
  },
  centrado: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5F7FA",
    padding: 32,
    gap: 12,
  },
  sinViajeTexto: {
    fontSize: 16,
    color: "#6B7280",
    marginTop: 8,
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