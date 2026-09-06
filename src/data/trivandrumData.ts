/* ─── 50 Thiruvananthapuram (Trivandrum) Restaurants & 25 Dishes Each (INR Pricing & Coordinates) ─── */
import { Store, MenuItem } from './catalog';

export interface LocalityCoord {
  name: string;
  lat: number;
  lng: number;
}

// Thiruvananthapuram Locality Coordinates
export const TVM_LOCALITIES: Record<string, { lat: number; lng: number }> = {
  'Palayam': { lat: 8.5029, lng: 76.9537 },
  'Vazhuthacaud': { lat: 8.4984, lng: 76.9632 },
  'Statue': { lat: 8.4965, lng: 76.9515 },
  'Kowdiar': { lat: 8.5241, lng: 76.9628 },
  'Vellayambalam': { lat: 8.5132, lng: 76.9589 },
  'Sasthamangalam': { lat: 8.5109, lng: 76.9744 },
  'Pattom': { lat: 8.5255, lng: 76.9421 },
  'Kesavadasapuram': { lat: 8.5350, lng: 76.9380 },
  'Chalai': { lat: 8.4831, lng: 76.9532 },
  'East Fort': { lat: 8.4842, lng: 76.9480 },
  'Thampanoor': { lat: 8.4880, lng: 76.9525 },
  'Bakery Junction': { lat: 8.5010, lng: 76.9570 },
  'Kuravankonam': { lat: 8.5280, lng: 76.9550 },
  'Ambalamukku': { lat: 8.5320, lng: 76.9650 },
  'Kumarapuram': { lat: 8.5180, lng: 76.9320 },
  'Medical College': { lat: 8.5220, lng: 76.9280 },
  'Pettah': { lat: 8.4950, lng: 76.9320 },
  'Enjakkal': { lat: 8.4820, lng: 76.9340 },
  'Akkulam': { lat: 8.5290, lng: 76.8990 },
  'Lulu Mall': { lat: 8.5285, lng: 76.8995 },
  'Kazhakkoottam': { lat: 8.5686, lng: 76.8731 },
  'Technopark': { lat: 8.5580, lng: 76.8810 },
  'Sankhumugham': { lat: 8.4790, lng: 76.9110 },
  'Kovalam': { lat: 8.3988, lng: 76.9820 }
};

// Haversine distance calculator in Kilometers
export function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Number((R * c).toFixed(1));
}

export function getDistanceBetweenLocalities(loc1: string, loc2: string): number {
  const c1 = TVM_LOCALITIES[loc1] || TVM_LOCALITIES['Palayam'];
  const c2 = TVM_LOCALITIES[loc2] || TVM_LOCALITIES['Palayam'];
  return calculateDistanceKm(c1.lat, c1.lng, c2.lat, c2.lng);
}

