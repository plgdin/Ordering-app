import {
  AppliedCartDiscount,
  CartDiscountOption,
  CartLineItem,
  DeliveryQuote
} from "@nearnow/core";
import React, { useEffect, useState } from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { PaymentMethod } from "@nearnow/supabase";
import {
  Card,
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
  availableDiscounts,
  appliedDiscounts,
  discountTotal,
  grandTotal,
  paymentMethod,
  onPaymentMethodChange,
  isSignedIn,
  signedInEmail,
  checkoutBusy,
  checkoutStatus,
  onToggleDiscount,
  onUpdateQuantity,
  onCheckout,
  onGoToSettings
}: {
  groupedItems: CartGroup[];
  itemCount: number;
  itemTotal: number;
  deliveryQuote: DeliveryQuote;
  availableDiscounts: CartDiscountOption[];
  appliedDiscounts: AppliedCartDiscount[];
  discountTotal: number;
  grandTotal: number;
  paymentMethod: PaymentMethod;
  onPaymentMethodChange: (method: PaymentMethod) => void;
  isSignedIn: boolean;
  signedInEmail: string | null;
  checkoutBusy: boolean;
  checkoutStatus: { tone: "success" | "warning"; text: string } | null;
  onToggleDiscount: (discountId: string) => void;
  onUpdateQuantity: (lineId: string, nextQuantity: number) => void;
  onCheckout: () => Promise<boolean>;
  onGoToSettings: () => void;
}) {
  const deliveryIsFree = deliveryQuote.totalCharge === 0;
  const [multiStoreModalVisible, setMultiStoreModalVisible] = useState(false);
  const [hasShownMultiStoreNotice, setHasShownMultiStoreNotice] = useState(false);

  useEffect(() => {
    if (groupedItems.length <= 1) {
      setMultiStoreModalVisible(false);
      setHasShownMultiStoreNotice(false);
      return;
    }

    if (!hasShownMultiStoreNotice) {
      setMultiStoreModalVisible(true);
      setHasShownMultiStoreNotice(true);
    }
  }, [groupedItems.length, hasShownMultiStoreNotice]);

  return (
    <>
      <Modal
        visible={multiStoreModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setMultiStoreModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <Pressable
            style={styles.modalBackdrop}
            onPress={() => setMultiStoreModalVisible(false)}
          />
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Cart includes items from multiple stores</Text>
            <Text style={styles.modalBody}>
              Delivery charges may change because this order needs pickups from more than
              one store.
            </Text>
            <Pressable
              style={styles.modalButton}
              onPress={() => setMultiStoreModalVisible(false)}
            >
              <Text style={styles.modalButtonText}>Okay</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {checkoutStatus ? (
        <Notice tone={checkoutStatus.tone} text={checkoutStatus.text} />
      ) : null}

      {groupedItems.length === 0 ? (
        <Card>
          <Text style={styles.cardTitle}>Your cart is empty</Text>
          <Text style={styles.bodyText}>
            Add products from the store screens and they will stay saved here on this
            device.
          </Text>
        </Card>
      ) : (
        <>
          <View
            style={[
              styles.savingsBanner,
              deliveryIsFree ? styles.savingsBannerFree : styles.savingsBannerPaid
            ]}
          >
            <Text
              style={[
                styles.savingsBannerTitle,
                deliveryIsFree ? styles.savingsBannerTitleFree : styles.savingsBannerTitlePaid
              ]}
            >
              {deliveryIsFree ? "Free delivery unlocked" : "Ready for checkout"}
            </Text>
            <Text style={styles.savingsBannerBody}>
              {discountTotal > 0
                ? `You are already saving Rs ${discountTotal} on this order.`
                : "Apply store discounts below before you place the order."}
            </Text>
          </View>

          <SectionTitle title="Checkout" action={`${itemCount} items`} />
          {groupedItems.map((group) => {
            const groupSubtotal = group.items.reduce(
              (sum, item) => sum + item.price * item.quantity,
              0
            );

            return (
              <Card key={group.storeId} style={styles.storeCard}>
                <View style={styles.storeHeader}>
                  <View style={styles.storeThumbWrap}>
                    <StoreImageCard imageUri={group.storeImage} storeName={group.storeName} />
                  </View>
                  <View style={styles.storeHeaderCopy}>
                    <Text style={styles.cardTitle}>{group.storeName}</Text>
                    <Text style={styles.bodyText}>
                      {group.storeCategory} | {group.storeDistanceKm} km away
                    </Text>
                    <Text style={styles.storeSubtotal}>Store subtotal: Rs {groupSubtotal}</Text>
                  </View>
                </View>

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
                      <Text style={styles.linePrice}>Rs {item.price * item.quantity}</Text>
                    </View>
                  </View>
                ))}
              </Card>
            );
          })}

          <Card style={styles.summaryCard}>
            <Text style={styles.cardTitle}>Add discounts</Text>
            {availableDiscounts.length > 0 ? (
              availableDiscounts.map((discount) => {
                const applied = appliedDiscounts.some(
                  (entry) => entry.id === discount.id
                );

                return (
                  <View key={discount.id} style={styles.discountRow}>
                    <View style={styles.discountCopy}>
                      <Text style={styles.discountCode}>{discount.code}</Text>
                      <Text style={styles.discountTitle}>
                        {discount.title} from {discount.storeName}
                      </Text>
                      <Text style={styles.discountMeta}>Save Rs {discount.savingsAmount}</Text>
                    </View>
                    <Pressable
                      style={[
                        styles.discountButton,
                        applied && styles.discountButtonApplied
                      ]}
                      onPress={() => onToggleDiscount(discount.id)}
                    >
                      <Text
                        style={[
                          styles.discountButtonText,
                          applied && styles.discountButtonTextApplied
                        ]}
                      >
                        {applied ? "Applied" : "Apply"}
                      </Text>
                    </Pressable>
                  </View>
                );
              })
            ) : (
              <Text style={styles.bodyText}>
                No merchant discounts are available for this cart right now.
              </Text>
            )}
          </Card>

          <Card style={styles.summaryCard}>
            <Text style={styles.cardTitle}>Bill details</Text>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Items total</Text>
              <Text style={styles.summaryValue}>Rs {itemTotal}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Delivery fee</Text>
              <Text style={styles.summaryValue}>
                {deliveryIsFree ? "Free" : `Rs ${deliveryQuote.totalCharge}`}
              </Text>
            </View>
            {discountTotal > 0 ? (
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Discounts</Text>
                <Text style={styles.summarySuccess}>-Rs {discountTotal}</Text>
              </View>
            ) : null}
            <View style={styles.summaryDivider} />
            <View style={styles.summaryRow}>
              <Text style={styles.totalLabel}>To pay</Text>
              <Text style={styles.totalText}>Rs {grandTotal}</Text>
            </View>
            <Notice
              tone="success"
              text={
                discountTotal > 0
                  ? `You saved Rs ${discountTotal} with applied discounts.`
                  : deliveryIsFree
                    ? "Delivery is free on this order."
                    : "Add discounts from eligible merchants to save more."
              }
            />
          </Card>
        </>
      )}

      <Card style={styles.summaryCard}>
        <Text style={styles.cardTitle}>Payment method</Text>
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
        <Text style={styles.policyText}>
          Cancellation policy: Please double-check your order and address details before
          placing the order.
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
  savingsBanner: {
    borderRadius: radius.md,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    gap: 4
  },
  savingsBannerFree: {
    backgroundColor: "#DCF5E6",
    borderColor: "#BDE4C8"
  },
  savingsBannerPaid: {
    backgroundColor: "#F4FAF5",
    borderColor: "#D7E5D9"
  },
  savingsBannerTitle: {
    fontSize: 18,
    fontWeight: "800"
  },
  savingsBannerTitleFree: {
    color: "#18663A"
  },
  savingsBannerTitlePaid: {
    color: colors.primaryDeep
  },
  savingsBannerBody: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 20
  },
  storeCard: {
    gap: spacing.md
  },
  storeHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md
  },
  storeThumbWrap: {
    width: 88,
    overflow: "hidden",
    borderRadius: radius.sm
  },
  storeHeaderCopy: {
    flex: 1,
    gap: 4
  },
  storeSubtotal: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.primaryMid
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
    justifyContent: "flex-end",
    flexWrap: "wrap",
    gap: spacing.sm
  },
  linePrice: {
    minWidth: 70,
    textAlign: "right",
    fontSize: 14,
    fontWeight: "800",
    color: colors.ink
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
  summaryCard: {
    gap: spacing.md
  },
  summaryRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md
  },
  summaryLabel: {
    flex: 1,
    fontSize: 15,
    color: colors.muted
  },
  summaryValue: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.ink
  },
  summarySuccess: {
    fontSize: 15,
    fontWeight: "800",
    color: colors.success
  },
  summaryDivider: {
    height: 1,
    backgroundColor: colors.line
  },
  totalLabel: {
    fontSize: 17,
    fontWeight: "800",
    color: colors.ink
  },
  totalText: {
    fontSize: 18,
    fontWeight: "800",
    color: colors.ink
  },
  discountRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: 12
  },
  discountCopy: {
    flex: 1,
    gap: 2
  },
  discountCode: {
    fontSize: 12,
    fontWeight: "800",
    color: colors.primaryMid
  },
  discountTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.ink
  },
  discountMeta: {
    fontSize: 13,
    color: colors.muted
  },
  discountButton: {
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.primaryMid,
    paddingHorizontal: 14,
    paddingVertical: 8
  },
  discountButtonApplied: {
    backgroundColor: colors.primaryMid
  },
  discountButtonText: {
    fontSize: 13,
    fontWeight: "800",
    color: colors.primaryMid
  },
  discountButtonTextApplied: {
    color: "#FFFFFF"
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
  },
  policyText: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 20
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(17, 17, 17, 0.35)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.lg
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject
  },
  modalCard: {
    width: "100%" as never,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.line,
    padding: spacing.lg,
    gap: spacing.md
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: colors.ink
  },
  modalBody: {
    fontSize: 14,
    lineHeight: 21,
    color: colors.muted
  },
  modalButton: {
    alignSelf: "flex-end",
    backgroundColor: colors.primaryMid,
    borderRadius: radius.pill,
    paddingHorizontal: 18,
    paddingVertical: 10
  },
  modalButtonText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#FFFFFF"
  }
});
