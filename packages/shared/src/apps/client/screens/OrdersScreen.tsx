import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Card, Chip, SectionTitle, colors } from "@nearnow/ui";
import { useClientOrders } from "../../../hooks/useSupabaseData";

export function ClientOrdersScreen() {
  const orders = useClientOrders();

  return (
    <>
      <SectionTitle title="Recent orders" />
      {orders.map((order) => (
        <Card key={order.id}>
          <Text style={styles.cardTitle}>{order.title}</Text>
          <Text style={styles.bodyText}>{order.subtitle}</Text>
          <View style={styles.orderRow}>
            <Chip label={order.status} solid />
            <Text style={styles.amount}>{order.amount}</Text>
          </View>
        </Card>
      ))}
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
  orderRow: {
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
