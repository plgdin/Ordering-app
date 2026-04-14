import React, { useCallback, useState } from "react";
import { LocationBar, PageShell, SavedAddress } from "@nearnow/ui";
import { Store } from "@nearnow/core";
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
        <StoreDetailScreen store={selectedStore} onBack={handleBackFromStore} />
      ) : null}
      {activeTab === "cart" ? <ClientCartScreen /> : null}
      {activeTab === "orders" ? <ClientOrdersScreen /> : null}
      {activeTab === "settings" ? <ClientSettingsScreen /> : null}
    </PageShell>
  );
}
