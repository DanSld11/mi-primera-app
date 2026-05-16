import { useAuth } from '@/src/context/AuthContext';
import { Redirect } from 'expo-router';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

/**
 * Ruta raíz: redirige según estado de autenticación y rol.
 * - No autenticado → /login
 * - Administrador  → /(admin)
 * - Ciudadano      → /(tabs)
 */
export default function Index() {
  const { usuario, rol, cargando } = useAuth();

  if (cargando) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0B6E4F" />
      </View>
    );
  }

  if (!usuario) {
    return <Redirect href="/onboarding" />;
  }

  if (rol === 'administrador') {
    // @ts-ignore
    return <Redirect href="/(admin)/dashboard" />;
  }

  // @ts-ignore
  return <Redirect href="/(tabs)" />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F7FA',
  },
});
