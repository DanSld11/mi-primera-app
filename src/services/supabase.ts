import "react-native-url-polyfill/auto";
import { createClient, Session, SupabaseClient } from "@supabase/supabase-js";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";
import Config from "../constants/config";

const supabaseUrl: string = Config.SUPABASE_URL || "";
const supabaseKey: string = Config.SUPABASE_ANON_KEY || "";

/**
 * ADAPTADOR DE ALMACENAMIENTO SEGURO
 * Se utiliza AsyncStorage directamente para la app.
 * Durante la compilación (Node.js), se devuelve un adaptador vacío para evitar errores de 'window'.
 */
const isServer = typeof window === "undefined";

const SafeStorage = {
  getItem: (key: string) => {
    if (isServer) return Promise.resolve(null);
    return AsyncStorage.getItem(key);
  },
  setItem: (key: string, value: string) => {
    if (isServer) return Promise.resolve();
    return AsyncStorage.setItem(key, value);
  },
  removeItem: (key: string) => {
    if (isServer) return Promise.resolve();
    return AsyncStorage.removeItem(key);
  },
};

const supabase: SupabaseClient = createClient(supabaseUrl, supabaseKey, {
  auth: {
    storage: SafeStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

export default supabase;
export type { Session };
