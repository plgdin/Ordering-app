import React, { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { Card, Notice, colors, radius, spacing } from "@nearnow/ui";

type AuthCardProps = {
  title: string;
  roleLabel: string;
  configured: boolean;
  signedIn: boolean;
  email: string | null;
  busy: boolean;
  error: string | null;
  onSignIn: (email: string, password: string) => Promise<boolean>;
  onSignUp: (email: string, password: string) => Promise<boolean>;
  onSignOut: () => Promise<boolean>;
  onClearError: () => void;
};

export function AuthCard({
  title,
  roleLabel,
  configured,
  signedIn,
  email,
  busy,
  error,
  onSignIn,
  onSignUp,
  onSignOut,
  onClearError
}: AuthCardProps) {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [draftEmail, setDraftEmail] = useState("");
  const [draftPassword, setDraftPassword] = useState("");

  if (!configured) {
    return (
      <Card>
        <Text style={styles.cardTitle}>{title}</Text>
        <Text style={styles.bodyText}>
          Add the Supabase env values on this machine to enable {roleLabel.toLowerCase()} auth.
        </Text>
      </Card>
    );
  }

  if (signedIn) {
    return (
      <Card>
        <Text style={styles.cardTitle}>{title}</Text>
        <Text style={styles.bodyText}>Signed in as {email ?? "active user"}</Text>
        <Pressable
          style={[styles.primaryButton, busy && styles.buttonDisabled]}
          disabled={busy}
          onPress={() => {
            onClearError();
            void onSignOut();
          }}
        >
          <Text style={styles.primaryButtonText}>
            {busy ? "Signing out..." : "Sign out"}
          </Text>
        </Pressable>
      </Card>
    );
  }

  return (
    <Card>
      <Text style={styles.cardTitle}>{title}</Text>
      <Text style={styles.bodyText}>
        Sign in or create a {roleLabel.toLowerCase()} account to unlock live data and writes.
      </Text>

      {error ? <Notice tone="warning" text={error} /> : null}

      <View style={styles.switchRow}>
        <Pressable
          style={[styles.modeChip, mode === "signin" && styles.modeChipActive]}
          onPress={() => {
            onClearError();
            setMode("signin");
          }}
        >
          <Text
            style={[styles.modeChipText, mode === "signin" && styles.modeChipTextActive]}
          >
            Sign in
          </Text>
        </Pressable>
        <Pressable
          style={[styles.modeChip, mode === "signup" && styles.modeChipActive]}
          onPress={() => {
            onClearError();
            setMode("signup");
          }}
        >
          <Text
            style={[styles.modeChipText, mode === "signup" && styles.modeChipTextActive]}
          >
            Create account
          </Text>
        </Pressable>
      </View>

      <View style={styles.formField}>
        <Text style={styles.formLabel}>Email</Text>
        <TextInput
          style={styles.formInput}
          value={draftEmail}
          onChangeText={setDraftEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          placeholder="you@example.com"
          placeholderTextColor={colors.muted}
        />
      </View>
      <View style={styles.formField}>
        <Text style={styles.formLabel}>Password</Text>
        <TextInput
          style={styles.formInput}
          value={draftPassword}
          onChangeText={setDraftPassword}
          secureTextEntry
          placeholder="Minimum 6 characters"
          placeholderTextColor={colors.muted}
        />
      </View>

      <Pressable
        style={[styles.primaryButton, busy && styles.buttonDisabled]}
        disabled={busy}
        onPress={() => {
          onClearError();
          if (mode === "signin") {
            void onSignIn(draftEmail.trim(), draftPassword);
            return;
          }

          void onSignUp(draftEmail.trim(), draftPassword);
        }}
      >
        <Text style={styles.primaryButtonText}>
          {busy ? "Working..." : mode === "signin" ? "Sign in" : "Create account"}
        </Text>
      </Pressable>
    </Card>
  );
}

const styles = StyleSheet.create({
  cardTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: colors.ink
  },
  bodyText: {
    color: colors.muted,
    fontSize: 15,
    lineHeight: 22
  },
  switchRow: {
    flexDirection: "row",
    gap: spacing.sm
  },
  modeChip: {
    flex: 1,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.line,
    paddingVertical: 10,
    alignItems: "center"
  },
  modeChipActive: {
    backgroundColor: colors.primaryMid,
    borderColor: colors.primaryMid
  },
  modeChipText: {
    color: colors.muted,
    fontWeight: "700",
    fontSize: 13
  },
  modeChipTextActive: {
    color: "#FFFFFF"
  },
  formField: {
    gap: 6
  },
  formLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.muted
  },
  formInput: {
    backgroundColor: colors.primaryFaint,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.line,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: colors.ink
  },
  primaryButton: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: 14,
    alignItems: "center"
  },
  buttonDisabled: {
    opacity: 0.7
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontWeight: "800",
    fontSize: 14
  }
});
