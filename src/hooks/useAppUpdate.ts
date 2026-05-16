import * as Updates from 'expo-updates';
import { useCallback, useState } from 'react';

type UpdateState = 'idle' | 'checking' | 'available' | 'downloading' | 'ready' | 'up_to_date' | 'error';

interface UpdateInfo {
  canal: string;
  runtimeVersion: string;
  updateId: string | null;
  isEmbedded: boolean;
  createdAt: Date | null;
}

export function useAppUpdate() {
  const [estado, setEstado] = useState<UpdateState>('idle');
  const [error, setError] = useState<string | null>(null);

  const info: UpdateInfo = {
    canal: Updates.channel ?? 'desconocido',
    runtimeVersion: Updates.runtimeVersion ?? '—',
    updateId: Updates.updateId ?? null,
    isEmbedded: Updates.isEmbeddedLaunch ?? true,
    createdAt: Updates.createdAt ?? null,
  };

  const buscarActualizacion = useCallback(async () => {
    setError(null);
    setEstado('checking');

    try {
      const resultado = await Updates.checkForUpdateAsync();

      if (!resultado.isAvailable) {
        setEstado('up_to_date');
        return;
      }

      setEstado('downloading');
      await Updates.fetchUpdateAsync();
      setEstado('ready');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error desconocido al verificar actualizaciones.';
      console.error('[useAppUpdate] Error:', msg);
      setError(msg);
      setEstado('error');
    }
  }, []);

  const aplicarActualizacion = useCallback(async () => {
    try {
      await Updates.reloadAsync();
    } catch {
      setError('No se pudo reiniciar la app. Ciérrala manualmente y vuelve a abrirla.');
      setEstado('error');
    }
  }, []);

  const resetear = useCallback(() => {
    setEstado('idle');
    setError(null);
  }, []);

  return {
    estado,
    error,
    info,
    buscarActualizacion,
    aplicarActualizacion,
    resetear,
  };
}