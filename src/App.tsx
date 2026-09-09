import React, { useState, useEffect, useRef, useMemo } from 'react';
import confetti from 'canvas-confetti';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Utensils,
  ShoppingBag,
  Pill,
  Search,
  MapPin,
  SlidersHorizontal,
  ChevronLeft,
  ArrowRight,
  CheckCircle2,
  Clock,
  Home,
  Compass,
  ClipboardList,
  User,
  RotateCcw,
  X,
  Plus,
  Minus,
  Star,
  Truck,
  Sparkles,
  PhoneCall,
  FastForward,
  Award,
  CreditCard,
  Bell,
  HelpCircle,
  ShoppingBasket,
  Zap,
  ChevronRight,
  AlertTriangle,
  Flame,
  Check,
  Percent,
  Heart
} from 'lucide-react';

import { CATEGORY_THEMES, CategoryTheme } from './theme/colors';
import {
  STORES_BY_CATEGORY,
  MENU_ITEMS_BY_CATEGORY,
  MULTI_STORE_BUNDLES,
  DIET_ITEMS,
  CRAVINGS_ITEMS,
  CUISINE_COLLECTIONS,
  SWIGGY_MIND_DISHES,
  Store,
  MenuItem,
  MultiStoreBundle,
  TRIVANDRUM_FOOD_MENU_ITEMS,
  ALL_TRIVANDRUM_FOOD_DISHES,
  TVM_LOCALITIES,
  getDistanceBetweenLocalities,
  calculateDistanceKm
} from './data/catalog';

type ScreenType = 'home' | 'discover' | 'stores' | 'menu' | 'cart' | 'tracker' | 'profile' | 'multiorder';

export interface SpinReward {
  code: string;
  title: string;
  desc: string;
  discountPercent?: number;
  discountAmount?: number;
  color: string;
}

const SPIN_WHEEL_REWARDS: SpinReward[] = [
  { code: 'SPIN25', title: 'FLAT 25% OFF', desc: 'Get 25% off on your entire food order!', discountPercent: 25, color: '#DC2626' },
  { code: 'FREEDEL', title: 'FREE DELIVERY', desc: 'Zero delivery charges on your current order!', discountAmount: 40, color: '#059669' },
  { code: 'SAVE100', title: 'FLAT ₹100 OFF', desc: 'Flat ₹100 instant discount on orders above ₹299!', discountAmount: 100, color: '#7C3AED' },
  { code: 'FREEDESSERT', title: 'FREE DESSERT', desc: 'Free Neyyappam or Gelato with your next order!', discountAmount: 50, color: '#DB2777' },
  { code: 'SPIN30', title: '30% OFF COMBOS', desc: '30% off on all Multi-Store & Gourmet combos!', discountPercent: 30, color: '#2563EB' },
  { code: 'GOLDSPIN', title: '1-MO GOLD FREE', desc: 'Free 4Kit Gold membership with zero delivery fees!', discountAmount: 75, color: '#D97706' }
];

const BUBBLE_CATEGORIES = [
  { id: 'food', name: 'Food', icon: Utensils, theme: CATEGORY_THEMES.food },
  { id: 'supermarket', name: 'Groceries', icon: ShoppingBag, theme: CATEGORY_THEMES.supermarket },
  { id: 'pharmacy', name: 'Pharmacy', icon: Pill, theme: CATEGORY_THEMES.pharmacy }
];

const SAMPLE_SEARCHES = ['Biriyani', 'Porotta', 'Fish Nirvana', 'Alfaham', 'Beef', 'Puttu', 'Dosa'];

const TVM_AREAS = [
  'Palayam',
  'Vazhuthacaud',
  'Statue',
  'Kowdiar',
  'Vellayambalam',
  'Sasthamangalam',
  'Pattom',
  'Kesavadasapuram',
  'Chalai',
  'Thampanoor',
  'Kuravankonam',
  'Kazhakkoottam',
  'Lulu Mall',
  'Kovalam'
];

