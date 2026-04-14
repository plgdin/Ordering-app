import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { merchantOrders } from "@nearnow/core";
import { Card, Chip, SectionTitle, colors } from "@nearnow/ui";

export function MerchantOrdersScreen() {
  return (
    <>
      <SectionTitle title="Priority queue" />
      {merchantOrders.map((order) => (
        <Card key={order.id}>
          <Text style={styles.cardTitle}>{order.title}</Text>
          <Text style={styles.bodyText}>{order.subtitle}</Text>
          <View style={styles.rowBetween}>
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
