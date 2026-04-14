import React from "react";
import { StyleSheet, View } from "react-native";
import { serviceRules } from "@nearnow/config";
import { HeroCard, MetricCard, Notice, SectionTitle } from "@nearnow/ui";
import { useDeliveryMetrics } from "../../../hooks/useSupabaseData";

export function DeliveryHomeScreen() {
  const metrics = useDeliveryMetrics();

  return (
    <>
      <HeroCard
        eyebrow="Delivery app"
        title="Reward riders for speed, reliability, and smart route stacking."
        body="The rider app highlights low-detour pickups so extra stores on the same way do not feel like extra friction."
        accent="#CCF2D8"
      />
      <SectionTitle title="Today at a glance" />
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
      <Notice
        text={`Completed work today is scheduled for payout tomorrow at ${serviceRules.nextDayPayoutTime}.`}
      />
    </>
  );
}

const styles = StyleSheet.create({
  metricRow: {
    flexDirection: "row",
    gap: 12
  }
});
