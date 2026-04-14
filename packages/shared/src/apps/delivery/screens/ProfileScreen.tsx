import React from "react";
import { StyleSheet, Text } from "react-native";
import { Card, SectionTitle, colors } from "@nearnow/ui";
import { AuthCard } from "../../../components/AuthCard";
import { useDeliveryProfile } from "../../../hooks/useSupabaseData";
import { useSupabaseAuth } from "../../../hooks/useSupabaseAuth";

export function DeliveryProfileScreen() {
  const profile = useDeliveryProfile();
  const auth = useSupabaseAuth("delivery");

  return (
    <>
      <SectionTitle title="Rider profile" />
      <Card>
        <Text style={styles.cardTitle}>Status</Text>
        <Text style={styles.bodyText}>{profile.onlineWindow}</Text>
        <Text style={styles.bodyText}>Vehicle type: {profile.vehicleType}</Text>
        <Text style={styles.bodyText}>Preferred zone: {profile.preferredZone}</Text>
      </Card>
      <AuthCard
        title="Rider access"
        roleLabel="Delivery"
        configured={auth.snapshot.isConfigured}
        signedIn={auth.snapshot.isSignedIn}
        email={auth.snapshot.email}
        busy={auth.busy}
        error={auth.error}
        info={auth.info}
        onClearError={auth.clearError}
        onSignIn={auth.signIn}
        onSignUp={auth.signUp}
        onSignOut={auth.signOut}
        onSendReset={auth.sendReset}
        onResendConfirmation={auth.resendConfirmation}
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
