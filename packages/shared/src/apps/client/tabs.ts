import { TabOption } from "@nearnow/ui";
import { ClientTab } from "./types";

export const clientTabs: TabOption<ClientTab>[] = [
  { id: "home", label: "Home" },
  { id: "cart", label: "Cart" },
  { id: "orders", label: "Orders" },
  { id: "settings", label: "Settings" }
];
