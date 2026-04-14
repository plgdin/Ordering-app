import { Metric, OrderCard, QuoteStop, Store } from "./types";

export const categories = [
  "Groceries",
  "Pharmacy",
  "Bakery",
  "Fresh Veg",
  "Daily Needs",
  "Pet Care",
  "Home Care",
  "Snacks"
];

export const featuredStores: Store[] = [
  {
    id: "more",
    name: "More Daily Mart",
    category: "Supermarket",
    eta: "18-25 min",
    distanceKm: 2.1,
    rating: 4.7,
    deliveryTag: "Free pickup if clubbed with nearby stores",
    highlight: "Fruits, milk, staples, and premium pantry"
  },
  {
    id: "pharma",
    name: "HealthPoint Pharmacy",
    category: "Pharmacy",
    eta: "20-28 min",
    distanceKm: 3.4,
    rating: 4.8,
    deliveryTag: "Only non-prescription items enabled",
    highlight: "Wellness, baby care, hygiene, OTC products"
  },
  {
    id: "bakery",
    name: "Daily Crust Bakery",
    category: "Bakery",
    eta: "16-22 min",
    distanceKm: 1.6,
    rating: 4.9,
    deliveryTag: "Stack on-route pickups to save delivery fees",
    highlight: "Fresh breads, cakes, buns, and tea-time snacks"
  }
];

export const multiStoreStops: QuoteStop[] = [
  {
    storeName: "More Daily Mart",
    distanceFromCustomerKm: 1.8,
    direction: "same-route",
    isAlongCurrentRoute: true
  },
  {
    storeName: "HealthPoint Pharmacy",
    distanceFromCustomerKm: 2.2,
    direction: "same-route",
    isAlongCurrentRoute: true
  },
  {
    storeName: "Daily Crust Bakery",
    distanceFromCustomerKm: 0.8,
    direction: "same-route"
  }
];

export const splitDirectionStops: QuoteStop[] = [
  {
    storeName: "More Daily Mart",
    distanceFromCustomerKm: 2.4,
    direction: "north"
  },
  {
    storeName: "Daily Crust Bakery",
    distanceFromCustomerKm: 3.1,
    direction: "west"
  }
];

export const clientOrders: OrderCard[] = [
  {
    id: "ORD-2401",
    title: "Order packed and waiting for rider",
    subtitle: "More Daily Mart + HealthPoint Pharmacy",
    status: "Stacked order",
    amount: "Rs 624"
  },
  {
    id: "ORD-2402",
    title: "Fresh bakery order delivered",
    subtitle: "Daily Crust Bakery",
    status: "Delivered",
    amount: "Rs 182"
  }
];

export const merchantMetrics: Metric[] = [
  { label: "Today's orders", value: "126", trend: "+18%" },
  { label: "Packed in SLA", value: "94%", trend: "+6%" },
  { label: "Catalog live", value: "2,430", trend: "+110 SKUs" }
];

export const merchantOrders: OrderCard[] = [
  {
    id: "MER-801",
    title: "Express grocery basket",
    subtitle: "Pack in 4 min, rider arriving in 6 min",
    status: "High priority",
    amount: "Rs 980"
  },
  {
    id: "MER-802",
    title: "Pharmacy essentials basket",
    subtitle: "Verify OTC-only items before packing",
    status: "Review basket",
    amount: "Rs 365"
  }
];

export const deliveryMetrics: Metric[] = [
  { label: "Today's earnings", value: "Rs 1,480", trend: "+Rs 240 bonus" },
  { label: "Completed runs", value: "14", trend: "+3 stacked trips" },
  { label: "Tomorrow payout", value: "9:00 AM", trend: "Auto-settlement" }
];

export const deliveryRuns: OrderCard[] = [
  {
    id: "RUN-118",
    title: "Route stack available",
    subtitle: "2 pickups on the same lane, no delay risk",
    status: "Best incentive fit",
    amount: "Rs 172"
  },
  {
    id: "RUN-119",
    title: "Single pickup express",
    subtitle: "Short 1.4 km completion, quick turnover",
    status: "Fast finish",
    amount: "Rs 74"
  }
];
