import { Metric, OrderCard, QuoteStop, Store } from "./types";

export const verticals = [
  "Restaurants",
  "Stores",
  "Pharmacy",
  "Fashion"
];

export const categories = [
  "Indian",
  "Pizza",
  "Burgers",
  "Healthy",
  "Desserts",
  "Beverages",
  "Chinese",
  "Street Food"
];

export const storeImages: Record<string, string> = {
  indian: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=600&h=300&fit=crop",
  pizza: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&h=300&fit=crop",
  burger: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&h=300&fit=crop"
};

export const featuredStores: Store[] = [
  {
    id: "indian_delight",
    name: "Indian Delight",
    category: "Indian",
    eta: "25-35 min",
    distanceKm: 2.1,
    rating: 4.7,
    deliveryTag: "Free delivery on orders above ₹300",
    highlight: "Authentic North Indian curries and tandoori",
    featured: true,
    enabledDiscountKeys: ["combo30", "save10"],
    image: storeImages.indian,
    inventory: [
      { id: "i1", name: "Butter Chicken", price: 320, unit: "plate", inStock: true },
      { id: "i2", name: "Garlic Naan", price: 50, unit: "pc", inStock: true },
      { id: "i3", name: "Paneer Tikka Masala", price: 280, unit: "plate", inStock: true },
      { id: "i4", name: "Dal Makhani", price: 220, unit: "plate", inStock: true },
      { id: "i5", name: "Jeera Rice", price: 150, unit: "plate", inStock: true },
      { id: "i6", name: "Chicken Biryani", price: 350, unit: "plate", inStock: false },
      { id: "i7", name: "Gulab Jamun", price: 80, unit: "plate", inStock: true },
      { id: "i8", name: "Lassi", price: 90, unit: "glass", inStock: true }
    ]
  },
  {
    id: "pizza_house",
    name: "Pizza House",
    category: "Pizza",
    eta: "30-40 min",
    distanceKm: 3.4,
    rating: 4.8,
    deliveryTag: "Bestseller in your area",
    highlight: "Wood-fired pizzas with fresh toppings",
    featured: true,
    enabledDiscountKeys: ["combo30"],
    image: storeImages.pizza,
    inventory: [
      { id: "p1", name: "Margherita Pizza", price: 250, unit: "pc", inStock: true },
      { id: "p2", name: "Pepperoni Pizza", price: 450, unit: "pc", inStock: true },
      { id: "p3", name: "Farmhouse Pizza", price: 350, unit: "pc", inStock: true },
      { id: "p4", name: "Garlic Breadsticks", price: 120, unit: "plate", inStock: true },
      { id: "p5", name: "Cheese Dip", price: 30, unit: "cup", inStock: true },
      { id: "p6", name: "Choco Lava Cake", price: 110, unit: "pc", inStock: true }
    ]
  },
  {
    id: "burger_joint",
    name: "The Burger Joint",
    category: "Burgers",
    eta: "15-25 min",
    distanceKm: 1.6,
    rating: 4.9,
    deliveryTag: "Superfast delivery",
    highlight: "Juicy smash burgers and crispy fries",
    featured: true,
    enabledDiscountKeys: ["flat75", "save10"],
    image: storeImages.burger,
    inventory: [
      { id: "b1", name: "Classic Cheeseburger", price: 180, unit: "pc", inStock: true },
      { id: "b2", name: "Double Patty Burger", price: 280, unit: "pc", inStock: true },
      { id: "b3", name: "Spicy Chicken Burger", price: 220, unit: "pc", inStock: true },
      { id: "b4", name: "French Fries (M)", price: 100, unit: "plate", inStock: true },
      { id: "b5", name: "Peri Peri Fries", price: 130, unit: "plate", inStock: false },
      { id: "b6", name: "Vanilla Milkshake", price: 150, unit: "glass", inStock: true },
      { id: "b7", name: "Onion Rings", price: 120, unit: "plate", inStock: true }
    ]
  }
];

export const multiStoreStops: QuoteStop[] = [
  {
    storeName: "Indian Delight",
    distanceFromCustomerKm: 1.8,
    direction: "same-route",
    isAlongCurrentRoute: true
  },
  {
    storeName: "Pizza House",
    distanceFromCustomerKm: 2.2,
    direction: "same-route",
    isAlongCurrentRoute: true
  },
  {
    storeName: "The Burger Joint",
    distanceFromCustomerKm: 0.8,
    direction: "same-route"
  }
];

export const splitDirectionStops: QuoteStop[] = [
  {
    storeName: "Indian Delight",
    distanceFromCustomerKm: 2.4,
    direction: "north"
  },
  {
    storeName: "The Burger Joint",
    distanceFromCustomerKm: 3.1,
    direction: "west"
  }
];

export const clientOrders: OrderCard[] = [
  {
    id: "ORD-2401",
    title: "Food prepared and waiting for rider",
    subtitle: "Indian Delight",
    status: "Preparing",
    amount: "Rs 624"
  },
  {
    id: "ORD-2402",
    title: "Pizza delivered",
    subtitle: "Pizza House",
    status: "Delivered",
    amount: "Rs 450"
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
    title: "New order: Butter Chicken",
    subtitle: "Prepare in 15 min, rider arriving in 12 min",
    status: "High priority",
    amount: "Rs 980"
  },
  {
    id: "MER-802",
    title: "Burger & Fries combo",
    subtitle: "Customer requested extra mayo",
    status: "Review order",
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
