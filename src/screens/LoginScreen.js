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
  SafeAreaView,
} from "react-native";
import { useRouter } from "expo-router";
import { login } from "@/src/services/authService";
import Colors from "@/src/constants/colors";
import { MaterialIcons } from '@expo/vector-icons';

export default function LoginScreen() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");

  const manejarLogin = async () => {
    setError("");

    if (!email.trim() || !password.trim()) {
      setError("Por favor ingresa tu email y contraseña.");
      return;
    }

    setCargando(true);

    try {
      await login(email.trim(), password);
      router.replace("/(tabs)");
    } catch (err) {
      setError(
        err.message?.includes("Invalid login credentials")
          ? "Email o contraseña incorrectos."
          : "No se pudo iniciar sesión. Intenta de nuevo."
      );
    } finally {
      setCargando(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: Colors.background }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
      {/* Decorative Background Elements */}
      <View style={styles.bgGradientMock} />
      <View style={styles.bgCircleMock} />

      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          
          {/* Logo / Brand Centered */}
          <View style={styles.headerCentered}>
            <View style={styles.iconContainer}>
              <MaterialIcons name="directions-bike" size={40} color="#FFFFFF" />
            </View>
            <Text style={styles.pageTitle}>Bici San Borja</Text>
            <Text style={styles.pageSubtitle}>Inicia sesión para continuar</Text>
          </View>

          {/* Form Card (Glassmorphism Bento Style) */}
          <View style={styles.glassPanel}>
            {error ? (
              <View style={styles.errorContainer}>
                <MaterialIcons name="error-outline" size={16} color={Colors.error} />
                <Text style={styles.errorTexto}>{error}</Text>
              </View>
            ) : null}

            {/* Input: Correo */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Correo Electrónico</Text>
              <View style={styles.inputContainer}>
                <MaterialIcons name="mail" size={20} color={Colors.outline} style={styles.inputIcon} />
                <TextInput
                  style={styles.inputField}
                  placeholder="juan@ejemplo.com"
                  placeholderTextColor={Colors.outline}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={email}
                  onChangeText={setEmail}
                  editable={!cargando}
                />
              </View>
            </View>

            {/* Input: Contraseña */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Contraseña</Text>
              <View style={styles.inputContainer}>
                <MaterialIcons name="lock" size={20} color={Colors.outline} style={styles.inputIcon} />
                <TextInput
                  style={styles.inputField}
                  placeholder="••••••••"
                  placeholderTextColor={Colors.outline}
                  secureTextEntry
                  value={password}
                  onChangeText={setPassword}
                  editable={!cargando}
                  onSubmitEditing={manejarLogin}
                />
              </View>
            </View>

            <TouchableOpacity
              style={styles.linkOlvide}
              onPress={() => router.push("/recuperar-password")}
              activeOpacity={0.7}
              disabled={cargando}
            >
              <Text style={styles.linkOlvideTexto}>¿Olvidaste tu contraseña?</Text>
            </TouchableOpacity>

          </View>

          {/* Bottom Action Area */}
          <View style={styles.actionArea}>
            <TouchableOpacity
              style={[styles.botonPrimario, cargando && { opacity: 0.7 }]}
              onPress={manejarLogin}
              activeOpacity={0.8}
              disabled={cargando}
            >
              {cargando ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <Text style={styles.botonTexto}>Iniciar sesión</Text>
                  <MaterialIcons name="login" size={18} color="#FFFFFF" style={{ marginLeft: 8 }} />
                </>
              )}
            </TouchableOpacity>
            
            <View style={styles.footerRow}>
              <Text style={styles.footerText}>¿No tienes cuenta?</Text>
              <TouchableOpacity onPress={() => router.push("/registro")} disabled={cargando}>
                <Text style={styles.footerLink}> Regístrate</Text>
              </TouchableOpacity>
            </View>
          </View>

        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  bgGradientMock: {
    position: 'absolute', top: 0, left: 0, right: 0, height: 250,
    backgroundColor: 'rgba(149, 211, 186, 0.15)',
  },
  bgCircleMock: {
    position: 'absolute', top: -50, right: -50, width: 200, height: 200,
    backgroundColor: 'rgba(178, 247, 70, 0.1)',
    borderRadius: 100,
  },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
    paddingBottom: 40,
    paddingTop: 20,
  },
  headerCentered: {
    alignItems: 'center',
    marginBottom: 40,
  },
  iconContainer: {
    backgroundColor: Colors.primaryContainer,
    padding: 16,
    borderRadius: 20,
    marginBottom: 16,
    shadowColor: Colors.primaryContainer,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 4,
  },
  pageTitle: {
    fontSize: 28, fontWeight: '800', color: Colors.primary, marginBottom: 8, letterSpacing: -0.5,
  },
  pageSubtitle: {
    fontSize: 15, color: Colors.onSurfaceVariant,
  },
  glassPanel: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 28,
    padding: 24,
    borderColor: 'rgba(255, 255, 255, 0.6)', borderWidth: 1,
    shadowColor: '#334155', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08, shadowRadius: 20, elevation: 3,
  },
  errorContainer: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.errorContainer,
    padding: 12, borderRadius: 12, marginBottom: 16,
  },
  errorTexto: {
    color: Colors.onErrorContainer, fontSize: 13, fontWeight: '600', marginLeft: 8, flex: 1,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 13, fontWeight: '600', color: Colors.onSurfaceVariant,
    marginBottom: 8, marginLeft: 4, letterSpacing: 0.5,
  },
  inputContainer: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#ffffff',
    borderWidth: 1, borderColor: Colors.outlineVariant,
    borderRadius: 14, paddingHorizontal: 16, height: 56,
  },
  inputIcon: {
    marginRight: 12,
  },
  inputField: {
    flex: 1, fontSize: 16, color: Colors.onSurface,
  },
  linkOlvide: {
    alignSelf: 'center',
    marginTop: 8,
    paddingVertical: 8,
  },
  linkOlvideTexto: {
    fontSize: 14, color: Colors.primary, fontWeight: '700',
  },
  actionArea: {
    marginTop: 32,
  },
  botonPrimario: {
    backgroundColor: Colors.primary,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    height: 56, borderRadius: 16,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2, shadowRadius: 8, elevation: 4,
  },
  botonTexto: {
    color: '#ffffff', fontSize: 16, fontWeight: '700', letterSpacing: 0.5,
  },
  footerRow: {
    flexDirection: 'row', justifyContent: 'center', marginTop: 24,
  },
  footerText: {
    color: Colors.onSurfaceVariant, fontSize: 15,
  },
  footerLink: {
    color: Colors.primaryContainer, fontSize: 15, fontWeight: '700',
  },
  });
