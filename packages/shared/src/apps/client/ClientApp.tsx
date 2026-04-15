import React, { useCallback, useEffect, useState } from "react";
import { LocationBar, PageShell, SavedAddress } from "@nearnow/ui";
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
  const [activeTab, setActiveTab] = useState<ClientTab>("home");
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [address, setAddress] = useState<SavedAddress>(defaultAddress);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cod");
  const [checkoutBusy, setCheckoutBusy] = useState(false);
  const [checkoutStatus, setCheckoutStatus] = useState<{
    tone: "success" | "warning";
    text: string;
  } | null>(null);
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
      setCheckoutStatus({
        tone: "success",
        text: `${item.name} added to your cart.`
      });
      setActiveTab("cart");
    },
    [cart]
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

  const locationBar = (
    <LocationBar
      address={address}
      onEditAddress={(nextAddress) => {
        setAddress(nextAddress);
        if (!auth.snapshot.isSignedIn) return;

        void saveCurrentClientAddress(nextAddress).catch((nextError: any) => {
          setCheckoutStatus({
            tone: "warning",
            text: nextError?.message ?? "Unable to save the address right now."
          });
        });
      }}
    />
  );

  return (
    <PageShell
      locationBar={locationBar}
      activeTab={activeTab}
      onTabChange={handleTabChange}
      tabs={clientTabs}
    >
      {activeTab === "home" && !selectedStore ? (
        <ClientHomeScreen onStorePress={handleStorePress} />
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
  );
}
