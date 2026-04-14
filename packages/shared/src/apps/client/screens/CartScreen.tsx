import React from "react";
import { StyleSheet, Text } from "react-native";
import { Card, HeroCard, Notice, colors } from "@nearnow/ui";

export function ClientCartScreen() {
  return (
    <>
      <HeroCard
        eyebrow="Cart"
        title="One basket, multiple stores, clear pricing."
        body="Customers get a visible notice before checkout whenever the order needs pickups from multiple stores."
        accent="#FFE8A3"
      />
      <Card>
        <Text style={styles.cardTitle}>Current stacked cart</Text>
        <Text style={styles.bodyText}>More Daily Mart: milk, rice, eggs</Text>
        <Text style={styles.bodyText}>
          HealthPoint Pharmacy: vitamin C, bandages, sanitizer
        </Text>
        <Text style={styles.bodyText}>Daily Crust Bakery: sandwich loaf</Text>
        <Notice text="No extra charge right now because the pickups fit the same rider route." />
      </Card>
      <Card>
        <Text style={styles.cardTitle}>Checkout notes</Text>
        <Text style={styles.bodyText}>
          Delivery ETA stays fast by showing only stores in the nearby locality.
        </Text>
        <Text style={styles.bodyText}>
          Pharmacy is limited to non-prescription products in this version.
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
