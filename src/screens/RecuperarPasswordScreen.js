import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { resetearPassword } from "@/src/services/authService";
import Colors from "@/src/constants/colors";

export default function RecuperarPasswordScreen() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [cargando, setCargando] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [error, setError] = useState("");

  const manejarEnvio = async () => {
    setError("");

    if (!email.trim()) {
      setError("Por favor ingresa tu correo electrónico.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError("El formato del correo no es válido.");
      return;
    }

    setCargando(true);

    try {
      await resetearPassword(email.trim());
      setEnviado(true);
    } catch (err) {
      setError(
        err.message?.includes("rate limit")
          ? "Demasiados intentos. Espera unos minutos."
          : "No se pudo enviar el email. Verifica que el correo esté registrado."
      );
    } finally {
      setCargando(false);
    }
  };

  if (enviado) {
    return (
      <View style={styles.exitoContenedor}>
        <Text style={styles.exitoIcono}>📧</Text>
        <Text style={styles.exitoTitulo}>¡Email enviado!</Text>
        <Text style={styles.exitoTexto}>
          Revisa tu bandeja de entrada. Te hemos enviado un enlace para
          restablecer tu contraseña.
        </Text>
        <TouchableOpacity
          style={styles.boton}
          onPress={() => router.replace("/login")}
          activeOpacity={0.8}
        >
          <Text style={styles.botonTexto}>Volver al inicio de sesión</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.logoIcono}>🔐</Text>
          <Text style={styles.logoTitulo}>Recuperar contraseña</Text>
          <Text style={styles.logoSubtitulo}>
            Te enviaremos un enlace a tu correo
          </Text>
        </View>

        {/* Formulario */}
        <View style={styles.formulario}>
          {error ? <Text style={styles.errorTexto}>{error}</Text> : null}

          <View style={styles.campo}>
            <Text style={styles.campoLabel}>Correo electrónico</Text>
            <TextInput
              style={styles.campoInput}
              placeholder="tu@email.com"
              placeholderTextColor={Colors.disabled}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              value={email}
              onChangeText={setEmail}
              editable={!cargando}
              onSubmitEditing={manejarEnvio}
            />
          </View>

          <TouchableOpacity
            style={[styles.boton, cargando && styles.botonDeshabilitado]}
            onPress={manejarEnvio}
            activeOpacity={0.8}
            disabled={cargando}
          >
            {cargando ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.botonTexto}>Enviar enlace</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <TouchableOpacity
          style={styles.botonVolver}
          onPress={() => router.replace("/login")}
          activeOpacity={0.7}
          disabled={cargando}
        >
          <Text style={styles.botonVolverTexto}>← Volver al inicio de sesión</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flexGrow: 1,
    backgroundColor: Colors.background,
    paddingHorizontal: 28,
    paddingTop: 80,
    paddingBottom: 40,
    justifyContent: "center",
  },

  header: {
    alignItems: "center",
    marginBottom: 40,
  },
  logoIcono: {
    fontSize: 64,
    marginBottom: 12,
  },
  logoTitulo: {
    fontSize: 26,
    fontWeight: "800",
    color: Colors.primary,
    letterSpacing: -0.5,
  },
  logoSubtitulo: {
    fontSize: 15,
    color: Colors.textSecondary,
    marginTop: 6,
    textAlign: "center",
  },

  formulario: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: 24,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },

  campo: {
    marginBottom: 16,
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
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: Colors.textPrimary,
    borderWidth: 1,
    borderColor: Colors.border,
  },

  errorTexto: {
    color: Colors.error,
    fontSize: 13,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 12,
    backgroundColor: "#FEF2F2",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
  },

  boton: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 8,
  },
  botonDeshabilitado: {
    opacity: 0.6,
  },
  botonTexto: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },

  botonVolver: {
    marginTop: 24,
    alignItems: "center",
    paddingVertical: 8,
  },
  botonVolverTexto: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: "500",
  },

  exitoContenedor: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: "center",
    alignItems: "center",
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
});
