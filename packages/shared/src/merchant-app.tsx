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
import { merchantMetrics, merchantOrders } from "./data";
import { colors } from "./theme";

type MerchantTab = "dashboard" | "orders" | "catalog" | "settings";

const tabs = [
  { id: "dashboard", label: "Dashboard" },
  { id: "orders", label: "Orders" },
  { id: "catalog", label: "Catalog" },
  { id: "settings", label: "Settings" }
] satisfies { id: MerchantTab; label: string }[];

export function MerchantApp() {
  const [activeTab, setActiveTab] = useState<MerchantTab>("dashboard");

  return (
    <PageShell
      title="Merchant Hub"
      subtitle="Faster packing, cleaner ops, better repeat orders."
      activeTab={activeTab}
      onTabChange={setActiveTab}
      tabs={tabs}
    >
      {activeTab === "dashboard" ? (
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
              A shared shopper experience means baskets can come from multiple nearby stores, so packing speed becomes a competitive advantage.
            </Text>
          </Card>
        </>
      ) : null}

      {activeTab === "orders" ? (
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
      ) : null}

      {activeTab === "catalog" ? (
        <>
          <SectionTitle title="Catalog controls" />
          <Card>
            <Text style={styles.cardTitle}>Category readiness</Text>
            <Text style={styles.bodyText}>Groceries and bakery items are fully enabled.</Text>
            <Text style={styles.bodyText}>
              OTC pharmacy items require careful category tagging so prescription-only products stay hidden.
            </Text>
          </Card>
          <Card>
            <Text style={styles.cardTitle}>Growth tools</Text>
            <Text style={styles.bodyText}>Scheduled offers for locality bursts</Text>
            <Text style={styles.bodyText}>Best-seller pinning on customer home page</Text>
            <Text style={styles.bodyText}>Low-stock nudges before item sellout</Text>
          </Card>
        </>
      ) : null}

      {activeTab === "settings" ? (
        <>
          <SectionTitle title="Store settings" />
          <Card>
            <Text style={styles.cardTitle}>Operational rules</Text>
            <Text style={styles.bodyText}>Store radius visibility: 25 km service grid</Text>
            <Text style={styles.bodyText}>Auto-accept during peak hours: On</Text>
            <Text style={styles.bodyText}>Settlement summary refresh: Daily</Text>
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
