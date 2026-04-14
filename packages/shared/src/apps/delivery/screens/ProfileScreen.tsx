import React from "react";
import { StyleSheet, Text } from "react-native";
import { Card, SectionTitle, colors } from "@nearnow/ui";

export function DeliveryProfileScreen() {
  return (
    <>
      <SectionTitle title="Rider profile" />
      <Card>
        <Text style={styles.cardTitle}>Status</Text>
        <Text style={styles.bodyText}>Online window: 7:00 AM to 11:30 PM</Text>
        <Text style={styles.bodyText}>Vehicle type: Bike</Text>
        <Text style={styles.bodyText}>Preferred zone: Central locality cluster</Text>
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
