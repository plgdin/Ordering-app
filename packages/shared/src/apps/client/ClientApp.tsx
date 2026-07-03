import React, { useCallback, useEffect, useRef, useState } from "react";
import { LocationBar, PageShell, SavedAddress, ForkItSplash } from "@nearnow/ui";
import { Store } from "@nearnow/core";
import {
  PaymentMethod,
  createClientOrder,
  fetchCurrentClientAddress,
  saveCurrentClientAddress
} from "@nearnow/supabase";
import { useClientCart } from "../../hooks/useClientCart";
import { useSupabaseAuth } from "../../hooks/useSupabaseAuth";
import { ClientCartScreen } from "./screens/CartScreen";
import { ClientHomeScreen } from "./screens/HomeScreen";
import { ClientOrdersScreen } from "./screens/OrdersScreen";
import { ClientSettingsScreen } from "./screens/SettingsScreen";
import { StoreDetailScreen } from "./screens/StoreDetailScreen";
import { clientTabs } from "./tabs";
import { ClientTab } from "./types";
import { Platform, View, Text, Pressable, Animated, StyleSheet } from "react-native";

const defaultAddress: SavedAddress = {
  label: "Home",
  houseNo: "Flat 301, Tower B",
  street: "MG Road",
  area: "Sector 21",
  city: "Gandhinagar",
  pincode: "382021",
  landmark: "Near City Mall",
  directions: ""
};

