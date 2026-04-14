import {
  AppRole,
  AuthSnapshot,
  getAuthSnapshot,
  requestPasswordReset,
  resendSignupConfirmation,
  signInWithPassword,
  signOutCurrentUser,
  signUpWithPassword,
  subscribeToAuthSnapshot
} from "@nearnow/supabase";
import { useEffect, useState } from "react";

export function useSupabaseAuth(role: Exclude<AppRole, "admin">) {
  const [snapshot, setSnapshot] = useState<AuthSnapshot>({
    isConfigured: false,
    isSignedIn: false,
    userId: null,
    email: null,
    role: null
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = subscribeToAuthSnapshot(setSnapshot);
    return unsubscribe;
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      setBusy(true);
      setError(null);
      setInfo(null);
      const next = await signInWithPassword(email, password);
      setSnapshot(next);
      return true;
    } catch (nextError: any) {
      setError(nextError?.message ?? "Unable to sign in.");
      return false;
    } finally {
      setBusy(false);
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      setBusy(true);
      setError(null);
      setInfo(null);
      const next = await signUpWithPassword(email, password, role);
      setSnapshot(next);
      if (!next.isSignedIn) {
        setInfo("Check your email to confirm the account before signing in.");
      }
      return true;
    } catch (nextError: any) {
      setError(nextError?.message ?? "Unable to create the account.");
      return false;
    } finally {
      setBusy(false);
    }
  };

  const signOut = async () => {
    try {
      setBusy(true);
      setError(null);
      setInfo(null);
      await signOutCurrentUser();
      setSnapshot(await getAuthSnapshot());
      return true;
    } catch (nextError: any) {
      setError(nextError?.message ?? "Unable to sign out.");
      return false;
    } finally {
      setBusy(false);
    }
  };

  const sendReset = async (email: string) => {
    try {
      setBusy(true);
      setError(null);
      setInfo(null);
      await requestPasswordReset(email);
      setInfo("Password reset email sent. Check your inbox.");
      return true;
    } catch (nextError: any) {
      setError(nextError?.message ?? "Unable to send reset email.");
      return false;
    } finally {
      setBusy(false);
    }
  };

  const resendConfirmation = async (email: string) => {
    try {
      setBusy(true);
      setError(null);
      setInfo(null);
      await resendSignupConfirmation(email);
      setInfo("Confirmation email sent again.");
      return true;
    } catch (nextError: any) {
      setError(nextError?.message ?? "Unable to resend confirmation.");
      return false;
    } finally {
      setBusy(false);
    }
  };

  return {
    snapshot,
    busy,
    error,
    info,
    clearError: () => {
      setError(null);
      setInfo(null);
    },
    signIn,
    signUp,
    signOut,
    sendReset,
    resendConfirmation
  };
}
