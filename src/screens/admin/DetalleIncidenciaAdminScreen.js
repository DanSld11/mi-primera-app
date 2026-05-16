import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Image,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { getIncidencias, actualizarEstadoIncidencia } from "@/src/services/adminService";
import Colors from "@/src/constants/colors";

const ESTADOS_OPCIONES = [
  { key: "pendiente", label: "Pendiente", color: Colors.error },
  { key: "en revision", label: "En revisión", color: Colors.warning },
  { key: "resuelta", label: "Resuelta", color: Colors.success },
];

function formatearFecha(fecha) {
  if (!fecha) return "—";
  const d = new Date(fecha);
  return d.toLocaleDateString("es-PE", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatearTipo(tipo) {
  return tipo.replace(/_/g, " ");
}

export default function DetalleIncidenciaAdminScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const [incidencia, setIncidencia] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [estadoSeleccionado, setEstadoSeleccionado] = useState(null);
  const [mensaje, setMensaje] = useState(null);

  useEffect(() => {
    const cargar = async () => {
      try {
        const todas = await getIncidencias();
        const found = todas.find((inc) => String(inc.id) === String(id));
        if (found) {
          setIncidencia(found);
          setEstadoSeleccionado(found.estado);
        }
      } catch (err) {
        console.error("[DetalleIncidencia] Error:", err.message);
      } finally {
        setCargando(false);
      }
    };
    cargar();
  }, [id]);

  function mostrarMensaje(texto, tipo = "exito") {
    setMensaje({ texto, tipo });
    setTimeout(() => setMensaje(null), 3000);
  }

  async function guardarCambios() {
    if (!estadoSeleccionado || estadoSeleccionado === incidencia.estado) {
      mostrarMensaje("Selecciona un estado diferente al actual.", "error");
      return;
    }

    setGuardando(true);
    try {
      await actualizarEstadoIncidencia(Number(id), estadoSeleccionado);
      setIncidencia((prev) => ({ ...prev, estado: estadoSeleccionado }));
      mostrarMensaje("Estado actualizado correctamente.");
    } catch (err) {
      mostrarMensaje(
        err.message?.includes("row-level security")
          ? "No tienes permisos para actualizar incidencias."
          : "Ocurrió un error al guardar. Intenta de nuevo.",
        "error"
      );
    } finally {
      setGuardando(false);
    }
  }

  if (cargando) {
    return (
      <View style={styles.centrado}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.cargandoTexto}>Cargando incidencia...</Text>
      </View>
    );
  }

  if (!incidencia) {
    return (
      <View style={styles.centrado}>
        <Text style={styles.errorTitulo}>Incidencia no encontrada</Text>
        <TouchableOpacity
          style={styles.botonVolver}
          onPress={() => router.back()}
          activeOpacity={0.8}
        >
          <Text style={styles.botonVolverTexto}>Volver</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scroll}
      showsVerticalScrollIndicator={false}
    >
      {/* Mensaje flotante */}
      {mensaje && (
        <View
          style={[
            styles.mensajeBanner,
            mensaje.tipo === "error" && styles.mensajeError,
          ]}
        >
          <Text style={styles.mensajeTexto}>{mensaje.texto}</Text>
        </View>
      )}

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTipo}>{formatearTipo(incidencia.tipo)}</Text>
        <Text style={styles.headerFecha}>
          Reportado el {formatearFecha(incidencia.createdAt)}
        </Text>
      </View>

      {/* Info */}
      <View style={styles.tarjeta}>
        <View style={styles.infoFila}>
          <Text style={styles.infoLabel}>Estación</Text>
          <Text style={styles.infoValor}>{incidencia.estacionNombre}</Text>
        </View>
        <View style={[styles.infoFila, styles.infoFilaUltima]}>
          <Text style={styles.infoLabel}>ID de reporte</Text>
          <Text style={styles.infoValor}>#{incidencia.id}</Text>
        </View>
      </View>

      {/* Descripción */}
      <View style={styles.tarjeta}>
        <Text style={styles.seccionTitulo}>Descripción</Text>
        <Text style={styles.descripcionTexto}>
          {incidencia.descripcion || "Sin descripción proporcionada."}
        </Text>
      </View>

      {/* Foto */}
      {incidencia.fotoUrl ? (
        <View style={styles.tarjeta}>
          <Text style={styles.seccionTitulo}>Foto adjunta</Text>
          <Image
            source={{ uri: incidencia.fotoUrl }}
            style={styles.foto}
            resizeMode="cover"
          />
        </View>
      ) : null}

      {/* Cambiar estado */}
      <View style={styles.tarjeta}>
        <Text style={styles.seccionTitulo}>Estado del reporte</Text>
        <View style={styles.estadosGrid}>
          {ESTADOS_OPCIONES.map((opcion) => (
            <TouchableOpacity
              key={opcion.key}
              style={[
                styles.estadoOpcion,
                estadoSeleccionado === opcion.key && {
                  borderColor: opcion.color,
                  backgroundColor: opcion.color + "15",
                },
              ]}
              onPress={() => setEstadoSeleccionado(opcion.key)}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.estadoDot,
                  { backgroundColor: opcion.color },
                ]}
              />
              <Text
                style={[
                  styles.estadoOpcionTexto,
                  estadoSeleccionado === opcion.key && {
                    color: opcion.color,
                    fontWeight: "700",
                  },
                ]}
              >
                {opcion.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          style={[
            styles.botonGuardar,
            guardando && styles.botonGuardando,
          ]}
          onPress={guardarCambios}
          activeOpacity={0.8}
          disabled={guardando}
        >
          {guardando ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.botonGuardarTexto}>Guardar cambios</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Volver */}
      <TouchableOpacity
        style={styles.botonVolverSecundario}
        onPress={() => router.back()}
        activeOpacity={0.7}
      >
        <Text style={styles.botonVolverSecundarioTexto}>← Volver al listado</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scroll: {
    padding: 16,
    paddingBottom: 40,
  },
  centrado: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.background,
    padding: 32,
  },
  cargandoTexto: {
    marginTop: 12,
    fontSize: 16,
    color: Colors.textSecondary,
  },
  errorTitulo: {
    fontSize: 20,
    fontWeight: "700",
    color: Colors.textPrimary,
    marginBottom: 16,
  },

  mensajeBanner: {
    backgroundColor: "#ECFDF5",
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginBottom: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: Colors.success,
  },
  mensajeError: {
    backgroundColor: "#FEF2F2",
    borderLeftColor: Colors.error,
  },
  mensajeTexto: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.textPrimary,
  },

  header: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    alignItems: "center",
  },
  headerTipo: {
    fontSize: 22,
    fontWeight: "800",
    color: Colors.textPrimary,
    textAlign: "center",
    textTransform: "capitalize",
    marginBottom: 6,
  },
  headerFecha: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: "center",
  },

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
    marginBottom: 12,
  },

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
  },

  descripcionTexto: {
    fontSize: 15,
    color: Colors.textSecondary,
    lineHeight: 22,
  },

  foto: {
    width: "100%",
    height: 220,
    borderRadius: 12,
    backgroundColor: Colors.background,
  },

  estadosGrid: {
    gap: 10,
    marginBottom: 16,
  },
  estadoOpcion: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.border,
    backgroundColor: Colors.background,
  },
  estadoDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  estadoOpcionTexto: {
    fontSize: 15,
    fontWeight: "600",
    color: Colors.textSecondary,
  },

  botonGuardar: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
  },
  botonGuardando: {
    opacity: 0.6,
  },
  botonGuardarTexto: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },

  botonVolver: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 32,
    marginTop: 16,
  },
  botonVolverTexto: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  botonVolverSecundario: {
    alignItems: "center",
    paddingVertical: 12,
  },
  botonVolverSecundarioTexto: {
    fontSize: 15,
    color: Colors.textSecondary,
    fontWeight: "500",
  },
});
