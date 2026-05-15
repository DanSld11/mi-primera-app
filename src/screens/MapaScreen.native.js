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
import { getEstaciones } from "../services/api";
import Colors from "../constants/colors";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

const getMarkerColor = (estado) => {
  switch (estado) {
    case "disponible":
      return Colors.estadoDisponible;
    case "pocas":
      return Colors.estadoPocas;
    case "llena":
      return Colors.estadoLlena;
    case "vacia":
      return Colors.estadoVacia;
    default:
      return Colors.disabled;
  }
};

const getEstadoLabel = (estado) => {
  switch (estado) {
    case "disponible":
      return "Disponible";
    case "pocas":
      return "Pocas bicis";
    case "llena":
      return "Llena";
    case "vacia":
      return "Vacía";
    default:
      return "Desconocido";
  }
};

export default function MapaScreen() {
  const router = useRouter();
  const mapRef = useRef(null);
  const cardAnimation = useRef(new Animated.Value(SCREEN_HEIGHT)).current;

  const [ubicacion, setUbicacion] = useState(null);
  const [estaciones, setEstaciones] = useState([]);
  const [estacionSeleccionada, setEstacionSeleccionada] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [errorUbicacion, setErrorUbicacion] = useState(null);
  const [errorApi, setErrorApi] = useState(null);

  // Cargar estaciones desde el backend
  const cargarEstaciones = useCallback(async () => {
    try {
      const data = await getEstaciones();
      setEstaciones(data);
      setErrorApi(null);
    } catch {
      setErrorApi("No se pudo conectar con el servidor");
    }
  }, []);

  useEffect(() => {
    cargarEstaciones();
  }, [cargarEstaciones]);

  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          setErrorUbicacion("Permiso de ubicación denegado");
          setCargando(false);
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
        setCargando(false);
      }
    })();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      cargarEstaciones();
    }, 10000);

    return () => clearInterval(interval);
  }, [cargarEstaciones]);

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
    const estacion = estaciones.find((e) => e.id === estacionSeleccionada.id);
    ocultarTarjeta();
    router.push({
      pathname: "/detalle-estacion",
      params: { estacion: JSON.stringify({ id: estacionSeleccionada.id }) },
    });
  }, [estacionSeleccionada, estaciones, ocultarTarjeta, router]);

  // Centrar en San Borja, Lima, Perú
  // Coordenadas ajustadas para abarcar todas las estaciones verificadas
  const regionInicial = {
    latitude: -12.0970,
    longitude: -76.9970,
    latitudeDelta: 0.025,
    longitudeDelta: 0.020,
  };

  const irAMiUbicacion = useCallback(() => {
    if (ubicacion && mapRef.current) {
      mapRef.current.animateToRegion(
        {
          latitude: ubicacion.latitud,
          longitude: ubicacion.longitud,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        },
        1000
      );
    }
  }, [ubicacion]);

  if (cargando) {
    return (
      <View style={styles.centrado}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.textoCargando}>Cargando mapa...</Text>
      </View>
    );
  }

  return (
    <View style={styles.contenedor}>
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

      {/* Botón flotante: ir a mi ubicación */}
      {ubicacion && (
        <TouchableOpacity
          style={styles.botonUbicacion}
          onPress={irAMiUbicacion}
          activeOpacity={0.8}
        >
          <Text style={styles.botonUbicacionIcono}>📍</Text>
        </TouchableOpacity>
      )}

      {/* Botón flotante: recomendaciones */}
      <TouchableOpacity
        style={styles.botonRecomendaciones}
        onPress={() => router.push("/recomendaciones")}
        activeOpacity={0.8}
      >
        <Text style={styles.botonRecomendacionesIcono}>⭐</Text>
      </TouchableOpacity>

      {/* Botón flotante: reportar incidencia */}
      <TouchableOpacity
        style={styles.botonReporte}
        onPress={() => router.push("/reporte-incidencia")}
        activeOpacity={0.8}
      >
        <Text style={styles.botonReporteIcono}>⚠️</Text>
      </TouchableOpacity>

      {/* Leyenda de colores */}
      <View style={styles.leyenda}>
        <View style={styles.leyendaItem}>
          <View style={[styles.leyendaColor, { backgroundColor: Colors.estadoDisponible }]} />
          <Text style={styles.leyendaTexto}>Disponible</Text>
        </View>
        <View style={styles.leyendaItem}>
          <View style={[styles.leyendaColor, { backgroundColor: Colors.estadoPocas }]} />
          <Text style={styles.leyendaTexto}>Pocas</Text>
        </View>
        <View style={styles.leyendaItem}>
          <View style={[styles.leyendaColor, { backgroundColor: Colors.estadoLlena }]} />
          <Text style={styles.leyendaTexto}>Llena</Text>
        </View>
        <View style={styles.leyendaItem}>
          <View style={[styles.leyendaColor, { backgroundColor: Colors.estadoVacia }]} />
          <Text style={styles.leyendaTexto}>Vacía</Text>
        </View>
      </View>

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
            <View style={styles.infoFila}>
              <Text style={styles.infoEtiqueta}>Bicicletas disponibles</Text>
              <Text style={styles.infoValor}>
                {estacionSeleccionada.bicicletasDisponibles} /{" "}
                {estacionSeleccionada.capacidadTotal}
              </Text>
            </View>
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
  );
}

const styles = StyleSheet.create({
  contenedor: {
    flex: 1,
  },
  mapa: {
    flex: 1,
  },
  centrado: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.background,
  },
  textoCargando: {
    marginTop: 12,
    color: Colors.textSecondary,
    fontSize: 16,
  },
  tarjeta: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingBottom: 34,
    paddingTop: 12,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 10,
  },
  tarjetaHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.border,
    alignSelf: "center",
    marginBottom: 16,
  },
  tarjetaHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  tarjetaHeaderTexto: {
    flex: 1,
    marginRight: 12,
  },
  tarjetaTitulo: {
    fontSize: 20,
    fontWeight: "700",
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  tarjetaDireccion: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  estadoBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  estadoBadgeTexto: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "600",
  },
  tarjetaInfo: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  infoFila: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  infoEtiqueta: {
    fontSize: 15,
    color: Colors.textSecondary,
  },
  infoValor: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.textPrimary,
  },
  botonDetalle: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  botonDetalleTexto: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  errorBanner: {
    position: "absolute",
    top: 10,
    left: 20,
    right: 20,
    backgroundColor: Colors.error,
    borderRadius: 10,
    padding: 14,
  },
  errorTexto: {
    color: "#FFFFFF",
    textAlign: "center",
    fontSize: 14,
    fontWeight: "500",
  },
  botonUbicacion: {
    position: "absolute",
    top: 10,
    right: 16,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.surface,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  botonUbicacionIcono: {
    fontSize: 20,
  },
  botonRecomendaciones: {
    position: "absolute",
    top: 62,
    right: 16,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primary,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  botonRecomendacionesIcono: {
    fontSize: 20,
  },
  botonReporte: {
    position: "absolute",
    top: 114,
    right: 16,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.warning,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  botonReporteIcono: {
    fontSize: 18,
  },
  leyenda: {
    position: "absolute",
    top: 64,
    left: 16,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 12,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    gap: 6,
  },
  leyendaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  leyendaColor: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  leyendaTexto: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
});
