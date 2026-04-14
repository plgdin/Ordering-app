export type DirectionBucket = "same-route" | "north" | "south" | "east" | "west";

export type InventoryItem = {
  id: string;
  name: string;
  price: number;
  unit: string;
  inStock: boolean;
};

export type Store = {
  id: string;
  name: string;
  category: string;
  eta: string;
  distanceKm: number;
  rating: number;
  deliveryTag: string;
  highlight: string;
  featured?: boolean;
  image?: string;
  inventory?: InventoryItem[];
};

export type QuoteStop = {
  storeName: string;
  distanceFromCustomerKm: number;
  direction: DirectionBucket;
  isAlongCurrentRoute?: boolean;
};

export type DeliveryQuote = {
  baseCharge: number;
  extraCharge: number;
  totalCharge: number;
  explanation: string;
  freeBecauseClustered: boolean;
  freeBecauseOnRoute: boolean;
};

export type OrderCard = {
  id: string;
  title: string;
  subtitle: string;
  status: string;
  amount: string;
};

export type Metric = {
  label: string;
  value: string;
  trend: string;
};
