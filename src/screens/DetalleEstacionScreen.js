import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { getEstacionById, getEstacionesCercanas } from "../services/api";
import Colors from "../constants/colors";

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
      return "Pocas bicicletas";
    case "llena":
      return "Estación llena";
    case "vacia":
      return "Estación vacía";
    default:
      return "Desconocido";
  }
}

function getBadgeColor(estado) {
  if (estado === "disponible" || estado === "pocas") {
    return Colors.estadoDisponible;
  }
  if (estado === "llena" || estado === "vacia") {
    return Colors.estadoLlena;
  }
  return Colors.disabled;
}

export default function DetalleEstacionScreen() {
  const { estacion: estacionJSON } = useLocalSearchParams();
  const router = useRouter();

  const [estacion, setEstacion] = useState(null);
  const [alternativas, setAlternativas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const inicial = estacionJSON ? JSON.parse(estacionJSON) : null;
    if (!inicial) {
      setError("No se recibieron datos de la estación");
      setCargando(false);
      return;
    }

    (async () => {
      try {
        const data = await getEstacionById(inicial.id);
        setEstacion(data);

        if (data.estado === "llena" || data.estado === "vacia") {
          const cercanas = await getEstacionesCercanas(data.latitud, data.longitud);
          setAlternativas(
            cercanas.filter((e) => e.id !== data.id).slice(0, 2)
          );
        }
      } catch {
        setError("No se pudo conectar con el servidor");
      } finally {
        setCargando(false);
      }
    })();
  }, [estacionJSON]);

  if (cargando) {
    return (
      <View style={styles.centrado}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.errorTexto}>Cargando estación...</Text>
      </View>
    );
  }

  if (error || !estacion) {
    return (
      <View style={styles.centrado}>
        <Text style={styles.errorTitulo}>Estación no encontrada</Text>
        <Text style={styles.errorTexto}>
          {error || "No se pudo cargar la información de la estación."}
        </Text>
        <TouchableOpacity
          style={styles.botonVolver}
          onPress={() => router.back()}
          activeOpacity={0.8}
        >
          <Text style={styles.botonVolverTexto}>Volver al mapa</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const porcentaje = Math.round(
    (estacion.bicicletasDisponibles / estacion.capacidadTotal) * 100
  );

  const necesitaAlternativas = estacion.estado === "llena" || estacion.estado === "vacia";

  return (
    <ScrollView
      style={styles.contenedor}
      contentContainerStyle={styles.scroll}
      showsVerticalScrollIndicator={false}
    >
      {/* Cabecera */}
      <View style={styles.header}>
        <Text style={styles.titulo}>{estacion.nombre}</Text>
        <Text style={styles.direccion}>{estacion.direccion}</Text>
        <View
          style={[
            styles.estadoBadge,
            { backgroundColor: getBadgeColor(estacion.estado) },
          ]}
        >
          <Text style={styles.estadoBadgeTexto}>
            {getEstadoLabel(estacion.estado)}
          </Text>
        </View>
      </View>

      {/* Barra de ocupación */}
      <View style={styles.tarjeta}>
        <Text style={styles.seccionTitulo}>Ocupación</Text>

        <View style={styles.ocupacionNumeros}>
          <Text style={styles.ocupacionDisponibles}>
            {estacion.bicicletasDisponibles}
          </Text>
          <Text style={styles.ocupacionSeparador}>/</Text>
          <Text style={styles.ocupacionTotal}>{estacion.capacidadTotal}</Text>
          <Text style={styles.ocupacionUnidad}>bicicletas</Text>
        </View>

        <View style={styles.barraFondo}>
          <View
            style={[
              styles.barraRelleno,
              {
                width: `${Math.max(porcentaje, 4)}%`,
                backgroundColor: getEstadoColor(estacion.estado),
              },
            ]}
          />
        </View>

        <Text style={styles.ocupacionPorcentaje}>
          {porcentaje}% de ocupación
        </Text>
      </View>

      {/* Información general */}
      <View style={styles.tarjeta}>
        <Text style={styles.seccionTitulo}>Información</Text>
        <View style={styles.infoFila}>
          <Text style={styles.infoLabel}>ID de estación</Text>
          <Text style={styles.infoValor}>#{estacion.id}</Text>
        </View>
        <View style={styles.infoFila}>
          <Text style={styles.infoLabel}>Dirección</Text>
          <Text style={styles.infoValor}>{estacion.direccion}</Text>
        </View>
        <View style={styles.infoFila}>
          <Text style={styles.infoLabel}>Capacidad total</Text>
          <Text style={styles.infoValor}>
            {estacion.capacidadTotal} bicicletas
          </Text>
        </View>
        <View style={[styles.infoFila, styles.infoFilaUltima]}>
          <Text style={styles.infoLabel}>Coordenadas</Text>
          <Text style={styles.infoValor}>
            {estacion.latitud}, {estacion.longitud}
          </Text>
        </View>
      </View>

      {/* Estaciones alternativas (solo si está llena o vacía) */}
      {necesitaAlternativas && (
        <View style={styles.tarjetaAlternativas}>
          <Text style={styles.alternativasTitulo}>
            {estacion.estado === "llena"
              ? "No puedes devolver tu bicicleta aquí"
              : "No hay bicicletas disponibles"}
          </Text>
          <Text style={styles.alternativasSubtitulo}>
            Estaciones cercanas con disponibilidad:
          </Text>

          {alternativas.length > 0 ? (
            alternativas.map((alt) => (
              <TouchableOpacity
                key={alt.id}
                style={styles.alternativaTarjeta}
                activeOpacity={0.7}
                onPress={() =>
                  router.replace({
                    pathname: "/detalle-estacion",
                    params: { estacion: JSON.stringify({ id: alt.id }) },
                  })
                }
              >
                <View style={styles.alternativaInfo}>
                  <Text style={styles.alternativaNombre}>{alt.nombre}</Text>
                  <Text style={styles.alternativaDireccion}>
                    {alt.direccion}
                  </Text>
                  <Text style={styles.alternativaBicis}>
                    {alt.bicicletasDisponibles} bicis disponibles
                  </Text>
                </View>
                <View style={styles.alternativaDistancia}>
                  <Text style={styles.alternativaDistanciaValor}>
                    {alt.distancia < 1
                      ? `${Math.round(alt.distancia * 1000)} m`
                      : `${alt.distancia.toFixed(1)} km`}
                  </Text>
                  <View
                    style={[
                      styles.alternativaBadgeMini,
                      { backgroundColor: getBadgeColor(alt.estado) },
                    ]}
                  >
                    <Text style={styles.alternativaBadgeMiniTexto}>
                      {getEstadoLabel(alt.estado)}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <View style={styles.sinAlternativas}>
              <Text style={styles.sinAlternativasTexto}>
                No hay estaciones cercanas disponibles en este momento.
              </Text>
            </View>
          )}
        </View>
      )}

      {/* Botón reportar incidencia */}
      <TouchableOpacity
        style={styles.botonReporte}
        onPress={() =>
          router.push("/reporte-incidencia")
        }
        activeOpacity={0.8}
      >
        <Text style={styles.botonReporteTexto}>⚠️ Reportar incidencia</Text>
      </TouchableOpacity>

      {/* Botón volver */}
      <TouchableOpacity
        style={styles.botonVolver}
        onPress={() => router.back()}
        activeOpacity={0.8}
      >
        <Text style={styles.botonVolverTexto}>Volver al mapa</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scroll: {
    padding: 20,
    paddingBottom: 40,
  },
  centrado: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.background,
    padding: 32,
  },
  errorTitulo: {
    fontSize: 20,
    fontWeight: "700",
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  errorTexto: {
    fontSize: 15,
    color: Colors.textSecondary,
    textAlign: "center",
    marginBottom: 24,
  },

  // Header
  header: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 24,
    marginBottom: 16,
    alignItems: "center",
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  titulo: {
    fontSize: 24,
    fontWeight: "800",
    color: Colors.textPrimary,
    textAlign: "center",
    marginBottom: 6,
  },
  direccion: {
    fontSize: 15,
    color: Colors.textSecondary,
    textAlign: "center",
    marginBottom: 16,
  },
  estadoBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
  },
  estadoBadgeTexto: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },

  // Tarjeta genérica
  tarjeta: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  seccionTitulo: {
    fontSize: 17,
    fontWeight: "700",
    color: Colors.textPrimary,
    marginBottom: 16,
  },

  // Ocupación
  ocupacionNumeros: {
    flexDirection: "row",
    alignItems: "baseline",
    marginBottom: 16,
  },
  ocupacionDisponibles: {
    fontSize: 42,
    fontWeight: "800",
    color: Colors.textPrimary,
  },
  ocupacionSeparador: {
    fontSize: 28,
    fontWeight: "300",
    color: Colors.textSecondary,
    marginHorizontal: 6,
  },
  ocupacionTotal: {
    fontSize: 28,
    fontWeight: "600",
    color: Colors.textSecondary,
  },
  ocupacionUnidad: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginLeft: 8,
  },
  barraFondo: {
    height: 14,
    backgroundColor: Colors.border,
    borderRadius: 7,
    overflow: "hidden",
    marginBottom: 10,
  },
  barraRelleno: {
    height: "100%",
    borderRadius: 7,
  },
  ocupacionPorcentaje: {
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: "right",
  },

  // Información
  infoFila: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  infoFilaUltima: {
    borderBottomWidth: 0,
    paddingBottom: 0,
  },
  infoLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  infoValor: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.textPrimary,
    flexShrink: 1,
    textAlign: "right",
    marginLeft: 16,
  },

  // Alternativas
  tarjetaAlternativas: {
    backgroundColor: "#FFF7ED",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: Colors.warning,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  alternativasTitulo: {
    fontSize: 17,
    fontWeight: "700",
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  alternativasSubtitulo: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 16,
  },
  alternativaTarjeta: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.border,
  },
  alternativaInfo: {
    flex: 1,
    marginRight: 12,
  },
  alternativaNombre: {
    fontSize: 15,
    fontWeight: "700",
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  alternativaDireccion: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  alternativaBicis: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.primary,
  },
  alternativaDistancia: {
    alignItems: "flex-end",
  },
  alternativaDistanciaValor: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  alternativaBadgeMini: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  alternativaBadgeMiniTexto: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "600",
  },
  sinAlternativas: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
  },
  sinAlternativasTexto: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: "center",
  },

  // Botón volver
  botonReporte: {
    backgroundColor: "#FFF7ED",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    marginBottom: 12,
    borderWidth: 1.5,
    borderColor: Colors.warning,
  },
  botonReporteTexto: {
    color: Colors.warning,
    fontSize: 15,
    fontWeight: "600",
  },
  botonVolver: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 8,
  },
  botonVolverTexto: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});
