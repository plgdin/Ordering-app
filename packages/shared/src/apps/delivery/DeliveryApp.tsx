import React, { useState } from "react";
import { PageShell } from "@nearnow/ui";
import { DeliveryEarningsScreen } from "./screens/EarningsScreen";
import { DeliveryHomeScreen } from "./screens/HomeScreen";
import { DeliveryProfileScreen } from "./screens/ProfileScreen";
import { DeliveryRunsScreen } from "./screens/RunsScreen";
import { deliveryTabs } from "./tabs";
import { DeliveryTab } from "./types";

export function DeliveryApp() {
  const [activeTab, setActiveTab] = useState<DeliveryTab>("home");

  return (
    <PageShell
      title="Rider Go"
      subtitle="Fast routes, smart stacking, daily earning clarity."
      activeTab={activeTab}
      onTabChange={setActiveTab}
      tabs={deliveryTabs}
    >
      {activeTab === "home" ? <DeliveryHomeScreen /> : null}
      {activeTab === "runs" ? <DeliveryRunsScreen /> : null}
      {activeTab === "earnings" ? <DeliveryEarningsScreen /> : null}
      {activeTab === "profile" ? <DeliveryProfileScreen /> : null}
    </PageShell>
  );
}