// Helper to generate 25 dishes per restaurant in INR
function createDishesForStore(storeId: string, storeName: string, _cuisineType: string, basePriceINR: number, storeLoc: string): MenuItem[] {
  const dishTemplates = [
    { name: 'Malabar Chicken Dum Biriyani', desc: 'Aromatic kaima rice layered with spiced tender chicken, fried onions, and boiled egg.', cat: 'Biriyani', pDiff: 0, diet: 'non-veg', sugar: 'low-sugar' },
    { name: 'Kerala Malabar Porotta (3pcs)', desc: 'Flaky, layered golden wheat porottas grilled on hot tawa with pure ghee.', cat: 'Breads', pDiff: -160, diet: 'veg', sugar: 'sugar-free' },
    { name: 'Nadan Beef Ularthiyathu', desc: 'Slow-roasted beef chunks cooked with crushed peppercorns, coconut slices, and curry leaves.', cat: 'Beef Specials', pDiff: 40, diet: 'non-veg', sugar: 'sugar-free' },
    { name: 'Kozhi Porichathu (Kerala Fried Chicken)', desc: 'Crispy deep-fried chicken marinated in Kashmiri red chili, ginger-garlic, and fennel paste.', cat: 'Chicken Starters', pDiff: 20, diet: 'non-veg', sugar: 'sugar-free' },
    { name: 'Fish Nirvana / Karimeen Pollichathu', desc: 'Pearl spot fish wrapped in banana leaf with rich spiced tomato-onion masala.', cat: 'Seafood', pDiff: 120, diet: 'keto', sugar: 'sugar-free' },
    { name: 'Appam with Mutton Stew', desc: 'Lacy soft fermented rice hoppers served with creamy coconut milk mutton stew.', cat: 'Appam & Stew', pDiff: 60, diet: 'non-veg', sugar: 'low-sugar' },
    { name: 'Puttu with Kadala Curry', desc: 'Steamed cylindrical rice cake layered with grated coconut served with spicy black chickpea gravy.', cat: 'Traditional', pDiff: -120, diet: 'vegan', sugar: 'sugar-free' },
    { name: 'Thalassery Mutton Biriyani', desc: 'Authentic Malabar style dum biriyani with succulent bone-in mutton and ghee flavor.', cat: 'Biriyani', pDiff: 90, diet: 'non-veg', sugar: 'low-sugar' },
    { name: 'Kothu Porotta (Egg & Chicken)', desc: 'Shredded crispy porotta tossed with eggs, spiced chicken salna, onions, and coriander.', cat: 'Street Food', pDiff: -20, diet: 'non-veg', sugar: 'sugar-free' },
    { name: 'Peri-Peri Alfaham Mandi', desc: 'Smoky charcoal grilled whole chicken served over fragrant Yemeni mandi rice with garlic mayo.', cat: 'Arabian Mandi', pDiff: 80, diet: 'high-protein', sugar: 'sugar-free' },
    { name: 'Classic Shawarma Roll (Jumbo)', desc: 'Juicy spiced sliced chicken wrapped in rumali roti with pickled veggies and toum.', cat: 'Rolls & Shawarma', pDiff: -80, diet: 'high-protein', sugar: 'sugar-free' },
    { name: 'Dragon Prawns & Fried Rice Combo', desc: 'Crisp batter-fried tiger prawns tossed in sweet & spicy sauce served with egg fried rice.', cat: 'Indo-Chinese', pDiff: 70, diet: 'non-veg', sugar: 'low-sugar' },
    { name: 'Nadan Kozhi Curry (Home Style)', desc: 'Country style chicken curry with roasted ground spices and thick coconut gravy.', cat: 'Curries', pDiff: 30, diet: 'non-veg', sugar: 'sugar-free' },
    { name: 'Travancore Prawns Roast', desc: 'Fresh coastal prawns simmered with shallots, kudampuli (pot tamarind), and green chilies.', cat: 'Seafood', pDiff: 110, diet: 'keto', sugar: 'sugar-free' },
    { name: 'Paneer Butter Masala', desc: 'Soft cottage cheese cubes in rich satin smooth tomato, butter, and cashew nut gravy.', cat: 'Vegetarian', pDiff: 10, diet: 'veg', sugar: 'low-sugar' },
    { name: 'Malabar Ghee Rice with Dal Fry', desc: 'Fragrant jeerakasala rice tempered with ghee, cashews, and raisins served with yellow dal.', cat: 'Rice Combos', pDiff: -60, diet: 'veg', sugar: 'sugar-free' },
    { name: 'Spicy Chatti Choru Special', desc: 'Traditional earthenware pot filled with rice, fish fry, meen curry, chammanthi, and moru.', cat: 'Meals & Thali', pDiff: 80, diet: 'non-veg', sugar: 'sugar-free' },
    { name: 'Pazham Pori with Beef Roast', desc: 'Iconic Kerala pairing of sweet golden ripe banana fritters with spicy beef roast.', cat: 'Trivandrum Favorites', pDiff: 30, diet: 'non-veg', sugar: 'sweet' },
    { name: 'Crispy Butter Garlic Naan (2pcs)', desc: 'Clay oven baked leavened bread brushed with melted garlic butter and parsley.', cat: 'Breads', pDiff: -130, diet: 'veg', sugar: 'sugar-free' },
    { name: 'Tandoori Chicken Platter (Half)', desc: 'Juicy chicken leg quarters marinated in spiced yogurt and grilled in traditional clay oven.', cat: 'Tandoori', pDiff: 50, diet: 'high-protein', sugar: 'sugar-free' },
    { name: 'Neyyappam & Unniyappam Box (6pcs)', desc: 'Deep-fried sweet rice and jaggery cakes flavored with cardamom, roasted coconut bits.', cat: 'Desserts', pDiff: -110, diet: 'veg', sugar: 'sweet' },
    { name: 'Royal Falooda with Kulfi', desc: 'Layered dessert with basil seeds, rose syrup, vermicelli, rich vanilla gelato, and dry fruits.', cat: 'Beverages & Desserts', pDiff: -50, diet: 'veg', sugar: 'sweet' },
    { name: 'Authentic Malabar Sulaimani Tea', desc: 'Black spiced tea brewed with cardamom, cloves, fresh mint leaves, and a dash of lemon.', cat: 'Hot Beverages', pDiff: -190, diet: 'vegan', sugar: 'sugar-free' },
    { name: 'Tender Coconut Milkshake 500ml', desc: 'Thick creamy shake blended with sweet tender coconut pulp and vanilla ice cream.', cat: 'Beverages', pDiff: -70, diet: 'veg', sugar: 'sweet' },
    { name: 'Trivandrum Filter Coffee (Double Shot)', desc: 'Traditional South Indian freshly brewed chicory blend frothy filter coffee.', cat: 'Hot Beverages', pDiff: -180, diet: 'veg', sugar: 'diabetic-friendly' }
  ];

  return dishTemplates.map((template, idx) => {
    const rawPrice = basePriceINR + template.pDiff + (idx % 4) * 10;
    const finalPrice = Math.max(40, Math.round(rawPrice / 10) * 10);
    return {
      id: `m_${storeId}_${idx + 1}`,
      name: `${template.name}`,
      price: finalPrice,
      desc: template.desc,
      category: template.cat,
      storeName: storeName,
      storeLoc: storeLoc,
      diet: template.diet,
      sugar: template.sugar,
      image: getDishImage(template.cat, idx)
    };
  });
}

