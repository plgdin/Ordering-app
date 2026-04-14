import React from "react";
import { StyleSheet, Text } from "react-native";
import { serviceRules } from "@nearnow/config";
import { Card, SectionTitle, colors } from "@nearnow/ui";

export function ClientSettingsScreen() {
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
  }
});
