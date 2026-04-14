import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { serviceRules } from "@nearnow/config";
import {
  categories,
  featuredStores,
  multiStoreStops,
  splitDirectionStops
} from "@nearnow/core";
import {
  Card,
  Chip,
  HeroCard,
  Notice,
  SearchBar,
  SectionTitle
} from "@nearnow/ui";
import { calculateDeliveryQuote } from "@nearnow/core";
import { colors, spacing } from "@nearnow/ui";

export function ClientHomeScreen() {
  const routeFriendlyQuote = calculateDeliveryQuote(multiStoreStops);
  const splitDirectionQuote = calculateDeliveryQuote(splitDirectionStops);

  return (
    <>
      <SearchBar label="Search stores, groceries, medicines, bakery, daily needs" />
      <HeroCard
        eyebrow="Client app"
        title="Local shopping that feels as easy as one smart cart."
        body="Browse nearby supermarkets, bakery items, and OTC pharmacy products across your locality with one smooth delivery flow."
        accent="#C4F4D7"
      />

      <View>
        <SectionTitle
          title="Shop by category"
          action={`Within ${serviceRules.localityRadiusKm} km`}
        />
        <View style={styles.rowWrap}>
          {categories.map((category, index) => (
            <Chip key={category} label={category} solid={index < 2} />
          ))}
        </View>
      </View>

      <View>
        <SectionTitle title="Featured nearby stores" action="See all" />
        {featuredStores.map((store) => (
          <Card key={store.id}>
            <View style={styles.storeHeader}>
              <View style={styles.storeText}>
                <Text style={styles.storeName}>{store.name}</Text>
                <Text style={styles.storeMeta}>
                  {store.category} . {store.eta} . {store.distanceKm} km
                </Text>
              </View>
              <Chip label={`${store.rating} rating`} solid />
            </View>
            <Text style={styles.storeHighlight}>{store.highlight}</Text>
            <Notice text={store.deliveryTag} />
          </Card>
        ))}
      </View>

      <View>
        <SectionTitle title="Smart multi-store pricing" />
        <Card>
          <Text style={styles.cardTitle}>When extra delivery is not added</Text>
          <Text style={styles.bodyText}>
            Base fee: Rs {routeFriendlyQuote.baseCharge}. Total: Rs{" "}
            {routeFriendlyQuote.totalCharge}.
          </Text>
          <Text style={styles.bodyText}>{routeFriendlyQuote.explanation}</Text>
        </Card>
        <Card>
          <Text style={styles.cardTitle}>
            When stores split in different directions
          </Text>
          <Text style={styles.bodyText}>
            Base fee: Rs {splitDirectionQuote.baseCharge}. Extra fee: Rs{" "}
            {splitDirectionQuote.extraCharge}. Total: Rs{" "}
            {splitDirectionQuote.totalCharge}.
          </Text>
          <Text style={styles.bodyText}>{splitDirectionQuote.explanation}</Text>
        </Card>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  rowWrap: {
    flexDirection: "row",
    flexWrap: "wrap"
  },
  storeHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: spacing.md
  },
  storeText: {
    flex: 1,
    gap: 6
  },
  storeName: {
    fontSize: 18,
    fontWeight: "800",
    color: colors.ink
  },
  storeMeta: {
    color: colors.muted,
    fontSize: 14
  },
  storeHighlight: {
    color: colors.ink,
    fontSize: 15,
    lineHeight: 22
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
