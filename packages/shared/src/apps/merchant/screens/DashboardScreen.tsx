import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { merchantMetrics } from "@nearnow/core";
import {
  Card,
  HeroCard,
  MetricCard,
  Notice,
  SectionTitle
} from "@nearnow/ui";
import { colors } from "@nearnow/ui";

export function MerchantDashboardScreen() {
  return (
    <>
      <HeroCard
        eyebrow="Merchant app"
        title="Run your local store like a fast fulfillment center."
        body="See live orders, stock risks, and dispatch readiness in a single mobile workspace."
        accent="#BDEFD0"
      />
      <SectionTitle title="Today's pulse" />
      <View style={styles.metricRow}>
        {merchantMetrics.map((metric) => (
          <MetricCard
            key={metric.label}
            label={metric.label}
            value={metric.value}
            trend={metric.trend}
          />
        ))}
      </View>
      <Card>
        <Text style={styles.cardTitle}>Dispatch readiness</Text>
        <Notice text="2 stacked baskets are ready. Next rider arrival is estimated in 6 minutes." />
        <Text style={styles.bodyText}>
          A shared shopper experience means baskets can come from multiple nearby
          stores, so packing speed becomes a competitive advantage.
        </Text>
      </Card>
    </>
  );
}

const styles = StyleSheet.create({
  metricRow: {
    flexDirection: "row",
    gap: 12
  },
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
