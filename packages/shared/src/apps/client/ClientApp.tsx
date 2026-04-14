import React, { useState } from "react";
import { PageShell } from "@nearnow/ui";
import { ClientCartScreen } from "./screens/CartScreen";
import { ClientHomeScreen } from "./screens/HomeScreen";
import { ClientOrdersScreen } from "./screens/OrdersScreen";
import { ClientSettingsScreen } from "./screens/SettingsScreen";
import { clientTabs } from "./tabs";
import { ClientTab } from "./types";

export function ClientApp() {
  const [activeTab, setActiveTab] = useState<ClientTab>("home");

  return (
    <PageShell
      title="NearNow"
      subtitle="Everything useful around you, delivered fast."
      activeTab={activeTab}
      onTabChange={setActiveTab}
      tabs={clientTabs}
    >
      {activeTab === "home" ? <ClientHomeScreen /> : null}
      {activeTab === "cart" ? <ClientCartScreen /> : null}
      {activeTab === "orders" ? <ClientOrdersScreen /> : null}
      {activeTab === "settings" ? <ClientSettingsScreen /> : null}
    </PageShell>
  );
}
