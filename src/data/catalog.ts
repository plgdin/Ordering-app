/* ─── 4Kit / Swiggy-Inspired Catalog & Data System ─── */

export interface MenuItem {
  id: string;
  name: string;
  price: number; // in INR
  desc: string;
  image: string;
  category: string;
  sauces?: string[];
  storeName?: string;
  storeLoc?: string;
  badge?: string;
  macros?: string;
  diet?: string; // 'veg' | 'non-veg' | 'vegan' | 'keto' | 'high-protein'
  sugar?: string; // 'sugar-free' | 'low-sugar' | 'sweet' | 'diabetic-friendly'
  isVeg?: boolean;
}

export interface Store {
  id: string;
  name: string;
  locality?: string;
  categoryTag: string;
  rating: number;
  eta: string;
  deliveryFee: string;
  image: string;
  categoryId: string;
  lat?: number;
  lng?: number;
  discountTag?: string;
  reviewCount?: string;
  isGourmet?: boolean;
  hasOneBenefit?: boolean;
}

export interface MultiStoreBundle {
  id: string;
  title: string;
  subtitle: string;
  price: number; // in INR
  savings: string;
  image: string;
  storesIncluded: string[];
  items: { id: string; name: string; price: number; store: string }[];
}

export interface CuisineCollection {
  id: string;
  name: string;
  flag: string;
  tagline: string;
  image: string;
  dishesCount: number;
}

import {
  TRIVANDRUM_FOOD_STORES,
  TRIVANDRUM_FOOD_MENU_ITEMS,
  ALL_TRIVANDRUM_FOOD_DISHES,
  TVM_LOCALITIES,
  getDistanceBetweenLocalities,
  calculateDistanceKm
} from './trivandrumData';

export {
  TRIVANDRUM_FOOD_STORES,
  TRIVANDRUM_FOOD_MENU_ITEMS,
  ALL_TRIVANDRUM_FOOD_DISHES,
  TVM_LOCALITIES,
  getDistanceBetweenLocalities,
  calculateDistanceKm
};

