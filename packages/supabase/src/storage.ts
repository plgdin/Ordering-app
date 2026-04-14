import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

function canUseWebStorage() {
  return Platform.OS === "web" && typeof window !== "undefined" && !!window.localStorage;
}

export async function readStoredJson<T>(key: string, fallback: T): Promise<T> {
  try {
    if (canUseWebStorage()) {
      const value = window.localStorage.getItem(key);
      return value ? (JSON.parse(value) as T) : fallback;
    }

    const value = await AsyncStorage.getItem(key);
    return value ? (JSON.parse(value) as T) : fallback;
  } catch {
    return fallback;
  }
}

export async function writeStoredJson<T>(key: string, value: T) {
  const payload = JSON.stringify(value);

  if (canUseWebStorage()) {
    window.localStorage.setItem(key, payload);
    return;
  }

  await AsyncStorage.setItem(key, payload);
}

export async function removeStoredValue(key: string) {
  if (canUseWebStorage()) {
    window.localStorage.removeItem(key);
    return;
  }

  await AsyncStorage.removeItem(key);
}
