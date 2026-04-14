import { TabOption } from "@nearnow/ui";
import { MerchantTab } from "./types";

export const merchantTabs: TabOption<MerchantTab>[] = [
  { id: "dashboard", label: "Dashboard" },
  { id: "orders", label: "Orders" },
  { id: "catalog", label: "Catalog" },
  { id: "settings", label: "Settings" }
];
