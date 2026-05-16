import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from "react";
import * as Location from "expo-location";
import { getViajeActivo } from "../services/viajeService";
import { useAuth } from "./AuthContext";

interface ViajeActivoState {
  viajeId: number | null;
  bicicletaId: number | null;
  estacionOrigenId: number | null;
  inicio: string | null;
  duracionSegundos: number;
  distanciaKm: number;
  cargando: boolean;
}

interface ViajeContextType extends ViajeActivoState {
  iniciarViaje: (viajeId: number, bicicletaId: number, estacionOrigenId: number, inicio: string) => void;
  finalizarViaje: () => void;
  isViajeActivo: boolean;
}

const ViajeContext = createContext<ViajeContextType>({
  viajeId: null,
  bicicletaId: null,
  estacionOrigenId: null,
  inicio: null,
  duracionSegundos: 0,
  distanciaKm: 0,
  cargando: true,
  iniciarViaje: () => {},
  finalizarViaje: () => {},
  isViajeActivo: false,
});

export function ViajeProvider({ children }: { children: React.ReactNode }) {
  const { perfil } = useAuth();
  const [viajeId, setViajeId] = useState<number | null>(null);
  const [bicicletaId, setBicicletaId] = useState<number | null>(null);
  const [estacionOrigenId, setEstacionOrigenId] = useState<number | null>(null);
  const [inicio, setInicio] = useState<string | null>(null);
  const [duracionSegundos, setDuracionSegundos] = useState(0);
  const [distanciaKm, setDistanciaKm] = useState(0);
  const [cargando, setCargando] = useState(true);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastCoordRef = useRef<{ lat: number; lng: number } | null>(null);
  const locationSubRef = useRef<Location.LocationSubscription | null>(null);

  const iniciarViaje = useCallback(
    (vId: number, bId: number, eId: number, inicioStr: string) => {
      setViajeId(vId);
      setBicicletaId(bId);
      setEstacionOrigenId(eId);
      setInicio(inicioStr);
      setDuracionSegundos(0);
      setDistanciaKm(0);

      const inicioMs = new Date(inicioStr).getTime();
      timerRef.current = setInterval(() => {
        const ahora = Date.now();
        setDuracionSegundos(Math.floor((ahora - inicioMs) / 1000));
      }, 1000);
    },
    []
  );

  const finalizarViaje = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (locationSubRef.current) {
      locationSubRef.current.remove();
      locationSubRef.current = null;
    }
    setViajeId(null);
    setBicicletaId(null);
    setEstacionOrigenId(null);
    setInicio(null);
    setDuracionSegundos(0);
    setDistanciaKm(0);
    lastCoordRef.current = null;
  }, []);

  useEffect(() => {
    if (viajeId) {
      (async () => {
        try {
          const { status } = await Location.requestForegroundPermissionsAsync();
          if (status !== "granted") return;

          locationSubRef.current = await Location.watchPositionAsync(
            {
              accuracy: Location.Accuracy.Balanced,
              distanceInterval: 10,
            },
            (location) => {
              const { latitude, longitude } = location.coords;
              if (lastCoordRef.current) {
                const prev = lastCoordRef.current;
                const R = 6371;
                const dLat = ((latitude - prev.lat) * Math.PI) / 180;
                const dLng = ((longitude - prev.lng) * Math.PI) / 180;
                const a =
                  Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                  Math.cos((prev.lat * Math.PI) / 180) *
                    Math.cos((latitude * Math.PI) / 180) *
                    Math.sin(dLng / 2) *
                    Math.sin(dLng / 2);
                const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
                const dist = R * c;
                setDistanciaKm((prev) => prev + dist);
              }
              lastCoordRef.current = { lat: latitude, lng: longitude };
            }
          );
        } catch {
          // GPS no disponible, continuar sin tracking
        }
      })();
    }

    return () => {
      if (locationSubRef.current) {
        locationSubRef.current.remove();
        locationSubRef.current = null;
      }
    };
  }, [viajeId]);

  useEffect(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  useEffect(() => {
    (async () => {
      if (!perfil?.id) {
        setCargando(false);
        return;
      }
      try {
        const viaje = await getViajeActivo(perfil.id);
        if (viaje) {
          iniciarViaje(
            viaje.id,
            viaje.bicicleta_id,
            viaje.estacion_origen,
            viaje.inicio
          );
        }
      } catch {
        // Sin viaje activo
      } finally {
        setCargando(false);
      }
    })();
  }, [perfil?.id, iniciarViaje]);

  return (
    <ViajeContext.Provider
      value={{
        viajeId,
        bicicletaId,
        estacionOrigenId,
        inicio,
        duracionSegundos,
        distanciaKm,
        cargando,
        iniciarViaje,
        finalizarViaje,
        isViajeActivo: viajeId !== null,
      }}
    >
      {children}
    </ViajeContext.Provider>
  );
}

export function useViaje(): ViajeContextType {
  const context = useContext(ViajeContext);
  if (!context) {
    throw new Error("useViaje debe usarse dentro de un ViajeProvider");
  }
  return context;
}