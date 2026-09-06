export interface FoodCategory {
  id: string;
  name: string;
  icon: string;
  badge?: string;
}

export interface FoodTypeOption {
  id: string;
  name: string;
  icon: string;
  selectedByDefault?: boolean;
}

export interface QuickDish {
  id: string;
  name: string;
  price: number;
  badge?: string;
  isVeg?: boolean;
  image: string;
}

export interface Restaurant {
  id: string;
  name: string;
  cuisine: string;
  location: string;
  rating: number;
  reviewsCount: number;
  eta: string;
  deliveryFee: string;
  sponsored?: boolean;
  tag?: string;
  topRated?: boolean;
  schedule?: string;
  image: string;
  featuredDishes?: QuickDish[];
}

export interface CollectionPick {
  id: string;
  name: string;
  subtitle: string;
  icon: string;
  selected: boolean;
  count: number;
}

export const CATEGORIES: FoodCategory[] = [
  { id: 'promotions', name: 'Offers', icon: '🏷️', badge: '50% OFF' },
  { id: 'biryani', name: 'Biryani', icon: '🍲' },
  { id: 'burgers', name: 'Burgers', icon: '🍔' },
  { id: 'north_indian', name: 'North Indian', icon: '🍛' },
  { id: 'pizza', name: 'Pizza', icon: '🍕' },
  { id: 'chinese', name: 'Chinese', icon: '🥟' },
  { id: 'japanese', name: 'Japanese', icon: '🍱' },
  { id: 'desserts', name: 'Desserts', icon: '🍨' }
];

export const FOOD_TYPES: FoodTypeOption[] = [
  { id: 'biryani', name: 'Biryani', icon: '🍲', selectedByDefault: true },
  { id: 'north_indian', name: 'North Indian', icon: '🍛', selectedByDefault: true },
  { id: 'south_indian', name: 'South Indian', icon: '🧇' },
  { id: 'chinese', name: 'Indo-Chinese', icon: '🥢' },
  { id: 'japanese', name: 'Japanese & Sushi', icon: '🍜' },
  { id: 'pizza', name: 'Pizza & Pasta', icon: '🍕', selectedByDefault: true },
  { id: 'burgers', name: 'Burgers & Fries', icon: '🍔' },
  { id: 'street_food', name: 'Chaat & Street', icon: '🥙' },
  { id: 'kebab', name: 'Kebab & Tandoor', icon: '🍢', selectedByDefault: true },
  { id: 'thali', name: 'Royal Thali', icon: '🍱' },
  { id: 'desserts', name: 'Sweets & Desserts', icon: '🍧' },
  { id: 'shakes', name: 'Shakes & Beverages', icon: '🥤' }
];

export const QUICK_JAPANESE_DISHES: QuickDish[] = [
  {
    id: 'j1',
    name: 'Special Salmon Roll (8 Pcs)',
    price: 549,
    badge: 'BUY 1 GET 1',
    isVeg: false,
    image: 'https://images.unsplash.com/photo-1611143669185-af224c5e3252?w=400&h=400&fit=crop'
  },
  {
    id: 'j2',
    name: 'Avocado Hosomaki Roll',
    price: 329,
    isVeg: true,
    image: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=400&h=400&fit=crop'
  },
  {
    id: 'j3',
    name: 'Deluxe Sushi Platter (16 Pcs)',
    price: 899,
    isVeg: false,
    image: 'https://images.unsplash.com/photo-1553621042-f6e147245754?w=400&h=400&fit=crop'
  }
];

export const RESTAURANTS: Restaurant[] = [
  {
    id: 'r1',
    name: "McDonald's® India",
    cuisine: 'Burgers • Fast Food • Beverages',
    location: 'Indiranagar, Bengaluru',
    rating: 4.4,
    reviewsCount: 2400,
    eta: '20-25 min',
    deliveryFee: 'Free',
    sponsored: true,
    tag: '50% OFF up to ₹100',
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&h=400&fit=crop'
  },
  {
    id: 'r2',
    name: 'Pa Pa Ya - Asian Bistro',
    cuisine: 'Japanese • Pan-Asian • Sushi',
    location: 'Koramangala 5th Block',
    rating: 4.7,
    reviewsCount: 1800,
    eta: '30-40 min',
    deliveryFee: '₹35',
    topRated: true,
    tag: 'FLAT ₹150 OFF',
    schedule: 'Schedule for 12:30 PM',
    image: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=800&h=400&fit=crop',
    featuredDishes: [
      { id: 'ur1', name: 'Dragon Salmon Roll', price: 590, isVeg: false, image: 'https://images.unsplash.com/photo-1611143669185-af224c5e3252?w=300&h=300&fit=crop' },
      { id: 'ur2', name: 'Crispy Asparagus Roll', price: 480, isVeg: true, image: 'https://images.unsplash.com/photo-1553621042-f6e147245754?w=300&h=300&fit=crop' },
      { id: 'ur3', name: 'Truffle Edamame Dimsum', price: 520, isVeg: true, image: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=300&h=300&fit=crop' }
    ]
  },
  {
    id: 'r3',
    name: 'Meghana Foods Biryani',
    cuisine: 'Andhra • Biryani • North Indian',
    location: 'Jayanagar, Bengaluru',
    rating: 4.8,
    reviewsCount: 5200,
    eta: '25-30 min',
    deliveryFee: 'Free',
    sponsored: true,
    tag: 'Bestseller Spot',
    image: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=800&h=400&fit=crop'
  },
  {
    id: 'r4',
    name: 'Tossin Pizza Craft',
    cuisine: 'Gourmet Pizza • Italian',
    location: 'HSR Layout',
    rating: 4.5,
    reviewsCount: 980,
    eta: '30-35 min',
    deliveryFee: '₹25',
    tag: 'BUY 1 GET 1 FREE',
    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&h=400&fit=crop'
  }
];

export const INITIAL_PICKS: CollectionPick[] = [
  {
    id: 'p1',
    name: 'My Favourites',
    subtitle: '4 places saved',
    icon: '❤️',
    selected: true,
    count: 4
  },
  {
    id: 'p2',
    name: 'Late Night Craving',
    subtitle: '6 places saved',
    icon: '🌙',
    selected: false,
    count: 6
  },
  {
    id: 'p3',
    name: 'Weekend Biryani Spots',
    subtitle: '3 places saved',
    icon: '🍲',
    selected: false,
    count: 3
  }
];

export const BUILDING_TYPES = [
  { id: 'house', label: 'Independent House', icon: '🏠', desc: 'Villa, Independent house or bunglow' },
  { id: 'apartment', label: 'Apartment / Gated', icon: '🏢', desc: 'High-rise apartment or flat block' },
  { id: 'office', label: 'Office / Tech Park', icon: '💼', desc: 'IT Park, commercial office tower' },
  { id: 'other', label: 'Other Location', icon: '📍', desc: 'Hotel, friend house, or landmark' }
];
