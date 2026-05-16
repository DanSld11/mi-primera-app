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
import { registro } from "@/src/services/authService";
import Colors from "@/src/constants/colors";
import { MaterialIcons } from '@expo/vector-icons';

export default function RegistroScreen() {
  const router = useRouter();

  const [nombreCompleto, setNombreCompleto] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmarPassword, setConfirmarPassword] = useState("");
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");
  const [exito, setExito] = useState(false);

  const validarEmail = (texto) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(texto);
  };

  const manejarRegistro = async () => {
    setError("");
    setExito(false);

    if (!nombreCompleto.trim()) return setError("El nombre completo es obligatorio.");
    if (!email.trim()) return setError("El correo electrónico es obligatorio.");
    if (!validarEmail(email.trim())) return setError("El formato del correo electrónico no es válido.");
    if (!password) return setError("La contraseña es obligatoria.");
    if (password.length < 6) return setError("La contraseña debe tener al menos 6 caracteres.");
    if (password !== confirmarPassword) return setError("Las contraseñas no coinciden.");

    setCargando(true);

    try {
      await registro(email.trim(), password, nombreCompleto.trim());
      setExito(true);
    } catch (err) {
      let mensaje = "No se pudo crear la cuenta. Intenta de nuevo.";
      if (err.message?.includes("User already registered")) {
        mensaje = "Este correo ya está registrado. Usa otro o inicia sesión.";
      }
      setError(mensaje);
    } finally {
      setCargando(false);
    }
  };

  if (exito) {
    return (
      <View style={styles.exitoContenedor}>
        <MaterialIcons name="check-circle" size={64} color={Colors.primary} style={{marginBottom: 16}} />
        <Text style={styles.exitoTitulo}>¡Cuenta creada!</Text>
        <Text style={styles.exitoTexto}>Tu cuenta ha sido registrada exitosamente. Ahora puedes iniciar sesión.</Text>
        <TouchableOpacity style={styles.botonPrimario} onPress={() => router.replace("/login")}>
          <Text style={styles.botonTexto}>Ir a iniciar sesión</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: Colors.background }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
      {/* Decorative Background Elements */}
      <View style={styles.bgGradientMock} />
      <View style={styles.bgCircleMock} />

      <SafeAreaView style={{ flex: 1 }}>
        {/* App Bar */}
        <View style={styles.headerBar}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => router.back()}
            disabled={cargando}
          >
            <MaterialIcons name="arrow-back" size={24} color={Colors.primary} />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          {/* Header Title */}
          <View style={styles.titleSection}>
            <Text style={styles.pageTitle}>Crear Cuenta</Text>
            <Text style={styles.pageSubtitle}>Datos Personales y Acceso</Text>
          </View>

          {/* Progress Bar (Mock) */}
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: '50%' }]} />
          </View>

          {/* Form Card (Glassmorphism Bento Style) */}
          <View style={styles.glassPanel}>
            {error ? (
              <View style={styles.errorContainer}>
                <MaterialIcons name="error-outline" size={16} color={Colors.error} />
                <Text style={styles.errorTexto}>{error}</Text>
              </View>
            ) : null}

            {/* Input: Nombre */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Nombre Completo</Text>
              <View style={styles.inputContainer}>
                <MaterialIcons name="person" size={20} color={Colors.outline} style={styles.inputIcon} />
                <TextInput
                  style={styles.inputField}
                  placeholder="Ej. Juan Pérez"
                  placeholderTextColor={Colors.outline}
                  autoCapitalize="words"
                  value={nombreCompleto}
                  onChangeText={setNombreCompleto}
                  editable={!cargando}
                />
              </View>
            </View>

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
                  placeholder="Mínimo 6 caracteres"
                  placeholderTextColor={Colors.outline}
                  secureTextEntry
                  value={password}
                  onChangeText={setPassword}
                  editable={!cargando}
                />
              </View>
            </View>

            {/* Input: Confirmar Contraseña */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Confirmar Contraseña</Text>
              <View style={styles.inputContainer}>
                <MaterialIcons name="lock-outline" size={20} color={Colors.outline} style={styles.inputIcon} />
                <TextInput
                  style={styles.inputField}
                  placeholder="Repite tu contraseña"
                  placeholderTextColor={Colors.outline}
                  secureTextEntry
                  value={confirmarPassword}
                  onChangeText={setConfirmarPassword}
                  editable={!cargando}
                  onSubmitEditing={manejarRegistro}
                />
              </View>
            </View>

          </View>

          {/* Bottom Action Area */}
          <View style={styles.actionArea}>
            <TouchableOpacity
              style={[styles.botonPrimario, cargando && { opacity: 0.7 }]}
              onPress={manejarRegistro}
              activeOpacity={0.8}
              disabled={cargando}
            >
              {cargando ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <Text style={styles.botonTexto}>Continuar</Text>
                  <MaterialIcons name="arrow-forward" size={18} color="#FFFFFF" style={{ marginLeft: 8 }} />
                </>
              )}
            </TouchableOpacity>
            
            <View style={styles.footerRow}>
              <Text style={styles.footerText}>¿Ya tienes cuenta?</Text>
              <TouchableOpacity onPress={() => router.replace("/login")} disabled={cargando}>
                <Text style={styles.footerLink}> Inicia sesión</Text>
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
    backgroundColor: 'rgba(149, 211, 186, 0.15)', // primary-fixed-dim/30
  },
  bgCircleMock: {
    position: 'absolute', top: -50, right: -50, width: 200, height: 200,
    backgroundColor: 'rgba(178, 247, 70, 0.1)', // secondary-container/20
    borderRadius: 100,
  },
  headerBar: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  backButton: {
    width: 40, height: 40,
    borderRadius: 20,
    backgroundColor: '#ffffff',
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
  },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  titleSection: {
    marginBottom: 24,
    marginTop: 8,
  },
  pageTitle: {
    fontSize: 24, fontWeight: '700', color: Colors.primary, marginBottom: 4,
  },
  pageSubtitle: {
    fontSize: 16, color: Colors.onSurfaceVariant,
  },
  progressBarBg: {
    width: '100%', height: 8,
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: 4, overflow: 'hidden',
    marginBottom: 24,
  },
  progressBarFill: {
    height: '100%', backgroundColor: Colors.primary, borderRadius: 4,
  },
  glassPanel: {
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 24,
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
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 12, fontWeight: '600', color: Colors.onSurfaceVariant,
    marginBottom: 6, marginLeft: 4, letterSpacing: 0.5,
  },
  inputContainer: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#ffffff',
    borderWidth: 1, borderColor: Colors.outlineVariant,
    borderRadius: 12, paddingHorizontal: 16, height: 52,
  },
  inputIcon: {
    marginRight: 12,
  },
  inputField: {
    flex: 1, fontSize: 16, color: Colors.onSurface,
  },
  actionArea: {
    marginTop: 32,
  },
  botonPrimario: {
    backgroundColor: Colors.primary,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    height: 56, borderRadius: 12,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2, shadowRadius: 8, elevation: 4,
  },
  botonTexto: {
    color: '#ffffff', fontSize: 14, fontWeight: '600', letterSpacing: 0.5,
  },
  footerRow: {
    flexDirection: 'row', justifyContent: 'center', marginTop: 24,
  },
  footerText: {
    color: Colors.onSurfaceVariant, fontSize: 14,
  },
  footerLink: {
    color: Colors.primaryContainer, fontSize: 14, fontWeight: '700',
  },
  exitoContenedor: {
    flex: 1, backgroundColor: Colors.background,
    justifyContent: "center", alignItems: "center", padding: 32,
  },
  exitoTitulo: {
    fontSize: 24, fontWeight: "800", color: Colors.primary, marginBottom: 8,
  },
  exitoTexto: {
    fontSize: 15, color: Colors.onSurfaceVariant, textAlign: "center", lineHeight: 22, marginBottom: 32,
  },
});
