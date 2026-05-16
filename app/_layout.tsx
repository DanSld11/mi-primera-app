import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { AuthProvider, useAuth } from '@/src/context/AuthContext';
import { ViajeProvider } from '@/src/context/ViajeContext';
import Colors from '@/src/constants/colors';

/**
 * ============================================================
 * RootLayout - Layout raíz con redirección automática por rol
 * ============================================================
 * Estados:
 * 1. Cargando: muestra indicador mientras verifica sesión
 * 2. No autenticado: redirige a /login o /registro
 * 3. Autenticado ciudadano: redirige a /(tabs)
 * 4. Autenticado administrador: redirige a /(admin)
 * ============================================================
 */

function LoadingScreen() {
  return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color={Colors.primary} />
      <Text style={styles.loadingText}>Cargando...</Text>
    </View>
  );
}

function ProtectedRouteGuard({ children }: { children: React.ReactNode }) {
  const { usuario, rol, cargando } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (cargando) return;

    const segment = segments[0] as string;
    const inAuthGroup = segment === 'login' || segment === 'registro' || segment === 'recuperar-password';
    const inCiudadanoGroup = segment === '(tabs)';
    const inAdminGroup = segment === '(admin)';

    if (!usuario) {
      if (!inAuthGroup && segment !== 'onboarding') {
        // @ts-ignore
        router.replace('/onboarding');
      }
    } else {
      if (inAuthGroup || segment === 'onboarding' || !segment) {
        if (rol === 'administrador') {
          // @ts-ignore
          router.replace('/(admin)/dashboard');
        } else {
          // @ts-ignore
          router.replace('/(tabs)');
        }
      } else if (rol === 'administrador' && inCiudadanoGroup) {
        // @ts-ignore
        router.replace('/(admin)/dashboard');
      } else if (rol === 'ciudadano' && inAdminGroup) {
        // @ts-ignore
        router.replace('/(tabs)');
      }
    }
  }, [usuario, rol, cargando, segments, router]);

  if (cargando) {
    return <LoadingScreen />;
  }

  return (
    <>
      {children}
    </>
  );
}



export const unstable_settings = {
  anchor: '(tabs)',
};

function RootLayoutNav() {
  const colorScheme = useColorScheme();

  return (
    <SafeAreaProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <ProtectedRouteGuard>
          <Stack>
            <Stack.Screen name="onboarding" options={{ headerShown: false }} />
            <Stack.Screen name="login" options={{ headerShown: false }} />
          <Stack.Screen name="registro" options={{ headerShown: false }} />
          <Stack.Screen name="recuperar-password" options={{ headerShown: false }} />
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="(admin)" options={{ headerShown: false }} />
            <Stack.Screen
              name="detalle-estacion"
              options={{ headerTitle: "Detalle de estación", headerBackTitle: "Mapa" }}
            />
            <Stack.Screen
              name="recomendaciones"
              options={{ headerTitle: "Recomendaciones", headerBackTitle: "Mapa" }}
            />
            <Stack.Screen
              name="reporte-incidencia"
              options={{ headerTitle: "Reportar incidencia", headerBackTitle: "Atrás" }}
            />
            <Stack.Screen
              name="escanear-qr"
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="viaje-activo"
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="resumen-viaje"
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="selector-estacion"
              options={{ headerTitle: "Devolver bicicleta", headerBackTitle: "Atrás" }}
            />
            <Stack.Screen
              name="seleccionar-estacion"
              options={{ headerTitle: "Devolver bicicleta", headerBackTitle: "Viaje" }}
            />
            <Stack.Screen
              name="historial-viajes"
              options={{ headerTitle: "Mis viajes", headerBackTitle: "Atrás" }}
            />
            <Stack.Screen
              name="perfil"
              options={{ headerTitle: "Mi perfil", headerBackTitle: "Atrás" }}
            />
            <Stack.Screen
              name="detalle-incidencia-admin"
              options={{ headerTitle: "Detalle de incidencia", headerBackTitle: "Incidencias" }}
            />
          </Stack>
        </ProtectedRouteGuard>
        <StatusBar style="auto" />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <ViajeProvider>
        <RootLayoutNav />
      </ViajeProvider>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: Colors.textSecondary,
  },
});
