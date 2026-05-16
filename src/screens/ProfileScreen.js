import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "@/src/hooks/useAuth";
import Colors from "@/src/constants/colors";
import { MaterialIcons } from "@expo/vector-icons";
import supabase from "@/src/services/supabase";

export default function ProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { perfil, rol, logout } = useAuth();

  const [editando, setEditando] = useState(false);
  const [nombre, setNombre] = useState(perfil?.nombre_completo || "");
  const [guardando, setGuardando] = useState(false);

  const handleGuardar = async () => {
    if (!nombre.trim()) {
      Alert.alert("Error", "El nombre no puede estar vacío");
      return;
    }
    setGuardando(true);
    try {
      const { error } = await supabase
        .from("perfiles")
        .update({ nombre_completo: nombre.trim() })
        .eq("id", perfil.id);

      if (error) throw error;
      setEditando(false);
      Alert.alert("Éxito", "Perfil actualizado correctamente");
    } catch (_err) {
      Alert.alert("Error", "No se pudo actualizar el perfil");
    } finally {
      setGuardando(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      "Cerrar sesión",
      "¿Estás seguro de que deseas cerrar sesión?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Cerrar sesión",
          style: "destructive",
          onPress: async () => {
            await logout();
            router.replace("/login");
          },
        },
      ]
    );
  };

  return (
    <View style={[styles.contenedor, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mi Perfil</Text>
      </View>

      <View style={styles.perfilCard}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <MaterialIcons name="person" size={48} color={Colors.primary} />
          </View>
          <TouchableOpacity
            style={styles.avatarEdit}
            onPress={() => setEditando(true)}
          >
            <MaterialIcons name="edit" size={16} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {editando ? (
          <View style={styles.editForm}>
            <TextInput
              style={styles.input}
              value={nombre}
              onChangeText={setNombre}
              placeholder="Tu nombre completo"
              placeholderTextColor="#9CA3AF"
              autoFocus
            />
            <View style={styles.editButtons}>
              <TouchableOpacity
                style={styles.botonCancelar}
                onPress={() => {
                  setNombre(perfil?.nombre_completo || "");
                  setEditando(false);
                }}
              >
                <Text style={styles.botonCancelarTexto}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.botonGuardar, guardando && styles.botonDisabled]}
                onPress={handleGuardar}
                disabled={guardando}
              >
                {guardando ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.botonGuardarTexto}>Guardar</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <>
            <Text style={styles.nombre}>{perfil?.nombre_completo || "Usuario"}</Text>
            <Text style={styles.email}>{perfil?.email}</Text>
            <View style={styles.rolBadge}>
              <Text style={styles.rolTexto}>
                {rol === "administrador" ? "Administrador" : "Ciudadano"}
              </Text>
            </View>
          </>
        )}
      </View>

      <View style={styles.infoSection}>
        <Text style={styles.sectionTitle}>Información de la cuenta</Text>

        <View style={styles.infoItem}>
          <MaterialIcons name="email" size={20} color="#6B7280" />
          <View style={styles.infoText}>
            <Text style={styles.infoLabel}>Correo electrónico</Text>
            <Text style={styles.infoValue}>{perfil?.email}</Text>
          </View>
        </View>

        <View style={styles.infoItem}>
          <MaterialIcons name="calendar-today" size={20} color="#6B7280" />
          <View style={styles.infoText}>
            <Text style={styles.infoLabel}>Miembro desde</Text>
            <Text style={styles.infoValue}>
              {perfil?.fecha_creacion
                ? new Date(perfil.fecha_creacion).toLocaleDateString("es-PE", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })
                : "—"}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.statsSection}>
        <Text style={styles.sectionTitle}>Estadísticas</Text>
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <MaterialIcons name="directions-bike" size={24} color={Colors.primary} />
            <Text style={styles.statLabel}>Viajes</Text>
            <Text style={styles.statValue}>—</Text>
          </View>
          <View style={styles.statCard}>
            <MaterialIcons name="eco" size={24} color={Colors.estadoDisponible} />
            <Text style={styles.statLabel}>CO2 ahorrado</Text>
            <Text style={styles.statValue}>— kg</Text>
          </View>
        </View>
      </View>

      <TouchableOpacity style={styles.botonLogout} onPress={handleLogout}>
        <MaterialIcons name="logout" size={20} color={Colors.error} />
        <Text style={styles.botonLogoutTexto}>Cerrar sesión</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: { flex: 1, backgroundColor: "#F5F7FA" },
  header: { paddingHorizontal: 20, paddingVertical: 14, backgroundColor: "#FFFFFF", borderBottomWidth: 1, borderBottomColor: "#E5E7EB" },
  headerTitle: { fontSize: 20, fontWeight: "800", color: "#111827" },
  perfilCard: { backgroundColor: "#FFFFFF", margin: 16, borderRadius: 16, padding: 24, alignItems: "center", borderWidth: 1, borderColor: "#E5E7EB", elevation: 2, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4 },
  avatarContainer: { position: "relative", marginBottom: 16 },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: "#D1FAE5", justifyContent: "center", alignItems: "center" },
  avatarEdit: { position: "absolute", bottom: 0, right: 0, width: 28, height: 28, borderRadius: 14, backgroundColor: Colors.primary, justifyContent: "center", alignItems: "center", borderWidth: 2, borderColor: "#FFFFFF" },
  nombre: { fontSize: 22, fontWeight: "800", color: "#111827", marginBottom: 4 },
  email: { fontSize: 14, color: "#6B7280", marginBottom: 12 },
  rolBadge: { backgroundColor: "#DBEAFE", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  rolTexto: { fontSize: 12, fontWeight: "600", color: "#1E40AF" },
  editForm: { width: "100%", gap: 12 },
  input: { backgroundColor: "#F5F7FA", borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, fontSize: 16, borderWidth: 1, borderColor: "#E5E7EB" },
  editButtons: { flexDirection: "row", gap: 10 },
  botonCancelar: { flex: 1, paddingVertical: 12, borderRadius: 10, borderWidth: 1, borderColor: "#E5E7EB", alignItems: "center" },
  botonCancelarTexto: { fontSize: 14, fontWeight: "600", color: "#6B7280" },
  botonGuardar: { flex: 1, paddingVertical: 12, borderRadius: 10, backgroundColor: Colors.primary, alignItems: "center" },
  botonGuardarTexto: { fontSize: 14, fontWeight: "600", color: "#FFFFFF" },
  botonDisabled: { opacity: 0.6 },
  infoSection: { marginHorizontal: 16, marginBottom: 16 },
  sectionTitle: { fontSize: 14, fontWeight: "700", color: "#111827", marginBottom: 12 },
  infoItem: { flexDirection: "row", alignItems: "center", backgroundColor: "#FFFFFF", borderRadius: 12, padding: 14, marginBottom: 8, borderWidth: 1, borderColor: "#E5E7EB", gap: 12 },
  infoText: { flex: 1 },
  infoLabel: { fontSize: 12, color: "#6B7280" },
  infoValue: { fontSize: 15, fontWeight: "600", color: "#111827", marginTop: 2 },
  statsSection: { marginHorizontal: 16, marginBottom: 16 },
  statsRow: { flexDirection: "row", gap: 10 },
  statCard: { flex: 1, backgroundColor: "#FFFFFF", borderRadius: 12, padding: 16, alignItems: "center", borderWidth: 1, borderColor: "#E5E7EB", gap: 6 },
  statLabel: { fontSize: 11, color: "#6B7280" },
  statValue: { fontSize: 18, fontWeight: "800", color: "#111827" },
  botonLogout: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, marginHorizontal: 16, marginTop: "auto", marginBottom: 20, paddingVertical: 14, borderRadius: 12, borderWidth: 1, borderColor: Colors.error },
  botonLogoutTexto: { fontSize: 15, fontWeight: "600", color: Colors.error },
});