// "What's on your mind?" Swiggy Circular Dish Data
export const SWIGGY_MIND_DISHES = [
  { id: 'mind_1', name: 'Noodles', query: 'Indo-Chinese', img: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=160&h=160&fit=crop' },
  { id: 'mind_2', name: 'Rolls', query: 'Rolls', img: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=160&h=160&fit=crop' },
  { id: 'mind_3', name: 'Burgers', query: 'Burgers', img: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=160&h=160&fit=crop' },
  { id: 'mind_4', name: 'Shawarma', query: 'Shawarma', img: 'https://images.unsplash.com/photo-1541518763669-27fef04b14ea?w=160&h=160&fit=crop' },
  { id: 'mind_5', name: 'Pizza', query: 'Pizza', img: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=160&h=160&fit=crop' },
  { id: 'mind_6', name: 'Biriyani', query: 'Biriyani', img: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=160&h=160&fit=crop' },
  { id: 'mind_7', name: 'Porotta', query: 'Porotta', img: 'https://images.unsplash.com/photo-1626074353765-517a681e40be?w=160&h=160&fit=crop' },
  { id: 'mind_8', name: 'Dosa', query: 'Dosa', img: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=160&h=160&fit=crop' },
  { id: 'mind_9', name: 'Ice Cream', query: 'Ice Cream', img: 'https://images.unsplash.com/photo-1560008511-11c63416e52d?w=160&h=160&fit=crop' },
  { id: 'mind_10', name: 'Cakes', query: 'Cake', img: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?w=160&h=160&fit=crop' }
];

// Swiggy 99 Store Budget Meals
export const SWIGGY_99_STORE_ITEMS: MenuItem[] = [
  {
    id: 'store99_1',
    name: 'Classic Veg Fried Rice',
    price: 99,
    desc: 'Wok tossed basmati rice with crunchy garden veggies & spring onions.',
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=240&h=240&fit=crop',
    category: 'Indo-Chinese',
    diet: 'veg',
    isVeg: true,
    storeName: 'Open House Restaurant',
    storeLoc: 'Statue'
  },
  {
    id: 'store99_2',
    name: 'Aloo Paratha with Curd',
    price: 99,
    desc: 'Golden spiced potato stuffed whole wheat paratha served with fresh curd.',
    image: 'https://images.unsplash.com/photo-1626074353765-517a681e40be?w=240&h=240&fit=crop',
    category: 'Breads',
    diet: 'veg',
    isVeg: true,
    storeName: "Ambiswamy's Vegetarian",
    storeLoc: 'Statue'
  },
  {
    id: 'store99_3',
    name: 'Ghee Crispy Plain Roast Dosa',
    price: 99,
    desc: 'Golden crisp dosa with aromatic pure ghee, coconut chutney & sambar.',
    image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=240&h=240&fit=crop',
    category: 'Traditional',
    diet: 'veg',
    isVeg: true,
    storeName: 'Saravana Bhavan',
    storeLoc: 'Thampanoor'
  },
  {
    id: 'store99_4',
    name: 'Chicken Steamed Dumplings (4pcs)',
    price: 99,
    desc: 'Juicy minced chicken momos served with fiery red chili garlic dip.',
    image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=240&h=240&fit=crop',
    category: 'Starters',
    diet: 'non-veg',
    isVeg: false,
    storeName: 'Oriental Spice',
    storeLoc: 'Kowdiar'
  },
  {
    id: 'store99_5',
    name: 'Egg Kothu Porotta Box',
    price: 99,
    desc: 'Tawa shredded crispy porotta scrambled with eggs and spiced salna.',
    image: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=240&h=240&fit=crop',
    category: 'Street Food',
    diet: 'non-veg',
    isVeg: false,
    storeName: 'Buhari Hotel',
    storeLoc: 'Thampanoor'
  }
];

// Swiggy Promotional Banner Deals
export const SWIGGY_PROMO_BANNERS = [
  {
    id: 'promo_1',
    title: 'Dinner Specials',
    subtitle: 'Up to 60% OFF & more',
    bg: 'linear-gradient(135deg, #FF5200 0%, #E03E00 100%)',
    cta: 'ORDER NOW',
    image: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=320&h=220&fit=crop'
  },
  {
    id: 'promo_2',
    title: 'FLAT DEAL ₹30 OFF',
    subtitle: 'Above ₹199 + FREE DELIVERY',
    bg: 'linear-gradient(135deg, #FF6B00 0%, #FA4A0C 100%)',
    cta: 'GRAB DEAL',
    image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=320&h=220&fit=crop'
  },
  {
    id: 'promo_3',
    title: 'Multi-Store Express',
    subtitle: 'Combine 2 Stores in 1 Order',
    bg: 'linear-gradient(135deg, #7C3AED 0%, #4F46E5 100%)',
    cta: 'EXPLORE',
    image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=320&h=220&fit=crop'
  }
];

export const STORES_BY_CATEGORY: Record<string, Store[]> = {
  food: TRIVANDRUM_FOOD_STORES,
  supermarket: [
    {
      id: 's_groc_1',
      name: 'Lulu Hypermarket Trivandrum',
      locality: 'Lulu Mall',
      categoryTag: 'Lulu Mall • Fresh Farm Produce & Imports',
      rating: 4.95,
      reviewCount: '4.8K+',
      eta: '12-22 min',
      deliveryFee: 'Free',
      discountTag: '50% OFF UPTO ₹100',
      hasOneBenefit: true,
      image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&h=300&fit=crop',
      categoryId: 'supermarket',
      lat: TVM_LOCALITIES['Lulu Mall'].lat,
      lng: TVM_LOCALITIES['Lulu Mall'].lng
    },
    {
      id: 's_groc_2',
      name: 'Margin Free Market',
      locality: 'Palayam',
      categoryTag: 'Palayam • Spices & Daily Groceries',
      rating: 4.85,
      reviewCount: '1.9K+',
      eta: '10-18 min',
      deliveryFee: 'Free',
      discountTag: 'FLAT ₹40 OFF',
      hasOneBenefit: true,
      image: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=600&h=300&fit=crop',
      categoryId: 'supermarket',
      lat: TVM_LOCALITIES['Palayam'].lat,
      lng: TVM_LOCALITIES['Palayam'].lng
    },
    {
      id: 's_groc_3',
      name: 'Nilgiris Supermarket',
      locality: 'Kowdiar',
      categoryTag: 'Kowdiar • Farm Fresh Dairy & Breads',
      rating: 4.9,
      reviewCount: '2.3K+',
      eta: '8-15 min',
      deliveryFee: 'Free',
      discountTag: '30% OFF',
      hasOneBenefit: true,
      image: 'https://images.unsplash.com/photo-1528751014936-863e6e7a319c?w=600&h=300&fit=crop',
      categoryId: 'supermarket',
      lat: TVM_LOCALITIES['Kowdiar'].lat,
      lng: TVM_LOCALITIES['Kowdiar'].lng
    },
    {
      id: 's_groc_4',
      name: 'FreshToHome Trivandrum',
      locality: 'Kazhakkoottam',
      categoryTag: 'Kazhakkoottam • Fresh Coastal Fish & Meat',
      rating: 4.85,
      reviewCount: '3.1K+',
      eta: '14-22 min',
      deliveryFee: 'Free',
      discountTag: '60% OFF',
      hasOneBenefit: true,
      image: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=600&h=300&fit=crop',
      categoryId: 'supermarket',
      lat: TVM_LOCALITIES['Kazhakkoottam'].lat,
      lng: TVM_LOCALITIES['Kazhakkoottam'].lng
    },
    {
      id: 's_groc_5',
      name: 'Pothys Superstore',
      locality: 'Statue',
      categoryTag: 'Statue • Organic Produce & Grains',
      rating: 4.8,
      reviewCount: '1.2K+',
      eta: '10-18 min',
      deliveryFee: 'Free',
      discountTag: 'FLAT ₹50 OFF',
      hasOneBenefit: true,
      image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=600&h=300&fit=crop',
      categoryId: 'supermarket',
      lat: TVM_LOCALITIES['Statue'].lat,
      lng: TVM_LOCALITIES['Statue'].lng
    }
  ],
  pharmacy: [
    {
      id: 's_pharm_1',
      name: 'Apollo Pharmacy Vazhuthacaud',
      locality: 'Vazhuthacaud',
      categoryTag: 'Vazhuthacaud • 24/7 Meds & Wellness',
      rating: 4.9,
      reviewCount: '5.2K+',
      eta: '8-15 min',
      deliveryFee: 'Free',
      discountTag: '20% OFF ALL MEDS',
      hasOneBenefit: true,
      image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&h=300&fit=crop',
      categoryId: 'pharmacy',
      lat: TVM_LOCALITIES['Vazhuthacaud'].lat,
      lng: TVM_LOCALITIES['Vazhuthacaud'].lng
    },
    {
      id: 's_pharm_2',
      name: 'MedPlus Pattom',
      locality: 'Pattom',
      categoryTag: 'Pattom • Health Supplements & First Aid',
      rating: 4.85,
      reviewCount: '2.7K+',
      eta: '10-18 min',
      deliveryFee: 'Free',
      discountTag: 'FLAT ₹30 OFF',
      hasOneBenefit: true,
      image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=600&h=300&fit=crop',
      categoryId: 'pharmacy',
      lat: TVM_LOCALITIES['Pattom'].lat,
      lng: TVM_LOCALITIES['Pattom'].lng
    },
    {
      id: 's_pharm_3',
      name: 'Neethi Medical Store',
      locality: 'Palayam',
      categoryTag: 'Palayam • Affordable Generic Medicines',
      rating: 4.8,
      reviewCount: '1.4K+',
      eta: '10-16 min',
      deliveryFee: 'Free',
      discountTag: 'EXTRA 15% OFF',
      hasOneBenefit: true,
      image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&h=300&fit=crop',
      categoryId: 'pharmacy',
      lat: TVM_LOCALITIES['Palayam'].lat,
      lng: TVM_LOCALITIES['Palayam'].lng
    }
  ]
};

export const MENU_ITEMS_BY_CATEGORY: Record<string, MenuItem[]> = {
  food: ALL_TRIVANDRUM_FOOD_DISHES,
  supermarket: [
    { id: 'm_groc_1', name: 'Organic Almond Milk 1L', price: 180, desc: 'Unsweetened cold-pressed organic almond milk.', image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=200&h=200&fit=crop', category: 'Dairy & Plant', diet: 'vegan', isVeg: true, sugar: 'sugar-free', storeName: 'Lulu Hypermarket', storeLoc: 'Lulu Mall' },
    { id: 'm_groc_2', name: 'Ripe Hass Avocados (Pack of 3)', price: 190, desc: 'Handpicked creamy Hass avocados.', image: 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=200&h=200&fit=crop', category: 'Produce', diet: 'keto', isVeg: true, sugar: 'sugar-free', storeName: 'Margin Free Market', storeLoc: 'Palayam' },
    { id: 'm_groc_3', name: 'Organic Sourdough Loaf', price: 120, desc: 'Naturally fermented 36-hour sourdough bread.', image: 'https://images.unsplash.com/photo-1586444248902-2f64eddc13df?w=200&h=200&fit=crop', category: 'Bakery', diet: 'vegan', isVeg: true, sugar: 'sugar-free', storeName: 'Nilgiris', storeLoc: 'Kowdiar' },
    { id: 'm_groc_4', name: 'Free-Range Organic Eggs (12ct)', price: 110, desc: 'Farm-fresh pasture-raised brown eggs.', image: 'https://images.unsplash.com/photo-1506976785307-8732e854ad03?w=200&h=200&fit=crop', category: 'Dairy', diet: 'high-protein', isVeg: false, sugar: 'sugar-free', storeName: 'FreshToHome', storeLoc: 'Kazhakkoottam' },
    { id: 'm_groc_5', name: 'Organic Strawberries 400g', price: 160, desc: 'Sweet locally grown organic strawberries.', image: 'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=200&h=200&fit=crop', category: 'Produce', diet: 'vegan', isVeg: true, sugar: 'low-sugar', storeName: 'Pothys Superstore', storeLoc: 'Statue' }
  ],
  pharmacy: [
    { id: 'm_pharm_1', name: 'Vital Vitamin C 1000mg', price: 220, desc: 'Effervescent immunity booster tablets (30ct).', image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=200&h=200&fit=crop', category: 'Supplements', diet: 'vegan', isVeg: true, sugar: 'sugar-free', storeName: 'Apollo Pharmacy', storeLoc: 'Vazhuthacaud' },
    { id: 'm_pharm_2', name: 'Organic Chamomile Tea', price: 180, desc: 'Calming herbal tea infusion for sleep quality.', image: 'https://images.unsplash.com/photo-1597481499750-3e6b22637e12?w=200&h=200&fit=crop', category: 'Wellness', diet: 'vegan', isVeg: true, sugar: 'diabetic-friendly', storeName: 'MedPlus', storeLoc: 'Pattom' },
    { id: 'm_pharm_3', name: 'Electrolyte Hydration Mix (10pk)', price: 140, desc: 'Rapid hydration powder mix with essential minerals.', image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=200&h=200&fit=crop', category: 'Sports Nutrition', diet: 'vegan', isVeg: true, sugar: 'low-sugar', storeName: 'Neethi Medical', storeLoc: 'Palayam' }
  ]
};

export const DIET_ITEMS: MenuItem[] = [
  { id: 'diet_1', name: 'Keto Grilled Fish & Greens Bowl', price: 340, desc: 'Fresh seared catch, Hass avocado, organic salad with crushed black pepper & olive oil.', image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=300&h=300&fit=crop', category: 'Diet', badge: 'KETO FRIENDLY', macros: '45g Protein • 2g Net Carbs', diet: 'keto', isVeg: false, sugar: 'sugar-free', storeName: 'Villa Maya Heritage', storeLoc: 'Enjakkal' },
  { id: 'diet_2', name: 'Vegan Green Goddess Sadhya Bowl', price: 210, desc: 'Traditional red rice, organic thoran, mezhukkupuratti, pumpkin erissery, and tender greens.', image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=300&h=200&fit=crop', category: 'Diet', badge: '100% VEGAN', macros: 'Plant-Based • High Fiber', diet: 'vegan', isVeg: true, sugar: 'sugar-free', storeName: 'Mothers Veg Plaza', storeLoc: 'Bakery Junction' },
  { id: 'diet_3', name: 'High-Protein Tandoori Chicken Bento', price: 290, desc: 'Clay-oven grilled lean breast, steamed jeera rice, sprouted salad & mint dip.', image: 'https://images.unsplash.com/photo-1543339308-43e59d6b73a6?w=300&h=200&fit=crop', category: 'Diet', badge: 'HIGH PROTEIN', macros: '52g Protein • Low Fat', diet: 'high-protein', isVeg: false, sugar: 'sugar-free', storeName: 'Imperial Kitchen', storeLoc: 'Kowdiar' }
];

export const CRAVINGS_ITEMS: MenuItem[] = [
  { id: 'crav_1', name: 'Warm Chocolate Lava Cake & Gelato', price: 190, desc: 'Molten dark Belgian chocolate cake served with vanilla bean gelato.', image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=300&h=200&fit=crop', category: 'Cravings', badge: 'SUGAR HEAVEN', diet: 'veg', isVeg: true, sugar: 'sweet', storeName: 'Supreme Upper Crust', storeLoc: 'Kuravankonam' },
  { id: 'crav_2', name: 'Royal Malabar Falooda with Kulfi', price: 160, desc: 'Layered falooda with basil seeds, rose syrup, rich malai kulfi & pistachios.', image: 'https://images.unsplash.com/photo-1560008511-11c63416e52d?w=300&h=200&fit=crop', category: 'Cravings', badge: 'SWEET CRAVING', diet: 'veg', isVeg: true, sugar: 'sweet', storeName: 'Falooda Nation', storeLoc: 'Kuravankonam' },
  { id: 'crav_3', name: 'Neyyappam & Pazham Pori Box', price: 120, desc: 'Hot sweet banana fritters and pure ghee cardamom jaggery unniyappam.', image: 'https://images.unsplash.com/photo-1624371414361-e670ef4889d5?w=300&h=200&fit=crop', category: 'Cravings', badge: 'TRIVANDRUM SPECIAL', diet: 'veg', isVeg: true, sugar: 'sweet', storeName: 'Sree Krishna Marry Cafe', storeLoc: 'Chalai' }
];

export const CUISINE_COLLECTIONS: CuisineCollection[] = [
  { id: 'cuis_1', name: 'Malabar & Travancore', flag: '', tagline: 'Dum Biriyani, Porotta & Fish Nirvana', image: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=300&h=200&fit=crop', dishesCount: 350 },
  { id: 'cuis_2', name: 'Arabian & Mandi', flag: '', tagline: 'Smoky Charcoal Alfaham & Shawarma', image: 'https://images.unsplash.com/photo-1541518763669-27fef04b14ea?w=300&h=200&fit=crop', dishesCount: 180 },
  { id: 'cuis_3', name: 'Pure Veg & Sadhya', flag: '', tagline: 'Crispy Dosas, Ghee Roast & Sadhya', image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=300&h=200&fit=crop', dishesCount: 220 },
  { id: 'cuis_4', name: 'Gourmet Bakeries & Cafes', flag: '', tagline: 'Artisanal Croissants, Shakes & Desserts', image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=300&h=200&fit=crop', dishesCount: 140 }
];

export const MULTI_STORE_BUNDLES: MultiStoreBundle[] = [
  {
    id: 'bundle_1',
    title: 'Palayam Feast Duo',
    subtitle: 'Zam Zam Restaurant (Palayam) + Azad (Vazhuthacaud) • 1.8km apart',
    price: 490,
    savings: 'Save ₹60',
    image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=500&h=300&fit=crop',
    storesIncluded: ['Zam Zam Restaurant', 'Azad Restaurant'],
    items: [
      { id: 'm_food_1', name: 'Malabar Chicken Dum Biriyani', price: 240, store: 'Zam Zam Restaurant' },
      { id: 'm_food_2', name: 'Mutton Biriyani & Porotta', price: 250, store: 'Azad Restaurant' }
    ]
  },
  {
    id: 'bundle_2',
    title: 'Kowdiar & Kuravankonam Combo',
    subtitle: 'Imperial Kitchen (Kowdiar) + Supreme Upper Crust • 1.2km apart',
    price: 520,
    savings: 'Save ₹70',
    image: 'https://images.unsplash.com/photo-1552566626-52f8b828add9?w=500&h=300&fit=crop',
    storesIncluded: ['Imperial Kitchen', 'Supreme Upper Crust'],
    items: [
      { id: 'm_bake_1', name: 'Tandoori Chicken Platter', price: 270, store: 'Imperial Kitchen' },
      { id: 'm_groc_1', name: 'Gourmet Chocolate Pastry & Pasta', price: 250, store: 'Supreme Upper Crust' }
    ]
  },
  {
    id: 'bundle_3',
    title: 'Late Night Chalai Treats',
    subtitle: "Rahmaniya Kethel's Chicken + Falooda Nation • 3.2km apart",
    price: 390,
    savings: 'Save ₹50',
    image: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=500&h=300&fit=crop',
    storesIncluded: ["Rahmaniya Kethel's Chicken", 'Falooda Nation'],
    items: [
      { id: 'm_snack_1', name: 'Kethel Fried Chicken & Chappathi', price: 230, store: "Rahmaniya Kethel's Chicken" },
      { id: 'm_sweet_2', name: 'Royal Falooda with Kulfi', price: 160, store: 'Falooda Nation' }
    ]
  }
];
