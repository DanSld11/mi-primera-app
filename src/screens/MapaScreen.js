import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  ScrollView,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { getEstaciones } from "@/src/services/api";
import Colors from "@/src/constants/colors";
import MapView, { Marker } from "react-native-maps";
import { MaterialIcons } from "@expo/vector-icons";
import { useAuth } from "@/src/context/AuthContext";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const LIMA_REGION = {
  latitude: -12.1065,
  longitude: -77.0,
  latitudeDelta: 0.05,
  longitudeDelta: 0.05,
};

export default function MapaScreen() {
  const router = useRouter();
  const { logout } = useAuth();
  const insets = useSafeAreaInsets();

  const [estaciones, setEstaciones] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const data = await getEstaciones();
        setEstaciones(data || []);
      } catch (_err) {
        //silent
      } finally {
        setCargando(false);
      }
    })();
  }, []);

  const confirmarLogout = () => {
    Alert.alert(
      "Cerrar sesión",
      "¿Estás seguro de que deseas cerrar sesión?",
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Cerrar sesión", style: "destructive", onPress: () => logout() },
      ]
    );
  };

  const estacionesFiltradas = busqueda.trim()
    ? estaciones.filter((est) =>
        est.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        est.direccion.toLowerCase().includes(busqueda.toLowerCase())
      )
    : estaciones;

  return (
    <View style={styles.container}>
      {/* ── BARRA SUPERIOR ── */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <View style={styles.headerLeft}>
          <View style={styles.logoBadge}>
            <MaterialIcons name="directions-bike" size={18} color="#fff" />
          </View>
          <Text style={styles.headerTitle}>San Borja en Bici</Text>
        </View>
        <TouchableOpacity style={styles.avatarBtn} onPress={confirmarLogout}>
          <MaterialIcons name="person" size={20} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      {/* ── BARRA DE BÚSQUEDA ── */}
      <View style={styles.searchRow}>
        <View style={styles.searchBar}>
          <MaterialIcons name="search" size={18} color="#9CA3AF" style={{ marginRight: 8 }} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar estación..."
            placeholderTextColor="#9CA3AF"
            value={busqueda}
            onChangeText={setBusqueda}
          />
          {busqueda.length > 0 && (
            <TouchableOpacity onPress={() => setBusqueda("")}>
              <MaterialIcons name="close" size={18} color="#9CA3AF" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* ── MAPA ── */}
      <View style={styles.mapContainer}>
        <MapView
          style={StyleSheet.absoluteFillObject}
          initialRegion={LIMA_REGION}
          showsUserLocation
          showsMyLocationButton={false}
        >
          {estacionesFiltradas.map((est) => (
            <Marker
              key={est.id}
              coordinate={{
                latitude: est.latitud || -12.106,
                longitude: est.longitud || -77.0,
              }}
              onPress={() =>
                router.push({
                  pathname: "/detalle-estacion",
                  params: { estacion: JSON.stringify({ id: est.id }) },
                })
              }
            >
              <View style={[styles.marker, est.estado === "vacia" && { opacity: 0.5 }]}>
                <MaterialIcons name="directions-bike" size={16} color={Colors.primary} />
              </View>
            </Marker>
          ))}
        </MapView>

        {cargando && (
          <View style={styles.mapLoading}>
            <ActivityIndicator size="small" color={Colors.primary} />
          </View>
        )}
      </View>

      {/* ── PANEL INFERIOR DE ESTACIONES ── */}
      <View style={styles.bottomPanel}>
        <View style={styles.handleBar} />
        <View style={styles.panelHeader}>
          <Text style={styles.panelTitle}>Estaciones</Text>
          <Text style={styles.panelSub}>
            {busqueda.trim()
              ? `${estacionesFiltradas.length} resultado${estacionesFiltradas.length !== 1 ? "s" : ""}`
              : `${estaciones.length} disponibles`}
          </Text>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.stationsScroll}
        >
          {cargando ? (
            <ActivityIndicator size="small" color={Colors.primary} />
          ) : estacionesFiltradas.length === 0 ? (
            <Text style={styles.emptyText}>
              {busqueda.trim() ? "Sin resultados para tu búsqueda" : "Sin estaciones disponibles"}
            </Text>
          ) : (
            estacionesFiltradas.slice(0, 5).map((est) => (
              <TouchableOpacity
                key={est.id}
                style={styles.stationCard}
                onPress={() =>
                  router.push({
                    pathname: "/detalle-estacion",
                    params: { estacion: JSON.stringify({ id: est.id }) },
                  })
                }
              >
                <View style={styles.stationIconBg}>
                  <MaterialIcons name="directions-bike" size={18} color={Colors.primary} />
                </View>
                <Text style={styles.stationName} numberOfLines={1}>
                  {est.nombre}
                </Text>
                <Text style={styles.stationAddr} numberOfLines={1}>
                  {est.direccion}
                </Text>
                <View style={styles.stationBadge}>
                  <Text style={styles.stationBadgeText}>
                    {est.bicicletasDisponibles ?? "—"} bicis
                  </Text>
                </View>
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7FA",
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 10,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
  },
  headerLeft: { flexDirection: "row", alignItems: "center" },
  logoBadge: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: Colors.primary,
    letterSpacing: -0.3,
  },
  avatarBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(11,110,79,0.1)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(11,110,79,0.2)",
  },

  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: "#fff",
  },
  searchBar: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 42,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: "#111827",
  },

  mapContainer: {
    flex: 1,
  },
  mapLoading: {
    position: "absolute",
    top: 12,
    right: 12,
    backgroundColor: "#fff",
    padding: 6,
    borderRadius: 8,
    elevation: 3,
  },

  marker: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 5,
    borderWidth: 2,
    borderColor: Colors.primary,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },

  bottomPanel: {
    backgroundColor: "#fff",
    paddingTop: 8,
    paddingBottom: 12,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
  },
  handleBar: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#E5E7EB",
    alignSelf: "center",
    marginBottom: 10,
  },
  panelHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  panelTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#111827",
  },
  panelSub: {
    fontSize: 12,
    color: "#6B7280",
  },
  stationsScroll: {
    paddingHorizontal: 16,
    gap: 10,
  },

  stationCard: {
    width: 140,
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginRight: 10,
  },
  stationIconBg: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: "rgba(11,110,79,0.1)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  stationName: {
    fontSize: 13,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 2,
  },
  stationAddr: {
    fontSize: 11,
    color: "#6B7280",
    marginBottom: 6,
  },
  stationBadge: {
    backgroundColor: Colors.primary,
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    alignSelf: "flex-start",
  },
  stationBadgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#fff",
  },
  emptyText: {
    color: "#9CA3AF",
    fontSize: 13,
    paddingVertical: 12,
  },
});