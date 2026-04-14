import React from "react";
import { StyleSheet, Text } from "react-native";
import { Card, SectionTitle, colors } from "@nearnow/ui";
import { useDeliveryEarningsDetails } from "../../../hooks/useSupabaseData";

export function DeliveryEarningsScreen() {
  const details = useDeliveryEarningsDetails();

  return (
    <>
      <SectionTitle title="Incentives" />
      <Card>
        <Text style={styles.cardTitle}>Daily incentive ladder</Text>
        {details.milestones.map((line) => (
          <Text key={line} style={styles.bodyText}>
            {line}
          </Text>
        ))}
      </Card>
      <Card>
        <Text style={styles.cardTitle}>Settlement rhythm</Text>
        {details.settlementLines.map((line) => (
          <Text key={line} style={styles.bodyText}>
            {line}
          </Text>
        ))}
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
