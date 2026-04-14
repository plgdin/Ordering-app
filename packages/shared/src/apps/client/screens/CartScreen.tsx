import { CartLineItem, DeliveryQuote } from "@nearnow/core";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { PaymentMethod } from "@nearnow/supabase";
import {
  Card,
  HeroCard,
  Notice,
  SectionTitle,
  StoreImageCard,
  colors,
  radius,
  spacing
} from "@nearnow/ui";

type CartGroup = {
  storeId: string;
  storeName: string;
  storeCategory: string;
  storeDistanceKm: number;
  storeImage?: string;
  items: CartLineItem[];
};

export function ClientCartScreen({
  groupedItems,
  itemCount,
  itemTotal,
  deliveryQuote,
  grandTotal,
  paymentMethod,
  onPaymentMethodChange,
  isSignedIn,
  signedInEmail,
  checkoutBusy,
  checkoutStatus,
  onUpdateQuantity,
  onCheckout,
  onGoToSettings
}: {
  groupedItems: CartGroup[];
  itemCount: number;
  itemTotal: number;
  deliveryQuote: DeliveryQuote;
  grandTotal: number;
  paymentMethod: PaymentMethod;
  onPaymentMethodChange: (method: PaymentMethod) => void;
  isSignedIn: boolean;
  signedInEmail: string | null;
  checkoutBusy: boolean;
  checkoutStatus: { tone: "success" | "warning"; text: string } | null;
  onUpdateQuantity: (lineId: string, nextQuantity: number) => void;
  onCheckout: () => Promise<boolean>;
  onGoToSettings: () => void;
}) {
  return (
    <>
      <HeroCard
        eyebrow="Cart"
        title="One basket, multiple stores, clear pricing."
        body="Customers get a visible notice before checkout whenever the order needs pickups from multiple stores."
        accent="#FFE8A3"
      />

      {checkoutStatus ? (
        <Notice tone={checkoutStatus.tone} text={checkoutStatus.text} />
      ) : null}

      {groupedItems.length === 0 ? (
        <Card>
          <Text style={styles.cardTitle}>Your cart is empty</Text>
          <Text style={styles.bodyText}>
            Add products from the store screens and they will stay saved here on this device.
          </Text>
        </Card>
      ) : (
        <>
          <SectionTitle title="Current stacked cart" action={`${itemCount} items`} />
          {groupedItems.map((group) => (
            <Card key={group.storeId}>
              <StoreImageCard imageUri={group.storeImage} storeName={group.storeName} />
              <Text style={styles.cardTitle}>{group.storeName}</Text>
              <Text style={styles.bodyText}>
                {group.storeCategory} | {group.storeDistanceKm} km away
              </Text>

              {group.items.map((item) => (
                <View key={item.id} style={styles.lineRow}>
                  <View style={styles.lineInfo}>
                    <Text style={styles.itemName}>{item.name}</Text>
                    <Text style={styles.itemMeta}>
                      Rs {item.price} per {item.unit}
                    </Text>
                  </View>
                  <View style={styles.lineActions}>
                    <Pressable
                      style={styles.qtyButton}
                      onPress={() => onUpdateQuantity(item.id, item.quantity - 1)}
                    >
                      <Text style={styles.qtyButtonText}>-</Text>
                    </Pressable>
                    <Text style={styles.qtyText}>{item.quantity}</Text>
                    <Pressable
                      style={styles.qtyButton}
                      onPress={() => onUpdateQuantity(item.id, item.quantity + 1)}
                    >
                      <Text style={styles.qtyButtonText}>+</Text>
                    </Pressable>
                  </View>
                </View>
              ))}
            </Card>
          ))}

          <Card>
            <Text style={styles.cardTitle}>Checkout summary</Text>
            <Text style={styles.bodyText}>Items total: Rs {itemTotal}</Text>
            <Text style={styles.bodyText}>
              Delivery fee: Rs {deliveryQuote.baseCharge}
            </Text>
            <Text style={styles.bodyText}>
              Extra multi-store fee: Rs {deliveryQuote.extraCharge}
            </Text>
            <Text style={styles.totalText}>Grand total: Rs {grandTotal}</Text>
            <Notice
              tone={deliveryQuote.extraCharge > 0 ? "warning" : "success"}
              text={deliveryQuote.explanation}
            />
          </Card>
        </>
      )}

      <Card>
        <Text style={styles.cardTitle}>Checkout notes</Text>
        <View style={styles.switchRow}>
          <Pressable
            style={[
              styles.modeChip,
              paymentMethod === "cod" && styles.modeChipActive
            ]}
            onPress={() => onPaymentMethodChange("cod")}
          >
            <Text
              style={[
                styles.modeChipText,
                paymentMethod === "cod" && styles.modeChipTextActive
              ]}
            >
              Cash on delivery
            </Text>
          </Pressable>
          <Pressable
            style={[
              styles.modeChip,
              paymentMethod === "online" && styles.modeChipActive
            ]}
            onPress={() => onPaymentMethodChange("online")}
          >
            <Text
              style={[
                styles.modeChipText,
                paymentMethod === "online" && styles.modeChipTextActive
              ]}
            >
              Online payment
            </Text>
          </Pressable>
        </View>
        {isSignedIn ? (
          <Text style={styles.bodyText}>Signed in as {signedInEmail ?? "active user"}</Text>
        ) : (
          <Text style={styles.bodyText}>
            Sign in from Settings before checkout so the order can be written to Supabase.
          </Text>
        )}
        <Text style={styles.bodyText}>
          Delivery ETA stays fast by showing only stores in the nearby locality.
        </Text>
        <Text style={styles.bodyText}>
          Pharmacy is limited to non-prescription products in this version.
        </Text>

        {isSignedIn ? (
          <Pressable
            style={[styles.primaryButton, checkoutBusy && styles.buttonDisabled]}
            disabled={checkoutBusy || groupedItems.length === 0}
            onPress={() => {
              void onCheckout();
            }}
          >
            <Text style={styles.primaryButtonText}>
              {checkoutBusy ? "Placing order..." : "Place order"}
            </Text>
          </Pressable>
        ) : (
          <Pressable style={styles.secondaryButton} onPress={onGoToSettings}>
            <Text style={styles.secondaryButtonText}>Go to settings to sign in</Text>
          </Pressable>
        )}
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
  lineRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: spacing.md
  },
  lineInfo: {
    flex: 1,
    gap: 2
  },
  itemName: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.ink
  },
  itemMeta: {
    fontSize: 13,
    color: colors.muted
  },
  lineActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm
  },
  qtyButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primaryFaint,
    borderWidth: 1,
    borderColor: colors.line,
    alignItems: "center",
    justifyContent: "center"
  },
  qtyButtonText: {
    color: colors.primaryDeep,
    fontSize: 18,
    fontWeight: "800"
  },
  qtyText: {
    minWidth: 18,
    textAlign: "center",
    fontSize: 15,
    fontWeight: "700",
    color: colors.ink
  },
  totalText: {
    fontSize: 18,
    fontWeight: "800",
    color: colors.ink
  },
  primaryButton: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: 14,
    alignItems: "center"
  },
  secondaryButton: {
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.line,
    paddingVertical: 14,
    alignItems: "center"
  },
  secondaryButtonText: {
    color: colors.primaryMid,
    fontWeight: "700",
    fontSize: 14
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontWeight: "800",
    fontSize: 14
  },
  buttonDisabled: {
    opacity: 0.7
  },
  switchRow: {
    flexDirection: "row",
    gap: spacing.sm
  },
  modeChip: {
    flex: 1,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.line,
    paddingVertical: 10,
    alignItems: "center"
  },
  modeChipActive: {
    backgroundColor: colors.primaryMid,
    borderColor: colors.primaryMid
  },
  modeChipText: {
    color: colors.muted,
    fontWeight: "700",
    fontSize: 12
  },
  modeChipTextActive: {
    color: "#FFFFFF"
  }
});
