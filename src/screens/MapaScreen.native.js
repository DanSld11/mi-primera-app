import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location";
import { useRouter } from "expo-router";
import { useEstacionesRealtime } from "@/src/hooks/useEstacionesRealtime";
import Colors from "@/src/constants/colors";
import { MaterialIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

const getMarkerColor = (estado) => {
  switch (estado) {
    case "disponible": return Colors.estadoDisponible;
    case "pocas": return Colors.estadoPocas;
    case "llena": return Colors.estadoLlena;
    case "vacia": return Colors.estadoVacia;
    default: return Colors.disabled;
  }
};

const getEstadoLabel = (estado) => {
  switch (estado) {
    case "disponible": return "Disponible";
    case "pocas": return "Pocas bicis";
    case "llena": return "Llena";
    case "vacia": return "Vacía";
    default: return "Desconocido";
  }
};

export default function MapaScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const mapRef = useRef(null);
  const cardAnimation = useRef(new Animated.Value(SCREEN_HEIGHT)).current;

  const [ubicacion, setUbicacion] = useState(null);
  const [estacionSeleccionada, setEstacionSeleccionada] = useState(null);
  const [errorUbicacion, setErrorUbicacion] = useState(null);

  const { estaciones, cargando, errorApi } = useEstacionesRealtime();

  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          setErrorUbicacion("Permiso de ubicación denegado");
          ;
          return;
        }
        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        setUbicacion({
          latitud: location.coords.latitude,
          longitud: location.coords.longitude,
        });
      } catch {
        setErrorUbicacion("No se pudo obtener la ubicación");
      } finally {
        ;
      }
    })();
  }, []);

  const mostrarTarjeta = useCallback(
    (estacion) => {
      setEstacionSeleccionada(estacion);
      cardAnimation.setValue(SCREEN_HEIGHT);
      Animated.spring(cardAnimation, {
        toValue: 0,
        useNativeDriver: true,
        tension: 65,
        friction: 11,
      }).start();
    },
    [cardAnimation]
  );

  const ocultarTarjeta = useCallback(() => {
    Animated.timing(cardAnimation, {
      toValue: SCREEN_HEIGHT,
      duration: 250,
      useNativeDriver: true,
    }).start(() => setEstacionSeleccionada(null));
  }, [cardAnimation]);

  const irADetalle = useCallback(() => {
    if (!estacionSeleccionada) return;
    ocultarTarjeta();
    router.push({
      pathname: "/detalle-estacion",
      params: { estacion: JSON.stringify({ id: estacionSeleccionada.id }) },
    });
  }, [estacionSeleccionada, ocultarTarjeta, router]);

  const irAMiUbicacion = useCallback(() => {
    if (ubicacion && mapRef.current) {
      mapRef.current.animateToRegion(
        {
          latitude: ubicacion.latitud,
          longitude: ubicacion.longitud,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        },
        800
      );
    }
  }, [ubicacion]);

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
        <Text style={styles.textoCargando}>Cargando mapa...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.contenedor, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mapa</Text>
        <Text style={styles.headerSub}>Estaciones en tiempo real</Text>
      </View>
      <View style={styles.mapaContenedor}>
        <MapView
          ref={mapRef}
          style={styles.mapa}
          initialRegion={regionInicial}
          showsUserLocation={!!ubicacion}
          showsMyLocationButton={false}
          onPress={ocultarTarjeta}
        >
          {estaciones.map((estacion) => (
            <Marker
              key={estacion.id}
              coordinate={{
                latitude: estacion.latitud,
                longitude: estacion.longitud,
              }}
              pinColor={getMarkerColor(estacion.estado)}
              title={estacion.nombre}
              description={`${estacion.bicicletasDisponibles}/${estacion.capacidadTotal} bicis`}
              onPress={() => mostrarTarjeta(estacion)}
            />
          ))}
        </MapView>

        {/* Botones flotantes agrupados */}
        <View style={styles.floatingButtons}>
          {ubicacion && (
            <TouchableOpacity
              style={styles.fabButton}
              onPress={irAMiUbicacion}
              activeOpacity={0.8}
            >
              <MaterialIcons name="my-location" size={20} color={Colors.primary} />
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={[styles.fabButton, { backgroundColor: Colors.primary }]}
            onPress={() => router.push("/recomendaciones")}
            activeOpacity={0.8}
          >
            <MaterialIcons name="star" size={20} color="#FFFFFF" />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.fabButton, { backgroundColor: Colors.warning }]}
            onPress={() => router.push("/reporte-incidencia")}
            activeOpacity={0.8}
          >
            <MaterialIcons name="report-problem" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Leyenda compacta */}
        <View style={styles.leyenda}>
          <View style={styles.leyendaItem}>
            <View style={[styles.leyendaPunto, { backgroundColor: Colors.estadoDisponible }]} />
            <Text style={styles.leyendaTexto}>Disponible</Text>
          </View>
          <View style={styles.leyendaItem}>
            <View style={[styles.leyendaPunto, { backgroundColor: Colors.estadoPocas }]} />
            <Text style={styles.leyendaTexto}>Pocas</Text>
          </View>
          <View style={styles.leyendaItem}>
            <View style={[styles.leyendaPunto, { backgroundColor: Colors.estadoLlena }]} />
            <Text style={styles.leyendaTexto}>Llena</Text>
          </View>
          <View style={styles.leyendaItem}>
            <View style={[styles.leyendaPunto, { backgroundColor: Colors.estadoVacia }]} />
            <Text style={styles.leyendaTexto}>Vacía</Text>
          </View>
        </View>

        {/* Tarjeta de estación seleccionada */}
        {estacionSeleccionada && (
          <Animated.View
            style={[
              styles.tarjeta,
              { transform: [{ translateY: cardAnimation }] },
            ]}
          >
            <View style={styles.tarjetaHandle} />
            <View style={styles.tarjetaHeader}>
              <View style={styles.tarjetaHeaderTexto}>
                <Text style={styles.tarjetaTitulo}>
                  {estacionSeleccionada.nombre}
                </Text>
                <Text style={styles.tarjetaDireccion}>
                  {estacionSeleccionada.direccion}
                </Text>
              </View>
              <View
                style={[
                  styles.estadoBadge,
                  { backgroundColor: getMarkerColor(estacionSeleccionada.estado) },
                ]}
              >
                <Text style={styles.estadoBadgeTexto}>
                  {getEstadoLabel(estacionSeleccionada.estado)}
                </Text>
              </View>
            </View>

            <View style={styles.tarjetaInfo}>
              <Text style={styles.infoEtiqueta}>Bicicletas disponibles</Text>
              <Text style={styles.infoValor}>
                {estacionSeleccionada.bicicletasDisponibles} / {estacionSeleccionada.capacidadTotal}
              </Text>
            </View>

            <TouchableOpacity
              style={styles.botonDetalle}
              onPress={irADetalle}
              activeOpacity={0.8}
            >
              <Text style={styles.botonDetalleTexto}>Ver detalle</Text>
            </TouchableOpacity>
          </Animated.View>
        )}

        {errorUbicacion && (
          <View style={styles.errorBanner}>
            <Text style={styles.errorTexto}>{errorUbicacion}</Text>
          </View>
        )}

        {errorApi && (
          <View style={[styles.errorBanner, { backgroundColor: Colors.warning }]}>
            <Text style={styles.errorTexto}>{errorApi}</Text>
          </View>
        )}
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
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    flexDirection: "row",
    alignItems: "baseline",
    gap: 8,
  },
  headerTitle: { fontSize: 20, fontWeight: "800", color: "#111827" },
  headerSub: { fontSize: 13, color: "#6B7280" },
  mapaContenedor: {
    flex: 1,
    position: "relative",
  },
  mapa: {
    ...StyleSheet.absoluteFillObject,
  },
  centrado: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5F7FA",
    padding: 32,
    gap: 8,
  },
  textoCargando: {
    marginTop: 8,
    color: "#6B7280",
    fontSize: 14,
  },
  floatingButtons: {
    position: "absolute",
    right: 12,
    top: 12,
    gap: 8,
  },
  fabButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  leyenda: {
    position: "absolute",
    top: 12,
    left: 12,
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    gap: 4,
  },
  leyendaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  leyendaPunto: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  leyendaTexto: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
  tarjeta: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingBottom: 20,
    paddingTop: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
  },
  tarjetaHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#E5E7EB",
    alignSelf: "center",
    marginBottom: 12,
  },
  tarjetaHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  tarjetaHeaderTexto: {
    flex: 1,
    marginRight: 12,
  },
  tarjetaTitulo: {
    fontSize: 18,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 2,
  },
  tarjetaDireccion: {
    fontSize: 13,
    color: "#6B7280",
  },
  estadoBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  estadoBadgeTexto: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
  },
  tarjetaInfo: {
    backgroundColor: "#F5F7FA",
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  infoEtiqueta: {
    fontSize: 13,
    color: "#6B7280",
  },
  infoValor: {
    fontSize: 16,
    fontWeight: "800",
    color: "#111827",
  },
  botonDetalle: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
  },
  botonDetalleTexto: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "600",
  },
  errorBanner: {
    position: "absolute",
    top: 12,
    left: 12,
    right: 12,
    backgroundColor: Colors.error,
    borderRadius: 10,
    padding: 10,
  },
  errorTexto: {
    color: "#FFFFFF",
    textAlign: "center",
    fontSize: 13,
    fontWeight: "500",
  },
});