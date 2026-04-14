import { maybeGetSupabaseClient } from "./client";

export type AppRole = "client" | "merchant" | "delivery" | "admin";

export type AuthSnapshot = {
  isConfigured: boolean;
  isSignedIn: boolean;
  userId: string | null;
  email: string | null;
  role: AppRole | null;
};

const emptySnapshot: AuthSnapshot = {
  isConfigured: false,
  isSignedIn: false,
  userId: null,
  email: null,
  role: null
};

async function fetchRoleForUser(userId: string): Promise<AppRole | null> {
  const supabase = maybeGetSupabaseClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    return null;
  }

  return (data?.role as AppRole | undefined) ?? null;
}

async function ensureDeliveryPartnerRow(userId: string) {
  const supabase = maybeGetSupabaseClient();
  if (!supabase) return;

  const { error } = await supabase.from("delivery_partners").upsert(
    {
      user_id: userId,
      vehicle_type: "bike",
      is_online: false
    },
    {
      onConflict: "user_id",
      ignoreDuplicates: false
    }
  );

  if (error) {
    throw error;
  }
}

async function buildSnapshot(): Promise<AuthSnapshot> {
  const supabase = maybeGetSupabaseClient();
  if (!supabase) return emptySnapshot;

  const {
    data: { session }
  } = await supabase.auth.getSession();

  if (!session?.user) {
    return {
      ...emptySnapshot,
      isConfigured: true
    };
  }

  return {
    isConfigured: true,
    isSignedIn: true,
    userId: session.user.id,
    email: session.user.email ?? null,
    role: await fetchRoleForUser(session.user.id)
  };
}

export async function getAuthSnapshot() {
  return buildSnapshot();
}

export function subscribeToAuthSnapshot(listener: (snapshot: AuthSnapshot) => void) {
  const supabase = maybeGetSupabaseClient();
  if (!supabase) {
    listener(emptySnapshot);
    return () => {};
  }

  void buildSnapshot().then(listener).catch(() => listener({
    ...emptySnapshot,
    isConfigured: true
  }));

  const {
    data: { subscription }
  } = supabase.auth.onAuthStateChange(() => {
    void buildSnapshot()
      .then(listener)
      .catch(() =>
        listener({
          ...emptySnapshot,
          isConfigured: true
        })
      );
  });

  return () => {
    subscription.unsubscribe();
  };
}

export async function signInWithPassword(email: string, password: string) {
  const supabase = maybeGetSupabaseClient();
  if (!supabase) {
    throw new Error("Supabase is not configured.");
  }

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    throw error;
  }

  return buildSnapshot();
}

export async function signUpWithPassword(
  email: string,
  password: string,
  role: Exclude<AppRole, "admin">
) {
  const supabase = maybeGetSupabaseClient();
  if (!supabase) {
    throw new Error("Supabase is not configured.");
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        role
      }
    }
  });

  if (error) {
    throw error;
  }

  if (role === "delivery" && data.session?.user?.id) {
    await ensureDeliveryPartnerRow(data.session.user.id);
  }

  return buildSnapshot();
}

export async function signOutCurrentUser() {
  const supabase = maybeGetSupabaseClient();
  if (!supabase) return;

  const { error } = await supabase.auth.signOut();
  if (error) {
    throw error;
  }
}
