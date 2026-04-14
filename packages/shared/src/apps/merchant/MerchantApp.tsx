import React, { useState } from "react";
import { PageShell } from "@nearnow/ui";
import { MerchantCatalogScreen } from "./screens/CatalogScreen";
import { MerchantDashboardScreen } from "./screens/DashboardScreen";
import { MerchantOrdersScreen } from "./screens/OrdersScreen";
import { MerchantSettingsScreen } from "./screens/SettingsScreen";
import { merchantTabs } from "./tabs";
import { MerchantTab } from "./types";

export function MerchantApp() {
  const [activeTab, setActiveTab] = useState<MerchantTab>("dashboard");

  return (
    <PageShell
      title="Merchant Hub"
      subtitle="Faster packing, cleaner ops, better repeat orders."
      activeTab={activeTab}
      onTabChange={setActiveTab}
      tabs={merchantTabs}
    >
      {activeTab === "dashboard" ? <MerchantDashboardScreen /> : null}
      {activeTab === "orders" ? <MerchantOrdersScreen /> : null}
      {activeTab === "catalog" ? <MerchantCatalogScreen /> : null}
      {activeTab === "settings" ? <MerchantSettingsScreen /> : null}
    </PageShell>
  );
}