export function ClientApp() {
  const [showSplash, setShowSplash] = useState(true);
  const [activeTab, setActiveTab] = useState<ClientTab>("home");
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [address, setAddress] = useState<SavedAddress>(defaultAddress);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cod");
  const [checkoutBusy, setCheckoutBusy] = useState(false);
  const [checkoutStatus, setCheckoutStatus] = useState<{
    tone: "success" | "warning";
    text: string;
  } | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const toastOpacity = useRef(new Animated.Value(0)).current;

  const cart = useClientCart();
  const auth = useSupabaseAuth("client");

  useEffect(() => {
    let cancelled = false;

    if (!auth.snapshot.isSignedIn) return;

    void fetchCurrentClientAddress()
      .then((saved) => {
        if (!saved || cancelled) return;
        setAddress(saved);
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [auth.snapshot.isSignedIn]);

  const handleStorePress = useCallback((store: Store) => {
    setSelectedStore(store);
  }, []);

  const handleBackFromStore = useCallback(() => {
    setSelectedStore(null);
  }, []);

  const handleTabChange = useCallback((tab: ClientTab) => {
    setSelectedStore(null);
    setActiveTab(tab);
  }, []);

  const handleAddToCart = useCallback(
    (store: Store, item: NonNullable<Store["inventory"]>[number]) => {
      cart.addItem(store, item);
      setToastMessage(`${item.name} added to cart.`);
      toastOpacity.setValue(0);
      Animated.sequence([
        Animated.timing(toastOpacity, { toValue: 1, duration: 200, useNativeDriver: true }),
        Animated.delay(1800),
        Animated.timing(toastOpacity, { toValue: 0, duration: 300, useNativeDriver: true })
      ]).start(() => setToastMessage(null));
    },
    [cart, toastOpacity]
  );

  const handleCheckout = useCallback(async () => {
    try {
      setCheckoutBusy(true);
      setCheckoutStatus(null);
      const result = await createClientOrder(
        cart.items,
        address,
        paymentMethod,
        cart.appliedDiscounts
      );
      cart.clear();
      setCheckoutStatus({
        tone: "success",
        text:
          paymentMethod === "online"
            ? `Order ${result.orderId} was created for ${result.amount}. Payment is pending (wire a payment provider next).`
            : `Order ${result.orderId} was created for ${result.amount}.`
      });
      return true;
    } catch (error: any) {
      setCheckoutStatus({
        tone: "warning",
        text: error?.message ?? "Unable to place the order right now."
      });
      return false;
    } finally {
      setCheckoutBusy(false);
    }
  }, [address, cart, paymentMethod]);

  if (showSplash) {
    return <ForkItSplash onFinish={() => setShowSplash(false)} />;
  }

  return (
    <View style={styles.rootContainer}>
      <PageShell
        activeTab={activeTab}
        onTabChange={handleTabChange}
        tabs={clientTabs}
      >
        {activeTab === "home" && !selectedStore ? (
          <ClientHomeScreen
            onStorePress={handleStorePress}
            cartCount={cart.itemCount}
            onGoToCart={() => setActiveTab("cart")}
            onQuickAdd={(item) => {
              const moreStore = {
                id: "more",
                name: "More Daily Mart",
                category: "Groceries",
                distanceKm: 2.1,
                eta: "18-25 min",
                rating: 4.7,
                deliveryTag: "Free pickup if clubbed with nearby stores",
                highlight: "Fruits, milk, staples, and premium pantry",
                enabledDiscountKeys: ["combo30", "save10"] as any
              };
              handleAddToCart(moreStore, item);
            }}
          />
        ) : null}
        {activeTab === "home" && selectedStore ? (
          <StoreDetailScreen
            store={selectedStore}
            onBack={handleBackFromStore}
            onAddItem={handleAddToCart}
          />
        ) : null}
        {activeTab === "cart" ? (
          <ClientCartScreen
            groupedItems={cart.groupedItems}
            itemCount={cart.itemCount}
            itemTotal={cart.itemTotal}
            deliveryQuote={cart.deliveryQuote}
            availableDiscounts={cart.availableDiscounts}
            appliedDiscounts={cart.appliedDiscounts}
            discountTotal={cart.discountTotal}
            grandTotal={cart.grandTotal}
            paymentMethod={paymentMethod}
            onPaymentMethodChange={setPaymentMethod}
            isSignedIn={auth.snapshot.isSignedIn}
            signedInEmail={auth.snapshot.email}
            checkoutBusy={checkoutBusy}
            checkoutStatus={checkoutStatus}
            onToggleDiscount={cart.toggleDiscount}
            onUpdateQuantity={cart.updateQuantity}
            onCheckout={handleCheckout}
            onGoToSettings={() => setActiveTab("settings")}
          />
        ) : null}
        {activeTab === "orders" ? <ClientOrdersScreen /> : null}
        {activeTab === "settings" ? (
          <ClientSettingsScreen
            auth={auth}
            onAuthComplete={() => setCheckoutStatus(null)}
          />
        ) : null}
      </PageShell>

      {/* Floating Swiggy/Instamart style Cart Strip */}
      {activeTab === "home" && cart.itemCount > 0 && (
        <Pressable
          style={styles.floatingCartStrip}
          onPress={() => setActiveTab("cart")}
        >
          <View style={styles.cartStripInfo}>
            <Text style={styles.cartStripIcon}>🛒</Text>
            <Text style={styles.cartStripText}>
              {cart.itemCount} {cart.itemCount === 1 ? "item" : "items"} added
            </Text>
          </View>
          <Text style={styles.cartStripBtn}>View Cart ➔</Text>
        </Pressable>
      )}

      {/* Floating toast notification */}
      {toastMessage && (
        <Animated.View style={[styles.floatingToast, { opacity: toastOpacity }]}>
          <Text style={styles.floatingToastText}>{toastMessage}</Text>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
    position: "relative"
  },
  floatingToast: {
    position: "absolute",
    bottom: 96,
    left: 20,
    right: 20,
    backgroundColor: "#FAF6F0", // cream beige background
    borderColor: "#A8201A", // primary Red border
    borderWidth: 2,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 18,
    alignItems: "center",
    shadowColor: "#5C0D11",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
    zIndex: 9999
  },
  floatingToastText: {
    color: "#8B1E22", // crimson red text
    fontSize: 14,
    fontWeight: "900",
    letterSpacing: 0.5
  },
  floatingCartStrip: {
    position: "absolute",
    bottom: 84, // position it just above the bottom tab bar
    left: 20,
    right: 20,
    backgroundColor: "#A8201A", // primary Red
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 18,
    shadowColor: "#5C0D11",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
    zIndex: 999
  },
  cartStripInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10
  },
  cartStripIcon: {
    fontSize: 20
  },
  cartStripText: {
    color: "#FAF6F0",
    fontSize: 15,
    fontWeight: "800",
    letterSpacing: 0.5
  },
  cartStripBtn: {
    color: "#FAF6F0",
    fontSize: 15,
    fontWeight: "900",
    letterSpacing: 0.5
  }
});
