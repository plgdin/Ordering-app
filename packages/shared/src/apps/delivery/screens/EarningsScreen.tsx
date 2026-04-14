import React from "react";
import { StyleSheet, Text } from "react-native";
import { serviceRules } from "@nearnow/config";
import { Card, SectionTitle, colors } from "@nearnow/ui";

export function DeliveryEarningsScreen() {
  return (
    <>
      <SectionTitle title="Incentives" />
      <Card>
        <Text style={styles.cardTitle}>Daily incentive ladder</Text>
        <Text style={styles.bodyText}>8 runs: unlock Rs 120 bonus</Text>
        <Text style={styles.bodyText}>12 runs: unlock Rs 220 bonus</Text>
        <Text style={styles.bodyText}>16 runs: unlock Rs 360 bonus</Text>
      </Card>
      <Card>
        <Text style={styles.cardTitle}>Settlement rhythm</Text>
        <Text style={styles.bodyText}>
          All accepted and completed work for today moves into the next payout
          cycle at {serviceRules.nextDayPayoutTime} tomorrow.
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
