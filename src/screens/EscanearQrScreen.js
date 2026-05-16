import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { validarBicicletaQR, marcarBicicletaEnUso } from "@/src/services/bicicletaService";
import { crearViaje } from "@/src/services/viajeService";
import { useViaje } from "@/src/context/ViajeContext";
import { useAuth } from "@/src/hooks/useAuth";
import Colors from "@/src/constants/colors";
import { MaterialIcons } from "@expo/vector-icons";

export default function EscanearQrScreenWeb() {
  const router = useRouter();
  const { estacionId } = useLocalSearchParams();
  const { perfil } = useAuth();
  const { iniciarViaje, isViajeActivo } = useViaje();

  const [codigo, setCodigo] = useState("");
  const [validando, setValidando] = useState(false);
  const [error, setError] = useState(null);

  const estId = Number(estacionId) || 0;

  if (isViajeActivo) {
    router.replace("/viaje-activo");
    return null;
  }

  const handleIngresarCodigo = async () => {
    if (!perfil?.id) {
      setError("Debes iniciar sesión para escanear una bicicleta");
      return;
    }
    if (!codigo.trim()) {
      setError("Ingresa el código de la bicicleta");
      return;
    }

    setValidando(true);
    setError(null);

    try {
      const resultado = await validarBicicletaQR(codigo.trim().toUpperCase(), estId);

      if (!resultado.valida) {
        setError(resultado.error);
        setValidando(false);
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
    }
  };

  return (
    <View style={styles.contenedor}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Escanear bicicleta</Text>
        <Text style={styles.headerSub}>Estación #{estId}</Text>
      </View>

      <View style={styles.tarjeta}>
        <View style={styles.iconoContainer}>
          <MaterialIcons name="qr-code-scanner" size={64} color={Colors.primary} />
        </View>
        <Text style={styles.titulo}>Ingresa el código QR</Text>
        <Text style={styles.descripcion}>
          En la web, ingresa manualmente el código que aparece en la bicicleta.
          En la app móvil podrás escanear con la cámara.
        </Text>

        <TextInput
          style={styles.input}
          value={codigo}
          onChangeText={(text) => {
            setCodigo(text.toUpperCase());
            setError(null);
          }}
          placeholder="Ej: BICI-1-2"
          placeholderTextColor="#9CA3AF"
          autoCapitalize="characters"
          autoCorrect={false}
        />

        {error && (
          <View style={styles.errorContainer}>
            <MaterialIcons name="error-outline" size={18} color="#FFFFFF" />
            <Text style={styles.errorTexto}>{error}</Text>
          </View>
        )}

        <TouchableOpacity
          style={[styles.botonIniciar, validando && styles.botonDisabled]}
          onPress={handleIngresarCodigo}
          disabled={validando}
          activeOpacity={0.8}
        >
          {validando ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <MaterialIcons name="directions-bike" size={22} color="#FFFFFF" />
          )}
          <Text style={styles.botonIniciarTexto}>
            {validando ? "Validando..." : "Iniciar viaje"}
          </Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.botonVolver} onPress={() => router.back()}>
        <MaterialIcons name="arrow-back" size={20} color="#6B7280" />
        <Text style={styles.botonVolverTexto}>Volver</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    flex: 1,
    backgroundColor: "#F5F7FA",
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    flexDirection: "row",
    alignItems: "baseline",
    gap: 8,
  },
  headerTitle: { fontSize: 20, fontWeight: "800", color: "#111827" },
  headerSub: { fontSize: 13, color: "#6B7280" },
  tarjeta: {
    backgroundColor: "#FFFFFF",
    margin: 20,
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  iconoContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: Colors.primaryLight,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  titulo: {
    fontSize: 20,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 8,
  },
  descripcion: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 24,
  },
  input: {
    width: "100%",
    backgroundColor: "#F5F7FA",
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 16,
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.error,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    marginBottom: 16,
    gap: 6,
    width: "100%",
  },
  errorTexto: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "500",
    flexShrink: 1,
  },
  botonIniciar: {
    flexDirection: "row",
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 32,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    width: "100%",
  },
  botonDisabled: {
    opacity: 0.6,
  },
  botonIniciarTexto: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  botonVolver: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    paddingVertical: 12,
  },
  botonVolverTexto: {
    fontSize: 15,
    color: "#6B7280",
    fontWeight: "500",
  },
});