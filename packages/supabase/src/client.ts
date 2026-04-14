import "react-native-url-polyfill/auto";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { AppState, AppStateStatus, Platform } from "react-native";
import { assertSupabaseEnv, getSupabaseEnv } from "./env";

let supabaseClient: SupabaseClient | null = null;
let appStateSubscription: { remove: () => void } | null = null;

export function getSupabaseClient() {
  if (supabaseClient) {
    return supabaseClient;
  }

  const env = assertSupabaseEnv();

  supabaseClient = createClient(env.url, env.publishableKey, {
    auth: {
      storage: Platform.OS === "web" ? undefined : AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: Platform.OS === "web"
    }
  });

  return supabaseClient;
}

export function maybeGetSupabaseClient() {
  if (!getSupabaseEnv()) {
    return null;
  }

  return getSupabaseClient();
}

export function registerSupabaseAutoRefresh() {
  const client = maybeGetSupabaseClient();

  if (!client || Platform.OS === "web" || appStateSubscription) {
    return () => {};
  }

  const onAppStateChange = (state: AppStateStatus) => {
    if (state === "active") {
      client.auth.startAutoRefresh();
      return;
    }

    client.auth.stopAutoRefresh();
  };

  const subscription = AppState.addEventListener("change", onAppStateChange);
  appStateSubscription = subscription;

  client.auth.startAutoRefresh();

  return () => {
    subscription.remove();
    appStateSubscription = null;
    client.auth.stopAutoRefresh();
  };
}
