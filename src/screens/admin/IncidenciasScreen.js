import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useRouter } from "expo-router";
import { getIncidencias } from "@/src/services/adminService";
import Colors from "@/src/constants/colors";

const ESTADOS_FILTRO = [
  { key: "todas", label: "Todas" },
  { key: "pendiente", label: "Pendientes" },
  { key: "en revision", label: "En revisión" },
  { key: "resuelta", label: "Resueltas" },
];

const ESTADO_COLORES = {
  pendiente: Colors.error,
  "en revision": Colors.warning,
  resuelta: Colors.success,
};

function formatearEstado(estado) {
  if (estado === "en revision") return "En revisión";
  return estado.charAt(0).toUpperCase() + estado.slice(1);
}

function formatearFecha(fecha) {
  if (!fecha) return "—";
  const d = new Date(fecha);
  return d.toLocaleDateString("es-PE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatearTipo(tipo) {
  return tipo.replace(/_/g, " ");
}

export default function IncidenciasScreen() {
  const router = useRouter();

  const [incidencias, setIncidencias] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [refrescando, setRefrescando] = useState(false);
  const [filtro, setFiltro] = useState("todas");
  const [error, setError] = useState(null);

  const cargarDatos = useCallback(async (mostrarLoader = true) => {
    if (mostrarLoader) setCargando(true);
    setError(null);
    try {
      const data = await getIncidencias();
      setIncidencias(data);
    } catch (err) {
      setError("No se pudieron cargar las incidencias.");
      console.error("[Incidencias] Error:", err.message);
    } finally {
      setCargando(false);
      setRefrescando(false);
    }
  }, []);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  const onRefresh = () => {
    setRefrescando(true);
    cargarDatos(false);
  };

  const incidenciasFiltradas =
    filtro === "todas"
      ? incidencias
      : incidencias.filter((inc) => inc.estado === filtro);

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.tarjeta}
      activeOpacity={0.7}
      onPress={() =>
        router.push({
          pathname: "/detalle-incidencia-admin",
          params: { id: String(item.id) },
        })
      }
    >
      <View style={styles.tarjetaHeader}>
        <Text style={styles.tarjetaTipo}>{formatearTipo(item.tipo)}</Text>
        <View
          style={[
            styles.badge,
            { backgroundColor: ESTADO_COLORES[item.estado] || Colors.disabled },
          ]}
        >
          <Text style={styles.badgeTexto}>{formatearEstado(item.estado)}</Text>
        </View>
      </View>
      <Text style={styles.tarjetaEstacion}>📍 {item.estacionNombre}</Text>
      <Text style={styles.tarjetaFecha}>{formatearFecha(item.createdAt)}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitulo}>Reportes de incidencias</Text>
        <Text style={styles.headerSubtitulo}>
          {incidencias.length} incidencias registradas
        </Text>
      </View>

      {/* Filtros */}
      <View style={styles.filtrosContainer}>
        <FlatList
          data={ESTADOS_FILTRO}
          keyExtractor={(item) => item.key}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtrosLista}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.filtroChip,
                filtro === item.key && styles.filtroChipActivo,
              ]}
              onPress={() => setFiltro(item.key)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.filtroChipTexto,
                  filtro === item.key && styles.filtroChipTextoActivo,
                ]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Error */}
      {error && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorTexto}>{error}</Text>
          <TouchableOpacity onPress={onRefresh} activeOpacity={0.7}>
            <Text style={styles.errorLink}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Lista */}
      {cargando ? (
        <View style={styles.centrado}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : (
        <FlatList
          data={incidenciasFiltradas}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.lista}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refrescando} onRefresh={onRefresh} />
          }
          renderItem={renderItem}
          ListEmptyComponent={() => (
            <View style={styles.sinDatos}>
              <Text style={styles.sinDatosIcono}>📭</Text>
              <Text style={styles.sinDatosTexto}>
                {filtro === "todas"
                  ? "No hay incidencias registradas"
                  : `No hay incidencias ${formatearEstado(filtro).toLowerCase()}`}
              </Text>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  centrado: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  header: {
    backgroundColor: Colors.surface,
    padding: 20,
    paddingTop: 24,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerTitulo: {
    fontSize: 22,
    fontWeight: "800",
    color: Colors.textPrimary,
  },
  headerSubtitulo: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 4,
  },

  filtrosContainer: {
    backgroundColor: Colors.surface,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  filtrosLista: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filtroChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.background,
  },
  filtroChipActivo: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filtroChipTexto: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.textSecondary,
  },
  filtroChipTextoActivo: {
    color: "#FFFFFF",
  },

  errorBanner: {
    backgroundColor: "#FEF2F2",
    margin: 16,
    borderRadius: 12,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderLeftWidth: 4,
    borderLeftColor: Colors.error,
  },
  errorTexto: {
    flex: 1,
    fontSize: 13,
    color: Colors.error,
    fontWeight: "600",
  },
  errorLink: {
    fontSize: 13,
    color: Colors.error,
    fontWeight: "700",
    textDecorationLine: "underline",
  },

  lista: {
    padding: 16,
    paddingBottom: 40,
  },
  sinDatos: {
    alignItems: "center",
    paddingVertical: 60,
  },
  sinDatosIcono: {
    fontSize: 48,
    marginBottom: 12,
  },
  sinDatosTexto: {
    fontSize: 15,
    color: Colors.textSecondary,
  },

  tarjeta: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
    borderLeftWidth: 4,
    borderLeftColor: Colors.warning,
  },
  tarjetaHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  tarjetaTipo: {
    fontSize: 15,
    fontWeight: "700",
    color: Colors.textPrimary,
    textTransform: "capitalize",
    flex: 1,
    marginRight: 8,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  badgeTexto: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "700",
  },
  tarjetaEstacion: {
    fontSize: 13,
    color: Colors.primary,
    fontWeight: "600",
    marginBottom: 4,
  },
  tarjetaFecha: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
});
