import React, { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Card, Chip, Notice, SectionTitle, colors, radius, spacing } from "@nearnow/ui";
import { useDeliveryRuns } from "../../../hooks/useSupabaseData";
import { acceptDeliveryRun, updateDeliveryRunStatus } from "@nearnow/supabase";

export function DeliveryRunsScreen() {
  const runs = useDeliveryRuns();
  const [busyRunId, setBusyRunId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  return (
    <>
      <SectionTitle title="Suggested runs" />
      {error ? <Notice tone="warning" text={error} /> : null}
      {runs.map((run) => (
        <Card key={run.id}>
          <Text style={styles.cardTitle}>{run.title}</Text>
          <Text style={styles.bodyText}>{run.subtitle}</Text>
          <View style={styles.rowBetween}>
            <Chip label={run.status} solid />
            <Text style={styles.amount}>{run.amount}</Text>
          </View>
          {run.nextStatus && run.actionLabel ? (
            <Pressable
              style={[styles.primaryButton, busyRunId === run.runId && styles.buttonDisabled]}
              disabled={busyRunId === run.runId}
              onPress={() => {
                setError(null);
                setBusyRunId(run.runId);
                const action =
                  run.nextStatus === "accepted"
                    ? acceptDeliveryRun(run.runId)
                    : updateDeliveryRunStatus(run.runId, run.nextStatus as "picked_up" | "delivered");
                void action
                  .catch((nextError: any) => {
                    setError(nextError?.message ?? "Unable to update this run.");
                  })
                  .finally(() => setBusyRunId(null));
              }}
            >
              <Text style={styles.primaryButtonText}>
                {busyRunId === run.runId ? "Updating..." : run.actionLabel}
              </Text>
            </Pressable>
          ) : null}
        </Card>
      ))}
      <Card>
        <Text style={styles.cardTitle}>Stacking rule</Text>
        <Text style={styles.bodyText}>
          If the second pickup falls naturally on the rider's route, the
          customer sees no extra charge and the rider gets a smoother
          higher-yield run.
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
  primaryButton: {
    marginTop: spacing.md,
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
  buttonDisabled: {
    opacity: 0.7
  }
});
