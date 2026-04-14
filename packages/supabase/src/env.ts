declare const process:
  | {
      env?: Record<string, string | undefined>;
    }
  | undefined;

type SupabaseEnv = {
  url: string;
  publishableKey: string;
};

function readEnvVar(name: string) {
  return process?.env?.[name]?.trim() ?? "";
}

export function getSupabaseEnv(): SupabaseEnv | null {
  const url = readEnvVar("EXPO_PUBLIC_SUPABASE_URL");
  const publishableKey =
    readEnvVar("EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY") ||
    readEnvVar("EXPO_PUBLIC_SUPABASE_ANON_KEY");

  if (!url || !publishableKey) {
    return null;
  }

  return { url, publishableKey };
}

export function isSupabaseConfigured() {
  return getSupabaseEnv() !== null;
}

export function assertSupabaseEnv() {
  const env = getSupabaseEnv();

  if (!env) {
    throw new Error(
      "Supabase environment variables are missing. Set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY."
    );
  }

  return env;
}