function getDishImage(cat: string, idx: number): string {
  const images: Record<string, string[]> = {
    'Biriyani': [
      'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=300&h=300&fit=crop',
      'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=300&h=300&fit=crop'
    ],
    'Breads': [
      'https://images.unsplash.com/photo-1626074353765-517a681e40be?w=300&h=300&fit=crop',
      'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=300&h=300&fit=crop'
    ],
    'Beef Specials': [
      'https://images.unsplash.com/photo-1544025162-d76694265947?w=300&h=300&fit=crop',
      'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=300&h=300&fit=crop'
    ],
    'Chicken Starters': [
      'https://images.unsplash.com/photo-1527477396000-e27163b481c2?w=300&h=300&fit=crop',
      'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=300&h=300&fit=crop'
    ],
    'Seafood': [
      'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=300&h=300&fit=crop',
      'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=300&h=300&fit=crop'
    ],
    'Arabian Mandi': [
      'https://images.unsplash.com/photo-1541518763669-27fef04b14ea?w=300&h=300&fit=crop'
    ],
    'Desserts': [
      'https://images.unsplash.com/photo-1551024601-bec78aea704b?w=300&h=300&fit=crop',
      'https://images.unsplash.com/photo-1560008511-11c63416e52d?w=300&h=300&fit=crop'
    ],
    'Beverages': [
      'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=300&h=300&fit=crop',
      'https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=300&h=300&fit=crop'
    ]
  };

  const pool = images[cat] || [
    'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=300&h=300&fit=crop',
    'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=300&h=300&fit=crop',
    'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=300&h=300&fit=crop'
  ];
  return pool[idx % pool.length];
}

