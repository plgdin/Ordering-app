import React, { useCallback, useState } from "react";
import { LocationBar, PageShell, SavedAddress } from "@nearnow/ui";
import { Store } from "@nearnow/core";
import { createClientOrder } from "@nearnow/supabase";
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
  const [checkoutBusy, setCheckoutBusy] = useState(false);
  const [checkoutStatus, setCheckoutStatus] = useState<{
    tone: "success" | "warning";
    text: string;
  } | null>(null);
  const cart = useClientCart();
  const auth = useSupabaseAuth("client");

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
      const result = await createClientOrder(cart.items, address);
      cart.clear();
      setCheckoutStatus({
        tone: "success",
        text: `Order ${result.orderId} was created for ${result.amount}.`
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
  }, [address, cart]);

  const locationBar = (
    <LocationBar address={address} onEditAddress={setAddress} />
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
          grandTotal={cart.grandTotal}
          isSignedIn={auth.snapshot.isSignedIn}
          signedInEmail={auth.snapshot.email}
          checkoutBusy={checkoutBusy}
          checkoutStatus={checkoutStatus}
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
