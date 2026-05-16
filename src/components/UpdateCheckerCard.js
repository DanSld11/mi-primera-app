import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { useAppUpdate } from '@/src/hooks/useAppUpdate';
import Colors from '@/src/constants/colors';

const ESTADOS_TEXTO = {
  idle:         { icono: '🔄', label: 'Verificar actualizaciones', color: Colors.primary },
  checking:     { icono: '🔍', label: 'Buscando actualizaciones...', color: Colors.primary },
  downloading:  { icono: '⬇️', label: 'Descargando actualización...', color: Colors.primary },
  ready:        { icono: '✅', label: '¡Actualización lista!', color: Colors.estadoDisponible },
  up_to_date:   { icono: '✅', label: 'La app está al día', color: Colors.estadoDisponible },
  error:        { icono: '❌', label: 'Error al verificar', color: Colors.error },
};

/**
 * Tarjeta de actualización OTA reutilizable.
 * Muestra info del update actual y permite buscar/aplicar actualizaciones.
 */
export default function UpdateCheckerCard() {
  const { estado, error, info, buscarActualizacion, aplicarActualizacion, resetear } =
    useAppUpdate();

  const estadoActual = ESTADOS_TEXTO[estado] ?? ESTADOS_TEXTO.idle;
  const estaOcupado = estado === 'checking' || estado === 'downloading';
  const listaParaAplicar = estado === 'ready';
  const upToDate = estado === 'up_to_date';

  const formatearFecha = (fecha) => {
    if (!fecha) return '—';
    return new Date(fecha).toLocaleString('es-PE', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <View style={styles.card}>
      {/* Header de la tarjeta */}
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitulo}>🚀 Actualizaciones</Text>
        <View style={[styles.badge, { backgroundColor: estadoActual.color + '20' }]}>
          <Text style={[styles.badgeTexto, { color: estadoActual.color }]}>
            {estadoActual.icono} {estadoActual.label}
          </Text>
        </View>
      </View>

      {/* Info de la versión actual */}
      <View style={styles.infoGrid}>
        <View style={styles.infoItem}>
          <Text style={styles.infoEtiqueta}>Canal</Text>
          <Text style={styles.infoValor}>{info.canal}</Text>
        </View>
        <View style={styles.infoItem}>
          <Text style={styles.infoEtiqueta}>Versión nativa</Text>
          <Text style={styles.infoValor}>{info.runtimeVersion}</Text>
        </View>
        <View style={styles.infoItemFull}>
          <Text style={styles.infoEtiqueta}>Tipo de carga</Text>
          <Text style={styles.infoValor}>
            {info.isEmbedded ? '📦 APK Base (sin OTA)' : '⚡ OTA (actualización remota)'}
          </Text>
        </View>
        <View style={styles.infoItemFull}>
          <Text style={styles.infoEtiqueta}>ID de esta versión</Text>
          <Text style={[styles.infoValor, styles.idTexto]}>
            {info.updateId
              ? `...${info.updateId.slice(-12)}`
              : 'APK base — sin OTA aplicado'}
          </Text>
        </View>
        {info.createdAt && (
          <View style={styles.infoItemFull}>
            <Text style={styles.infoEtiqueta}>Fecha del update</Text>
            <Text style={styles.infoValor}>{formatearFecha(info.createdAt)}</Text>
          </View>
        )}
      </View>


      {/* Mensaje de error */}
      {error && (
        <View style={styles.errorBox}>
          <Text style={styles.errorTexto}>⚠️ {error}</Text>
        </View>
      )}

      {/* Botones de acción */}
      <View style={styles.botonesRow}>
        {/* Botón principal */}
        {listaParaAplicar ? (
          <TouchableOpacity
            style={[styles.boton, styles.botonAplicar]}
            onPress={aplicarActualizacion}
            activeOpacity={0.8}
          >
            <Text style={styles.botonTextoAplicar}>⚡ Aplicar y reiniciar</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.boton, styles.botonBuscar, (estaOcupado || upToDate) && styles.botonDeshabilitado]}
            onPress={upToDate || estaOcupado ? undefined : buscarActualizacion}
            activeOpacity={estaOcupado || upToDate ? 1 : 0.8}
            disabled={estaOcupado}
          >
            {estaOcupado ? (
              <View style={styles.botonCargando}>
                <ActivityIndicator size="small" color="#fff" />
                <Text style={styles.botonTextoBuscar}>
                  {estado === 'checking' ? ' Buscando...' : ' Descargando...'}
                </Text>
              </View>
            ) : (
              <Text style={styles.botonTextoBuscar}>
                {upToDate ? '✅ Al día' : '🔍 Buscar actualizaciones'}
              </Text>
            )}
          </TouchableOpacity>
        )}

        {/* Botón resetear (si ya verificó o hubo error) */}
        {(upToDate || estado === 'error') && (
          <TouchableOpacity
            style={[styles.boton, styles.botonSecundario]}
            onPress={resetear}
            activeOpacity={0.7}
          >
            <Text style={styles.botonTextoSecundario}>Verificar de nuevo</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Nota informativa */}
      {listaParaAplicar && (
        <Text style={styles.nota}>
          💡 La app se reiniciará automáticamente para aplicar los cambios.
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 18,
    marginHorizontal: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  cardHeader: {
    marginBottom: 14,
    gap: 8,
  },
  cardTitulo: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  badgeTexto: {
    fontSize: 13,
    fontWeight: '600',
  },

  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 14,
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    padding: 12,
  },
  infoItem: {
    flex: 1,
    minWidth: '40%',
  },
  infoItemFull: {
    width: '100%',
  },
  infoEtiqueta: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  infoValor: {
    fontSize: 13,
    color: Colors.textPrimary,
    fontWeight: '600',
  },
  idTexto: {
    fontFamily: 'monospace',
    fontSize: 12,
    color: Colors.textSecondary,
  },

  errorBox: {
    backgroundColor: '#FEF2F2',
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
    borderLeftWidth: 3,
    borderLeftColor: Colors.error,
  },
  errorTexto: {
    fontSize: 12,
    color: Colors.error,
    fontWeight: '500',
    lineHeight: 18,
  },

  botonesRow: {
    gap: 8,
  },
  boton: {
    borderRadius: 10,
    paddingVertical: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  botonBuscar: {
    backgroundColor: Colors.primary,
  },
  botonAplicar: {
    backgroundColor: Colors.estadoDisponible,
  },
  botonSecundario: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  botonDeshabilitado: {
    opacity: 0.7,
  },
  botonCargando: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  botonTextoBuscar: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  botonTextoAplicar: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  botonTextoSecundario: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
  },

  nota: {
    marginTop: 10,
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
  },
});