// 50 Thiruvananthapuram Restaurants List with Locality Coordinates & INR Base Price
export const TRIVANDRUM_RESTAURANTS_METADATA = [
  { id: 'tvm_1', name: 'Zam Zam Restaurant', loc: 'Palayam', tag: 'Arabian • Shawarma • Alfaham', rating: 4.9, eta: '15-25 min', fee: 'Free', img: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&h=300&fit=crop', basePrice: 240 },
  { id: 'tvm_2', name: 'Azad Restaurant', loc: 'Vazhuthacaud', tag: 'Mutton Biriyani • Porotta • Grills', rating: 4.85, eta: '18-28 min', fee: 'Free', img: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&h=300&fit=crop', basePrice: 250 },
  { id: 'tvm_3', name: 'Grand Paragon', loc: 'Kesavadasapuram', tag: 'Malabar Cuisine • Fish Mango Curry', rating: 4.95, eta: '20-30 min', fee: '₹30', img: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=600&h=300&fit=crop', basePrice: 280 },
  { id: 'tvm_4', name: 'Villa Maya Heritage', loc: 'Enjakkal', tag: 'Fine Dining • Travancore Seafood', rating: 4.95, eta: '25-35 min', fee: '₹50', img: 'https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?w=600&h=300&fit=crop', basePrice: 380 },
  { id: 'tvm_5', name: 'Mothers Veg Plaza', loc: 'Bakery Junction', tag: 'Grand Kerala Sadhya • Pure Veg', rating: 4.9, eta: '12-22 min', fee: 'Free', img: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&h=300&fit=crop', basePrice: 190 },
  { id: 'tvm_6', name: 'Imperial Kitchen', loc: 'Kowdiar', tag: 'Continental • Tandoori • Biriyani', rating: 4.85, eta: '15-25 min', fee: 'Free', img: 'https://images.unsplash.com/photo-1552566626-52f8b828add9?w=600&h=300&fit=crop', basePrice: 270 },
  { id: 'tvm_7', name: 'Dhe Puttu', loc: 'Akkulam', tag: 'Signature Puttu Varieties • Curries', rating: 4.8, eta: '18-26 min', fee: 'Free', img: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&h=300&fit=crop', basePrice: 220 },
  { id: 'tvm_8', name: 'Buhari Hotel', loc: 'Thampanoor', tag: 'Late Night Porotta • Mutton Fry', rating: 4.75, eta: '12-20 min', fee: 'Free', img: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=600&h=300&fit=crop', basePrice: 210 },
  { id: 'tvm_9', name: "Rahmaniya Kethel's Chicken", loc: 'Chalai', tag: 'Iconic Fried Chicken • Chappathi', rating: 4.9, eta: '15-22 min', fee: 'Free', img: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=600&h=300&fit=crop', basePrice: 230 },
  { id: 'tvm_10', name: 'Supreme Upper Crust', loc: 'Kuravankonam', tag: 'Gourmet Bakery • Pasta • Pastries', rating: 4.9, eta: '10-20 min', fee: 'Free', img: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&h=300&fit=crop', basePrice: 260 },
  { id: 'tvm_11', name: 'Curry Chatty', loc: 'Pattom', tag: 'Earthen Pot Curries • Nadan Seafood', rating: 4.8, eta: '14-24 min', fee: 'Free', img: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=600&h=300&fit=crop', basePrice: 230 },
  { id: 'tvm_12', name: 'Open House Restaurant', loc: 'Statue', tag: 'Chilli Chicken • Fried Rice • Grills', rating: 4.7, eta: '12-20 min', fee: 'Free', img: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&h=300&fit=crop', basePrice: 200 },
  { id: 'tvm_13', name: 'Le Arabia', loc: 'Kazhakkoottam', tag: 'Arabian Shawarma • Grill Platters', rating: 4.85, eta: '15-25 min', fee: 'Free', img: 'https://images.unsplash.com/photo-1541518763669-27fef04b14ea?w=600&h=300&fit=crop', basePrice: 250 },
  { id: 'tvm_14', name: 'Halais Dum Biriyani', loc: 'Kazhakkoottam', tag: 'Khyber Biriyani • Tandoori', rating: 4.8, eta: '16-26 min', fee: 'Free', img: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&h=300&fit=crop', basePrice: 240 },
  { id: 'tvm_15', name: "Ambiswamy's Vegetarian", loc: 'Statue', tag: 'Crispy Ghee Roast • South Meals', rating: 4.75, eta: '10-18 min', fee: 'Free', img: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&h=300&fit=crop', basePrice: 160 },
  { id: 'tvm_16', name: "Paul's Creamery", loc: 'Kuravankonam', tag: 'Artisanal Ice Creams • Waffles', rating: 4.95, eta: '10-18 min', fee: 'Free', img: 'https://images.unsplash.com/photo-1560008511-11c63416e52d?w=600&h=300&fit=crop', basePrice: 190 },
  { id: 'tvm_17', name: 'Trivandrum Donut House', loc: 'Vazhuthacaud', tag: 'Glazed Gourmet Donuts • Shakes', rating: 4.85, eta: '10-18 min', fee: 'Free', img: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?w=600&h=300&fit=crop', basePrice: 150 },
  { id: 'tvm_18', name: 'Oriental Spice', loc: 'Kowdiar', tag: 'Pan-Asian • Dimsums • Thai Curry', rating: 4.8, eta: '18-28 min', fee: '₹30', img: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=600&h=300&fit=crop', basePrice: 290 },
  { id: 'tvm_19', name: 'Pankayam Restaurant', loc: 'Vazhuthacaud', tag: 'Thalassery Specialties • Prawns Roast', rating: 4.8, eta: '16-24 min', fee: 'Free', img: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=600&h=300&fit=crop', basePrice: 260 },
  { id: 'tvm_20', name: 'Saravana Bhavan', loc: 'Thampanoor', tag: 'Filter Coffee • Podi Dosa • Idli', rating: 4.8, eta: '10-18 min', fee: 'Free', img: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&h=300&fit=crop', basePrice: 140 },
  { id: 'tvm_21', name: 'Thakkaram', loc: 'Kazhakkoottam', tag: 'Nostalgic Malabar Delicacies', rating: 4.75, eta: '15-25 min', fee: 'Free', img: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=600&h=300&fit=crop', basePrice: 230 },
  { id: 'tvm_22', name: 'Indian Coffee House', loc: 'Thampanoor', tag: 'Beetroot Cutlet • Filter Coffee', rating: 4.7, eta: '10-18 min', fee: 'Free', img: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&h=300&fit=crop', basePrice: 120 },
  { id: 'tvm_23', name: 'TBX - The Burger X', loc: 'Sasthamangalam', tag: 'Smashed Beef & Crispy Chicken Burgers', rating: 4.9, eta: '14-22 min', fee: 'Free', img: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&h=300&fit=crop', basePrice: 220 },
  { id: 'tvm_24', name: 'Chicking Lulu Mall', loc: 'Lulu Mall', tag: 'Fried Chicken • Crunchy Burgers', rating: 4.75, eta: '16-26 min', fee: 'Free', img: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=600&h=300&fit=crop', basePrice: 210 },
  { id: 'tvm_25', name: 'Square One Homemade', loc: 'Vellayambalam', tag: 'Cakes • Pastas • Quiches', rating: 4.85, eta: '12-20 min', fee: 'Free', img: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=600&h=300&fit=crop', basePrice: 180 },
  { id: 'tvm_26', name: 'Cherries & Berries', loc: 'Kuravankonam', tag: 'Dessert Parlour • Waffle Pops', rating: 4.8, eta: '10-18 min', fee: 'Free', img: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?w=600&h=300&fit=crop', basePrice: 170 },
  { id: 'tvm_27', name: 'French Baguette', loc: 'Kowdiar', tag: 'Croissants • Sourdough Sandwiches', rating: 4.9, eta: '12-20 min', fee: 'Free', img: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&h=300&fit=crop', basePrice: 210 },
  { id: 'tvm_28', name: 'Ariya Nivaas', loc: 'Thampanoor', tag: 'Traditional Veg Thali • Ghee Dosa', rating: 4.75, eta: '10-18 min', fee: 'Free', img: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&h=300&fit=crop', basePrice: 140 },
  { id: 'tvm_29', name: 'Hotel Arul Jyothi', loc: 'Statue', tag: 'Rava Dosa • South Indian Breakfast', rating: 4.7, eta: '10-18 min', fee: 'Free', img: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&h=300&fit=crop', basePrice: 130 },
  { id: 'tvm_30', name: 'Pathayam Organic', loc: 'Statue', tag: 'Healthy Organic Grain Bowls • Herbal Teas', rating: 4.85, eta: '14-22 min', fee: 'Free', img: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=300&h=300&fit=crop', basePrice: 180 },
  { id: 'tvm_31', name: 'Steampot Kitchen', loc: 'Technopark', tag: 'Express Meals • Rice Combos', rating: 4.75, eta: '10-16 min', fee: 'Free', img: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&h=300&fit=crop', basePrice: 160 },
  { id: 'tvm_32', name: 'Swaad Pure Veg', loc: 'Pattom', tag: 'North & South Indian Delicacies', rating: 4.75, eta: '12-20 min', fee: 'Free', img: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&h=300&fit=crop', basePrice: 170 },
  { id: 'tvm_33', name: 'Garden Grille - Hilton', loc: 'Statue', tag: 'Luxury Continental & Seafood', rating: 4.95, eta: '25-35 min', fee: '₹60', img: 'https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?w=600&h=300&fit=crop', basePrice: 420 },
  { id: 'tvm_34', name: 'The Gourmet House', loc: 'Vazhuthacaud', tag: 'Steaks • Gourmet Pizza • Salads', rating: 4.85, eta: '18-28 min', fee: '₹30', img: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&h=300&fit=crop', basePrice: 320 },
  { id: 'tvm_35', name: 'Biverah Hotel & Suites', loc: 'Kumarapuram', tag: 'Multi-Cuisine Buffet • Biriyani', rating: 4.8, eta: '15-25 min', fee: 'Free', img: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&h=300&fit=crop', basePrice: 260 },
  { id: 'tvm_36', name: 'Feast - Sheraton Grand', loc: 'Kazhakkoottam', tag: 'Artisanal Global Buffet', rating: 4.95, eta: '22-32 min', fee: '₹50', img: 'https://images.unsplash.com/photo-1552566626-52f8b828add9?w=600&h=300&fit=crop', basePrice: 450 },
  { id: 'tvm_37', name: 'The Yellow Chilli', loc: 'Lulu Mall', tag: "Sanjeev Kapoor's Indian Bistro", rating: 4.85, eta: '18-28 min', fee: '₹30', img: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=600&h=300&fit=crop', basePrice: 310 },
  { id: 'tvm_38', name: 'Cafe Sarwaa', loc: 'Sankhumugham', tag: 'Beachside Cafe • Coffee & Pasta', rating: 4.8, eta: '16-26 min', fee: 'Free', img: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&h=300&fit=crop', basePrice: 200 },
  { id: 'tvm_39', name: "Eve's Coffee", loc: 'Pettah', tag: 'Specialty Pour-Overs • Cold Brews', rating: 4.9, eta: '10-18 min', fee: 'Free', img: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=600&h=300&fit=crop', basePrice: 170 },
  { id: 'tvm_40', name: 'Bait - Taj Kovalam', loc: 'Kovalam', tag: 'Coastal Grilled Seafood Catch', rating: 4.95, eta: '28-38 min', fee: '₹80', img: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=600&h=300&fit=crop', basePrice: 490 },
  { id: 'tvm_41', name: 'Jasmine Bay - Taj Cove', loc: 'Kovalam', tag: 'All Day Coastal Fusion', rating: 4.9, eta: '28-38 min', fee: '₹80', img: 'https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?w=600&h=300&fit=crop', basePrice: 460 },
  { id: 'tvm_42', name: 'Barbeque Nation', loc: 'Lulu Mall', tag: 'Live Grills • Kebab Skewers', rating: 4.85, eta: '20-30 min', fee: '₹30', img: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=600&h=300&fit=crop', basePrice: 340 },
  { id: 'tvm_43', name: 'Roast Town', loc: 'Kowdiar', tag: 'Charcoal Smoked Meats & Steaks', rating: 4.8, eta: '15-25 min', fee: 'Free', img: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600&h=300&fit=crop', basePrice: 280 },
  { id: 'tvm_44', name: 'Olive Restaurant', loc: 'Pattom', tag: 'Middle Eastern Mezze & Grills', rating: 4.75, eta: '14-22 min', fee: 'Free', img: 'https://images.unsplash.com/photo-1541518763669-27fef04b14ea?w=600&h=300&fit=crop', basePrice: 240 },
  { id: 'tvm_45', name: 'Paragon Express', loc: 'Lulu Mall', tag: 'Biriyani Bowls & Porotta Combos', rating: 4.85, eta: '14-22 min', fee: 'Free', img: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&h=300&fit=crop', basePrice: 240 },
  { id: 'tvm_46', name: 'Kebab Street', loc: 'Ambalamukku', tag: 'Sheekh Kebabs • Tikkas • Naan', rating: 4.75, eta: '12-20 min', fee: 'Free', img: 'https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=600&h=300&fit=crop', basePrice: 200 },
  { id: 'tvm_47', name: 'Charcoal Shack', loc: 'Kazhakkoottam', tag: 'Barbecue Wings • Charcoal Burgers', rating: 4.8, eta: '14-22 min', fee: 'Free', img: 'https://images.unsplash.com/photo-1527477396000-e27163b481c2?w=600&h=300&fit=crop', basePrice: 220 },
  { id: 'tvm_48', name: 'Sree Krishna Marry Cafe', loc: 'Chalai', tag: 'Hot Vada • Pazham Pori • Kaapi', rating: 4.7, eta: '8-15 min', fee: 'Free', img: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&h=300&fit=crop', basePrice: 90 },
  { id: 'tvm_49', name: 'Falooda Nation', loc: 'Kuravankonam', tag: 'Jumbo Royal Faloodas & Kulfi', rating: 4.9, eta: '10-18 min', fee: 'Free', img: 'https://images.unsplash.com/photo-1560008511-11c63416e52d?w=600&h=300&fit=crop', basePrice: 160 },
  { id: 'tvm_50', name: 'Venkitachalapathy Coffee', loc: 'Chalai', tag: 'South Indian Filter Kaapi & Snacks', rating: 4.85, eta: '8-15 min', fee: 'Free', img: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=600&h=300&fit=crop', basePrice: 90 }
];

const DISCOUNT_TAG_POOL = [
  '70% OFF UPTO ₹140',
  'FLAT ₹50 OFF',
  '60% OFF UPTO ₹120',
  '50% OFF UPTO ₹100',
  'ITEMS AT ₹99',
  'FREE DELIVERY'
];

const GOURMET_STORES = ['tvm_3', 'tvm_4', 'tvm_6', 'tvm_10', 'tvm_18', 'tvm_33', 'tvm_36', 'tvm_40', 'tvm_41'];

export const TRIVANDRUM_FOOD_STORES: Store[] = TRIVANDRUM_RESTAURANTS_METADATA.map((r, idx) => ({
  id: r.id,
  name: r.name,
  locality: r.loc,
  categoryTag: `${r.loc} • ${r.tag}`,
  rating: r.rating,
  reviewCount: `${(1.2 + (idx % 7) * 0.4).toFixed(1)}K+`,
  eta: r.eta,
  deliveryFee: r.fee,
  discountTag: DISCOUNT_TAG_POOL[idx % DISCOUNT_TAG_POOL.length],
  isGourmet: GOURMET_STORES.includes(r.id),
  hasOneBenefit: true,
  image: r.img,
  categoryId: 'food',
  lat: (TVM_LOCALITIES[r.loc] || TVM_LOCALITIES['Palayam']).lat,
  lng: (TVM_LOCALITIES[r.loc] || TVM_LOCALITIES['Palayam']).lng
}));

export const TRIVANDRUM_FOOD_MENU_ITEMS: Record<string, MenuItem[]> = {};

TRIVANDRUM_RESTAURANTS_METADATA.forEach((r) => {
  TRIVANDRUM_FOOD_MENU_ITEMS[r.id] = createDishesForStore(r.id, r.name, r.tag, r.basePrice, r.loc);
});

// All 1,250 dishes flat array for search and category aggregation
export const ALL_TRIVANDRUM_FOOD_DISHES: MenuItem[] = Object.values(TRIVANDRUM_FOOD_MENU_ITEMS).flat();
