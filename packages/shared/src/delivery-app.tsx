import React, { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import {
  Card,
  Chip,
  HeroCard,
  MetricCard,
  Notice,
  PageShell,
  SectionTitle
} from "./components";
import { deliveryMetrics, deliveryRuns } from "./data";
import { colors } from "./theme";

type DeliveryTab = "home" | "runs" | "earnings" | "profile";

const tabs = [
  { id: "home", label: "Home" },
  { id: "runs", label: "Runs" },
  { id: "earnings", label: "Earnings" },
  { id: "profile", label: "Profile" }
] satisfies { id: DeliveryTab; label: string }[];

export function DeliveryApp() {
  const [activeTab, setActiveTab] = useState<DeliveryTab>("home");

  return (
    <PageShell
      title="Rider Go"
      subtitle="Fast routes, smart stacking, daily earning clarity."
      activeTab={activeTab}
      onTabChange={setActiveTab}
      tabs={tabs}
    >
      {activeTab === "home" ? (
        <>
          <HeroCard
            eyebrow="Delivery app"
            title="Reward riders for speed, reliability, and smart route stacking."
            body="The rider app highlights low-detour pickups so extra stores on the same way do not feel like extra friction."
            accent="#CCF2D8"
          />
          <SectionTitle title="Today at a glance" />
          <View style={styles.metricRow}>
            {deliveryMetrics.map((metric) => (
              <MetricCard
                key={metric.label}
                label={metric.label}
                value={metric.value}
                trend={metric.trend}
              />
            ))}
          </View>
          <Notice text="Completed work today is scheduled for payout tomorrow at 9:00 AM." />
        </>
      ) : null}

      {activeTab === "runs" ? (
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
              If the second pickup falls naturally on the rider's route, the customer sees no extra charge and the rider gets a smoother higher-yield run.
            </Text>
          </Card>
        </>
      ) : null}

      {activeTab === "earnings" ? (
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
              All accepted and completed work for today moves into the next payout cycle at 9:00 AM tomorrow.
            </Text>
          </Card>
        </>
      ) : null}

      {activeTab === "profile" ? (
        <>
          <SectionTitle title="Rider profile" />
          <Card>
            <Text style={styles.cardTitle}>Status</Text>
            <Text style={styles.bodyText}>Online window: 7:00 AM to 11:30 PM</Text>
            <Text style={styles.bodyText}>Vehicle type: Bike</Text>
            <Text style={styles.bodyText}>Preferred zone: Central locality cluster</Text>
          </Card>
        </>
      ) : null}
    </PageShell>
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
