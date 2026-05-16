import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
} from "react-native";
import supabase from "../../src/services/supabase";
import Colors from "../../src/constants/colors";

export default function AdminIncidenciasScreen() {
  const [incidencias, setIncidencias] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const cargarIncidencias = async () => {
      try {
        const { data, error } = await supabase
          .from("incidencias")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) throw error;
        setIncidencias(data || []);
      } catch {
        // silent
      } finally {
        setCargando(false);
      }
    };

    cargarIncidencias();
  }, []);

  const formatearFecha = (fecha) => {
    if (!fecha) return "—";
    const d = new Date(fecha);
    return d.toLocaleDateString("es-PE", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (cargando) {
    return (
      <View style={styles.centrado}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitulo}>Reportes de incidencias</Text>
        <Text style={styles.headerSubtitulo}>
          {incidencias.length} incidencias registradas
        </Text>
      </View>

      {incidencias.length === 0 ? (
        <View style={styles.sinDatos}>
          <Text style={styles.sinDatosIcono}>📋</Text>
          <Text style={styles.sinDatosTexto}>No hay incidencias registradas</Text>
        </View>
      ) : (
        <FlatList
          data={incidencias}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.lista}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <View style={styles.tarjeta}>
              <View style={styles.tarjetaHeader}>
                <Text style={styles.tarjetaTipo}>{item.tipo}</Text>
                <Text style={styles.tarjetaFecha}>
                  {formatearFecha(item.created_at)}
                </Text>
              </View>
              {item.descripcion ? (
                <Text style={styles.tarjetaDescripcion}>{item.descripcion}</Text>
              ) : null}
              {item.estacion_id ? (
                <Text style={styles.tarjetaMeta}>
                  Estación #{item.estacion_id}
                </Text>
              ) : null}
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
  lista: {
    padding: 16,
  },
  sinDatos: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  sinDatosIcono: {
    fontSize: 48,
    marginBottom: 12,
  },
  sinDatosTexto: {
    fontSize: 16,
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
  },
  tarjetaFecha: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  tarjetaDescripcion: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
    marginBottom: 8,
  },
  tarjetaMeta: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: "600",
  },
});
