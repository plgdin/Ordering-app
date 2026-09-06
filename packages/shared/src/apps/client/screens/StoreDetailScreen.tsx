import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Store } from "@nearnow/core";
import {
  Card,
  Notice,
  RatingPill,
  SectionTitle,
  StoreImageCard,
  colors,
  radius,
  spacing
} from "@nearnow/ui";

export function StoreDetailScreen({
  store,
  onBack,
  onAddItem
}: {
  store: Store;
  onBack: () => void;
  onAddItem: (store: Store, item: NonNullable<Store["inventory"]>[number]) => void;
}) {
  return (
    <>
      <Pressable onPress={onBack} style={styles.backButton}>
        <Text style={styles.backArrow}>{"< Back to stores"}</Text>
      </Pressable>

      <View style={styles.storeInfo}>
        <StoreImageCard imageUri={store.image} storeName={store.name} />
        <View style={styles.storeInfoHeader}>
          <View style={styles.storeInfoText}>
            <Text style={styles.storeName}>{store.name}</Text>
            <Text style={styles.storeMeta}>
              {store.category} | {store.eta} | {store.distanceKm} km
            </Text>
          </View>
          <RatingPill rating={store.rating} caption="rated" />
        </View>
        <Notice text={store.deliveryTag} />
      </View>

      <View style={styles.sectionSpacing}>
        <SectionTitle
          title="Available items"
          action={`${store.inventory?.filter((item) => item.inStock).length ?? 0} in stock`}
        />
        {store.inventory?.map((item) => (
          <Card key={item.id}>
            <View style={styles.inventoryRow}>
              <View style={styles.inventoryInfo}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemUnit}>per {item.unit}</Text>
              </View>
              <View style={styles.inventoryRight}>
                <Text style={styles.itemPrice}>Rs {item.price}</Text>
                {item.inStock ? (
                  <Pressable
                    style={styles.addButton}
                    onPress={() => onAddItem(store, item)}
                  >
                    <Text style={styles.addButtonText}>+ Add</Text>
                  </Pressable>
                ) : (
                  <View style={styles.outOfStockBadge}>
                    <Text style={styles.outOfStockText}>Out of stock</Text>
                  </View>
                )}
              </View>
            </View>
          </Card>
        ))}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  backButton: {
    paddingVertical: 8,
    alignSelf: "flex-start"
  },
  backArrow: {
    fontSize: 15,
    fontWeight: "800",
    color: "#00A082"
  },
  storeInfo: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: colors.line,
    padding: spacing.lg,
    gap: spacing.sm,
    overflow: "hidden"
  },
  storeInfoHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: spacing.md
  },
  storeInfoText: {
    flex: 1,
    gap: 4
  },
  storeName: {
    fontSize: 24,
    fontWeight: "900",
    color: colors.ink
  },
  storeMeta: {
    color: colors.muted,
    fontSize: 14
  },
  sectionSpacing: {
    gap: spacing.sm
  },
  inventoryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  inventoryInfo: {
    flex: 1,
    gap: 2
  },
  inventoryRight: {
    alignItems: "flex-end",
    gap: 6
  },
  itemName: {
    fontSize: 16,
    fontWeight: "800",
    color: colors.ink
  },
  itemUnit: {
    fontSize: 13,
    color: colors.muted
  },
  itemPrice: {
    fontSize: 18,
    fontWeight: "900",
    color: colors.ink
  },
  addButton: {
    backgroundColor: "#00A082",
    borderRadius: radius.pill,
    paddingHorizontal: 22,
    paddingVertical: 10,
    shadowColor: "#00A082",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4
  },
  addButtonText: {
    color: "#FFFFFF",
    fontWeight: "900",
    fontSize: 14
  },
  outOfStockBadge: {
    backgroundColor: colors.primaryFaint,
    borderRadius: radius.pill,
    paddingHorizontal: 12,
    paddingVertical: 6
  },
  outOfStockText: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: "600"
  }
});
