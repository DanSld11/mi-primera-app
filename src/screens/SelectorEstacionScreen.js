import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { getEstaciones } from "@/src/services/api";
import { finalizarViaje, actualizarContadoresEstacion } from "@/src/services/viajeService";
import { marcarBicicletaDisponible } from "@/src/services/bicicletaService";
import { useViaje } from "@/src/context/ViajeContext";
import Colors from "@/src/constants/colors";
import { MaterialIcons } from "@expo/vector-icons";

function getEstadoConfig(estado) {
  switch (estado) {
    case "disponible": return { label: "Disponible", color: "#065F46", bg: "#D1FAE5", dot: Colors.estadoDisponible };
    case "pocas": return { label: "Pocas bicis", color: "#92400E", bg: "#FEF3C7", dot: Colors.estadoPocas };
    case "llena": return { label: "Llena", color: "#1E40AF", bg: "#DBEAFE", dot: Colors.estadoLlena };
    case "vacia": return { label: "Vacía", color: "#991B1B", bg: "#FEE2E2", dot: Colors.estadoVacia };
    default: return { label: "—", color: "#6B7280", bg: "#F3F4F6", dot: "#9CA3AF" };
  }
}

export default function SelectorEstacionScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();

  const duracion = Number(params.duracion) || 0;
  const distancia = Number(params.distancia) || 0;
  const co2 = Number(params.co2) || 0;

  const { viajeId, bicicletaId, estacionOrigenId, finalizeViaje: finalizeContext } = useViaje();

  const [estaciones, setEstaciones] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [finalizando, setFinalizando] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const data = await getEstaciones();
        setEstaciones(data);
      } catch {
        setError("No se pudieron cargar las estaciones");
      } finally {
        setCargando(false);
      }
    })();
  }, []);

  const handleSeleccionar = async (estacion) => {
    setFinalizando(true);
    setError(null);

    try {
      const destinoId = estacion.id;
      const duracionMin = duracion;

      await finalizarViaje({
        viajeId,
        estacionDestinoId: destinoId,
        distanciaKm: distancia,
        duracionMinutos: duracionMin,
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
        <Text style={styles.headerTitle}>Devolver bicicleta</Text>
        <Text style={styles.headerSub}>Selecciona la estación de destino</Text>
      </View>

      {error && (
        <View style={styles.errorBanner}>
          <MaterialIcons name="error-outline" size={18} color="#FFFFFF" />
          <Text style={styles.errorTexto}>{error}</Text>
        </View>
      )}

      <FlatList
        data={estaciones}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.lista}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => {
          const cfg = getEstadoConfig(item.estado);
          const pct = item.capacidadTotal
            ? Math.round((item.bicicletasDisponibles / item.capacidadTotal) * 100)
            : 0;
          const puedeDevolver = item.estado !== "llena";

          return (
            <TouchableOpacity
              style={[styles.tarjeta, !puedeDevolver && styles.tarjetaDisabled]}
              onPress={() => puedeDevolver && handleSeleccionar(item)}
              disabled={finalizando || !puedeDevolver}
              activeOpacity={0.7}
            >
              <View style={styles.tarjetaTop}>
                <View style={styles.tarjetaIconBg}>
                  <MaterialIcons name="directions-bike" size={22} color={Colors.primary} />
                </View>
                <View style={styles.tarjetaInfo}>
                  <Text style={styles.tarjetaNombre}>{item.nombre}</Text>
                  <Text style={styles.tarjetaDir} numberOfLines={1}>{item.direccion}</Text>
                </View>
                <View style={[styles.badge, { backgroundColor: cfg.bg }]}>
                  <View style={[styles.badgeDot, { backgroundColor: cfg.dot }]} />
                  <Text style={[styles.badgeText, { color: cfg.color }]}>{cfg.label}</Text>
                </View>
              </View>

              <View style={styles.barraFondo}>
                <View
                  style={[
                    styles.barraRelleno,
                    { width: `${Math.max(pct, 4)}%`, backgroundColor: cfg.color },
                  ]}
                />
              </View>

              <View style={styles.tarjetaBottom}>
                <Text style={styles.tarjetaBicis}>
                  <Text style={{ fontWeight: "700", color: Colors.primary }}>
                    {item.bicicletasDisponibles ?? "—"}
                  </Text>
                  {" / "}{item.capacidadTotal ?? "—"} bicicletas
                </Text>
                {puedeDevolver ? (
                  <MaterialIcons name="chevron-right" size={18} color="#9CA3AF" />
                ) : (
                  <Text style={styles.llenaTexto}>Llena</Text>
                )}
              </View>
            </TouchableOpacity>
          );
        }}
      />
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
  headerSub: {
    fontSize: 13,
    color: "#6B7280",
    marginTop: 2,
  },
  errorBanner: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 16,
    marginTop: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: Colors.error,
    gap: 8,
  },
  errorTexto: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "500",
    flexShrink: 1,
  },
  lista: {
    padding: 16,
    gap: 10,
    paddingBottom: 40,
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
  tarjetaDisabled: {
    opacity: 0.5,
  },
  tarjetaTop: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  tarjetaIconBg: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: "rgba(11,110,79,0.08)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  tarjetaInfo: {
    flex: 1,
    marginRight: 8,
  },
  tarjetaNombre: {
    fontSize: 15,
    fontWeight: "700",
    color: "#111827",
  },
  tarjetaDir: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 1,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  badgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "600",
  },
  barraFondo: {
    height: 6,
    backgroundColor: "#F3F4F6",
    borderRadius: 3,
    overflow: "hidden",
    marginBottom: 8,
  },
  barraRelleno: {
    height: "100%",
    borderRadius: 3,
  },
  tarjetaBottom: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  tarjetaBicis: {
    fontSize: 13,
    color: "#6B7280",
  },
  llenaTexto: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.estadoLlena,
  },
  centrado: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5F7FA",
    padding: 32,
  },
  cargandoTexto: {
    marginTop: 8,
    fontSize: 14,
    color: "#6B7280",
  },
});