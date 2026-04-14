import React, { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { serviceRules } from "@nearnow/config";
import { Card, Notice, SectionTitle, colors, radius, spacing } from "@nearnow/ui";
import { AuthCard } from "../../../components/AuthCard";
import { useSupabaseAuth } from "../../../hooks/useSupabaseAuth";
import { fetchCurrentProfileBasics, updateCurrentProfileBasics } from "@nearnow/supabase";

export function ClientSettingsScreen({
  auth,
  onAuthComplete
}: {
  auth: ReturnType<typeof useSupabaseAuth>;
  onAuthComplete: () => void;
}) {
  const [profileBusy, setProfileBusy] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");

  useEffect(() => {
    let cancelled = false;

    if (!auth.snapshot.isSignedIn) {
      setFullName("");
      setPhone("");
      return;
    }

    void fetchCurrentProfileBasics()
      .then((profile) => {
        if (cancelled || !profile) return;
        setFullName(profile.fullName);
        setPhone(profile.phone);
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [auth.snapshot.isSignedIn]);

  return (
    <>
      <SectionTitle title="Settings and trust" />
      <Card>
        <Text style={styles.cardTitle}>Default preferences</Text>
        <Text style={styles.bodyText}>
          Delivery radius: {serviceRules.localityRadiusKm} km
        </Text>
        <Text style={styles.bodyText}>
          Notify before extra multi-store charges: On
        </Text>
        <Text style={styles.bodyText}>
          Pharmacy mode: {serviceRules.otOnlyPharmacy ? "OTC products only" : "All"}
        </Text>
      </Card>
      {auth.snapshot.isSignedIn ? (
        <Card>
          <Text style={styles.cardTitle}>Profile</Text>
          {profileError ? <Notice tone="warning" text={profileError} /> : null}
          <View style={styles.formField}>
            <Text style={styles.formLabel}>Full name</Text>
            <TextInput
              style={styles.formInput}
              value={fullName}
              onChangeText={setFullName}
              placeholder="e.g. Riya Shah"
              placeholderTextColor={colors.muted}
            />
          </View>
          <View style={styles.formField}>
            <Text style={styles.formLabel}>Phone</Text>
            <TextInput
              style={styles.formInput}
              value={phone}
              onChangeText={setPhone}
              placeholder="e.g. +91 99999 12345"
              placeholderTextColor={colors.muted}
              keyboardType="phone-pad"
            />
          </View>
          <Pressable
            style={[styles.primaryButton, profileBusy && styles.buttonDisabled]}
            disabled={profileBusy}
            onPress={() => {
              setProfileError(null);
              setProfileBusy(true);
              void updateCurrentProfileBasics({ fullName, phone })
                .catch((nextError: any) => {
                  setProfileError(nextError?.message ?? "Unable to save profile changes.");
                })
                .finally(() => setProfileBusy(false));
            }}
          >
            <Text style={styles.primaryButtonText}>
              {profileBusy ? "Saving..." : "Save profile"}
            </Text>
          </Pressable>
        </Card>
      ) : null}
      <AuthCard
        title="Account access"
        roleLabel="Customer"
        configured={auth.snapshot.isConfigured}
        signedIn={auth.snapshot.isSignedIn}
        email={auth.snapshot.email}
        busy={auth.busy}
        error={auth.error}
        info={auth.info}
        onClearError={auth.clearError}
        onSignIn={async (email, password) => {
          const ok = await auth.signIn(email, password);
          if (ok) onAuthComplete();
          return ok;
        }}
        onSignUp={async (email, password) => {
          const ok = await auth.signUp(email, password);
          if (ok) onAuthComplete();
          return ok;
        }}
        onSignOut={auth.signOut}
        onSendReset={auth.sendReset}
        onResendConfirmation={auth.resendConfirmation}
      />
      <Card>
        <Text style={styles.cardTitle}>Future add-ons</Text>
        <Text style={styles.bodyText}>
          Wallet, subscription, reorder, loyalty rewards
        </Text>
        <Text style={styles.bodyText}>
          Live map tracking and smart substitutions
        </Text>
      </Card>
    </>
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
    marginTop: spacing.md,
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: 14,
    alignItems: "center"
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontWeight: "800",
    fontSize: 14
  },
  buttonDisabled: {
    opacity: 0.7
  }
});
