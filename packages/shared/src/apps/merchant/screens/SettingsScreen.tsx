import React from "react";
import { StyleSheet, Text } from "react-native";
import { serviceRules } from "@nearnow/config";
import { Card, SectionTitle, colors } from "@nearnow/ui";

export function MerchantSettingsScreen() {
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
