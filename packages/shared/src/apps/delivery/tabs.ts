import { TabOption } from "@nearnow/ui";
import { DeliveryTab } from "./types";

export const deliveryTabs: TabOption<DeliveryTab>[] = [
  { id: "home", label: "Home" },
  { id: "runs", label: "Runs" },
  { id: "earnings", label: "Earnings" },
  { id: "profile", label: "Profile" }
];
