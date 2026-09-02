import React from "react";
import { StyleSheet, Text, View } from "react-native";
import {
  Card,
  HeroCard,
  MetricCard,
  Notice,
  SectionTitle
} from "@nearnow/ui";
import { colors } from "@nearnow/ui";
import { useMerchantMetrics } from "../../../hooks/useSupabaseData";

export function MerchantDashboardScreen() {
  const metrics = useMerchantMetrics();

  return (
    <>
      <HeroCard
        eyebrow="Restaurant App"
        title="Run your kitchen smoothly and efficiently."
        body="Manage incoming food orders, kitchen prep, and handoffs seamlessly in one mobile workspace."
        accent="#BDEFD0"
      />
      <SectionTitle title="Today's pulse" />
      <View style={styles.metricRow}>
        {metrics.map((metric) => (
          <MetricCard
            key={metric.label}
            label={metric.label}
            value={metric.value}
            trend={metric.trend}
          />
        ))}
      </View>
      <Card>
        <Text style={styles.cardTitle}>Kitchen readiness</Text>
        <Notice text="2 food orders are ready for pickup. Next rider arrival is estimated in 6 minutes." />
        <Text style={styles.bodyText}>
          Quick kitchen prep and seamless rider handoffs are the key to good ratings and returning customers.
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
