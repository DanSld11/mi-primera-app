import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "@/src/context/AuthContext";
import {
  getTotalEstaciones,
  getEstacionesPorEstado,
  getTotalIncidencias,
  getIncidenciasRecientes,
} from "@/src/services/adminService";
import Colors from "@/src/constants/colors";
import UpdateCheckerCard from "@/src/components/UpdateCheckerCard";

export default function AdminDashboardScreen() {
  const { perfil, logout } = useAuth();
  const router = useRouter();

  const [cargando, setCargando] = useState(true);
  const [refrescando, setRefrescando] = useState(false);
  const [error, setError] = useState(null);

  const [totalEstaciones, setTotalEstaciones] = useState(0);
  const [estados, setEstados] = useState({
    disponible: 0,
    pocas: 0,
    llena: 0,
    vacia: 0,
  });
  const [totalIncidencias, setTotalIncidencias] = useState(0);
  const [incidenciasRecientes, setIncidenciasRecientes] = useState([]);

  const cargarDatos = useCallback(async (mostrarLoader = true) => {
    if (mostrarLoader) setCargando(true);
    setError(null);

    try {
      const [total, porEstado, totalInc, recientes] = await Promise.all([
        getTotalEstaciones(),
        getEstacionesPorEstado(),
        getTotalIncidencias(),
        getIncidenciasRecientes(5),
      ]);

      setTotalEstaciones(total);
      setEstados(porEstado);
      setTotalIncidencias(totalInc);
      setIncidenciasRecientes(recientes);
    } catch (err) {
      setError("No se pudieron cargar los datos del dashboard.");
      console.error("[Dashboard] Error:", err.message);
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

  const formatearFecha = (fecha) => {
    if (!fecha) return "—";
    const d = new Date(fecha);
    return d.toLocaleDateString("es-PE", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const criticas = estados.llena + estados.vacia;

  const stats = [
    {
      label: "Total estaciones",
      value: String(totalEstaciones),
      icon: "📍",
      color: Colors.primary,
    },
    {
      label: "Disponibles",
      value: String(estados.disponible),
      icon: "✅",
      color: Colors.estadoDisponible,
    },
    {
      label: "Críticas",
      value: String(criticas),
      icon: "⚠️",
      color: Colors.error,
    },
    {
      label: "Incidencias",
      value: String(totalIncidencias),
      icon: "📋",
      color: Colors.warning,
    },
  ];

  if (cargando) {
    return (
      <View style={styles.centrado}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.cargandoTexto}>Cargando dashboard...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refrescando} onRefresh={onRefresh} />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerIcono}>🛡️</Text>
        <Text style={styles.headerTitulo}>Panel de Administrador</Text>
        <Text style={styles.headerSubtitulo}>
          {perfil?.nombre_completo
            ? `Hola, ${perfil.nombre_completo}`
            : perfil?.email || "Administrador"}
        </Text>
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

      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        {stats.map((stat, index) => (
          <View key={index} style={styles.statCard}>
            <Text style={styles.statIcono}>{stat.icon}</Text>
            <Text style={[styles.statValor, { color: stat.color }]}>
              {stat.value}
            </Text>
            <Text style={styles.statLabel}>{stat.label}</Text>
          </View>
        ))}
      </View>

      {/* Incidencias recientes */}
      <View style={styles.seccion}>
        <View style={styles.seccionHeader}>
          <Text style={styles.seccionTitulo}>Incidencias recientes</Text>
          <TouchableOpacity
            onPress={() => router.push("/(admin)/incidencias")}
            activeOpacity={0.7}
          >
            <Text style={styles.seccionLink}>Ver todas ›</Text>
          </TouchableOpacity>
        </View>

        {incidenciasRecientes.length === 0 ? (
          <View style={styles.sinDatos}>
            <Text style={styles.sinDatosIcono}>📭</Text>
            <Text style={styles.sinDatosTexto}>
              No hay incidencias registradas
            </Text>
          </View>
        ) : (
          incidenciasRecientes.map((inc) => (
            <TouchableOpacity
              key={inc.id}
              style={styles.incidenciaCard}
              activeOpacity={0.7}
              onPress={() => router.push("/(admin)/incidencias")}
            >
              <View style={styles.incidenciaHeader}>
                <Text style={styles.incidenciaTipo}>
                  {inc.tipo.replace(/_/g, " ")}
                </Text>
                <Text style={styles.incidenciaFecha}>
                  {formatearFecha(inc.createdAt)}
                </Text>
              </View>
              <Text style={styles.incidenciaEstacion}>
                📍 {inc.estacionNombre}
              </Text>
              {inc.descripcion ? (
                <Text style={styles.incidenciaDescripcion} numberOfLines={2}>
                  {inc.descripcion}
                </Text>
              ) : null}
            </TouchableOpacity>
          ))
        )}
      </View>

      {/* Acciones rápidas */}
      <View style={styles.seccion}>
        <Text style={styles.seccionTitulo}>Acciones rápidas</Text>
        <View style={styles.accionesGrid}>
          <TouchableOpacity
            style={styles.accionCard}
            onPress={() => router.push("/(admin)/estaciones")}
            activeOpacity={0.7}
          >
            <Text style={styles.accionIcono}>📍</Text>
            <Text style={styles.accionLabel}>Gestionar estaciones</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.accionCard}
            onPress={() => router.push("/(admin)/incidencias")}
            activeOpacity={0.7}
          >
            <Text style={styles.accionIcono}>📋</Text>
            <Text style={styles.accionLabel}>Ver incidencias</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Actualizaciones OTA */}
      <View style={styles.seccionTituloWrapper}>
        <Text style={[styles.seccionTitulo, { marginHorizontal: 16, marginBottom: 10 }]}>
          Sistema
        </Text>
      </View>
      <UpdateCheckerCard />

      {/* Cerrar sesión */}
      <TouchableOpacity
        style={styles.botonLogout}
        onPress={logout}
        activeOpacity={0.8}
      >
        <Text style={styles.botonLogoutTexto}>🚪 Cerrar sesión</Text>
      </TouchableOpacity>
    </ScrollView>
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
    backgroundColor: Colors.background,
  },
  cargandoTexto: {
    marginTop: 12,
    fontSize: 16,
    color: Colors.textSecondary,
  },

  header: {
    backgroundColor: Colors.primary,
    padding: 28,
    paddingTop: 60,
    alignItems: "center",
  },
  headerIcono: {
    fontSize: 48,
    marginBottom: 8,
  },
  headerTitulo: {
    fontSize: 22,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  headerSubtitulo: {
    fontSize: 15,
    color: "rgba(255,255,255,0.85)",
    marginTop: 6,
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

  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    padding: 12,
    gap: 10,
  },
  statCard: {
    flex: 1,
    minWidth: "45%",
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 18,
    alignItems: "center",
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  statIcono: {
    fontSize: 28,
    marginBottom: 8,
  },
  statValor: {
    fontSize: 28,
    fontWeight: "800",
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: "center",
    marginTop: 4,
    fontWeight: "500",
  },

  seccion: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  seccionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  seccionTitulo: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.textPrimary,
  },
  seccionTituloWrapper: {
    marginTop: 4,
  },
  seccionLink: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: "600",
  },

  sinDatos: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 32,
    alignItems: "center",
  },
  sinDatosIcono: {
    fontSize: 32,
    marginBottom: 8,
  },
  sinDatosTexto: {
    fontSize: 14,
    color: Colors.textSecondary,
  },

  incidenciaCard: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
    borderLeftWidth: 4,
    borderLeftColor: Colors.warning,
  },
  incidenciaHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 6,
  },
  incidenciaTipo: {
    fontSize: 15,
    fontWeight: "700",
    color: Colors.textPrimary,
    textTransform: "capitalize",
    flex: 1,
  },
  incidenciaFecha: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  incidenciaEstacion: {
    fontSize: 13,
    color: Colors.primary,
    fontWeight: "600",
    marginBottom: 4,
  },
  incidenciaDescripcion: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
  },

  accionesGrid: {
    gap: 10,
  },
  accionCard: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 18,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  accionIcono: {
    fontSize: 24,
    marginRight: 14,
  },
  accionLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: Colors.textPrimary,
  },

  botonLogout: {
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 40,
    backgroundColor: "#FEF2F2",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.error,
  },
  botonLogoutTexto: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.error,
  },
});
