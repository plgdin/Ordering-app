import { CartDiscountOption, StoreDiscountKey } from "./discounts";

export type DirectionBucket = "same-route" | "north" | "south" | "east" | "west";

export type InventoryItem = {
  id: string;
  name: string;
  price: number;
  unit: string;
  inStock: boolean;
};

export type CartLineItem = {
  id: string;
  storeId: string;
  storeName: string;
  storeCategory: string;
  storeDistanceKm: number;
  storeDiscountKeys?: StoreDiscountKey[];
  storeImage?: string;
  productId: string;
  name: string;
  price: number;
  unit: string;
  quantity: number;
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
  enabledDiscountKeys?: StoreDiscountKey[];
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
  travelledDistanceKm: number;
  freeDistanceLimitKm: number;
  chargeableDistanceKm: number;
  perKmCharge: number;
};

export type AppliedCartDiscount = CartDiscountOption;

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
