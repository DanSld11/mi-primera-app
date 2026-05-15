import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { getEstaciones } from "../services/api";
import Colors from "../constants/colors";

const getEstadoColor = (estado) => {
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
      return "Pocas";
    case "llena":
      return "Llena";
    case "vacia":
      return "Vacía";
    default:
      return "—";
  }
};

export default function MapaScreen() {
  const router = useRouter();
  const [estaciones, setEstaciones] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

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
        <Text style={styles.subtitulo}>Cargando estaciones...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centrado}>
        <Text style={styles.titulo}>Error</Text>
        <Text style={styles.subtitulo}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Estaciones de bicicletas</Text>
      <Text style={styles.subtitulo}>
        El mapa interactivo está disponible en la app móvil (iOS / Android).
      </Text>

      {estaciones.map((estacion) => (
        <TouchableOpacity
          key={estacion.id}
          style={styles.tarjeta}
          activeOpacity={0.7}
          onPress={() =>
            router.push({
              pathname: "/detalle-estacion",
              params: { estacion: JSON.stringify({ id: estacion.id }) },
            })
          }
        >
          <View style={styles.tarjetaHeader}>
            <Text style={styles.tarjetaNombre}>{estacion.nombre}</Text>
            <View
              style={[
                styles.badge,
                { backgroundColor: getEstadoColor(estacion.estado) },
              ]}
            >
              <Text style={styles.badgeTexto}>
                {getEstadoLabel(estacion.estado)}
              </Text>
            </View>
          </View>
          <Text style={styles.tarjetaDireccion}>{estacion.direccion}</Text>
          <Text style={styles.tarjetaBicis}>
            {estacion.bicicletasDisponibles} / {estacion.capacidadTotal}{" "}
            bicicletas
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  centrado: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.background,
    padding: 20,
  },
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    padding: 20,
  },
  titulo: {
    fontSize: 24,
    fontWeight: "800",
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  subtitulo: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 24,
  },
  tarjeta: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  tarjetaHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  tarjetaNombre: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.textPrimary,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  badgeTexto: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
  },
  tarjetaDireccion: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  tarjetaBicis: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.primary,
  },
});
