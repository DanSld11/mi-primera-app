import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
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
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
