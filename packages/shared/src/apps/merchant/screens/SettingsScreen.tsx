import React from "react";
import { StyleSheet, Text } from "react-native";
import { serviceRules } from "@nearnow/config";
import { Card, SectionTitle, colors } from "@nearnow/ui";
import { AuthCard } from "../../../components/AuthCard";
import { useSupabaseAuth } from "../../../hooks/useSupabaseAuth";

export function MerchantSettingsScreen() {
  const auth = useSupabaseAuth("merchant");

  return (
    <>
      <SectionTitle title="Store settings" />
      <Card>
        <Text style={styles.cardTitle}>Operational rules</Text>
        <Text style={styles.bodyText}>
          Store radius visibility: {serviceRules.localityRadiusKm} km service grid
        </Text>
        <Text style={styles.bodyText}>Auto-accept during peak hours: On</Text>
        <Text style={styles.bodyText}>Settlement summary refresh: Daily</Text>
      </Card>
      <AuthCard
        title="Merchant access"
        roleLabel="Merchant"
        configured={auth.snapshot.isConfigured}
        signedIn={auth.snapshot.isSignedIn}
        email={auth.snapshot.email}
        busy={auth.busy}
        error={auth.error}
        onClearError={auth.clearError}
        onSignIn={auth.signIn}
        onSignUp={auth.signUp}
        onSignOut={auth.signOut}
      />
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
  }
});
