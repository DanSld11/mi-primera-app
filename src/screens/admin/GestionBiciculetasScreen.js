import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  Alert,
  Modal,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import supabase from "@/src/services/supabase";
import Colors from "@/src/constants/colors";
import { MaterialIcons } from "@expo/vector-icons";

function getEstadoConfig(estado) {
  switch (estado) {
    case "disponible": return { label: "Disponible", color: "#065F46", bg: "#D1FAE5" };
    case "en_uso": return { label: "En uso", color: "#1E40AF", bg: "#DBEAFE" };
    case "mantenimiento": return { label: "Mantenimiento", color: "#92400E", bg: "#FEF3C7" };
    default: return { label: "Desconocido", color: "#6B7280", bg: "#F3F4F6" };
  }
}

export default function GestionBiciculetasScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { estacionId, estacionNombre } = useLocalSearchParams();

  const [bicicletas, setBiciculetas] = useState([]);
  const [contador, setContador] = useState({ total: 0, disponibles: 0, enUso: 0, mantenimiento: 0 });
  const [cargando, setCargando] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [nuevoCodigo, setNuevoCodigo] = useState("");
  const [creando, setCreando] = useState(false);

  const estId = Number(estacionId);
  const nombreEstacion = estacionNombre || "Esta estación";

  const cargarDatos = useCallback(async () => {
    try {
      const { data: bikes, error: e1 } = await supabase
        .from("bicicletas")
        .select("*")
        .eq("estacion_id", estId)
        .order("id", { ascending: true });

      if (e1) throw e1;

      const { data: counts, error: e2 } = await supabase
        .from("bicicletas")
        .select("estado")
        .eq("estacion_id", estId);

      if (e2) throw e2;

      const bikesData = bikes || [];
      const countsData = counts || [];

      setBiciculetas(bikesData);
      setContador({
        total: countsData.length,
        disponibles: countsData.filter((b) => b.estado === "disponible").length,
        enUso: countsData.filter((b) => b.estado === "en_uso").length,
        mantenimiento: countsData.filter((b) => b.estado === "mantenimiento").length,
      });
    } catch (_err) {
      Alert.alert("Error", "No se pudieron cargar las bicicletas");
    } finally {
      setCargando(false);
    }
  }, [estId]);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  const handleAgregarBiciculeta = async () => {
    if (!nuevoCodigo.trim()) {
      Alert.alert("Error", "Ingresa un código QR");
      return;
    }
    setCreando(true);
    try {
      const { error } = await supabase
        .from("bicicletas")
        .insert([{ codigo_qr: nuevoCodigo.trim().toUpperCase(), estacion_id: estId, estado: "disponible" }]);

      if (error) throw error;
      setModalVisible(false);
      setNuevoCodigo("");
      cargarDatos();
    } catch (_err) {
      Alert.alert("Error", "No se pudo agregar la bicicleta. Puede que el código ya exista.");
    } finally {
      setCreando(false);
    }
  };

  const handleCambiarEstado = (bici) => {
    const estados = ["disponible", "en_uso", "mantenimiento"];
    const actualIndex = estados.indexOf(bici.estado);
    const siguiente = estados[(actualIndex + 1) % estados.length];

    Alert.alert("Cambiar estado", `¿Cambiar a "${getEstadoConfig(siguiente).label}"?`, [
      { text: "Cancelar", style: "cancel" },
      { text: "Sí", onPress: async () => {
        try {
          await supabase.from("bicicletas").update({ estado: siguiente }).eq("id", bici.id);
          cargarDatos();
        } catch { Alert.alert("Error", "No se pudo cambiar el estado"); }
      }},
    ]);
  };

  const handleEliminar = (bici) => {
    Alert.alert("Eliminar bicicleta", `¿Eliminar la bicicleta ${bici.codigo_qr}?`, [
      { text: "Cancelar", style: "cancel" },
      { text: "Eliminar", style: "destructive", onPress: async () => {
        try {
          await supabase.from("bicicletas").delete().eq("id", bici.id);
          cargarDatos();
        } catch { Alert.alert("Error", "No se pudo eliminar"); }
      }},
    ]);
  };

  if (cargando) {
    return <View style={styles.centrado}><ActivityIndicator size="large" color={Colors.primary} /></View>;
  }

  return (
    <View style={[styles.contenedor, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <MaterialIcons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <View style={styles.headerText}>
          <Text style={styles.headerTitle}>Biciculetas</Text>
          <Text style={styles.headerSub}>{nombreEstacion}</Text>
        </View>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statCard}><Text style={styles.statNum}>{contador.total}</Text><Text style={styles.statLabel}>Total</Text></View>
        <View style={[styles.statCard, { borderColor: "#10B981" }]}><Text style={[styles.statNum, { color: "#10B981" }]}>{contador.disponibles}</Text><Text style={styles.statLabel}>Disp.</Text></View>
        <View style={[styles.statCard, { borderColor: "#1E40AF" }]}><Text style={[styles.statNum, { color: "#1E40AF" }]}>{contador.enUso}</Text><Text style={styles.statLabel}>En uso</Text></View>
        <View style={[styles.statCard, { borderColor: "#92400E" }]}><Text style={[styles.statNum, { color: "#92400E" }]}>{contador.mantenimiento}</Text><Text style={styles.statLabel}>Manto.</Text></View>
      </View>

      <TouchableOpacity style={styles.botonAgregar} onPress={() => setModalVisible(true)}>
        <MaterialIcons name="add" size={22} color="#FFFFFF" />
        <Text style={styles.botonAgregarTexto}>Agregar bicicleta</Text>
      </TouchableOpacity>

      <FlatList
        data={bicicletas}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.lista}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={<View style={styles.vacio}><MaterialIcons name="directions-bike" size={48} color="#D1D5DB" /><Text style={styles.vacioTexto}>No hay bicicletas</Text></View>}
        renderItem={({ item }) => {
          const cfg = getEstadoConfig(item.estado);
          return (
            <View style={styles.tarjeta}>
              <View style={styles.tarjetaLeft}>
                <View style={[styles.estadoDot, { backgroundColor: cfg.color }]} />
                <View><Text style={styles.codigoQR}>{item.codigo_qr}</Text><Text style={styles.fecha}>ID: {item.id}</Text></View>
              </View>
              <View style={styles.tarjetaRight}>
                <TouchableOpacity style={styles.botonEstado} onPress={() => handleCambiarEstado(item)}>
                  <Text style={[styles.botonEstadoTexto, { color: cfg.color }]}>{cfg.label}</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleEliminar(item)}>
                  <MaterialIcons name="delete-outline" size={22} color={Colors.error} />
                </TouchableOpacity>
              </View>
            </View>
          );
        }}
      />

      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Agregar bicicleta</Text>
            <TextInput style={styles.input} value={nuevoCodigo} onChangeText={setNuevoCodigo} placeholder="Código QR" placeholderTextColor="#9CA3AF" autoCapitalize="characters" autoFocus />
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.botonCancelar} onPress={() => { setModalVisible(false); setNuevoCodigo(""); }}>
                <Text style={styles.botonCancelarTexto}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.botonConfirmar, creando && styles.botonDisabled]} onPress={handleAgregarBiciculeta} disabled={creando}>
                {creando ? <ActivityIndicator size="small" color="#FFFFFF" /> : <Text style={styles.botonConfirmarTexto}>Agregar</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: { flex: 1, backgroundColor: "#F5F7FA" },
  header: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 12, backgroundColor: "#FFFFFF", borderBottomWidth: 1, borderBottomColor: "#E5E7EB", gap: 12 },
  backBtn: { padding: 4 },
  headerText: { flex: 1 },
  headerTitle: { fontSize: 18, fontWeight: "700", color: "#111827" },
  headerSub: { fontSize: 13, color: "#6B7280", marginTop: 2 },
  statsRow: { flexDirection: "row", padding: 12, gap: 8 },
  statCard: { flex: 1, backgroundColor: "#FFFFFF", borderRadius: 10, padding: 10, alignItems: "center", borderWidth: 1, borderColor: "#E5E7EB" },
  statNum: { fontSize: 20, fontWeight: "800", color: "#111827" },
  statLabel: { fontSize: 10, color: "#6B7280", marginTop: 2 },
  botonAgregar: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, backgroundColor: Colors.primary, marginHorizontal: 16, marginBottom: 12, paddingVertical: 12, borderRadius: 10 },
  botonAgregarTexto: { color: "#FFFFFF", fontSize: 15, fontWeight: "600" },
  lista: { paddingHorizontal: 16, paddingBottom: 20, gap: 8 },
  tarjeta: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", backgroundColor: "#FFFFFF", borderRadius: 12, padding: 14, borderWidth: 1, borderColor: "#E5E7EB" },
  tarjetaLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  estadoDot: { width: 10, height: 10, borderRadius: 5 },
  codigoQR: { fontSize: 15, fontWeight: "700", color: "#111827" },
  fecha: { fontSize: 12, color: "#6B7280", marginTop: 2 },
  tarjetaRight: { flexDirection: "row", alignItems: "center", gap: 12 },
  botonEstado: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, backgroundColor: "#F3F4F6" },
  botonEstadoTexto: { fontSize: 12, fontWeight: "600" },
  vacio: { alignItems: "center", paddingVertical: 40, gap: 8 },
  vacioTexto: { fontSize: 14, color: "#6B7280" },
  centrado: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#F5F7FA" },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center" },
  modalContent: { backgroundColor: "#FFFFFF", borderRadius: 16, padding: 24, width: "85%", maxWidth: 340 },
  modalTitle: { fontSize: 18, fontWeight: "700", color: "#111827", marginBottom: 16, textAlign: "center" },
  input: { backgroundColor: "#F5F7FA", borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, marginBottom: 16 },
  modalButtons: { flexDirection: "row", gap: 10 },
  botonCancelar: { flex: 1, paddingVertical: 12, borderRadius: 10, borderWidth: 1, borderColor: "#E5E7EB", alignItems: "center" },
  botonCancelarTexto: { color: "#6B7280", fontSize: 15, fontWeight: "600" },
  botonConfirmar: { flex: 1, paddingVertical: 12, borderRadius: 10, backgroundColor: Colors.primary, alignItems: "center" },
  botonConfirmarTexto: { color: "#FFFFFF", fontSize: 15, fontWeight: "600" },
  botonDisabled: { opacity: 0.6 },
});