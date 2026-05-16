import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useRouter, useLocalSearchParams, useNavigation } from "expo-router";
import { postIncidencia, getEstaciones } from "@/src/services/api";
import { useAuth } from "@/src/hooks/useAuth";
import Colors from "@/src/constants/colors";

const TIPOS_INCIDENCIA = [
  { id: "bicicleta_danada", label: "Bicicleta dañada", icon: "🔧" },
  { id: "estacion_bloqueada", label: "Estación bloqueada", icon: "🚫" },
  { id: "mal_estacionada", label: "Bicicleta mal estacionada", icon: "⚠️" },
  { id: "otro", label: "Otro", icon: "📋" },
];

export default function ReporteIncidenciaScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const { logout } = useAuth();
  const params = useLocalSearchParams();

  const estacionIdParam = params.estacionId ? Number(params.estacionId) : null;

  const [tipo, setTipo] = useState(null);
  const [estacionId, setEstacionId] = useState(estacionIdParam);
  const [estaciones, setEstaciones] = useState([]);
  const [cargandoEstaciones, setCargandoEstaciones] = useState(false);
  const [descripcion, setDescripcion] = useState("");
  const [foto, setFoto] = useState(null);
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);

  const MAX_CARACTERES = 200;

  useEffect(() => {
    if (!estacionIdParam) {
      setCargandoEstaciones(true);
      getEstaciones()
        .then((data) => setEstaciones(data || []))
        .catch(() => {})
        .finally(() => setCargandoEstaciones(false));
    }
  }, [estacionIdParam]);

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

  const seleccionarFoto = async (desdeCamara = false) => {
    const permiso =
      desdeCamara
        ? await ImagePicker.requestCameraPermissionsAsync()
        : await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permiso.granted) {
      Alert.alert(
        "Permiso denegado",
        `Necesitamos acceso a tu ${
          desdeCamara ? "cámara" : "galería"
        } para adjuntar fotos.`
      );
      return;
    }

    const opciones = {
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.7,
      aspect: [4, 3],
    };

    const resultado = desdeCamara
      ? await ImagePicker.launchCameraAsync(opciones)
      : await ImagePicker.launchImageLibraryAsync(opciones);

    if (!resultado.canceled && resultado.assets.length > 0) {
      setFoto(resultado.assets[0].uri);
    }
  };

  const mostrarOpcionesFoto = () => {
    Alert.alert("Adjuntar foto", "Selecciona una opción", [
      { text: "Cámara", onPress: () => seleccionarFoto(true) },
      { text: "Galería", onPress: () => seleccionarFoto(false) },
      { text: "Cancelar", style: "cancel" },
    ]);
  };

  const quitarFoto = () => setFoto(null);

  const enviarReporte = async () => {
    if (!validarEnvio()) return;

    setEnviando(true);

    try {
      await postIncidencia({
        tipo,
        descripcion: descripcion.trim(),
        estacionId,
      });
      setEnviado(true);
    } catch {
      Alert.alert(
        "Error de conexión",
        "No se pudo enviar el reporte. Verifica que el servidor esté corriendo."
      );
    } finally {
      setEnviando(false);
    }
  };

  const nuevoReporte = () => {
    setTipo(null);
    setDescripcion("");
    setFoto(null);
    setEnviado(false);
  };

  const validarEnvio = () => {
    if (!tipo) {
      Alert.alert("Falta información", "Selecciona el tipo de incidencia.");
      return false;
    }
    if (!estacionId && estacionId !== 0) {
      Alert.alert("Falta información", "Selecciona la estación.");
      return false;
    }
    return true;
  };

  if (enviado) {
    return (
      <View style={styles.exitoContenedor}>
        <Text style={styles.exitoIcono}>✅</Text>
        <Text style={styles.exitoTitulo}>Reporte enviado</Text>
        <Text style={styles.exitoTexto}>
          Gracias por ayudarnos a mantener el sistema. Tu reporte será revisado
          a la brevedad.
        </Text>
        <TouchableOpacity
          style={styles.botonPrimario}
          onPress={nuevoReporte}
          activeOpacity={0.8}
        >
          <Text style={styles.botonPrimarioTexto}>Nuevo reporte</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.botonSecundario}
          onPress={() => router.back()}
          activeOpacity={0.8}
        >
          <Text style={styles.botonSecundarioTexto}>Volver al mapa</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.contenedor}
      contentContainerStyle={styles.scroll}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      {/* Tipo de incidencia */}
      <Text style={styles.seccionTitulo}>Tipo de incidencia *</Text>
      <View style={styles.tiposGrid}>
        {TIPOS_INCIDENCIA.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={[
              styles.tipoCard,
              tipo === item.id && styles.tipoCardSeleccionado,
            ]}
            onPress={() => setTipo(item.id)}
            activeOpacity={0.7}
          >
            <Text style={styles.tipoIcono}>{item.icon}</Text>
            <Text
              style={[
                styles.tipoLabel,
                tipo === item.id && styles.tipoLabelSeleccionado,
              ]}
            >
              {item.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Selector de estación */}
      {!estacionIdParam && (
        <View style={styles.estacionSeccion}>
          <Text style={styles.seccionTitulo}>Estación *</Text>
          {cargandoEstaciones ? (
            <ActivityIndicator size="small" color={Colors.primary} />
          ) : (
            <View style={styles.estacionGrid}>
              {estaciones.map((est) => (
                <TouchableOpacity
                  key={est.id}
                  style={[
                    styles.estacionChip,
                    estacionId === est.id && styles.estacionChipSeleccionado,
                  ]}
                  onPress={() => setEstacionId(est.id)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.estacionChipTexto,
                      estacionId === est.id && styles.estacionChipTextoSeleccionado,
                    ]}
                    numberOfLines={1}
                  >
                    {est.nombre}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      )}

      {/* Descripción */}
      <Text style={styles.seccionTitulo}>Descripción</Text>
      <View style={styles.descripcionContenedor}>
        <TextInput
          style={styles.descripcionInput}
          placeholder="Describe la incidencia con detalle..."
          placeholderTextColor={Colors.disabled}
          value={descripcion}
          onChangeText={(texto) => {
            if (texto.length <= MAX_CARACTERES) setDescripcion(texto);
          }}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />
        <Text
          style={[
            styles.contador,
            descripcion.length >= MAX_CARACTERES && styles.contadorLimite,
          ]}
        >
          {descripcion.length}/{MAX_CARACTERES}
        </Text>
      </View>

      {/* Foto adjunta */}
      <Text style={styles.seccionTitulo}>Foto (opcional)</Text>

      {foto ? (
        <View style={styles.fotoContenedor}>
          <Image source={{ uri: foto }} style={styles.fotoMiniatura} />
          <TouchableOpacity
            style={styles.fotoQuitar}
            onPress={quitarFoto}
            activeOpacity={0.7}
          >
            <Text style={styles.fotoQuitarIcono}>✕</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity
          style={styles.fotoBoton}
          onPress={mostrarOpcionesFoto}
          activeOpacity={0.7}
        >
          <Text style={styles.fotoBotonIcono}>📷</Text>
          <Text style={styles.fotoBotonTexto}>Adjuntar foto</Text>
          <Text style={styles.fotoBotonSubtitulo}>
            Cámara o galería
          </Text>
        </TouchableOpacity>
      )}

      {/* Botón enviar */}
      <TouchableOpacity
        style={[styles.botonEnviar, (!tipo || (!estacionId && estacionId !== 0)) && styles.botonEnviarDeshabilitado]}
        onPress={enviarReporte}
        activeOpacity={0.8}
        disabled={enviando}
      >
        {enviando ? (
          <ActivityIndicator size="small" color="#FFFFFF" />
        ) : (
          <Text style={styles.botonEnviarTexto}>Enviar reporte</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.botonCancelar}
        onPress={() => router.back()}
        activeOpacity={0.7}
      >
        <Text style={styles.botonCancelarTexto}>Cancelar</Text>
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

  // Sección
  seccionTitulo: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.textPrimary,
    marginBottom: 12,
    marginTop: 4,
  },

  // Tipos grid
  tiposGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 28,
  },
  tipoCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    width: "47%",
    borderWidth: 2,
    borderColor: "transparent",
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  tipoCardSeleccionado: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryLight,
  },
  tipoIcono: {
    fontSize: 28,
    marginBottom: 8,
  },
  tipoLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.textPrimary,
    textAlign: "center",
  },
  tipoLabelSeleccionado: {
    color: Colors.primary,
  },

  // Descripción
  descripcionContenedor: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 14,
    marginBottom: 28,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  descripcionInput: {
    fontSize: 15,
    color: Colors.textPrimary,
    minHeight: 100,
    lineHeight: 22,
  },
  contador: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: "right",
    marginTop: 8,
  },
  contadorLimite: {
    color: Colors.error,
    fontWeight: "600",
  },

  // Foto
  fotoBoton: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.border,
    borderStyle: "dashed",
    padding: 28,
    alignItems: "center",
    marginBottom: 32,
  },
  fotoBotonIcono: {
    fontSize: 32,
    marginBottom: 8,
  },
  fotoBotonTexto: {
    fontSize: 15,
    fontWeight: "600",
    color: Colors.primary,
    marginBottom: 4,
  },
  fotoBotonSubtitulo: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  fotoContenedor: {
    position: "relative",
    alignSelf: "flex-start",
    marginBottom: 32,
  },
  fotoMiniatura: {
    width: 160,
    height: 120,
    borderRadius: 12,
    backgroundColor: Colors.border,
  },
  fotoQuitar: {
    position: "absolute",
    top: -8,
    right: -8,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: Colors.error,
    justifyContent: "center",
    alignItems: "center",
  },
  fotoQuitarIcono: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },

  // Botones
  botonEnviar: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    marginBottom: 12,
  },
  botonEnviarDeshabilitado: {
    opacity: 0.5,
  },
  botonEnviarTexto: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  botonCancelar: {
    paddingVertical: 12,
    alignItems: "center",
  },
  botonCancelarTexto: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: "500",
  },

  // Éxito
  exitoContenedor: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.background,
    padding: 32,
  },
  exitoIcono: {
    fontSize: 56,
    marginBottom: 16,
  },
  exitoTitulo: {
    fontSize: 22,
    fontWeight: "800",
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  exitoTexto: {
    fontSize: 15,
    color: Colors.textSecondary,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 32,
  },
  botonPrimario: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 32,
    marginBottom: 12,
    width: "100%",
    alignItems: "center",
  },
  botonPrimarioTexto: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  botonSecundario: {
    paddingVertical: 12,
    alignItems: "center",
  },
  botonSecundarioTexto: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: "500",
  },
  estacionSeccion: {
    marginBottom: 8,
  },
  estacionGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  estacionChip: {
    backgroundColor: Colors.surface,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  estacionChipSeleccionado: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryLight,
  },
  estacionChipTexto: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.textSecondary,
    maxWidth: 120,
  },
  estacionChipTextoSeleccionado: {
    color: Colors.primary,
  },
});