export default function App() {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [currentScreen, setCurrentScreen] = useState<ScreenType>('home');
  const [activeCategory, setActiveCategory] = useState<string>('food');
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [placeholderIndex, setPlaceholderIndex] = useState<number>(0);
  const [favorites, setFavorites] = useState<string[]>(['tvm_1', 'tvm_3']);
  
  // User Selected Delivery Location in Trivandrum
  const [userLocation, setUserLocation] = useState<string>('Palayam');
  const [showLocationModal, setShowLocationModal] = useState<boolean>(false);

  // Cart with Max 10 items limit for multi-store express
  const [cartItems, setCartItems] = useState<{ id: string; name: string; price: number; qty: number; sauce?: string; store?: string }[]>([
    { id: 'm_tvm_1_1', name: 'Malabar Chicken Dum Biriyani', price: 240, qty: 1, sauce: 'Zam Zam', store: 'Zam Zam Restaurant' }
  ]);
  const [selectedDish, setSelectedDish] = useState<MenuItem | null>(null);
  const [selectedSauce, setSelectedSauce] = useState<string>('Standard');
  const [showOrderSuccessModal, setShowOrderSuccessModal] = useState<boolean>(false);
  const [isVideoPlaying, setIsVideoPlaying] = useState<boolean>(false);
  const [videoFinished, setVideoFinished] = useState<boolean>(false);
  const [limitWarning, setLimitWarning] = useState<string | null>(null);
  
  // Universal Multi-Tab Filters (Location, Price, Diet, Sugar)
  const [showFilterModal, setShowFilterModal] = useState<boolean>(false);
  const [filterRating48, setFilterRating48] = useState<boolean>(false);
  const [filterFreeDelivery, setFilterFreeDelivery] = useState<boolean>(false);
  const [filterFastETA, setFilterFastETA] = useState<boolean>(false);
  const [filterLocality, setFilterLocality] = useState<string>('All');
  const [filterMaxDistKm, setFilterMaxDistKm] = useState<number>(15); // max distance in km
  const [filterPriceRange, setFilterPriceRange] = useState<string>('All'); // 'All' | 'under150' | '150-300' | '300-500' | 'above500'
  const [filterDiet, setFilterDiet] = useState<string>('All'); // 'All' | 'veg' | 'non-veg' | 'vegan' | 'keto' | 'high-protein'
  const [filterSugar, setFilterSugar] = useState<string>('All'); // 'All' | 'sugar-free' | 'low-sugar' | 'sweet' | 'diabetic-friendly'
  const [sortBy, setSortBy] = useState<'default' | 'rating' | 'eta' | 'price_low' | 'price_high' | 'dist'>('default');

  // Multi-Store Order Builder State (Within 5km constraint & scoped to category)
  const [showCustomStoreBuilder, setShowCustomStoreBuilder] = useState<boolean>(false);
  const [customStore1, setCustomStore1] = useState<string>('Zam Zam Restaurant');
  const [customStore2, setCustomStore2] = useState<string>('Azad Restaurant');

  // Gamification & Spin Wheel State
  const [showSpinWheelModal, setShowSpinWheelModal] = useState<boolean>(false);
  const [isSpinning, setIsSpinning] = useState<boolean>(false);
  const [wheelRotation, setWheelRotation] = useState<number>(0);
  const [wonReward, setWonReward] = useState<SpinReward | null>(null);
  const [appliedCoupon, setAppliedCoupon] = useState<SpinReward | null>(null);

  // Cravings Roulette State
  const [rouletteMood, setRouletteMood] = useState<string | null>(null);
  const [rouletteDish, setRouletteDish] = useState<MenuItem | null>(null);
  const [isRouletteSpinning, setIsRouletteSpinning] = useState<boolean>(false);

  // Discover Screen Budget Filter State
  const [discoverMaxPrice, setDiscoverMaxPrice] = useState<number>(99);
  const [discoverVegOnly, setDiscoverVegOnly] = useState<boolean>(false);
  const [discoverTopRated, setDiscoverTopRated] = useState<boolean>(false);

  const triggerSpinWheel = () => {
    if (isSpinning) return;
    setIsSpinning(true);
    setWonReward(null);

    const randomIndex = Math.floor(Math.random() * SPIN_WHEEL_REWARDS.length);
    const sliceAngle = 360 / SPIN_WHEEL_REWARDS.length;
    const extraRotations = 1800;
    const targetSliceCenter = randomIndex * sliceAngle + sliceAngle / 2;
    const finalDegree = wheelRotation + extraRotations + (360 - (wheelRotation % 360) - targetSliceCenter);

    setWheelRotation(finalDegree);

    setTimeout(() => {
      setIsSpinning(false);
      const reward = SPIN_WHEEL_REWARDS[randomIndex];
      setWonReward(reward);
      try {
        confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
      } catch (e) {}
    }, 3600);
  };

  const triggerCravingsRoulette = (moodTag: string) => {
    setRouletteMood(moodTag);
    setIsRouletteSpinning(true);
    setRouletteDish(null);

    let candidates = ALL_TRIVANDRUM_FOOD_DISHES;
    if (moodTag === 'spicy') {
      candidates = ALL_TRIVANDRUM_FOOD_DISHES.filter((d) => d.name.toLowerCase().includes('biriyani') || d.name.toLowerCase().includes('beef') || d.name.toLowerCase().includes('alfaham'));
    } else if (moodTag === 'snack') {
      candidates = ALL_TRIVANDRUM_FOOD_DISHES.filter((d) => d.price <= 99 || d.category === 'Breads' || d.category === 'Street Food');
    } else if (moodTag === 'sweet') {
      candidates = ALL_TRIVANDRUM_FOOD_DISHES.filter((d) => d.sugar === 'sweet' || d.category.includes('Dessert') || d.category.includes('Beverage'));
    }

    if (candidates.length === 0) candidates = ALL_TRIVANDRUM_FOOD_DISHES;
    const picked = candidates[Math.floor(Math.random() * candidates.length)];

    setTimeout(() => {
      setIsRouletteSpinning(false);
      setRouletteDish(picked);
    }, 1000);
  };

  const videoRef = useRef<HTMLVideoElement | null>(null);

  const activeTheme: CategoryTheme = CATEGORY_THEMES[activeCategory] || CATEGORY_THEMES.food;
  const currentStores: Store[] = STORES_BY_CATEGORY[activeCategory] || STORES_BY_CATEGORY.food;

  const categoryPlaceholders = useMemo(() => {
    if (activeCategory === 'supermarket') {
      return ["Search for 'Organic Milk'", "Search for 'Avocados'", "Search for 'Fresh Eggs'", "Search for 'Sourdough'"];
    }
    if (activeCategory === 'pharmacy') {
      return ["Search for 'Vitamin C'", "Search for 'Chamomile Tea'", "Search for 'First Aid'", "Search for 'Electrolytes'"];
    }
    return ["Search for 'Biriyani'", "Search for 'Porotta'", "Search for 'Shawarma'", "Search for 'Fish Nirvana'", "Search for 'Alfaham'"];
  }, [activeCategory]);

  // Rotating placeholder animation
  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % categoryPlaceholders.length);
    }, 2500);
    return () => clearInterval(interval);
  }, [categoryPlaceholders]);

  const toggleFavorite = (storeId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setFavorites((prev) =>
      prev.includes(storeId) ? prev.filter((id) => id !== storeId) : [...prev, storeId]
    );
  };

  // Compute store distances from user location
  const storesWithDistance = useMemo(() => {
    return currentStores.map((st) => {
      const stLoc = st.locality || (st.categoryTag.split('•')[0].trim());
      const dist = getDistanceBetweenLocalities(userLocation, stLoc);
      return { ...st, distKm: dist };
    });
  }, [currentStores, userLocation]);

  // Primary store for multi-store 5km calculation
  const store1Obj = useMemo(() => {
    return currentStores.find((s) => s.name === customStore1) || currentStores[0];
  }, [currentStores, customStore1]);

  const store1Locality = store1Obj?.locality || (store1Obj?.categoryTag?.split('•')[0]?.trim()) || 'Palayam';

  // Stores available within 5km of Store 1
  const storesWithin5kmOfStore1 = useMemo(() => {
    return currentStores.map((st) => {
      const stLoc = st.locality || (st.categoryTag.split('•')[0].trim());
      const dist = getDistanceBetweenLocalities(store1Locality, stLoc);
      return { ...st, distFromStore1: dist };
    });
  }, [currentStores, store1Locality]);

  const validStore2Options = useMemo(() => {
    return storesWithin5kmOfStore1.filter((s) => s.name !== customStore1 && s.distFromStore1 <= 5.0);
  }, [storesWithin5kmOfStore1, customStore1]);

  // Selected Store 2 distance
  const currentStore2Distance = useMemo(() => {
    const found = storesWithin5kmOfStore1.find((s) => s.name === customStore2);
    return found ? found.distFromStore1 : 0;
  }, [storesWithin5kmOfStore1, customStore2]);

  // Filtered Stores calculation
  const filteredStores = useMemo(() => {
    return storesWithDistance.filter((store) => {
      if (filterRating48 && store.rating < 4.8) return false;
      if (filterFreeDelivery && store.deliveryFee !== 'Free') return false;
      if (filterFastETA) {
        const num = parseInt(store.eta, 10);
        if (!isNaN(num) && num > 15) return false;
      }
      if (filterLocality !== 'All' && !(store.locality || store.categoryTag).toLowerCase().includes(filterLocality.toLowerCase())) {
        return false;
      }
      if (store.distKm > filterMaxDistKm) return false;
      return true;
    }).sort((a, b) => {
      if (sortBy === 'rating') return b.rating - a.rating;
      if (sortBy === 'eta') return parseInt(a.eta, 10) - parseInt(b.eta, 10);
      if (sortBy === 'dist') return a.distKm - b.distKm;
      return 0;
    });
  }, [storesWithDistance, filterRating48, filterFreeDelivery, filterFastETA, filterLocality, filterMaxDistKm, sortBy]);

  // Active filter count
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filterRating48) count++;
    if (filterFreeDelivery) count++;
    if (filterFastETA) count++;
    if (filterLocality !== 'All') count++;
    if (filterMaxDistKm < 15) count++;
    if (filterPriceRange !== 'All') count++;
    if (filterDiet !== 'All') count++;
    if (filterSugar !== 'All') count++;
    if (sortBy !== 'default') count++;
    return count;
  }, [filterRating48, filterFreeDelivery, filterFastETA, filterLocality, filterMaxDistKm, filterPriceRange, filterDiet, filterSugar, sortBy]);

  const resetAllFilters = () => {
    setFilterRating48(false);
    setFilterFreeDelivery(false);
    setFilterFastETA(false);
    setFilterLocality('All');
    setFilterMaxDistKm(15);
    setFilterPriceRange('All');
    setFilterDiet('All');
    setFilterSugar('All');
    setSortBy('default');
  };

  // Filter dishes by diet, sugar, price, search
  const currentStoreDishes: MenuItem[] = useMemo(() => {
    const baseDishes = (selectedStore && TRIVANDRUM_FOOD_MENU_ITEMS[selectedStore.id])
      ? TRIVANDRUM_FOOD_MENU_ITEMS[selectedStore.id]
      : (MENU_ITEMS_BY_CATEGORY[activeCategory] || ALL_TRIVANDRUM_FOOD_DISHES);

    return baseDishes.filter((dish) => {
      if (filterDiet !== 'All' && dish.diet !== filterDiet) return false;
      if (filterSugar !== 'All' && dish.sugar !== filterSugar) return false;
      if (filterPriceRange === 'under150' && dish.price >= 150) return false;
      if (filterPriceRange === '150-300' && (dish.price < 150 || dish.price > 300)) return false;
      if (filterPriceRange === '300-500' && (dish.price < 300 || dish.price > 500)) return false;
      if (filterPriceRange === 'above500' && dish.price <= 500) return false;
      return true;
    }).sort((a, b) => {
      if (sortBy === 'price_low') return a.price - b.price;
      if (sortBy === 'price_high') return b.price - a.price;
      return 0;
    });
  }, [selectedStore, activeCategory, filterDiet, filterSugar, filterPriceRange, sortBy]);

  const totalCartCount = useMemo(() => {
    return cartItems.reduce((acc, i) => acc + i.qty, 0);
  }, [cartItems]);

  const cartSubtotal = useMemo(() => {
    return cartItems.reduce((acc, i) => acc + i.price * i.qty, 0);
  }, [cartItems]);

  // Unique stores in cart for multi-store delivery fee calculation
  const distinctStoresInCart = useMemo(() => {
    const stores = new Set(cartItems.map((i) => i.store || i.sauce || 'Main Merchant'));
    return stores.size;
  }, [cartItems]);

  // Delivery charge calculation: Increases as customer adds merchants and items
  const dynamicDeliveryFee = useMemo(() => {
    if (cartItems.length === 0) return 0;
    let base = 0; // free base for gold promo or ₹30 standard
    if (distinctStoresInCart > 1) {
      base += (distinctStoresInCart - 1) * 25; // +₹25 per extra pickup store
    }
    // Surcharge if > 4 items (+₹5 per extra heavy item)
    if (totalCartCount > 4) {
      base += (totalCartCount - 4) * 5;
    }
    return base;
  }, [distinctStoresInCart, totalCartCount, cartItems.length]);

  const finalCartTotal = cartSubtotal + dynamicDeliveryFee;

  const canGoBack = currentScreen !== 'home' || searchQuery.trim() !== '';

  const handleGoBack = () => {
    if (searchQuery.trim() !== '') {
      setSearchQuery('');
      return;
    }
    if (currentScreen === 'menu') {
      setCurrentScreen('stores');
    } else {
      setCurrentScreen('home');
    }
  };

  const getItemQty = (id: string) => {
    const found = cartItems.find((x) => x.id === id);
    return found ? found.qty : 0;
  };

  const updateItemQty = (item: MenuItem, delta: number) => {
    if (delta > 0 && totalCartCount >= 10) {
      setLimitWarning('Maximum 10 items limit reached for express delivery.');
      setTimeout(() => setLimitWarning(null), 3500);
      return;
    }

    setCartItems((prev) => {
      const idx = prev.findIndex((x) => x.id === item.id);
      if (idx === -1) {
        if (delta > 0) {
          return [
            ...prev,
            {
              id: item.id,
              name: item.name,
              price: item.price,
              qty: 1,
              sauce: selectedSauce,
              store: item.storeName || (selectedStore ? selectedStore.name : '4Kit Store')
            }
          ];
        }
        return prev;
      }
      const next = [...prev];
      const newQty = next[idx].qty + delta;
      if (newQty <= 0) return next.filter((x) => x.id !== item.id);
      next[idx].qty = newQty;
      return next;
    });
  };

  const addModalItemToCart = () => {
    if (!selectedDish) return;
    updateItemQty(selectedDish, 1);
    setSelectedDish(null);
  };

  const addBundleToCart = (bundle: MultiStoreBundle) => {
    if (totalCartCount + bundle.items.length > 10) {
      setLimitWarning('Adding this bundle exceeds the 10 item express limit.');
      setTimeout(() => setLimitWarning(null), 3500);
      return;
    }
    const newItems = bundle.items.map((bi) => ({
      id: `${bi.id}_${Date.now()}`,
      name: bi.name,
      price: bi.price,
      qty: 1,
      sauce: bi.store,
      store: bi.store
    }));
    setCartItems((prev) => [...prev, ...newItems]);
    setCurrentScreen('cart');
  };

  const addCustomMultiStoreOrder = () => {
    if (totalCartCount + 2 > 10) {
      setLimitWarning('Maximum 10 items limit reached.');
      setTimeout(() => setLimitWarning(null), 3500);
      return;
    }

    const dish1 = ALL_TRIVANDRUM_FOOD_DISHES.find((d) => d.storeName === customStore1) || ALL_TRIVANDRUM_FOOD_DISHES[0];
    const dish2 = ALL_TRIVANDRUM_FOOD_DISHES.find((d) => d.storeName === customStore2) || ALL_TRIVANDRUM_FOOD_DISHES[1];

    setCartItems((prev) => [
      ...prev,
      { id: `c_item_1_${Date.now()}`, name: dish1.name, price: dish1.price, qty: 1, sauce: customStore1, store: customStore1 },
      { id: `c_item_2_${Date.now()}`, name: dish2.name, price: dish2.price, qty: 1, sauce: customStore2, store: customStore2 }
    ]);
    setShowCustomStoreBuilder(false);
    setCurrentScreen('cart');
  };

  const handleConfirmOrder = () => {
    setShowOrderSuccessModal(true);
    setIsVideoPlaying(true);
    setVideoFinished(false);
  };

  const handleVideoEnd = () => {
    setIsVideoPlaying(false);
    setVideoFinished(true);
    try {
      confetti({ particleCount: 220, spread: 120, origin: { y: 0.5 } });
    } catch (_) {}
  };

  const skipVideo = () => {
    handleVideoEnd();
  };

  const proceedToTracker = () => {
    setShowOrderSuccessModal(false);
    setIsVideoPlaying(false);
    setVideoFinished(false);
    setCurrentScreen('tracker');
  };

  const selectCategory = (catId: string) => {
    setActiveCategory(catId);
    setCurrentScreen('stores');
  };

  // Category promotional specials banners tailored in 4Kit colors
  const categorySpecials = useMemo(() => {
    if (activeCategory === 'supermarket') {
      return [
        {
          id: 'spec_groc_1',
          title: 'Fresh Farm Specials',
          subtitle: 'Up to 40% OFF Daily Groceries & Fruits',
          bg: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
          cta: 'SHOP FRESH',
          image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=320&h=220&fit=crop'
        },
        {
          id: 'spec_groc_2',
          title: 'Dairy & Breads Fast',
          subtitle: 'Farm Milk & Sourdough in 15 mins',
          bg: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
          cta: 'ORDER NOW',
          image: 'https://images.unsplash.com/photo-1528751014936-863e6e7a319c?w=320&h=220&fit=crop'
        }
      ];
    }
    if (activeCategory === 'pharmacy') {
      return [
        {
          id: 'spec_pharm_1',
          title: 'Health & Wellness Specials',
          subtitle: 'Up to 50% OFF Vitamins & Supplements',
          bg: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
          cta: 'ORDER MEDS',
          image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=320&h=220&fit=crop'
        },
        {
          id: 'spec_pharm_2',
          title: '24/7 First Aid Express',
          subtitle: 'Delivered in 10 mins to your doorstep',
          bg: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)',
          cta: 'EXPLORE',
          image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=320&h=220&fit=crop'
        }
      ];
    }
    return [
      {
        id: 'spec_food_1',
        title: 'Dinner & Chef Specials',
        subtitle: 'Up to 60% OFF Top Trivandrum Kitchens',
        bg: 'linear-gradient(135deg, #DC2626 0%, #991B1B 100%)',
        cta: 'ORDER NOW',
        image: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=320&h=220&fit=crop'
      },
      {
        id: 'spec_food_2',
        title: 'Malabar Dum Biriyani Feast',
        subtitle: 'FLAT ₹50 OFF + Free Delivery',
        bg: 'linear-gradient(135deg, #EF4444 0%, #B91C1C 100%)',
        cta: 'GRAB DEAL',
        image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=320&h=220&fit=crop'
      },
      {
        id: 'spec_food_3',
        title: 'Multi-Store Express',
        subtitle: 'Combine 2 Stores in 1 Order (5km Radius)',
        bg: 'linear-gradient(135deg, #7C3AED 0%, #4F46E5 100%)',
        cta: 'BUILD BUNDLE',
        image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=320&h=220&fit=crop'
      }
    ];
  }, [activeCategory]);

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--active-primary', activeTheme.primary);
    root.style.setProperty('--active-dark', activeTheme.dark);
    root.style.setProperty('--active-gradient', activeTheme.gradient);
    root.style.setProperty('--active-glow', activeTheme.glow);
    root.style.setProperty('--active-light-bg', activeTheme.lightBg);
  }, [activeCategory, activeTheme]);

  const splashVideoRef = useRef<HTMLVideoElement | null>(null);

  const finishSplash = () => {
    setIsLoading(false);
  };

  useEffect(() => {
    if (isLoading) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isLoading]);

  return (
    <div className="app-container">
      {/* ─── 4KIT CINEMATIC VIDEO LOGO SPLASH SCREEN (MUTED / NO SOUND) ─── */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.06, filter: 'blur(8px)' }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="kit4-splash-screen"
            onClick={finishSplash}
          >
            <div className="splash-video-wrapper">
              <video
                ref={splashVideoRef}
                src="/splash_logo.mp4"
                autoPlay
                playsInline
                muted
                onEnded={finishSplash}
                className="splash-video-element"
              />
            </div>

            <motion.button
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="splash-skip-btn"
              onClick={(e) => {
                e.stopPropagation();
                finishSplash();
              }}
            >
              Skip &gt;
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── ITEM LIMIT WARNING NOTIFICATION ─── */}
      <AnimatePresence>
        {limitWarning && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            style={{
              position: 'fixed',
              top: 16,
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 2000,
              width: 'min(calc(100% - 32px), 440px)'
            }}
          >
            <div className="multi-item-limit-alert" style={{ boxShadow: '0 8px 24px rgba(0,0,0,0.18)' }}>
              <AlertTriangle size={18} color="#DC2626" />
              <span>{limitWarning}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── 4KIT HERO HEADER (PURE WHITE CLEAN) ─── */}
      <div className="kit4-hero-header">
        <div className="ios-status-bar">
          <span>9:41</span>
          <span>100%</span>
        </div>
        <div className="kit4-logo-row">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {canGoBack && (
              <motion.button
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                whileTap={{ scale: 0.9 }}
                className="header-back-circle-btn"
                onClick={handleGoBack}
                title="Go Back"
              >
                <ChevronLeft size={20} color="var(--text-primary)" />
              </motion.button>
            )}
            <div className="kit4-brand-logo" onClick={() => { setCurrentScreen('home'); setSearchQuery(''); }} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10 }}>
              <div 
                className="kit4-brand-logo-img"
                style={{ 
                  height: 38, 
                  width: 62, 
                  backgroundColor: activeTheme.primary,
                  WebkitMaskImage: 'url(/4kit_logo.png)',
                  maskImage: 'url(/4kit_logo.png)',
                  WebkitMaskSize: 'contain',
                  maskSize: 'contain',
                  WebkitMaskRepeat: 'no-repeat',
                  maskRepeat: 'no-repeat',
                  WebkitMaskPosition: 'center',
                  maskPosition: 'center',
                  transition: 'background-color 0.35s ease, transform 0.2s ease',
                  display: 'block'
                }} 
                title="4Kit Logo"
              />
              <div>
                <div className="kit4-tagline" style={{ color: activeTheme.primary, fontWeight: 700, fontSize: '11px', letterSpacing: '0.5px' }}>{activeTheme.name} Mode</div>
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            <button
              className="quick-filter-btn"
              style={{ padding: '6px 12px', borderColor: activeTheme.primary, color: activeTheme.primary }}
              onClick={() => setShowFilterModal(true)}
            >
              <SlidersHorizontal size={13} /> Filters {activeFilterCount > 0 ? `(${activeFilterCount})` : ''}
            </button>
            <button className="kit4-hero-badge-pill" style={{ cursor: 'pointer', border: 'none' }} onClick={() => setIsLoading(true)}>
              <RotateCcw size={12} color={activeTheme.primary} style={{ marginRight: 4 }} /> Replay
            </button>
          </div>
        </div>

        {/* Location Selector Box */}
        <div className="header-location-box" onClick={() => setShowLocationModal(true)}>
          <div className="location-left">
            <div className="location-icon-circle" style={{ background: activeTheme.primary }}>
              <MapPin size={18} color="#FFFFFF" />
            </div>
            <div>
              <div className="location-title">{userLocation}, Thiruvananthapuram</div>
              <div className="location-address">Deliver in 15 mins • Tap to change locality</div>
            </div>
          </div>
          <div style={{ color: activeTheme.primary, fontWeight: 900, fontSize: 13, display: 'flex', alignItems: 'center' }}>
            Change <ChevronRight size={16} style={{ marginLeft: 2 }} />
          </div>
        </div>
      </div>

      {/* ─── SCREEN CONTENT ROUTING ─── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentScreen}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          style={{ width: '100%' }}
        >
          {/* ═════════ 1. HOME SCREEN ═════════ */}
          {currentScreen === 'home' && (
            <>
              {/* Search Bar on Top of Categories */}
              <div className="glovo-search-container" style={{ padding: '16px 16px 10px' }}>
                <div className="glovo-search-bar">
                  <Search size={18} color="var(--text-muted)" />
                  <input
                    className="search-input-field"
                    placeholder={categoryPlaceholders[placeholderIndex]}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  {searchQuery && (
                    <button
                      style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: 4 }}
                      onClick={() => setSearchQuery('')}
                    >
                      <X size={16} color="#6B7280" />
                    </button>
                  )}
                </div>
                <div className="sample-chips-row">
                  <span className="sample-chip-label">Samples:</span>
                  {SAMPLE_SEARCHES.map((sample) => (
                    <button
                      key={sample}
                      className={`sample-chip ${searchQuery.toLowerCase() === sample.toLowerCase() ? 'active' : ''}`}
                      onClick={() => setSearchQuery(sample)}
                    >
                      {sample}
                    </button>
                  ))}
                </div>
              </div>

              {/* 3 DISTINCT CATEGORIES: Red Food, Green Groceries, Blue Pharmacy */}
              <div className="glovo-bubbles-section" style={{ paddingTop: 4 }}>
                <div className="section-label-badge" style={{ marginBottom: 12, color: activeTheme.primary }}>
                  <span>Categories</span>
                </div>
                <div className="glovo-bubbles-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
                  {BUBBLE_CATEGORIES.map((cat, idx) => {
                    const IconComp = cat.icon;
                    const isActive = activeCategory === cat.id;
                    return (
                      <motion.div
                        key={cat.id}
                        whileHover={{ scale: 1.08, y: -4 }}
                        whileTap={{ scale: 0.94 }}
                        className={`glovo-bubble-item ${isActive ? 'active' : ''}`}
                        onClick={() => selectCategory(cat.id)}
                      >
                        <div
                          className="bubble-outer-circle"
                          style={{
                            backgroundColor: cat.theme.primary,
                            color: '#FFFFFF',
                            boxShadow: isActive ? `0 0 0 4px #FFFFFF, 0 0 0 7px ${cat.theme.primary}` : 'var(--shadow-food-md)'
                          }}
                        >
                          <IconComp size={28} />
                          {isActive && (
                            <div className="bubble-active-dot" style={{ background: cat.theme.primary }}>
                              <Check size={12} color="#FFFFFF" />
                            </div>
                          )}
                        </div>
                        <div className="bubble-name" style={{ color: isActive ? cat.theme.primary : 'var(--text-primary)', fontWeight: 900 }}>
                          {cat.name}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>

              {searchQuery.trim() !== '' ? (
                /* Dynamic Search Results Feed */
                <div style={{ padding: '0 16px 24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 900, color: 'var(--text-primary)' }}>
                      Search Results for "{searchQuery}"
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 800, color: activeTheme.primary }}>
                      {
                        [...Object.values(MENU_ITEMS_BY_CATEGORY).flat(), ...DIET_ITEMS, ...CRAVINGS_ITEMS].filter(
                          (item, idx, self) =>
                            self.findIndex((x) => x.id === item.id) === idx &&
                            (item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                             item.desc.toLowerCase().includes(searchQuery.toLowerCase()) ||
                             item.category.toLowerCase().includes(searchQuery.toLowerCase()))
                        ).length
                      } items found
                    </span>
                  </div>
                  {
                    [...Object.values(MENU_ITEMS_BY_CATEGORY).flat(), ...DIET_ITEMS, ...CRAVINGS_ITEMS].filter(
                      (item, idx, self) =>
                        self.findIndex((x) => x.id === item.id) === idx &&
                        (item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.desc.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.category.toLowerCase().includes(searchQuery.toLowerCase()))
                    ).map((item) => (
                      <motion.div
                        key={item.id}
                        whileHover={{ y: -3 }}
                        className="diet-card"
                        style={{ background: '#FFFFFF', border: '1.5px solid #E5E7EB', padding: 16 }}
                        onClick={() => setSelectedDish(item)}
                      >
                        <img src={item.image} alt={item.name} className="diet-img" />
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', gap: 6, marginBottom: 4 }}>
                            <span className="diet-badge-pill" style={{ background: '#F3F4F6', color: '#374151', border: '1px solid #E5E7EB', textTransform: 'uppercase' }}>
                              {item.category}
                            </span>
                            {item.storeName && (
                              <span className="distance-pill-badge">
                                 {item.storeName}
                              </span>
                            )}
                          </div>
                          <div style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 900, color: 'var(--text-primary)' }}>
                            {item.name}
                          </div>
                          <div style={{ fontSize: 12, color: 'var(--text-secondary)', margin: '2px 0 6px' }}>{item.desc}</div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontWeight: 900, color: activeTheme.primary, fontSize: 16 }}>₹{item.price}</span>
                            <button
                              className="counter-btn-trigger"
                              style={{ width: 32, height: 32, background: activeTheme.primary }}
                              onClick={(e) => {
                                e.stopPropagation();
                                updateItemQty(item, 1);
                              }}
                            >
                              <Plus size={15} />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ))
                  }
                </div>
              ) : (
                <>
                  {/* ─── GAMIFIED SPIN THE WHEEL WIDGET BANNER ─── */}
                  <div style={{ padding: '0 16px', marginTop: 12 }}>
                    <div className="spin-wheel-card-banner" style={{ background: activeTheme.gradient, boxShadow: activeTheme.glow, transition: 'all 0.4s ease' }}>
                      <div className="spin-wheel-title">
                        Spin the Wheel for a Discount!
                      </div>
                      <div className="spin-wheel-sub">
                        Win up to 50% OFF, Free Delivery &amp; Mystery Food Deals!
                      </div>
                      <button className="spin-wheel-cta-btn" onClick={() => setShowSpinWheelModal(true)}>
                        Spin Now &amp; Claim Coupon
                      </button>
                    </div>
                  </div>

                  {/* ─── FOOD MOOD & CRAVINGS ROULETTE WIDGET ─── */}
                  <div style={{ padding: '0 16px', marginBottom: 16 }}>
                    <div style={{ background: '#FFFFFF', borderRadius: 20, padding: 18, border: '1.5px solid var(--food-border)', boxShadow: '0 4px 16px rgba(0,0,0,0.05)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                        <Flame size={18} color={activeTheme.primary} />
                        <span style={{ fontSize: 16, fontWeight: 900, fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>
                           Food Mood &amp; Mystery Dish Spinner
                        </span>
                      </div>
                      <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 12, fontWeight: 600 }}>
                        Can't decide what to eat? Tap a mood to roll a random Trivandrum mystery recommendation!
                      </p>
                      <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 6 }} className="no-scrollbar">
                        {[
                          { id: 'spicy', label: ' Spicy Kerala' },
                          { id: 'snack', label: ' Quick Snack' },
                          { id: 'sweet', label: ' Sweet Treat' }
                        ].map((mood) => (
                          <button
                            key={mood.id}
                            className="quick-filter-btn"
                            style={{ padding: '8px 14px', fontSize: 12 }}
                            onClick={() => triggerCravingsRoulette(mood.id)}
                          >
                            {mood.label}
                          </button>
                        ))}
                      </div>

                      {isRouletteSpinning && (
                        <div style={{ textAlign: 'center', padding: 16, color: activeTheme.primary, fontWeight: 800 }}>
                           Rolling the Trivandrum Cravings Wheel...
                        </div>
                      )}

                      {rouletteDish && !isRouletteSpinning && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ background: '#F8FAFC', borderRadius: 16, padding: 12, marginTop: 12, display: 'flex', gap: 12, alignItems: 'center', border: '1px solid #E2E8F0' }}>
                          <img src={rouletteDish.image} alt={rouletteDish.name} style={{ width: 64, height: 64, borderRadius: 12, objectFit: 'cover' }} />
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: 13, fontWeight: 900, color: '#1F2937' }}>{rouletteDish.name}</div>
                            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{rouletteDish.storeName} • ₹{rouletteDish.price}</div>
                          </div>
                          <button className="quick-filter-btn active" style={{ background: activeTheme.primary, borderColor: activeTheme.primary }} onClick={() => updateItemQty(rouletteDish, 1)}>
                            + Add
                          </button>
                        </motion.div>
                      )}
                    </div>
                  </div>

                  {/* ─── 4KIT CATEGORY SPECIALS PROMO CAROUSEL ─── */}
                  <div className="category-promo-carousel">
                    {categorySpecials.map((banner) => (
                      <motion.div
                        key={banner.id}
                        className="category-promo-card"
                        style={{ background: banner.bg }}
                        whileHover={{ scale: 1.02 }}
                        onClick={() => {
                          if (banner.id.includes('food_3')) {
                            setCurrentScreen('multiorder');
                          } else {
                            setCurrentScreen('stores');
                          }
                        }}
                      >
                        <div className="category-promo-left">
                          <div className="category-promo-title">{banner.title}</div>
                          <div className="category-promo-sub">{banner.subtitle}</div>
                          <button className="category-promo-cta-btn">{banner.cta} &gt;</button>
                        </div>
                        <img src={banner.image} alt={banner.title} className="category-promo-img" />
                      </motion.div>
                    ))}
                  </div>

                  {/* ─── "WHAT'S ON YOUR MIND?" CIRCULAR DISHES ─── */}
                  <div className="swiggy-mind-section" style={{ borderTop: '1px solid #F3F4F6', borderBottom: '1px solid #F3F4F6' }}>
                    <div className="swiggy-mind-header">Popular Cravings in Trivandrum</div>
                    <div className="swiggy-mind-scroll">
                      {SWIGGY_MIND_DISHES.map((dish) => (
                        <motion.div
                          key={dish.id}
                          className="swiggy-mind-item"
                          whileHover={{ scale: 1.06, y: -2 }}
                          whileTap={{ scale: 0.94 }}
                          onClick={() => setSearchQuery(dish.name)}
                        >
                          <img src={dish.img} alt={dish.name} className="swiggy-mind-circle-img" />
                          <div className="swiggy-mind-label">{dish.name}</div>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  {/* ─── GLOBAL CUISINE EXPLORER ─── */}
                  <div style={{ margin: '18px 0 16px', padding: '0 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                      <div style={{ fontSize: 16, fontWeight: 900, fontFamily: 'var(--font-display)' }}>
                        Cuisine Explorer (Trivandrum)
                      </div>
                      <span style={{ fontSize: 12, fontWeight: 800, color: activeTheme.primary, cursor: 'pointer' }} onClick={() => setCurrentScreen('stores')}>
                        Explore All
                      </span>
                    </div>
                    <div className="cuisine-scroll-row">
                      {CUISINE_COLLECTIONS.map((cuis) => (
                        <motion.div
                          key={cuis.id}
                          whileHover={{ scale: 1.04, y: -3 }}
                          className="cuisine-pill-card"
                          onClick={() => setCurrentScreen('stores')}
                        >
                          <img src={cuis.image} alt={cuis.name} className="cuisine-cover" />
                          <div className="cuisine-info">
                            <div className="cuisine-title">{cuis.name}</div>
                            <div className="cuisine-tagline">{cuis.tagline}</div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  {/* ─── DIETARY & HEALTHY LIFESTYLE SPOTLIGHT (INR) ─── */}
                  <div style={{ padding: '0 16px', marginBottom: 20 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                      <div style={{ fontSize: 16, fontWeight: 900, fontFamily: 'var(--font-display)' }}>
                        Dietary &amp; Healthy Lifestyle
                      </div>
                      <span className="distance-pill-badge within-range">Keto • Vegan • High-Protein</span>
                    </div>
                    {DIET_ITEMS.map((item) => (
                      <motion.div
                        key={item.id}
                        whileHover={{ y: -4, scale: 1.01 }}
                        whileTap={{ scale: 0.98 }}
                        className="diet-card"
                        onClick={() => setSelectedDish(item)}
                      >
                        <img src={item.image} alt={item.name} className="diet-img" />
                        <div style={{ flex: 1 }}>
                          <span className="diet-badge-pill">{item.badge}</span>
                          <div style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 900, color: 'var(--text-primary)' }}>{item.name}</div>
                          <div style={{ fontSize: 12, color: 'var(--text-secondary)', margin: '2px 0 6px' }}>{item.desc}</div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span className="diet-macros-tag">{item.macros}</span>
                            <span style={{ fontWeight: 900, color: '#059669', fontSize: 16 }}>₹{item.price}</span>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {/* ─── SUGAR & SWEET CRAVINGS COLLECTION (INR) ─── */}
                  <div style={{ padding: '0 16px', marginBottom: 24 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                      <div style={{ fontSize: 16, fontWeight: 900, fontFamily: 'var(--font-display)' }}>
                        Sugar &amp; Sweet Cravings Collection
                      </div>
                      <span className="distance-pill-badge" style={{ color: '#BE185D', borderColor: '#FBCFE8' }}>Desserts</span>
                    </div>
                    {CRAVINGS_ITEMS.map((item) => (
                      <motion.div
                        key={item.id}
                        whileHover={{ y: -4, scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="cravings-card"
                        onClick={() => setSelectedDish(item)}
                      >
                        <img src={item.image} alt={item.name} className="cravings-img" />
                        <div style={{ flex: 1 }}>
                          <span className="cravings-badge-pink">{item.badge}</span>
                          <div style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 900, color: 'var(--text-primary)' }}>{item.name}</div>
                          <div style={{ fontSize: 12, color: 'var(--text-secondary)', margin: '2px 0 6px' }}>{item.desc}</div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: 11, color: '#BE185D', fontWeight: 800 }}>Hot Sweet Craving</span>
                            <span style={{ fontWeight: 900, color: '#BE185D', fontSize: 16 }}>₹{item.price}</span>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </>
              )}
            </>
          )}

          {/* ═════════ 2. DISCOVER SCREEN (Budget Steals & Items under Certain Amount) ═════════ */}
          {currentScreen === 'discover' && (
            <div className="stores-section" style={{ paddingTop: 16 }}>
              {/* Discover Budget Hero - Modern Cool Typography */}
              <div className="discover-budget-hero" style={{ background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)', borderRadius: 24, padding: 22, color: '#FFFFFF', marginBottom: 20, boxShadow: '0 12px 32px rgba(15, 23, 42, 0.25)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                  <span style={{
                    fontSize: 11,
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    color: '#38BDF8',
                    background: 'rgba(56, 189, 248, 0.12)',
                    padding: '5px 14px',
                    borderRadius: 20,
                    border: '1px solid rgba(56, 189, 248, 0.3)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    fontFamily: "'Space Grotesk', 'Outfit', sans-serif"
                  }}>
                    <Compass size={14} color="#38BDF8" />
                    TRIVANDRUM BUDGET STEALS &amp; CRAVINGS
                  </span>
                </div>
                <h2 style={{ fontSize: 22, fontWeight: 800, fontFamily: "'Space Grotesk', 'Outfit', sans-serif", letterSpacing: '-0.02em', marginBottom: 8, color: '#FFFFFF', lineHeight: 1.25 }}>
                  Delicious Items Under Your Target Budget
                </h2>
                <div style={{ fontSize: 13, color: '#94A3B8', fontWeight: 600, fontFamily: "'Plus Jakarta Sans', sans-serif", lineHeight: 1.4 }}>
                  Filter top Trivandrum dishes &amp; teatime snacks by price range, dietary preferences &amp; fast delivery.
                </div>
              </div>

              {/* Interactive Budget & Preference Filter System */}
              <div style={{ background: '#FFFFFF', padding: '16px 18px', borderRadius: 22, marginBottom: 20, border: '1.5px solid #E2E8F0', boxShadow: '0 8px 24px rgba(0,0,0,0.04)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <SlidersHorizontal size={18} color={activeTheme.primary} />
                    <span style={{ fontSize: 14, fontWeight: 800, fontFamily: "'Space Grotesk', 'Outfit', sans-serif", color: 'var(--text-primary)' }}>
                      Filter Dishes by Price &amp; Preference
                    </span>
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 800, color: activeTheme.primary, background: activeTheme.lightBg, padding: '4px 12px', borderRadius: 12, border: `1px solid ${activeTheme.accentBorder}` }}>
                    {discoverMaxPrice >= 500 ? 'All Items' : `Max ₹${discoverMaxPrice}`}
                  </span>
                </div>

                {/* Price Range Filter Pills */}
                <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 6, marginBottom: 12 }} className="no-scrollbar">
                  {[
                    { label: 'All Items', val: 500 },
                    { label: 'Under ₹49 (Tea & Snacks)', val: 49 },
                    { label: 'Under ₹99 (Pocket Bites)', val: 99 },
                    { label: 'Under ₹149 (Quick Meals)', val: 149 },
                    { label: 'Under ₹199 (Full Combos)', val: 199 },
                    { label: 'Under ₹299 (Feasts)', val: 299 }
                  ].map((pill) => (
                    <button
                      key={pill.val}
                      className={`budget-price-chip ${discoverMaxPrice === pill.val ? 'active' : ''}`}
                      style={{
                        fontFamily: "'Space Grotesk', 'Plus Jakarta Sans', sans-serif",
                        fontWeight: 700,
                        fontSize: 12
                      }}
                      onClick={() => setDiscoverMaxPrice(pill.val)}
                    >
                      {pill.label}
                    </button>
                  ))}
                </div>

                {/* Quick Preference Filter Toggles */}
                <div style={{ display: 'flex', gap: 8, paddingTop: 10, borderTop: '1px solid #F1F5F9' }}>
                  <button
                    className={`quick-filter-btn ${discoverVegOnly ? 'active' : ''}`}
                    style={discoverVegOnly ? { background: '#059669', borderColor: '#059669', color: '#FFFFFF', fontWeight: 800 } : { fontSize: 12 }}
                    onClick={() => setDiscoverVegOnly(!discoverVegOnly)}
                  >
                    🍀 Pure Veg Only
                  </button>
                  <button
                    className={`quick-filter-btn ${discoverTopRated ? 'active' : ''}`}
                    style={discoverTopRated ? { background: '#D97706', borderColor: '#D97706', color: '#FFFFFF', fontWeight: 800 } : { fontSize: 12 }}
                    onClick={() => setDiscoverTopRated(!discoverTopRated)}
                  >
                    ⭐ Rating 4.5+
                  </button>
                </div>
              </div>

              {/* Dedicated Snacks Under ₹49 & ₹99 Section */}
              <div style={{ marginBottom: 24 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-primary)', fontFamily: "'Space Grotesk', 'Outfit', sans-serif" }}>
                    Popular Teatime &amp; Evening Snacks Under ₹99
                  </div>
                  <span className="rating-green-pill" style={{ background: '#FEF3C7', color: '#B45309', fontWeight: 800 }}>Trivandrum Favorites</span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 12 }}>
                  {ALL_TRIVANDRUM_FOOD_DISHES
                    .filter((d) => d.price <= 99 && (d.category === 'Breads' || d.category === 'Street Food' || d.category === 'Hot Beverages' || d.category.includes('Starters') || d.category.includes('Dessert')))
                    .filter((d) => !discoverVegOnly || d.diet === 'veg')
                    .filter((d) => !discoverTopRated || (d.rating && d.rating >= 4.5))
                    .slice(0, 6)
                    .map((snack) => (
                      <motion.div key={snack.id} whileHover={{ y: -3 }} style={{ background: '#FFFFFF', borderRadius: 16, border: '1px solid #E2E8F0', padding: 10, position: 'relative' }}>
                        <img src={snack.image} alt={snack.name} style={{ width: '100%', height: 100, borderRadius: 12, objectFit: 'cover', marginBottom: 8 }} />
                        <div style={{ fontSize: 13, fontWeight: 800, color: '#1F2937', height: 36, overflow: 'hidden', lineHeight: 1.3, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{snack.name}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, margin: '4px 0' }}>{snack.storeName}</div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
                          <span style={{ fontSize: 15, fontWeight: 900, color: activeTheme.primary, fontFamily: "'Space Grotesk', sans-serif" }}>₹{snack.price}</span>
                          <button
                            className="quick-filter-btn active"
                            style={{ padding: '4px 10px', fontSize: 12, background: activeTheme.primary, borderColor: activeTheme.primary }}
                            onClick={() => updateItemQty(snack, 1)}
                          >
                            + Add
                          </button>
                        </div>
                      </motion.div>
                    ))}
                </div>
              </div>

              {/* Full Budget Items Grid */}
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 12, fontFamily: "'Space Grotesk', 'Outfit', sans-serif" }}>
                  All Trivandrum Items {discoverMaxPrice >= 500 ? '' : `Under ₹${discoverMaxPrice}`} ({
                    ALL_TRIVANDRUM_FOOD_DISHES
                      .filter((d) => d.price <= discoverMaxPrice)
                      .filter((d) => !discoverVegOnly || d.diet === 'veg')
                      .filter((d) => !discoverTopRated || (d.rating && d.rating >= 4.5)).length
                  } dishes)
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {ALL_TRIVANDRUM_FOOD_DISHES
                    .filter((d) => d.price <= discoverMaxPrice)
                    .filter((d) => !discoverVegOnly || d.diet === 'veg')
                    .filter((d) => !discoverTopRated || (d.rating && d.rating >= 4.5))
                    .slice(0, 15)
                    .map((dish) => (
                      <div key={dish.id} className="budget-dish-card">
                        <img src={dish.image} alt={dish.name} className="budget-dish-img" />
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                            <span style={{ fontSize: 10, padding: '2px 6px', borderRadius: 4, background: dish.diet === 'veg' ? '#D1FAE5' : '#FEE2E2', color: dish.diet === 'veg' ? '#065F46' : '#991B1B', fontWeight: 800 }}>
                              {dish.diet === 'veg' ? 'VEG' : 'NON-VEG'}
                            </span>
                            <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>{dish.category}</span>
                          </div>
                          <div style={{ fontSize: 14, fontWeight: 800, color: '#1F2937', marginBottom: 2, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{dish.name}</div>
                          <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{dish.storeName} • {dish.storeLoc || 'Palayam'}</div>
                          <div style={{ fontSize: 15, fontWeight: 900, color: activeTheme.primary, marginTop: 4, fontFamily: "'Space Grotesk', sans-serif" }}>₹{dish.price}</div>
                        </div>
                        <button
                          className="shimmer-btn"
                          style={{ padding: '8px 14px', fontSize: 12, borderRadius: 12, background: activeTheme.gradient, boxShadow: activeTheme.glow }}
                          onClick={() => updateItemQty(dish, 1)}
                        >
                          + Add
                        </button>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          )}

          {/* ═════════ DEDICATED MULTI-ORDER SCREEN (Multi-Store Bundles & 5km Radius) ═════════ */}
          {currentScreen === 'multiorder' && (
            <div className="stores-section" style={{ paddingTop: 16 }}>
              <div className="section-label-badge" style={{ marginBottom: 8, color: activeTheme.primary }}>
                <Zap size={14} color={activeTheme.primary} />
                <span>Multi-Store Express (Within 5km Radius)</span>
              </div>
              <h2 className="section-h2" style={{ marginBottom: 6 }}>Bundle 2 Stores in 1 Order</h2>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16, fontWeight: 600 }}>
                Combine dishes from nearby merchants within 5km of each other (up to 10 items max per order).
              </div>

              {/* Custom 2-Store Builder Button */}
              <button
                className="shimmer-btn"
                style={{ width: '100%', marginBottom: 20, padding: 16, background: activeTheme.gradient, boxShadow: activeTheme.glow }}
                onClick={() => setShowCustomStoreBuilder(true)}
              >
                <SlidersHorizontal size={18} /> Build Custom 2-Store Order (5km Radius)
              </button>

              <div style={{ fontSize: 14, fontWeight: 900, color: 'var(--text-primary)', marginBottom: 12 }}>
                Popular Curated Bundles in Thiruvananthapuram
              </div>

              {MULTI_STORE_BUNDLES.map((bundle) => (
                <motion.div
                  key={bundle.id}
                  whileHover={{ y: -4 }}
                  className="store-ios-card"
                  style={{ marginBottom: 18 }}
                >
                  <img src={bundle.image} alt={bundle.title} className="store-cover-img" />
                  <div className="store-card-content">
                    <div className="store-title-row">
                      <div className="store-name-text">{bundle.title}</div>
                      <div className="rating-green-pill" style={{ background: '#FEF3C7', color: '#B45309', border: '1px solid #FDE68A' }}>
                        {bundle.savings}
                      </div>
                    </div>
                    <div className="store-meta-line" style={{ marginBottom: 10 }}>
                      {bundle.subtitle}
                    </div>

                    <div style={{ background: '#F8FAFC', padding: 12, borderRadius: 16, marginBottom: 14, border: '1px solid #E2E8F0' }}>
                      {bundle.items.map((it) => (
                        <div key={it.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, fontWeight: 700, margin: '4px 0', color: 'var(--text-primary)' }}>
                          <span>• {it.name} ({it.store})</span>
                          <span>₹{it.price}</span>
                        </div>
                      ))}
                    </div>

                    <button
                      className="shimmer-btn"
                      style={{ width: '100%', padding: 14, background: activeTheme.gradient, boxShadow: activeTheme.glow }}
                      onClick={() => addBundleToCart(bundle)}
                    >
                      <ShoppingBasket size={16} /> Add Multi-Store Bundle • ₹{bundle.price}
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {/* ═════════ 3. STORES LIST SCREEN (50 TVM Restaurants) ═════════ */}
          {currentScreen === 'stores' && (
            <div className="stores-section" style={{ paddingTop: 16 }}>
              <div className="section-header-row" style={{ marginBottom: 12 }}>
                <div>
                  <h2 className="section-h2">{activeTheme.name} Stores</h2>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 700, marginTop: 2 }}>
                    {filteredStores.length} merchants near {userLocation}
                  </div>
                </div>
                <button
                  className="border-beam-btn"
                  style={{ borderColor: activeTheme.primary, color: activeTheme.primary, background: '#FFFFFF' }}
                  onClick={() => setShowFilterModal(true)}
                >
                  <SlidersHorizontal size={14} /> Filters {activeFilterCount > 0 ? `(${activeFilterCount})` : ''}
                </button>
              </div>

              {/* Quick Filter Chips Bar */}
              <div className="quick-filter-scroll">
                <button
                  className={`quick-filter-btn ${filterRating48 ? 'active' : ''}`}
                  style={filterRating48 ? { background: activeTheme.primary, borderColor: activeTheme.primary } : {}}
                  onClick={() => setFilterRating48(!filterRating48)}
                >
                  <Star size={12} /> 4.8+ Rating
                </button>
                <button
                  className={`quick-filter-btn ${filterFastETA ? 'active' : ''}`}
                  style={filterFastETA ? { background: activeTheme.primary, borderColor: activeTheme.primary } : {}}
                  onClick={() => setFilterFastETA(!filterFastETA)}
                >
                  <Clock size={12} /> &lt; 15 mins
                </button>
                <button
                  className={`quick-filter-btn ${filterFreeDelivery ? 'active' : ''}`}
                  style={filterFreeDelivery ? { background: activeTheme.primary, borderColor: activeTheme.primary } : {}}
                  onClick={() => setFilterFreeDelivery(!filterFreeDelivery)}
                >
                  <Truck size={12} /> Free Delivery
                </button>
                <button
                  className={`quick-filter-btn ${filterMaxDistKm <= 5 ? 'active' : ''}`}
                  style={filterMaxDistKm <= 5 ? { background: activeTheme.primary, borderColor: activeTheme.primary } : {}}
                  onClick={() => setFilterMaxDistKm(filterMaxDistKm <= 5 ? 15 : 5)}
                >
                   &lt; 5km Radius
                </button>
                {['Palayam', 'Kowdiar', 'Kazhakkoottam', 'Lulu Mall', 'Vazhuthacaud'].map((loc) => (
                  <button
                    key={loc}
                    className={`quick-filter-btn ${filterLocality === loc ? 'active' : ''}`}
                    style={filterLocality === loc ? { background: activeTheme.primary, borderColor: activeTheme.primary } : {}}
                    onClick={() => setFilterLocality(filterLocality === loc ? 'All' : loc)}
                  >
                    {loc}
                  </button>
                ))}
              </div>

              {filteredStores.map((store) => (
                <motion.div
                  key={store.id}
                  className="swiggy-rest-card"
                  whileHover={{ y: -3 }}
                  onClick={() => {
                    setSelectedStore(store);
                    setCurrentScreen('menu');
                  }}
                >
                  <div className="swiggy-rest-img-col">
                    <img src={store.image} alt={store.name} className="swiggy-rest-img" />
                    <button
                      className={`swiggy-fav-btn ${favorites.includes(store.id) ? 'favorited' : ''}`}
                      onClick={(e) => toggleFavorite(store.id, e)}
                    >
                      <Heart size={14} fill={favorites.includes(store.id) ? '#FFFFFF' : 'none'} />
                    </button>
                    {store.discountTag && (
                      <div className="swiggy-discount-ribbon">{store.discountTag}</div>
                    )}
                  </div>

                  <div className="swiggy-rest-info-col">
                    <div className="swiggy-rest-title-row">
                      <div className="swiggy-rest-name">{store.name}</div>
                    </div>

                    <div className="swiggy-rating-row">
                      <span className="swiggy-star-circle" style={{ background: activeTheme.primary }}></span>
                      <span>{store.rating} ({store.reviewCount || '1.2K+'}) • {store.eta}</span>
                    </div>

                    <div className="swiggy-cuisines-text">
                      {store.categoryTag.split('•').slice(1).join('•').trim() || 'South Indian, Biriyani'}
                    </div>

                    <div className="swiggy-loc-dist">
                      {store.locality || store.categoryTag.split('•')[0].trim()} • {store.distKm} km from {userLocation}
                    </div>

                    <div className="swiggy-benefits-row">
                      <span className="swiggy-free-del-text" style={{ color: activeTheme.primary }}>FREE DELIVERY</span>
                      {store.hasOneBenefit && (
                        <span className="swiggy-one-pill" style={{ background: activeTheme.lightBg, color: activeTheme.primary, borderColor: activeTheme.primary }}>
                          4KIT GOLD
                        </span>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {/* ═════════ 4. STORE MENU SCREEN (25 Dishes per Restaurant in INR) ═════════ */}
          {currentScreen === 'menu' && (
            <div className="stores-section" style={{ paddingTop: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                <button
                  style={{ background: 'none', border: 'none', color: activeTheme.primary, fontWeight: 900, cursor: 'pointer', fontSize: 14, display: 'inline-flex', alignItems: 'center', gap: 4 }}
                  onClick={() => setCurrentScreen('stores')}
                >
                  <ChevronLeft size={16} /> Back to Stores
                </button>
                <button
                  className="quick-filter-btn"
                  style={{ padding: '4px 10px', fontSize: 11, borderColor: activeTheme.primary, color: activeTheme.primary }}
                  onClick={() => setShowFilterModal(true)}
                >
                  <SlidersHorizontal size={12} /> Filter Dishes {activeFilterCount > 0 ? `(${activeFilterCount})` : ''}
                </button>
              </div>

              <div style={{ marginBottom: 16 }}>
                <h2 className="section-h2">{selectedStore ? selectedStore.name : `${activeTheme.name} Menu`}</h2>
                {selectedStore && (
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 700, marginTop: 4 }}>
                     {selectedStore.locality || selectedStore.categoryTag.split('•')[0]} • 25 Curated Dishes Available
                  </div>
                )}
              </div>

              {currentStoreDishes.map((item) => {
                const qty = getItemQty(item.id);
                return (
                  <motion.div key={item.id} className="dish-menu-item">
                    <div className="dish-left" onClick={() => setSelectedDish(item)} style={{ cursor: 'pointer' }}>
                      <div style={{ display: 'flex', gap: 6, marginBottom: 4, alignItems: 'center' }}>
                        <span className="diet-badge-pill" style={{ fontSize: 9, padding: '2px 6px', textTransform: 'uppercase' }}>
                          {item.category}
                        </span>
                        {item.diet && (
                          <span style={{ fontSize: 10, fontWeight: 800, color: item.diet === 'veg' ? '#059669' : '#DC2626' }}>
                            ● {item.diet.toUpperCase()}
                          </span>
                        )}
                        {item.sugar === 'sugar-free' && (
                          <span style={{ fontSize: 10, fontWeight: 800, color: '#2563EB' }}>
                            [Sugar-Free]
                          </span>
                        )}
                      </div>
                      <div className="dish-name">{item.name}</div>
                      <div className="dish-desc">{item.desc}</div>
                      <div className="dish-price" style={{ color: activeTheme.primary }}>₹{item.price}</div>
                    </div>
                    {qty === 0 ? (
                      <motion.button
                        whileTap={{ scale: 0.88 }}
                        className="counter-btn-trigger"
                        style={{ background: activeTheme.primary, width: 34, height: 34 }}
                        onClick={() => updateItemQty(item, 1)}
                      >
                        <Plus size={16} />
                      </motion.button>
                    ) : (
                      <div className="dev21-counter-pill" style={{ borderColor: activeTheme.primary }}>
                        <button className="counter-btn-trigger" style={{ background: activeTheme.primary }} onClick={() => updateItemQty(item, -1)}><Minus size={14} /></button>
                        <span className="counter-qty-val" style={{ color: activeTheme.primary }}>{qty}</span>
                        <button className="counter-btn-trigger" style={{ background: activeTheme.primary }} onClick={() => updateItemQty(item, 1)}><Plus size={14} /></button>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          )}

          {/* ═════════ 5. CART & CHECKOUT SCREEN ═════════ */}
          {currentScreen === 'cart' && (
            <div className="stores-section" style={{ paddingTop: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h2 className="section-h2">4Kit Checkout <ShoppingBag size={20} style={{ verticalAlign: 'middle', color: activeTheme.primary }} /></h2>
                <span className="distance-pill-badge" style={{ fontWeight: 900, background: activeTheme.lightBg, color: activeTheme.primary }}>
                  {totalCartCount}/10 Items
                </span>
              </div>

              {cartItems.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-secondary)' }}>
                  <div style={{ marginBottom: 12 }}><ShoppingBag size={48} color={activeTheme.primary} /></div>
                  <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 4 }}>Your cart is empty!</div>
                  <div style={{ fontSize: 13, marginBottom: 16 }}>Explore 50 Thiruvananthapuram restaurants & add delicious food.</div>
                  <button className="shimmer-btn" style={{ background: activeTheme.gradient }} onClick={() => setCurrentScreen('stores')}>
                    Browse Stores <ArrowRight size={16} />
                  </button>
                </div>
              ) : (
                <>
                  {distinctStoresInCart > 1 && (
                    <div className="multi-store-distance-box">
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Zap size={18} color={activeTheme.primary} />
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 900, color: 'var(--text-primary)' }}>Multi-Store Order Active</div>
                          <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Bundled pickup from {distinctStoresInCart} nearby merchants</div>
                        </div>
                      </div>
                      <span className="distance-pill-badge within-range">Within 5km </span>
                    </div>
                  )}

                  {cartItems.map((ci) => (
                    <div key={ci.id} className="dish-menu-item">
                      <div style={{ flex: 1 }}>
                        <div className="dish-name">{ci.name}</div>
                        <div className="dish-desc">Merchant: <strong>{ci.store || ci.sauce || 'Main Merchant'}</strong></div>
                        <div className="dish-price" style={{ color: activeTheme.primary }}>₹{ci.price} x {ci.qty}</div>
                      </div>
                      <div style={{ fontWeight: 900, fontSize: 18, color: 'var(--text-primary)' }}>₹{ci.price * ci.qty}</div>
                    </div>
                  ))}

                  {/* Bill Breakdown with Increasing Delivery Fee */}
                  <div style={{ background: '#FFFFFF', padding: 20, borderRadius: 24, marginTop: 16, border: '1.5px solid var(--food-border)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 13, color: 'var(--text-secondary)' }}>
                      <span>Item Subtotal ({totalCartCount} items)</span>
                      <span style={{ fontWeight: 800, color: 'var(--text-primary)' }}>₹{cartSubtotal}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 13, color: 'var(--text-secondary)' }}>
                      <span>
                        Delivery Fee {distinctStoresInCart > 1 ? `(${distinctStoresInCart} merchants bundled)` : ''}
                      </span>
                      <span style={{ color: dynamicDeliveryFee === 0 ? '#059669' : activeTheme.primary, fontWeight: 900 }}>
                        {dynamicDeliveryFee === 0 ? 'FREE' : `₹${dynamicDeliveryFee}`}
                      </span>
                    </div>
                    <div style={{ height: 1, background: '#E5E7EB', margin: '10px 0' }} />
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 20, fontWeight: 900, color: 'var(--text-primary)' }}>
                      <span>To Pay</span>
                      <span style={{ color: activeTheme.primary }}>₹{finalCartTotal}</span>
                    </div>
                  </div>

                  <button
                    className="shimmer-btn"
                    style={{ width: '100%', marginTop: 20, padding: 18, background: activeTheme.gradient, boxShadow: activeTheme.glow }}
                    onClick={handleConfirmOrder}
                  >
                    Confirm &amp; Place Order • ₹{finalCartTotal} <ArrowRight size={18} />
                  </button>
                </>
              )}
            </div>
          )}

          {/* ═════════ 6. LIVE COURIER TRACKER ═════════ */}
          {currentScreen === 'tracker' && (
            <div className="stores-section" style={{ paddingTop: 20, textAlign: 'center' }}>
              <h2 className="section-h2" style={{ marginBottom: 6 }}>Live Courier Status</h2>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 24, fontWeight: 600 }}>Order #4KIT-TVM-904 • ETA 11 mins</div>
              <div style={{ background: activeTheme.lightBg, border: `2px solid ${activeTheme.primary}`, padding: 28, borderRadius: 32, marginBottom: 24, boxShadow: activeTheme.glow }}>
                <motion.div animate={{ x: [-12, 12, -12] }} transition={{ duration: 1.6, repeat: Infinity }} style={{ display: 'inline-block', marginBottom: 12 }}>
                  <Truck size={56} color={activeTheme.primary} />
                </motion.div>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 20, color: '#1F2937' }}>Nikhil is on the way to {userLocation}!</div>
                <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 8, fontWeight: 600 }}>Location: 0.8 km away • Arriving in 11 minutes</div>
              </div>
              <button className="shimmer-btn" style={{ width: '100%', padding: 16, background: activeTheme.gradient }} onClick={() => setCurrentScreen('home')}>
                Back to Home <ArrowRight size={16} />
              </button>
            </div>
          )}

          {/* ═════════ 7. PROFILE & USER SETTINGS ═════════ */}
          {currentScreen === 'profile' && (
            <div className="stores-section" style={{ paddingTop: 16 }}>
              <div className="profile-header-card" style={{ background: '#FFFFFF', border: '1.5px solid var(--food-border)', borderRadius: 32, padding: 24, marginBottom: 20, boxShadow: 'var(--shadow-food-md)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
                  <div style={{ width: 64, height: 64, borderRadius: '50%', background: activeTheme.gradient, color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, fontWeight: 900, boxShadow: activeTheme.glow }}>
                    RK
                  </div>
                  <div>
                    <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 900, color: 'var(--text-primary)' }}>Rahul Kumar</h2>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#FEF3C7', color: '#B45309', padding: '4px 12px', borderRadius: 9999, fontSize: 12, fontWeight: 800, marginTop: 4 }}>
                      <Award size={14} /> 4Kit Gold • {userLocation}
                    </div>
                  </div>
                </div>

                <div style={{ background: '#F8FAFC', padding: 16, borderRadius: 20, border: '1px solid #E2E8F0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, fontWeight: 800, marginBottom: 6 }}>
                    <span>Reward Points (Gold Tier)</span>
                    <span style={{ color: activeTheme.primary }}>2,850 / 3,000 XP</span>
                  </div>
                  <div style={{ width: '100%', height: 8, background: '#E2E8F0', borderRadius: 9999, overflow: 'hidden' }}>
                    <div style={{ width: '85%', height: '100%', background: activeTheme.primary, borderRadius: 9999 }} />
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 6, fontWeight: 600 }}>
                    150 XP to Platinum • Unlimited Free Delivery Active in Thiruvananthapuram
                  </div>
                </div>
              </div>

              {/* Past Orders in INR */}
              <div style={{ marginBottom: 20 }}>
                <h3 style={{ fontSize: 16, fontWeight: 900, marginBottom: 12 }}>Previous Orders</h3>
                <div style={{ background: '#FFFFFF', border: '1.5px solid var(--food-border)', borderRadius: 24, padding: 16, marginBottom: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ fontWeight: 800 }}>Zam Zam + Azad Restaurant</span>
                    <span style={{ color: activeTheme.primary, fontWeight: 900 }}>₹490</span>
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 12 }}>Malabar Biriyani + Porotta Combo • Delivered Yesterday</div>
                  <button className="shimmer-btn" style={{ width: '100%', padding: 10, fontSize: 13, background: activeTheme.gradient }} onClick={() => setCurrentScreen('cart')}>
                    Re-order in 1-Click <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* ─── LOCATION PICKER MODAL (Thiruvananthapuram Localities) ─── */}
      <AnimatePresence>
        {showLocationModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="dev21-modal-overlay" onClick={() => setShowLocationModal(false)}>
            <motion.div initial={{ y: 280 }} animate={{ y: 0 }} exit={{ y: 280 }} className="dev21-modal-drawer" onClick={(e) => e.stopPropagation()}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <div>
                  <h3 style={{ fontSize: 18, fontWeight: 900, color: 'var(--text-primary)' }}>Select Delivery Locality</h3>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Thiruvananthapuram, Kerala</div>
                </div>
                <button style={{ background: 'none', border: 'none', cursor: 'pointer' }} onClick={() => setShowLocationModal(false)}>
                  <X size={20} />
                </button>
              </div>

              <div style={{ maxHeight: '360px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
                {TVM_AREAS.map((area) => (
                  <div
                    key={area}
                    style={{
                      padding: 14,
                      borderRadius: 16,
                      background: userLocation === area ? activeTheme.lightBg : '#FFFFFF',
                      border: userLocation === area ? `2px solid ${activeTheme.primary}` : '1.5px solid #E5E7EB',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      cursor: 'pointer',
                      fontWeight: 800,
                      color: userLocation === area ? activeTheme.primary : 'var(--text-primary)'
                    }}
                    onClick={() => {
                      setUserLocation(area);
                      setShowLocationModal(false);
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <MapPin size={16} color={userLocation === area ? activeTheme.primary : '#6B7280'} />
                      <span>{area}</span>
                    </div>
                    {userLocation === area && <Check size={18} color={activeTheme.primary} />}
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── UNIVERSAL FILTER MODAL (Location, Price, Diet, Sugar) ─── */}
      <AnimatePresence>
        {showFilterModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="dev21-modal-overlay" onClick={() => setShowFilterModal(false)}>
            <motion.div initial={{ y: 320 }} animate={{ y: 0 }} exit={{ y: 320 }} className="dev21-modal-drawer" onClick={(e) => e.stopPropagation()} style={{ maxHeight: '85vh', overflowY: 'auto' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <div>
                  <h3 style={{ fontSize: 18, fontWeight: 900, color: 'var(--text-primary)' }}>Filters &amp; Preferences</h3>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Refine by location, price, diet &amp; sugar</div>
                </div>
                <button style={{ background: 'none', border: 'none', cursor: 'pointer' }} onClick={() => setShowFilterModal(false)}>
                  <X size={20} />
                </button>
              </div>

              {/* 1. Location & Distance Filter */}
              <div style={{ marginBottom: 16 }}>
                <div className="filter-section-title">
                  <MapPin size={14} color={activeTheme.primary} />
                  <span>Delivery Locality / Distance from {userLocation}</span>
                </div>
                <div className="filter-chips-grid">
                  {[
                    { label: 'All Trivandrum', val: 15 },
                    { label: '< 2 km (Walking)', val: 2 },
                    { label: '< 5 km (Fast Express)', val: 5 },
                    { label: '< 10 km (City Wide)', val: 10 }
                  ].map((opt) => (
                    <button
                      key={opt.label}
                      className={`filter-chip-option ${filterMaxDistKm === opt.val ? 'active' : ''}`}
                      style={filterMaxDistKm === opt.val ? { background: activeTheme.primary, borderColor: activeTheme.primary, color: '#FFFFFF' } : {}}
                      onClick={() => setFilterMaxDistKm(opt.val)}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
                <select className="store-select-dropdown" value={filterLocality} onChange={(e) => setFilterLocality(e.target.value)}>
                  <option value="All">All Localities</option>
                  {TVM_AREAS.map((a) => (
                    <option key={a} value={a}>{a}</option>
                  ))}
                </select>
              </div>

              {/* 2. Price Filter (INR) */}
              <div style={{ marginBottom: 16 }}>
                <div className="filter-section-title">
                  <span>Price Range (INR ₹)</span>
                </div>
                <div className="filter-chips-grid">
                  {[
                    { label: 'All Prices', val: 'All' },
                    { label: 'Under ₹150', val: 'under150' },
                    { label: '₹150 - ₹300', val: '150-300' },
                    { label: '₹300 - ₹500', val: '300-500' },
                    { label: 'Above ₹500', val: 'above500' }
                  ].map((pr) => (
                    <button
                      key={pr.label}
                      className={`filter-chip-option ${filterPriceRange === pr.val ? 'active' : ''}`}
                      style={filterPriceRange === pr.val ? { background: activeTheme.primary, borderColor: activeTheme.primary, color: '#FFFFFF' } : {}}
                      onClick={() => setFilterPriceRange(pr.val)}
                    >
                      {pr.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 3. Diet-Based Filter */}
              <div style={{ marginBottom: 16 }}>
                <div className="filter-section-title">
                  <span>Diet &amp; Nutrition</span>
                </div>
                <div className="filter-chips-grid">
                  {[
                    { label: 'All Diets', val: 'All' },
                    { label: ' Pure Veg', val: 'veg' },
                    { label: ' Non-Veg', val: 'non-veg' },
                    { label: ' 100% Vegan', val: 'vegan' },
                    { label: ' Keto Friendly', val: 'keto' },
                    { label: ' High Protein', val: 'high-protein' }
                  ].map((dt) => (
                    <button
                      key={dt.label}
                      className={`filter-chip-option ${filterDiet === dt.val ? 'active' : ''}`}
                      style={filterDiet === dt.val ? { background: activeTheme.primary, borderColor: activeTheme.primary, color: '#FFFFFF' } : {}}
                      onClick={() => setFilterDiet(dt.val)}
                    >
                      {dt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 4. Sugar Filter */}
              <div style={{ marginBottom: 20 }}>
                <div className="filter-section-title">
                  <span>Sugar &amp; Sweetness Preference</span>
                </div>
                <div className="filter-chips-grid">
                  {[
                    { label: 'All', val: 'All' },
                    { label: ' Sugar-Free', val: 'sugar-free' },
                    { label: ' Diabetic Friendly', val: 'diabetic-friendly' },
                    { label: ' Low Sugar', val: 'low-sugar' },
                    { label: ' Sweet Cravings', val: 'sweet' }
                  ].map((sg) => (
                    <button
                      key={sg.label}
                      className={`filter-chip-option ${filterSugar === sg.val ? 'active' : ''}`}
                      style={filterSugar === sg.val ? { background: activeTheme.primary, borderColor: activeTheme.primary, color: '#FFFFFF' } : {}}
                      onClick={() => setFilterSugar(sg.val)}
                    >
                      {sg.label}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  style={{ flex: 1, padding: 14, background: '#F3F4F6', border: '1px solid #E5E7EB', borderRadius: 9999, fontWeight: 800, cursor: 'pointer' }}
                  onClick={resetAllFilters}
                >
                  Reset
                </button>
                <button
                  className="shimmer-btn"
                  style={{ flex: 2, padding: 14, background: activeTheme.gradient }}
                  onClick={() => setShowFilterModal(false)}
                >
                  Apply Filters ({filteredStores.length} stores)
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── 5KM MULTI-STORE ORDER BUILDER DRAWER ─── */}
      <AnimatePresence>
        {showCustomStoreBuilder && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="dev21-modal-overlay" onClick={() => setShowCustomStoreBuilder(false)}>
            <motion.div initial={{ y: 280 }} animate={{ y: 0 }} exit={{ y: 280 }} className="dev21-modal-drawer" onClick={(e) => e.stopPropagation()}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <div>
                  <h3 style={{ fontSize: 18, fontWeight: 900, color: 'var(--text-primary)' }}>Multi-Store Order Builder (5km Limit)</h3>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                    Combine 2 {activeCategory.toUpperCase()} merchants within 5km radius
                  </div>
                </div>
                <button style={{ background: 'none', border: 'none', cursor: 'pointer' }} onClick={() => setShowCustomStoreBuilder(false)}>
                  <X size={20} />
                </button>
              </div>

              <div style={{ marginBottom: 14 }}>
                <label style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-primary)' }}>1. Primary Merchant ({activeTheme.name}):</label>
                <select className="store-select-dropdown" value={customStore1} onChange={(e) => setCustomStore1(e.target.value)}>
                  {currentStores.map((st) => (
                    <option key={`m1_${st.id}`} value={st.name}>{st.name} ({st.locality || st.categoryTag.split('•')[0].trim()})</option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: 14 }}>
                <label style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-primary)' }}>
                  2. Secondary Merchant (Only within 5.0 km of {customStore1}):
                </label>
                <select className="store-select-dropdown" value={customStore2} onChange={(e) => setCustomStore2(e.target.value)}>
                  {validStore2Options.map((st) => (
                    <option key={`m2_${st.id}`} value={st.name}>
                      {st.name} ({st.locality || st.categoryTag.split('•')[0].trim()} • {st.distFromStore1} km away)
                    </option>
                  ))}
                </select>
              </div>

              {/* 5KM Distance Verification Badge */}
              <div className="multi-store-distance-box">
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Zap size={16} color={activeTheme.primary} />
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--text-primary)' }}>
                      Distance between merchants: <strong>{currentStore2Distance} km</strong>
                    </div>
                    <div style={{ fontSize: 11, color: '#059669', fontWeight: 700 }}>
                       Valid for single courier pickup (&le; 5.0 km)
                    </div>
                  </div>
                </div>
                <span className="distance-pill-badge within-range">5km Verified</span>
              </div>

              <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 16 }}>
                 Express courier will collect both packages and deliver together (+₹25 multi-pickup surcharge applies). Max 10 items total.
              </div>

              <button
                className="shimmer-btn"
                style={{ width: '100%', padding: 16, background: activeTheme.gradient, boxShadow: activeTheme.glow }}
                onClick={addCustomMultiStoreOrder}
              >
                Add 2-Merchant Bundle to Cart <ArrowRight size={16} />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── DISH CUSTOMIZATION DRAWER ─── */}
      <AnimatePresence>
        {selectedDish && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="dev21-modal-overlay" onClick={() => setSelectedDish(null)}>
            <motion.div initial={{ y: 250 }} animate={{ y: 0 }} exit={{ y: 250 }} className="dev21-modal-drawer" onClick={(e) => e.stopPropagation()}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                <div><h3 style={{ fontSize: 20, fontWeight: 900 }}>{selectedDish.name}</h3></div>
                <button style={{ background: 'none', border: 'none', cursor: 'pointer' }} onClick={() => setSelectedDish(null)}><X size={20} /></button>
              </div>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 18 }}>{selectedDish.desc}</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24 }}>
                {(selectedDish.sauces || ['Spicy Chutney', 'Garlic Mayo', 'Coconut Chammanthi']).map((sauce) => (
                  <label key={sauce} style={{ display: 'flex', justifyContent: 'space-between', padding: 12, border: '1.5px solid var(--food-border)', borderRadius: 12, cursor: 'pointer' }} onClick={() => setSelectedSauce(sauce)}>
                    {sauce} <input type="radio" checked={selectedSauce === sauce} readOnly />
                  </label>
                ))}
              </div>
              <button
                className="shimmer-btn"
                style={{ width: '100%', padding: 18, background: activeTheme.gradient, boxShadow: activeTheme.glow }}
                onClick={addModalItemToCart}
              >
                Add to Order • ₹{selectedDish.price} <ArrowRight size={16} />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── ORDER SUCCESS VIDEO / CELEBRATION MODAL ─── */}
      <AnimatePresence>
        {showOrderSuccessModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="video-modal-fullscreen">
            {isVideoPlaying && (
              <motion.div initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.85, opacity: 0 }} className="video-container-card">
                <button className="video-skip-pill" onClick={skipVideo}>
                  <FastForward size={14} /> Skip Animation
                </button>
                <video
                  ref={videoRef}
                  src="/placed_order.mp4"
                  autoPlay
                  playsInline
                  muted
                  onLoadedMetadata={(e) => { e.currentTarget.currentTime = 3; }}
                  onEnded={handleVideoEnd}
                  className="placed-video-element"
                />
              </motion.div>
            )}

            {videoFinished && (
              <motion.div initial={{ scale: 0.7, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} className="nikhil-celebration-card">
                <div className="nikhil-card-glow-aura" />
                <div className="nikhil-avatar-ring">
                  <Truck size={38} color="#FFFFFF" />
                  <div className="nikhil-badge-online" />
                </div>
                <div className="nikhil-headline">Nikhil is on the way!</div>
                <div className="nikhil-subtext">
                  Arriving in <strong style={{ color: '#FFFFFF' }}>12 mins</strong> to {userLocation}
                </div>
                <div className="rider-status-box">
                  <div className="rider-info-row">
                    <div>
                      <div className="rider-name">Nikhil Sharma</div>
                      <div className="rider-rating"> 4.95 • Electric Scooter</div>
                    </div>
                    <button className="call-rider-btn" onClick={() => alert("Calling Nikhil (+91 98950-4KIT-NIKHIL)...")}>
                      <PhoneCall size={13} /> Call
                    </button>
                  </div>
                </div>
                <button className="shimmer-btn" style={{ width: '100%', padding: 16, fontSize: 15, background: activeTheme.gradient }} onClick={proceedToTracker}>
                  Track Live Order <ArrowRight size={18} />
                </button>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── FLOATING VIEW ORDER BAR (Strictly Pinned above bottom dock on all screens when cart > 0) ─── */}
      <AnimatePresence>
        {totalCartCount > 0 && currentScreen !== 'cart' && currentScreen !== 'tracker' && !showOrderSuccessModal && (
          <motion.div
            initial={{ opacity: 0, y: 20, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: 20, x: '-50%' }}
            className="glovo-cart-float-bar"
            style={{ background: activeTheme.gradient, boxShadow: activeTheme.glow }}
            onClick={() => setCurrentScreen('cart')}
          >
            <div className="cart-left-wrap">
              <div className="cart-badge-yellow" style={{ color: activeTheme.primary }}>
                {totalCartCount}
              </div>
              <span className="cart-title-text">View Order</span>
            </div>
            <div className="cart-cta-text">
              <span>₹{finalCartTotal}</span>
              <ArrowRight size={18} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── SPIN THE WHEEL INTERACTIVE DISCOUNT MODAL ─── */}
      <AnimatePresence>
        {showSpinWheelModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="spin-modal-overlay" onClick={() => !isSpinning && setShowSpinWheelModal(false)}>
            <motion.div initial={{ scale: 0.8, y: 30 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.8, y: 30 }} className="spin-modal-card" onClick={(e) => e.stopPropagation()}>
              <button
                style={{ position: 'absolute', top: 16, right: 16, background: '#F3F4F6', border: 'none', borderRadius: '50%', width: 32, height: 32, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                onClick={() => !isSpinning && setShowSpinWheelModal(false)}
              >
                <X size={18} color="#4B5563" />
              </button>

              <h3 style={{ fontSize: 20, fontWeight: 900, fontFamily: 'var(--font-display)', color: '#1F2937', marginBottom: 4 }}>
                Spin the Wheel for a Discount!
              </h3>
              <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 12, fontWeight: 600 }}>
                Tap SPIN below to reveal your randomized surprise coupon!
              </p>

              {/* Wheel Graphic */}
              <div className="spin-wheel-wrapper">
                <div className="spin-wheel-pointer" />
                <svg
                  className="spin-wheel-svg"
                  viewBox="0 0 200 200"
                  style={{
                    transform: `rotate(${wheelRotation}deg)`,
                    transition: isSpinning ? 'transform 3.5s cubic-bezier(0.15, 0.9, 0.2, 1)' : 'none'
                  }}
                >
                  {SPIN_WHEEL_REWARDS.map((rew, i) => {
                    const numSlices = SPIN_WHEEL_REWARDS.length;
                    const sliceAngle = 360 / numSlices;
                    const startAngle = i * sliceAngle;
                    const endAngle = (i + 1) * sliceAngle;
                    const x1 = 100 + 100 * Math.cos((Math.PI * startAngle) / 180);
                    const y1 = 100 + 100 * Math.sin((Math.PI * startAngle) / 180);
                    const x2 = 100 + 100 * Math.cos((Math.PI * endAngle) / 180);
                    const y2 = 100 + 100 * Math.sin((Math.PI * endAngle) / 180);
                    const textAngle = startAngle + sliceAngle / 2;
                    const textX = 100 + 65 * Math.cos((Math.PI * textAngle) / 180);
                    const textY = 100 + 65 * Math.sin((Math.PI * textAngle) / 180);

                    return (
                      <g key={rew.code}>
                        <path
                          d={`M 100 100 L ${x1} ${y1} A 100 100 0 0 1 ${x2} ${y2} Z`}
                          fill={rew.color}
                          stroke="#FFFFFF"
                          strokeWidth="2"
                        />
                        <text
                          x={textX}
                          y={textY}
                          fill="#FFFFFF"
                          fontSize="8"
                          fontWeight="900"
                          textAnchor="middle"
                          dominantBaseline="middle"
                          transform={`rotate(${textAngle + 90}, ${textX}, ${textY})`}
                        >
                          {rew.title}
                        </text>
                      </g>
                    );
                  })}
                </svg>

                <button className="spin-wheel-center-btn" onClick={triggerSpinWheel} disabled={isSpinning}>
                  {isSpinning ? 'SPINNING...' : 'SPIN!'}
                </button>
              </div>

              {/* Won Reward Banner */}
              {wonReward && (
                <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} style={{ background: '#ECFDF5', border: '1.5px solid #6EE7B7', borderRadius: 20, padding: 16, marginTop: 12 }}>
                  <div style={{ fontSize: 16, fontWeight: 900, color: '#047857', marginBottom: 2 }}>
                     YOU WON: {wonReward.title}!
                  </div>
                  <div style={{ fontSize: 12, color: '#065F46', marginBottom: 12, fontWeight: 600 }}>{wonReward.desc}</div>
                  <button
                    className="shimmer-btn"
                    style={{ width: '100%', padding: 12, background: 'linear-gradient(135deg, #059669 0%, #047857 100%)', boxShadow: '0 4px 14px rgba(5,150,105,0.4)' }}
                    onClick={() => {
                      setAppliedCoupon(wonReward);
                      setShowSpinWheelModal(false);
                      setLimitWarning(`Coupon ${wonReward.code} applied to cart!`);
                      setTimeout(() => setLimitWarning(null), 3500);
                    }}
                  >
                    Apply Coupon ({wonReward.code}) to Cart
                  </button>
                </motion.div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── 4KIT 5-TAB BOTTOM NAVIGATION DOCK ─── */}
      <div className="glovo-bottom-dock">
        <button
          className={`dock-tab-btn ${currentScreen === 'home' ? 'active' : ''}`}
          style={currentScreen === 'home' ? { background: activeTheme.gradient, boxShadow: activeTheme.glow } : {}}
          onClick={() => setCurrentScreen('home')}
        >
          <Home size={18} className="dock-tab-icon" /> <span>Home</span>
        </button>
        <button
          className={`dock-tab-btn ${currentScreen === 'discover' ? 'active' : ''}`}
          style={currentScreen === 'discover' ? { background: activeTheme.gradient, boxShadow: activeTheme.glow } : {}}
          onClick={() => setCurrentScreen('discover')}
        >
          <Compass size={18} className="dock-tab-icon" /> <span>Discover</span>
        </button>
        <button
          className={`dock-tab-btn ${currentScreen === 'multiorder' ? 'active' : ''}`}
          style={currentScreen === 'multiorder' ? { background: activeTheme.gradient, boxShadow: activeTheme.glow } : {}}
          onClick={() => setCurrentScreen('multiorder')}
        >
          <Zap size={18} className="dock-tab-icon" /> <span>Multi-Order</span>
        </button>
        <button
          className={`dock-tab-btn ${currentScreen === 'cart' || currentScreen === 'tracker' ? 'active' : ''}`}
          style={(currentScreen === 'cart' || currentScreen === 'tracker') ? { background: activeTheme.gradient, boxShadow: activeTheme.glow } : {}}
          onClick={() => setCurrentScreen('cart')}
        >
          <ClipboardList size={18} className="dock-tab-icon" /> <span>Orders</span>
        </button>
        <button
          className={`dock-tab-btn ${currentScreen === 'profile' ? 'active' : ''}`}
          style={currentScreen === 'profile' ? { background: activeTheme.gradient, boxShadow: activeTheme.glow } : {}}
          onClick={() => setCurrentScreen('profile')}
        >
          <User size={18} className="dock-tab-icon" /> <span>Profile</span>
        </button>
      </div>
    </div>
  );
}
