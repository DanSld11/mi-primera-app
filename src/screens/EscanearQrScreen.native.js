import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { CameraView, useCameraPermissions } from "expo-camera";
import { validarBicicletaQR, marcarBicicletaEnUso } from "@/src/services/bicicletaService";
import { crearViaje } from "@/src/services/viajeService";
import { useViaje } from "@/src/context/ViajeContext";
import { useAuth } from "@/src/hooks/useAuth";
import Colors from "@/src/constants/colors";
import { MaterialIcons } from "@expo/vector-icons";

export default function EscanearQrScreen() {
  const router = useRouter();
  const { estacionId } = useLocalSearchParams();
  const { perfil } = useAuth();
  const { iniciarViaje, isViajeActivo } = useViaje();

  const [permission, requestPermission] = useCameraPermissions();
  const [escaneado, setEscaneado] = useState(false);
  const [validando, setValidando] = useState(false);
  const [error, setError] = useState(null);

  const estId = Number(estacionId) || 0;

  useEffect(() => {
    if (isViajeActivo) {
      router.replace("/viaje-activo");
    }
    if (!estId) {
      setError("No se especificó la estación. Regresa e intenta de nuevo.");
    }
  }, [isViajeActivo, router, estId]);

  const handleBarcodeScanned = async ({ data }) => {
    if (escaneado) return;
    if (!perfil?.id) {
      setError("Debes iniciar sesión para escanear una bicicleta");
      return;
    }
    setEscaneado(true);
    setValidando(true);
    setError(null);

    try {
      const resultado = await validarBicicletaQR(data, estId);

      if (!resultado.valida) {
        setError(resultado.error);
        setValidando(false);
        setTimeout(() => setEscaneado(false), 3000);
        return;
      }

      const bici = resultado.bicicleta;

      await marcarBicicletaEnUso(bici.id);

      const viaje = await crearViaje({
        usuarioId: perfil.id,
        bicicletaId: bici.id,
        estacionOrigenId: estId,
      });

      iniciarViaje(viaje.id, bici.id, estId, viaje.inicio);

      router.replace("/viaje-activo");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error al iniciar el viaje";
      setError(msg);
      setValidando(false);
      setTimeout(() => setEscaneado(false), 3000);
    }
  };

  if (!permission) {
    return (
      <View style={styles.centrado}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.centrado}>
        <MaterialIcons name="qr-code-scanner" size={64} color={Colors.primary} />
        <Text style={styles.permisoTitulo}>Acceso a la cámara</Text>
        <Text style={styles.permisoTexto}>
          Necesitamos acceso a tu cámara para escanear el código QR de la bicicleta.
        </Text>
        <TouchableOpacity style={styles.botonPermiso} onPress={requestPermission}>
          <Text style={styles.botonPermisoTexto}>Permitir acceso a la cámara</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!estId) {
    return (
      <View style={styles.centrado}>
        <MaterialIcons name="error-outline" size={64} color={Colors.error} />
        <Text style={styles.permisoTitulo}>Error</Text>
        <Text style={styles.permisoTexto}>
          No se especificó la estación. Regresa e intenta de nuevo.
        </Text>
        <TouchableOpacity style={styles.botonPermiso} onPress={() => router.back()}>
          <Text style={styles.botonPermisoTexto}>Volver</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.contenedor}>
      <CameraView
        style={styles.camara}
        facing="back"
        onBarcodeScanned={escaneado ? undefined : handleBarcodeScanned}
      />

      <View style={styles.overlay}>
        <View style={styles.ventanaContainer}>
          <View style={styles.ventana} />
          <View style={styles.esquinas}>
            <View style={[styles.esquina, styles.esquinaTL]} />
            <View style={[styles.esquina, styles.esquinaTR]} />
            <View style={[styles.esquina, styles.esquinaBL]} />
            <View style={[styles.esquina, styles.esquinaBR]} />
          </View>
        </View>

        <Text style={styles.instruccion}>
          Apunta la cámara al código QR de la bicicleta
        </Text>

        {validando && (
          <View style={styles.validandoContainer}>
            <ActivityIndicator size="small" color="#FFFFFF" />
            <Text style={styles.validandoTexto}>Validando bicicleta...</Text>
          </View>
        )}

        {error && (
          <View style={styles.errorContainer}>
            <MaterialIcons name="error-outline" size={20} color="#FFFFFF" />
            <Text style={styles.errorTexto}>{error}</Text>
          </View>
        )}

        <View style={styles.estacionInfo}>
          <MaterialIcons name="directions-bike" size={18} color="#FFFFFF" />
          <Text style={styles.estacionTexto}>
            Estación #{estId}
          </Text>
        </View>
      </View>

      <TouchableOpacity style={styles.botonCerrar} onPress={() => router.back()}>
        <MaterialIcons name="close" size={28} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    flex: 1,
    backgroundColor: "#000000",
  },
  camara: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  ventanaContainer: {
    width: 250,
    height: 250,
    position: "relative",
  },
  ventana: {
    width: 250,
    height: 250,
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
    borderRadius: 12,
  },
  esquinas: {
    ...StyleSheet.absoluteFillObject,
  },
  esquina: {
    position: "absolute",
    width: 24,
    height: 24,
    borderColor: Colors.primary,
  },
  esquinaTL: {
    top: 0, left: 0, borderTopWidth: 3, borderLeftWidth: 3, borderTopLeftRadius: 12,
  },
  esquinaTR: {
    top: 0, right: 0, borderTopWidth: 3, borderRightWidth: 3, borderTopRightRadius: 12,
  },
  esquinaBL: {
    bottom: 0, left: 0, borderBottomWidth: 3, borderLeftWidth: 3, borderBottomLeftRadius: 12,
  },
  esquinaBR: {
    bottom: 0, right: 0, borderBottomWidth: 3, borderRightWidth: 3, borderBottomRightRadius: 12,
  },
  instruccion: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
    marginTop: 24,
  },
  validandoContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    marginTop: 16,
    gap: 8,
  },
  validandoTexto: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "500",
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.error,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    marginTop: 16,
    gap: 8,
  },
  errorTexto: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "500",
    flexShrink: 1,
  },
  estacionInfo: {
    position: "absolute",
    bottom: 40,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  estacionTexto: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "500",
  },
  centrado: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5F7FA",
    padding: 32,
    gap: 12,
  },
  permisoTitulo: {
    fontSize: 20,
    fontWeight: "800",
    color: "#111827",
    textAlign: "center",
  },
  permisoTexto: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 20,
  },
  botonPermiso: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 8,
  },
  botonPermisoTexto: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  botonCerrar: {
    position: "absolute",
    top: 50,
    left: 16,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
});