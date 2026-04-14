import React from "react";
import { StyleSheet, Text } from "react-native";
import { Card, SectionTitle, colors } from "@nearnow/ui";

export function MerchantCatalogScreen() {
  return (
    <>
      <SectionTitle title="Catalog controls" />
      <Card>
        <Text style={styles.cardTitle}>Category readiness</Text>
        <Text style={styles.bodyText}>
          Groceries and bakery items are fully enabled.
        </Text>
        <Text style={styles.bodyText}>
          OTC pharmacy items require careful category tagging so
          prescription-only products stay hidden.
        </Text>
      </Card>
      <Card>
        <Text style={styles.cardTitle}>Growth tools</Text>
        <Text style={styles.bodyText}>Scheduled offers for locality bursts</Text>
        <Text style={styles.bodyText}>
          Best-seller pinning on customer home page
        </Text>
        <Text style={styles.bodyText}>Low-stock nudges before item sellout</Text>
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
