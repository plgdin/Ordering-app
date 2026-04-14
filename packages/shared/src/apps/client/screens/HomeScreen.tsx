import React, { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { serviceRules } from "@nearnow/config";
import {
  categories,
  featuredStores,
  Store
} from "@nearnow/core";
import {
  Card,
  CategoryChip,
  Chip,
  FeaturedBadge,
  HeroCard,
  Notice,
  SearchBar,
  SectionTitle,
  StoreImageCard
} from "@nearnow/ui";
import { colors, spacing } from "@nearnow/ui";

export function ClientHomeScreen({
  onStorePress
}: {
  onStorePress: (store: Store) => void;
}) {
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  const filteredStores = activeFilter
    ? featuredStores.filter(
        (s) => s.category.toLowerCase() === activeFilter.toLowerCase()
      )
    : featuredStores;

  const featuredOnly = featuredStores.filter((s) => s.featured);

  const handleCategoryPress = (category: string) => {
    setActiveFilter((prev) =>
      prev?.toLowerCase() === category.toLowerCase() ? null : category
    );
  };

  return (
    <>
      <SearchBar label="Search stores, groceries, medicines, bakery..." />

      <HeroCard
        title="Local shopping that feels as easy as one smart cart."
        body="Browse nearby supermarkets, bakery items, and OTC pharmacy products across your locality with one smooth delivery flow."
        accent="#C8E6CF"
      />

      <View style={styles.sectionSpacing}>
        <SectionTitle
          title="Shop by category"
          action={`Within ${serviceRules.localityRadiusKm} km`}
        />
        <View style={styles.rowWrap}>
          {categories.map((category) => (
            <CategoryChip
              key={category}
              label={category}
              solid={activeFilter?.toLowerCase() === category.toLowerCase()}
              onPress={() => handleCategoryPress(category)}
            />
          ))}
        </View>
      </View>

      {featuredOnly.length > 0 && !activeFilter && (
        <View style={styles.sectionSpacing}>
          <SectionTitle title="Featured" action="Popular near you" />
          {featuredOnly.map((store) => (
            <Card key={`feat-${store.id}`} onPress={() => onStorePress(store)}>
              <StoreImageCard imageUri={store.image} storeName={store.name} />
              <FeaturedBadge />
              <View style={styles.storeHeader}>
                <View style={styles.storeText}>
                  <Text style={styles.storeName}>{store.name}</Text>
                  <Text style={styles.storeMeta}>
                    {store.category}  ·  {store.eta}  ·  {store.distanceKm} km
                  </Text>
                </View>
                <Chip label={`${store.rating} ★`} solid />
              </View>
              <Text style={styles.storeHighlight}>{store.highlight}</Text>
              <Notice text={store.deliveryTag} />
            </Card>
          ))}
        </View>
      )}

      <View style={styles.sectionSpacing}>
        <SectionTitle
          title={activeFilter ? `${activeFilter} stores` : "All nearby stores"}
          action={`${filteredStores.length} found`}
        />
        {filteredStores.length > 0 ? (
          filteredStores.map((store) => (
            <Card key={store.id} onPress={() => onStorePress(store)}>
              <StoreImageCard imageUri={store.image} storeName={store.name} />
              <View style={styles.storeHeader}>
                <View style={styles.storeText}>
                  <Text style={styles.storeName}>{store.name}</Text>
                  <Text style={styles.storeMeta}>
                    {store.category}  ·  {store.eta}  ·  {store.distanceKm} km
                  </Text>
                </View>
                <Chip label={`${store.rating} ★`} solid />
              </View>
              <Text style={styles.storeHighlight}>{store.highlight}</Text>
              <Notice text={store.deliveryTag} />
            </Card>
          ))
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No stores in this category nearby</Text>
            <Text style={styles.emptyBody}>
              Try a different category or check back later.
            </Text>
          </View>
        )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  sectionSpacing: {
    gap: spacing.lg
  },
  rowWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm
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
  emptyState: {
    alignItems: "center",
    paddingVertical: 40,
    gap: 8
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: colors.ink
  },
  emptyBody: {
    fontSize: 14,
    color: colors.muted,
    textAlign: "center"
  }
});
