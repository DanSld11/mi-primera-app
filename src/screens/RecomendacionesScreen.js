import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import * as Location from "expo-location";
import { useRouter, useNavigation } from "expo-router";
import { getEstacionesCercanas } from "@/src/services/api";
import { useAuth } from "@/src/hooks/useAuth";
import Colors from "@/src/constants/colors";

function formatearDistancia(km) {
  if (km < 1) return `${Math.round(km * 1000)} m`;
  return `${km.toFixed(1)} km`;
}

function getEstadoColor(estado) {
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
}

function getEstadoLabel(estado) {
  switch (estado) {
    case "disponible":
      return "Disponible";
    case "pocas":
      return "Pocas";
    case "llena":
      return "Llena";
    case "vacia":
      return "Vacía";
    default:
      return "—";
  }
}

export default function RecomendacionesScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const { logout } = useAuth();
  const [ubicacion, setUbicacion] = useState(null);
  const [recomendaciones, setRecomendaciones] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [actualizando, setActualizando] = useState(false);

  const buscarRecomendaciones = useCallback(async (mostrarLoader = false) => {
    if (mostrarLoader) setActualizando(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setError("Permiso de ubicación denegado");
        setCargando(false);
        setActualizando(false);
        return;
      }
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      const miUbicacion = {
        latitud: location.coords.latitude,
        longitud: location.coords.longitude,
      };
      setUbicacion(miUbicacion);

      const data = await getEstacionesCercanas(
        miUbicacion.latitud,
        miUbicacion.longitud
      );
      setRecomendaciones(data);
      setError(null);
    } catch {
      setError("No se pudo conectar con el servidor");
    } finally {
      setCargando(false);
      setActualizando(false);
    }
  }, []);

  useEffect(() => {
    buscarRecomendaciones();
  }, [buscarRecomendaciones]);

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          onPress={logout}
          style={{ marginRight: 16, padding: 6 }}
          activeOpacity={0.7}
        >
          <Text style={{ color: '#FFFFFF', fontSize: 13, fontWeight: '600' }}>
            🚪 Salir
          </Text>
        </TouchableOpacity>
      ),
    });
  }, [navigation, logout]);

  const irADetalle = (estacion) => {
    router.push({
      pathname: "/detalle-estacion",
      params: { estacion: JSON.stringify(estacion) },
    });
  };

  if (cargando) {
    return (
      <View style={styles.centrado}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.textoCarga}>Buscando estaciones cercanas...</Text>
      </View>
    );
  }

  return (
    <View style={styles.contenedor}>
      {/* Cabecera */}
      <View style={styles.cabecera}>
        <Text style={styles.cabeceraTitulo}>Recomendadas para ti</Text>
        <Text style={styles.cabeceraSubtitulo}>
          Las 3 estaciones más cercanas con bicicletas disponibles
        </Text>
      </View>

      {error && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorTexto}>{error}</Text>
          <TouchableOpacity
            style={styles.errorBoton}
            onPress={() => buscarRecomendaciones(true)}
          >
            <Text style={styles.errorBotonTexto}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      )}

      {!error && recomendaciones.length === 0 && (
        <View style={styles.sinResultados}>
          <Text style={styles.sinResultadosIcono}>🚲</Text>
          <Text style={styles.sinResultadosTitulo}>
            No hay estaciones disponibles
          </Text>
          <Text style={styles.sinResultadosTexto}>
            Todas las estaciones cercanas están llenas o vacías. Intenta de
            nuevo en unos minutos.
          </Text>
          <TouchableOpacity
            style={styles.botonActualizar}
            onPress={() => buscarRecomendaciones(true)}
            activeOpacity={0.8}
          >
            <Text style={styles.botonActualizarTexto}>Actualizar</Text>
          </TouchableOpacity>
        </View>
      )}

      {recomendaciones.length > 0 && (
        <>
          <FlatList
            data={recomendaciones}
            keyExtractor={(item) => String(item.id)}
            contentContainerStyle={styles.lista}
            showsVerticalScrollIndicator={false}
            renderItem={({ item, index }) => (
              <TouchableOpacity
                style={styles.tarjeta}
                activeOpacity={0.7}
                onPress={() => irADetalle(item)}
              >
                <View style={styles.tarjetaRank}>
                  <Text style={styles.tarjetaRankNumero}>{index + 1}</Text>
                </View>

                <View style={styles.tarjetaInfo}>
                  <Text style={styles.tarjetaNombre}>{item.nombre}</Text>
                  <Text style={styles.tarjetaDireccion}>{item.direccion}</Text>
                  <View style={styles.tarjetaDetalles}>
                    <View style={styles.detalleItem}>
                      <Text style={styles.detalleIcono}>📍</Text>
                      <Text style={styles.detalleTexto}>
                        {formatearDistancia(item.distancia)}
                      </Text>
                    </View>
                    <View style={styles.detalleItem}>
                      <Text style={styles.detalleIcono}>🚲</Text>
                      <Text style={styles.detalleTexto}>
                        {item.bicicletasDisponibles} bicis
                      </Text>
                    </View>
                  </View>
                </View>

                <View style={styles.tarjetaBadge}>
                  <View
                    style={[
                      styles.badge,
                      { backgroundColor: getEstadoColor(item.estado) },
                    ]}
                  >
                    <Text style={styles.badgeTexto}>
                      {getEstadoLabel(item.estado)}
                    </Text>
                  </View>
                  <Text style={styles.tarjetaFlecha}>›</Text>
                </View>
              </TouchableOpacity>
            )}
          />

          <View style={styles.pie}>
            {ubicacion && (
              <Text style={styles.pieUbicacion}>
                Basado en tu ubicación actual
              </Text>
            )}
            <TouchableOpacity
              style={[
                styles.botonActualizar,
                actualizando && styles.botonActualizando,
              ]}
              onPress={() => buscarRecomendaciones(true)}
              activeOpacity={0.8}
              disabled={actualizando}
            >
              {actualizando ? (
                <ActivityIndicator size="small" color={Colors.primary} />
              ) : (
                <Text style={styles.botonActualizarTexto}>
                  Actualizar ubicación
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  centrado: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.background,
    padding: 32,
  },
  textoCarga: {
    marginTop: 12,
    fontSize: 16,
    color: Colors.textSecondary,
  },

  // Cabecera
  cabecera: {
    backgroundColor: Colors.surface,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  cabeceraTitulo: {
    fontSize: 22,
    fontWeight: "800",
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  cabeceraSubtitulo: {
    fontSize: 14,
    color: Colors.textSecondary,
  },

  // Error
  errorBanner: {
    backgroundColor: "#FEF2F2",
    margin: 16,
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderLeftWidth: 4,
    borderLeftColor: Colors.error,
  },
  errorTexto: {
    flex: 1,
    fontSize: 14,
    color: Colors.error,
    marginRight: 12,
  },
  errorBoton: {
    backgroundColor: Colors.error,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  errorBotonTexto: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "600",
  },

  // Sin resultados
  sinResultados: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  sinResultadosIcono: {
    fontSize: 48,
    marginBottom: 16,
  },
  sinResultadosTitulo: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  sinResultadosTexto: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 20,
  },

  // Lista
  lista: {
    padding: 16,
  },
  tarjeta: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  tarjetaRank: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primaryLight,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  tarjetaRankNumero: {
    fontSize: 16,
    fontWeight: "800",
    color: Colors.primary,
  },
  tarjetaInfo: {
    flex: 1,
    marginRight: 10,
  },
  tarjetaNombre: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  tarjetaDireccion: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  tarjetaDetalles: {
    flexDirection: "row",
    gap: 16,
  },
  detalleItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  detalleIcono: {
    fontSize: 13,
  },
  detalleTexto: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.textSecondary,
  },
  tarjetaBadge: {
    alignItems: "flex-end",
    gap: 6,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  badgeTexto: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
  },
  tarjetaFlecha: {
    fontSize: 22,
    color: Colors.disabled,
    fontWeight: "300",
  },

  // Pie
  pie: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    alignItems: "center",
    gap: 10,
  },
  pieUbicacion: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  botonActualizar: {
    borderWidth: 1.5,
    borderColor: Colors.primary,
    borderRadius: 10,
    paddingHorizontal: 20,
    paddingVertical: 10,
    minWidth: 180,
    alignItems: "center",
  },
  botonActualizando: {
    opacity: 0.6,
  },
  botonActualizarTexto: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: "600",
  },
});
