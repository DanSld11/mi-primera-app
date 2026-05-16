import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { getEstaciones } from "@/src/services/api";
import { useRouter } from "expo-router";
import {
  crearEstacion,
  actualizarEstacion,
  eliminarEstacion,
} from "@/src/services/adminService";
import Colors from "@/src/constants/colors";

const ESTADOS = ["disponible", "pocas", "llena", "vacia"];

const ESTADO_COLORES = {
  disponible: Colors.estadoDisponible,
  pocas: Colors.estadoPocas,
  llena: Colors.estadoLlena,
  vacia: Colors.estadoVacia,
};

function formatearEstado(estado) {
  return estado.charAt(0).toUpperCase() + estado.slice(1);
}

export default function GestionEstacionesScreen() {
  const router = useRouter();
  const [estaciones, setEstaciones] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [estacionEditando, setEstacionEditando] = useState(null);
  const [mensaje, setMensaje] = useState(null);

  // Formulario
  const [nombre, setNombre] = useState("");
  const [direccion, setDireccion] = useState("");
  const [latitud, setLatitud] = useState("");
  const [longitud, setLongitud] = useState("");
  const [capacidad, setCapacidad] = useState("");
  const [bicicletas, setBicicletas] = useState("");
  const [estado, setEstado] = useState("disponible");

  const cargarDatos = useCallback(async () => {
    setCargando(true);
    try {
      const data = await getEstaciones();
      setEstaciones(data);
    } catch (_err) {
      mostrarMensaje("No se pudieron cargar las estaciones.", "error");
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  function mostrarMensaje(texto, tipo = "exito") {
    setMensaje({ texto, tipo });
    setTimeout(() => setMensaje(null), 3000);
  }

  function abrirCrear() {
    setModoEdicion(false);
    setEstacionEditando(null);
    limpiarFormulario();
    setModalVisible(true);
  }

  function abrirEditar(item) {
    setModoEdicion(true);
    setEstacionEditando(item);
    setNombre(item.nombre);
    setDireccion(item.direccion);
    setLatitud(String(item.latitud));
    setLongitud(String(item.longitud));
    setCapacidad(String(item.capacidadTotal));
    setBicicletas(String(item.bicicletasDisponibles));
    setEstado(item.estado);
    setModalVisible(true);
  }

  function limpiarFormulario() {
    setNombre("");
    setDireccion("");
    setLatitud("");
    setLongitud("");
    setCapacidad("");
    setBicicletas("");
    setEstado("disponible");
  }

  function validarFormulario() {
    if (!nombre.trim()) return "El nombre es obligatorio.";
    if (!direccion.trim()) return "La dirección es obligatoria.";
    if (!latitud.trim() || isNaN(Number(latitud))) return "La latitud debe ser un número válido.";
    if (!longitud.trim() || isNaN(Number(longitud))) return "La longitud debe ser un número válida.";
    if (!capacidad.trim() || isNaN(Number(capacidad)) || Number(capacidad) < 1) return "La capacidad total debe ser un número mayor a 0.";
    if (!bicicletas.trim() || isNaN(Number(bicicletas)) || Number(bicicletas) < 0) return "Las bicicletas disponibles deben ser un número igual o mayor a 0.";
    if (Number(bicicletas) > Number(capacidad)) return "Las bicicletas disponibles no pueden superar la capacidad total.";
    return null;
  }

  async function guardar() {
    const errorValidacion = validarFormulario();
    if (errorValidacion) {
      mostrarMensaje(errorValidacion, "error");
      return;
    }

    setGuardando(true);

    const datos = {
      nombre: nombre.trim(),
      direccion: direccion.trim(),
      latitud: Number(latitud),
      longitud: Number(longitud),
      capacidad_total: Number(capacidad),
      bicicletas_disponibles: Number(bicicletas),
      estado,
    };

    try {
      if (modoEdicion && estacionEditando) {
        await actualizarEstacion(estacionEditando.id, datos);
        mostrarMensaje("Estación actualizada correctamente.");
      } else {
        await crearEstacion(datos);
        mostrarMensaje("Estación creada correctamente.");
      }
      setModalVisible(false);
      limpiarFormulario();
      await cargarDatos();
    } catch (err) {
      mostrarMensaje(
        err.message?.includes("row-level security")
          ? "No tienes permisos para realizar esta acción."
          : "Ocurrió un error al guardar. Intenta de nuevo.",
        "error"
      );
    } finally {
      setGuardando(false);
    }
  }

  function confirmarEliminar(item) {
    Alert.alert(
      "Eliminar estación",
      `¿Estás seguro de eliminar "${item.nombre}"? Esta acción no se puede deshacer.`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: () => ejecutarEliminar(item.id),
        },
      ]
    );
  }

  async function ejecutarEliminar(id) {
    setGuardando(true);
    try {
      await eliminarEstacion(id);
      mostrarMensaje("Estación eliminada correctamente.");
      await cargarDatos();
    } catch (err) {
      mostrarMensaje(
        err.message?.includes("row-level security")
          ? "No tienes permisos para eliminar estaciones."
          : "Ocurrió un error al eliminar. Intenta de nuevo.",
        "error"
      );
    } finally {
      setGuardando(false);
    }
  }

  function renderEstacion({ item }) {
    return (
      <TouchableOpacity
        style={styles.tarjeta}
        activeOpacity={0.7}
        onPress={() => abrirEditar(item)}
      >
        <View style={styles.tarjetaHeader}>
          <Text style={styles.tarjetaNombre}>{item.nombre}</Text>
          <View
            style={[
              styles.badge,
              { backgroundColor: ESTADO_COLORES[item.estado] || Colors.disabled },
            ]}
          >
            <Text style={styles.badgeTexto}>{formatearEstado(item.estado)}</Text>
          </View>
        </View>
        <Text style={styles.tarjetaDireccion}>{item.direccion}</Text>
        <View style={styles.tarjetaFooter}>
          <Text style={styles.tarjetaBicis}>
            🚲 {item.bicicletasDisponibles} / {item.capacidadTotal}
          </Text>
          <TouchableOpacity
            style={styles.botonEliminar}
            onPress={() => confirmarEliminar(item)}
            activeOpacity={0.7}
          >
            <Text style={styles.botonEliminarTexto}>🗑️</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.botonBicis}
            onPress={() => router.push({ pathname: "/(admin)/gestion-biciculetas", params: { estacionId: String(item.id), estacionNombre: item.nombre } })}
            activeOpacity={0.7}
          >
            <Text style={styles.botonBicisTexto}>🚲</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitulo}>Gestión de estaciones</Text>
        <Text style={styles.headerSubtitulo}>
          {estaciones.length} estaciones registradas
        </Text>
      </View>

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

      {/* Lista */}
      {cargando ? (
        <View style={styles.centrado}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : (
        <FlatList
          data={estaciones}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.lista}
          showsVerticalScrollIndicator={false}
          renderItem={renderEstacion}
          ListEmptyComponent={() => (
            <View style={styles.sinDatos}>
              <Text style={styles.sinDatosIcono}>📍</Text>
              <Text style={styles.sinDatosTexto}>
                No hay estaciones registradas
              </Text>
            </View>
          )}
        />
      )}

      {/* Botón flotante crear */}
      <TouchableOpacity
        style={styles.fab}
        onPress={abrirCrear}
        activeOpacity={0.8}
      >
        <Text style={styles.fabTexto}>+</Text>
      </TouchableOpacity>

      {/* Modal crear/editar */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContenedor}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitulo}>
                  {modoEdicion ? "Editar estación" : "Nueva estación"}
                </Text>
                <TouchableOpacity
                  onPress={() => setModalVisible(false)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.modalCerrar}>✕</Text>
                </TouchableOpacity>
              </View>

              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.modalScroll}
              >
                <View style={styles.campo}>
                  <Text style={styles.campoLabel}>Nombre *</Text>
                  <TextInput
                    style={styles.campoInput}
                    placeholder="Ej: Municipalidad de San Borja"
                    placeholderTextColor={Colors.disabled}
                    value={nombre}
                    onChangeText={setNombre}
                  />
                </View>

                <View style={styles.campo}>
                  <Text style={styles.campoLabel}>Dirección *</Text>
                  <TextInput
                    style={styles.campoInput}
                    placeholder="Ej: Av. Joaquín de la Madrid 200"
                    placeholderTextColor={Colors.disabled}
                    value={direccion}
                    onChangeText={setDireccion}
                  />
                </View>

                <View style={styles.campoRow}>
                  <View style={[styles.campo, { flex: 1, marginRight: 8 }]}>
                    <Text style={styles.campoLabel}>Latitud *</Text>
                    <TextInput
                      style={styles.campoInput}
                      placeholder="-12.1072"
                      placeholderTextColor={Colors.disabled}
                      keyboardType="numeric"
                      value={latitud}
                      onChangeText={setLatitud}
                    />
                  </View>
                  <View style={[styles.campo, { flex: 1, marginLeft: 8 }]}>
                    <Text style={styles.campoLabel}>Longitud *</Text>
                    <TextInput
                      style={styles.campoInput}
                      placeholder="-76.9991"
                      placeholderTextColor={Colors.disabled}
                      keyboardType="numeric"
                      value={longitud}
                      onChangeText={setLongitud}
                    />
                  </View>
                </View>

                <View style={styles.campoRow}>
                  <View style={[styles.campo, { flex: 1, marginRight: 8 }]}>
                    <Text style={styles.campoLabel}>Capacidad total *</Text>
                    <TextInput
                      style={styles.campoInput}
                      placeholder="20"
                      placeholderTextColor={Colors.disabled}
                      keyboardType="numeric"
                      value={capacidad}
                      onChangeText={setCapacidad}
                    />
                  </View>
                  <View style={[styles.campo, { flex: 1, marginLeft: 8 }]}>
                    <Text style={styles.campoLabel}>Bicis disponibles *</Text>
                    <TextInput
                      style={styles.campoInput}
                      placeholder="10"
                      placeholderTextColor={Colors.disabled}
                      keyboardType="numeric"
                      value={bicicletas}
                      onChangeText={setBicicletas}
                    />
                  </View>
                </View>

                <View style={styles.campo}>
                  <Text style={styles.campoLabel}>Estado *</Text>
                  <View style={styles.estadosRow}>
                    {ESTADOS.map((e) => (
                      <TouchableOpacity
                        key={e}
                        style={[
                          styles.estadoChip,
                          estado === e && {
                            backgroundColor: ESTADO_COLORES[e],
                            borderColor: ESTADO_COLORES[e],
                          },
                        ]}
                        onPress={() => setEstado(e)}
                        activeOpacity={0.7}
                      >
                        <Text
                          style={[
                            styles.estadoChipTexto,
                            estado === e && styles.estadoChipTextoActivo,
                          ]}
                        >
                          {formatearEstado(e)}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </ScrollView>

              <TouchableOpacity
                style={[styles.botonGuardar, guardando && styles.botonGuardando]}
                onPress={guardar}
                activeOpacity={0.8}
                disabled={guardando}
              >
                {guardando ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.botonGuardarTexto}>
                    {modoEdicion ? "Guardar cambios" : "Crear estación"}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
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

  mensajeBanner: {
    backgroundColor: "#ECFDF5",
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginHorizontal: 16,
    marginTop: 10,
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

  lista: {
    padding: 16,
    paddingBottom: 100,
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
    fontSize: 12,
    fontWeight: "600",
  },
  tarjetaDireccion: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 10,
  },
  tarjetaFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  tarjetaBicis: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.primary,
  },
  botonEliminar: {
    padding: 6,
  },
  botonEliminarTexto: {
    fontSize: 18,
  },
  botonBicis: {
    padding: 6,
  },
  botonBicisTexto: {
    fontSize: 18,
  },

  fab: {
    position: "absolute",
    right: 20,
    bottom: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  fabTexto: {
    fontSize: 28,
    color: "#FFFFFF",
    fontWeight: "300",
    marginTop: -2,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContenedor: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "90%",
    paddingBottom: Platform.OS === "ios" ? 34 : 20,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalTitulo: {
    fontSize: 20,
    fontWeight: "700",
    color: Colors.textPrimary,
  },
  modalCerrar: {
    fontSize: 20,
    color: Colors.textSecondary,
    padding: 4,
  },
  modalScroll: {
    padding: 20,
    paddingBottom: 8,
  },

  campo: {
    marginBottom: 16,
  },
  campoRow: {
    flexDirection: "row",
  },
  campoLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.textPrimary,
    marginBottom: 6,
  },
  campoInput: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: Colors.textPrimary,
    borderWidth: 1,
    borderColor: Colors.border,
  },

  estadosRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  estadoChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.background,
  },
  estadoChipTexto: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.textSecondary,
  },
  estadoChipTextoActivo: {
    color: "#FFFFFF",
  },

  botonGuardar: {
    backgroundColor: Colors.primary,
    borderRadius: 14,
    paddingVertical: 16,
    marginHorizontal: 20,
    marginTop: 8,
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
});
