import React, { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { featuredStores, Store, InventoryItem } from "@nearnow/core";
import { Card, Chip, SectionTitle, StoreImageCard, Notice, colors, spacing, radius, fonts } from "@nearnow/ui";

export function MerchantCatalogScreen() {
  const [selectedStore, setSelectedStore] = useState<Store>(featuredStores[0]);
  const [inventory, setInventory] = useState<InventoryItem[]>(
    selectedStore.inventory ?? []
  );
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [newItemName, setNewItemName] = useState("");
  const [newItemPrice, setNewItemPrice] = useState("");
  const [newItemUnit, setNewItemUnit] = useState("piece");
  const [showAddForm, setShowAddForm] = useState(false);

  const toggleStock = (itemId: string) => {
    setInventory((prev) =>
      prev.map((item) =>
        item.id === itemId ? { ...item, inStock: !item.inStock } : item
      )
    );
  };

  const removeItem = (itemId: string) => {
    setInventory((prev) => prev.filter((item) => item.id !== itemId));
  };

  const addItem = () => {
    if (!newItemName.trim() || !newItemPrice.trim()) return;
    const newItem: InventoryItem = {
      id: `new-${Date.now()}`,
      name: newItemName.trim(),
      price: Number(newItemPrice),
      unit: newItemUnit.trim() || "piece",
      inStock: true
    };
    setInventory((prev) => [...prev, newItem]);
    setNewItemName("");
    setNewItemPrice("");
    setNewItemUnit("piece");
    setShowAddForm(false);
  };

  const inStockCount = inventory.filter((i) => i.inStock).length;

  return (
    <>
      <SectionTitle title="Store profile" action="Edit store" />
      <Card>
        <StoreImageCard imageUri={selectedStore.image} storeName={selectedStore.name} />
        <Text style={styles.storeName}>{selectedStore.name}</Text>
        <Text style={styles.storeMeta}>
          {selectedStore.category} · {selectedStore.distanceKm} km radius
        </Text>
        <Notice text="Tap 'Edit store' to update your store image and details. Changes reflect on the customer app immediately." />
      </Card>

      <View style={styles.sectionSpacing}>
        <SectionTitle
          title="Inventory"
          action={`${inStockCount}/${inventory.length} in stock`}
        />

        {inventory.map((item) => (
          <Card key={item.id}>
            <View style={styles.itemRow}>
              <View style={styles.itemInfo}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemMeta}>
                  ₹{item.price} per {item.unit}
                </Text>
              </View>
              <View style={styles.itemActions}>
                <Pressable
                  onPress={() => toggleStock(item.id)}
                  style={[
                    styles.stockToggle,
                    item.inStock ? styles.stockIn : styles.stockOut
                  ]}
                >
                  <Text
                    style={[
                      styles.stockToggleText,
                      item.inStock ? styles.stockInText : styles.stockOutText
                    ]}
                  >
                    {item.inStock ? "In Stock" : "Out"}
                  </Text>
                </Pressable>
                <Pressable onPress={() => removeItem(item.id)} style={styles.removeBtn}>
                  <Text style={styles.removeBtnText}>Remove</Text>
                </Pressable>
              </View>
            </View>
          </Card>
        ))}

        {!showAddForm ? (
          <Pressable style={styles.addItemBtn} onPress={() => setShowAddForm(true)}>
            <Text style={styles.addItemBtnText}>+ Add new item</Text>
          </Pressable>
        ) : (
          <Card>
            <Text style={styles.formTitle}>Add new item</Text>
            <View style={styles.formField}>
              <Text style={styles.formLabel}>Item name</Text>
              <TextInput
                style={styles.formInput}
                value={newItemName}
                onChangeText={setNewItemName}
                placeholder="e.g. Organic Honey 500g"
                placeholderTextColor={colors.muted}
              />
            </View>
            <View style={styles.formRow}>
              <View style={styles.formHalf}>
                <Text style={styles.formLabel}>Price (₹)</Text>
                <TextInput
                  style={styles.formInput}
                  value={newItemPrice}
                  onChangeText={setNewItemPrice}
                  placeholder="e.g. 150"
                  placeholderTextColor={colors.muted}
                  keyboardType="numeric"
                />
              </View>
              <View style={styles.formHalf}>
                <Text style={styles.formLabel}>Unit</Text>
                <TextInput
                  style={styles.formInput}
                  value={newItemUnit}
                  onChangeText={setNewItemUnit}
                  placeholder="e.g. bottle"
                  placeholderTextColor={colors.muted}
                />
              </View>
            </View>
            <View style={styles.formActions}>
              <Pressable style={styles.cancelBtn} onPress={() => setShowAddForm(false)}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </Pressable>
              <Pressable style={styles.saveBtn} onPress={addItem}>
                <Text style={styles.saveBtnText}>Add item</Text>
              </Pressable>
            </View>
          </Card>
        )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  storeName: {
    fontSize: 20,
    fontWeight: "800",
    color: colors.ink
  },
  storeMeta: {
    fontSize: 14,
    color: colors.muted
  },
  sectionSpacing: {
    gap: spacing.sm
  },
  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  itemInfo: {
    flex: 1,
    gap: 2
  },
  itemName: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.ink
  },
  itemMeta: {
    fontSize: 13,
    color: colors.muted
  },
  itemActions: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center"
  },
  stockToggle: {
    borderRadius: radius.pill,
    paddingHorizontal: 14,
    paddingVertical: 7
  },
  stockIn: {
    backgroundColor: colors.primaryFaint,
    borderWidth: 1,
    borderColor: colors.primarySoft
  },
  stockOut: {
    backgroundColor: "#FFF0F0",
    borderWidth: 1,
    borderColor: "#F5C5C5"
  },
  stockToggleText: {
    fontWeight: "700",
    fontSize: 12
  },
  stockInText: {
    color: colors.primaryMid
  },
  stockOutText: {
    color: colors.danger
  },
  removeBtn: {
    paddingHorizontal: 10,
    paddingVertical: 7
  },
  removeBtnText: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: "600"
  },
  addItemBtn: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: 16,
    alignItems: "center"
  },
  addItemBtnText: {
    color: "#FFFFFF",
    fontWeight: "800",
    fontSize: 15
  },
  formTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: colors.ink,
    marginBottom: 4
  },
  formField: {
    gap: 6
  },
  formRow: {
    flexDirection: "row",
    gap: spacing.md
  },
  formHalf: {
    flex: 1,
    gap: 6
  },
  formLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.muted
  },
  formInput: {
    backgroundColor: colors.primaryFaint,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.line,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: colors.ink
  },
  formActions: {
    flexDirection: "row",
    gap: spacing.md,
    marginTop: 4
  },
  cancelBtn: {
    flex: 1,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.line,
    paddingVertical: 14,
    alignItems: "center"
  },
  cancelBtnText: {
    color: colors.muted,
    fontWeight: "700",
    fontSize: 14
  },
  saveBtn: {
    flex: 1,
    backgroundColor: colors.primaryMid,
    borderRadius: radius.md,
    paddingVertical: 14,
    alignItems: "center"
  },
  saveBtnText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 14
  }
});
