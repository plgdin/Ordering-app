import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { deliveryRuns } from "@nearnow/core";
import { Card, Chip, SectionTitle, colors } from "@nearnow/ui";

export function DeliveryRunsScreen() {
  return (
    <>
      <SectionTitle title="Suggested runs" />
      {deliveryRuns.map((run) => (
        <Card key={run.id}>
          <Text style={styles.cardTitle}>{run.title}</Text>
          <Text style={styles.bodyText}>{run.subtitle}</Text>
          <View style={styles.rowBetween}>
            <Chip label={run.status} solid />
            <Text style={styles.amount}>{run.amount}</Text>
          </View>
        </Card>
      ))}
      <Card>
        <Text style={styles.cardTitle}>Stacking rule</Text>
        <Text style={styles.bodyText}>
          If the second pickup falls naturally on the rider's route, the
          customer sees no extra charge and the rider gets a smoother
          higher-yield run.
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
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  amount: {
    fontSize: 18,
    fontWeight: "800",
    color: colors.ink
  }
});
