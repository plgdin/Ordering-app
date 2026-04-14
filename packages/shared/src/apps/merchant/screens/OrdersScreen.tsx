import React, { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Card, Chip, Notice, SectionTitle, colors, radius, spacing } from "@nearnow/ui";
import { useMerchantOrders } from "../../../hooks/useSupabaseData";
import { updateMerchantOrderStatus } from "@nearnow/supabase";

export function MerchantOrdersScreen() {
  const orders = useMerchantOrders();
  const [busyGroupId, setBusyGroupId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  return (
    <>
      <SectionTitle title="Priority queue" />
      {error ? <Notice tone="warning" text={error} /> : null}
      {orders.map((order) => (
        <Card key={order.id}>
          <Text style={styles.cardTitle}>{order.title}</Text>
          <Text style={styles.bodyText}>{order.subtitle}</Text>
          <View style={styles.rowBetween}>
            <Chip label={order.status} solid />
            <Text style={styles.amount}>{order.amount}</Text>
          </View>
          {order.nextStatus && order.actionLabel ? (
            <View style={styles.actionRow}>
              {order.rawStatus === "pending" ? (
                <Pressable
                  style={[
                    styles.secondaryButton,
                    busyGroupId === order.groupId && styles.buttonDisabled
                  ]}
                  disabled={busyGroupId === order.groupId}
                  onPress={() => {
                    setError(null);
                    setBusyGroupId(order.groupId);
                    void updateMerchantOrderStatus(order.groupId, "cancelled")
                      .catch((nextError: any) => {
                        setError(nextError?.message ?? "Unable to reject the order.");
                      })
                      .finally(() => setBusyGroupId(null));
                  }}
                >
                  <Text style={styles.secondaryButtonText}>Reject</Text>
                </Pressable>
              ) : null}
              <Pressable
                style={[
                  styles.primaryButton,
                  busyGroupId === order.groupId && styles.buttonDisabled
                ]}
                disabled={busyGroupId === order.groupId}
                onPress={() => {
                  setError(null);
                  setBusyGroupId(order.groupId);
                  void updateMerchantOrderStatus(order.groupId, order.nextStatus!)
                    .catch((nextError: any) => {
                      setError(nextError?.message ?? "Unable to update the order.");
                    })
                    .finally(() => setBusyGroupId(null));
                }}
              >
                <Text style={styles.primaryButtonText}>
                  {busyGroupId === order.groupId ? "Updating..." : order.actionLabel}
                </Text>
              </Pressable>
            </View>
          ) : null}
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
  },
  actionRow: {
    flexDirection: "row",
    gap: spacing.sm,
    marginTop: spacing.md
  },
  primaryButton: {
    flex: 1,
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: 12,
    alignItems: "center"
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontWeight: "800",
    fontSize: 13
  },
  secondaryButton: {
    flex: 1,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.line,
    paddingVertical: 12,
    alignItems: "center"
  },
  secondaryButtonText: {
    color: colors.primaryMid,
    fontWeight: "800",
    fontSize: 13
  },
  buttonDisabled: {
    opacity: 0.7
  }
});
