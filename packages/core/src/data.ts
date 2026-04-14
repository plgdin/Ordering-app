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

export const storeImages: Record<string, string> = {
  more: "https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=600&h=300&fit=crop",
  pharma: "https://images.unsplash.com/photo-1631549916768-4119b2e5f926?w=600&h=300&fit=crop",
  bakery: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&h=300&fit=crop"
};

export const featuredStores: Store[] = [
  {
    id: "more",
    name: "More Daily Mart",
    category: "Groceries",
    eta: "18-25 min",
    distanceKm: 2.1,
    rating: 4.7,
    deliveryTag: "Free pickup if clubbed with nearby stores",
    highlight: "Fruits, milk, staples, and premium pantry",
    featured: true,
    image: storeImages.more,
    inventory: [
      { id: "m1", name: "Toned Milk 500ml", price: 28, unit: "pack", inStock: true },
      { id: "m2", name: "Basmati Rice 1kg", price: 98, unit: "bag", inStock: true },
      { id: "m3", name: "Farm Eggs (6 pcs)", price: 54, unit: "tray", inStock: true },
      { id: "m4", name: "Amul Butter 100g", price: 56, unit: "pack", inStock: true },
      { id: "m5", name: "Aashirvaad Atta 5kg", price: 265, unit: "bag", inStock: true },
      { id: "m6", name: "Sugar 1kg", price: 46, unit: "bag", inStock: false },
      { id: "m7", name: "Sunflower Oil 1L", price: 142, unit: "bottle", inStock: true },
      { id: "m8", name: "Fresh Paneer 200g", price: 80, unit: "pack", inStock: true }
    ]
  },
  {
    id: "pharma",
    name: "HealthPoint Pharmacy",
    category: "Pharmacy",
    eta: "20-28 min",
    distanceKm: 3.4,
    rating: 4.8,
    deliveryTag: "Only non-prescription items enabled",
    highlight: "Wellness, baby care, hygiene, OTC products",
    featured: true,
    image: storeImages.pharma,
    inventory: [
      { id: "p1", name: "Vitamin C 500mg (30)", price: 145, unit: "strip", inStock: true },
      { id: "p2", name: "Band-Aid Pack (10)", price: 35, unit: "box", inStock: true },
      { id: "p3", name: "Hand Sanitizer 200ml", price: 85, unit: "bottle", inStock: true },
      { id: "p4", name: "Dettol Soap (3 pack)", price: 120, unit: "pack", inStock: true },
      { id: "p5", name: "Baby Lotion 200ml", price: 195, unit: "bottle", inStock: true },
      { id: "p6", name: "Cough Drops (20)", price: 30, unit: "pack", inStock: true }
    ]
  },
  {
    id: "bakery",
    name: "Daily Crust Bakery",
    category: "Bakery",
    eta: "16-22 min",
    distanceKm: 1.6,
    rating: 4.9,
    deliveryTag: "Stack on-route pickups to save delivery fees",
    highlight: "Fresh breads, cakes, buns, and tea-time snacks",
    featured: true,
    image: storeImages.bakery,
    inventory: [
      { id: "b1", name: "Sandwich Loaf", price: 45, unit: "loaf", inStock: true },
      { id: "b2", name: "Butter Croissant", price: 60, unit: "piece", inStock: true },
      { id: "b3", name: "Chocolate Cake Slice", price: 85, unit: "slice", inStock: true },
      { id: "b4", name: "Pav Buns (6 pcs)", price: 30, unit: "pack", inStock: true },
      { id: "b5", name: "Veg Puff", price: 25, unit: "piece", inStock: false },
      { id: "b6", name: "Banana Muffin", price: 40, unit: "piece", inStock: true },
      { id: "b7", name: "Garlic Bread Stick", price: 55, unit: "piece", inStock: true }
    ]
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
