import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Easing,
  Image,
  ImageBackground,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { serviceRules } from "@nearnow/config";
import { Store, InventoryItem } from "@nearnow/core";
import {
  Card,
  CartLoadingIndicator,
  CategoryChip,
  FeaturedBadge,
  HeroCard,
  Notice,
  RatingPill,
  SearchBar,
  SectionTitle,
  StoreImageCard,
  colors,
  radius,
  spacing
} from "@nearnow/ui";
import { useClientStores } from "../../../hooks/useSupabaseData";

type MainCategory = "provisions" | "food" | "ride";

const munchiesItems = [
  { id: "munch1", name: "Chilled Cold Brew", price: 95, unit: "bottle", inStock: true, image: "https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=200&h=200&fit=crop" },
  { id: "munch2", name: "Spicy Shin Ramen", price: 120, unit: "cup", inStock: true, image: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=200&h=200&fit=crop" },
  { id: "munch3", name: "Truffle Potato Chips", price: 75, unit: "pack", inStock: true, image: "https://images.unsplash.com/photo-1566478989037-eec170784d20?w=200&h=200&fit=crop" },
  { id: "munch4", name: "Insta Guac Box", price: 180, unit: "box", inStock: true, image: "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=200&h=200&fit=crop" }
];

const foodCuisines = [
  { name: "Biryani", filterKey: "Restaurants", tag: "50% OFF", image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=200&h=280&fit=crop" },
  { name: "Burgers", filterKey: "Burgers", tag: "BUY 1 GET 1", image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=200&h=280&fit=crop" },
  { name: "Pizzas", filterKey: "Pizza", tag: "FLAT Rs 125 OFF", image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=200&h=280&fit=crop" },
  { name: "Desserts", filterKey: "Bakery", tag: "30% OFF", image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=200&h=280&fit=crop" }
];

const instamartGridCategories = [
  { name: "Vegetables & Fruit", filterKey: "Groceries", tag: "40% OFF", image: "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=150&h=150&fit=crop" },
  { name: "Dairy & Bread", filterKey: "Groceries", tag: "BUY 1 GET 1", image: "https://images.unsplash.com/photo-1563636619-e9143da7973b?w=150&h=150&fit=crop" },
  { name: "Snacks & Munchies", filterKey: "Groceries", tag: "FLAT 30%", image: "https://images.unsplash.com/photo-1566478989037-eec170784d20?w=150&h=150&fit=crop" },
  { name: "Wellness OTC", filterKey: "Pharmacy", tag: "10-MIN Drop", image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=150&h=150&fit=crop" },
  { name: "Daily Bakery", filterKey: "Bakery", tag: "WARM BREAD", image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=150&h=150&fit=crop" },
  { name: "Drinks & Soda", filterKey: "Groceries", tag: "FREE Delivery", image: "https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=150&h=150&fit=crop" },
  { name: "Atta, Rice & Dals", filterKey: "Groceries", tag: "SAVE Rs 100", image: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=150&h=150&fit=crop" },
  { name: "Baby Care & Toys", filterKey: "Groceries", tag: "15% OFF", image: "https://images.unsplash.com/photo-1515488042361-404e9250afef?w=150&h=150&fit=crop" }
];

/* ─── InfiniteLoopScroll (seamless loop carousel using duplication resets) ─── */
function InfiniteLoopScroll<T>({
  data,
  itemWidth,
  gap = 12,
  renderItem
}: {
  data: T[];
  itemWidth: number;
  gap?: number;
  renderItem: (item: T, index: number) => React.ReactNode;
}) {
  const scrollViewRef = useRef<ScrollView>(null);
  const singleSetWidth = data.length * (itemWidth + gap);
  const duplicatedData = useMemo(() => [...data, ...data, ...data], [data]);

  useEffect(() => {
    // Initial mount position at start of set 1 (the middle set)
    setTimeout(() => {
      scrollViewRef.current?.scrollTo({ x: singleSetWidth, animated: false });
    }, 120);
  }, [singleSetWidth]);

  const handleScroll = (event: any) => {
    const x = event.nativeEvent.contentOffset.x;
    if (x >= singleSetWidth * 2) {
      scrollViewRef.current?.scrollTo({ x: x - singleSetWidth, animated: false });
    } else if (x <= singleSetWidth - itemWidth) {
      scrollViewRef.current?.scrollTo({ x: x + singleSetWidth, animated: false });
    }
  };

  return (
    <ScrollView
      ref={scrollViewRef}
      horizontal
      showsHorizontalScrollIndicator={false}
      onScroll={handleScroll}
      scrollEventThrottle={16}
      contentContainerStyle={{ gap }}
    >
      {duplicatedData.map((item, idx) => (
        <View key={idx} style={{ width: itemWidth }}>
          {renderItem(item, idx % data.length)}
        </View>
      ))}
    </ScrollView>
  );
}


export function ClientHomeScreen({
  onStorePress,
  onQuickAdd,
  cartCount = 0,
  onGoToCart
}: {
  onStorePress: (store: Store) => void;
  onQuickAdd?: (item: any) => void;
  cartCount?: number;
  onGoToCart?: () => void;
}) {
  const [mainCategory, setMainCategory] = useState<MainCategory>("provisions");
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [pendingFilter, setPendingFilter] = useState<string | null>(null);
  const [isFilterLoading, setIsFilterLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const filterTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  // Custom states for Swiggy/Uber/Instamart parity
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [flashTimeLeft, setFlashTimeLeft] = useState(522);
  const [foodFilters, setFoodFilters] = useState({
    fastDelivery: false,
    topRated: false,
    pureVeg: false,
    offers: false
  });
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const [scheduledTime, setScheduledTime] = useState("");
  const [scheduleSuccess, setScheduleSuccess] = useState(false);

  // Flash timer decrement
  useEffect(() => {
    const timer = setInterval(() => {
      setFlashTimeLeft((prev) => (prev > 0 ? prev - 1 : 600));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formattedFlashTime = useMemo(() => {
    const mins = Math.floor(flashTimeLeft / 60);
    const secs = flashTimeLeft % 60;
    return `${mins.toString().padStart(2, "0")}m ${secs.toString().padStart(2, "0")}s`;
  }, [flashTimeLeft]);

  const allStores = useClientStores();

  const handleMainCategoryChange = (category: MainCategory) => {
    setActiveFilter(null);
    setPendingFilter(null);
    setSearchQuery("");
    setMainCategory(category);
  };

  const handleQuickAdd = (item: any) => {
    if (onQuickAdd) {
      onQuickAdd(item);
    }
  };

  const handleIncrement = (itemId: string, item: any) => {
    setQuantities((prev) => ({
      ...prev,
      [itemId]: (prev[itemId] || 0) + 1
    }));
    handleQuickAdd(item);
  };

  const handleDecrement = (itemId: string) => {
    setQuantities((prev) => {
      const next = { ...prev };
      if (next[itemId] > 1) {
        next[itemId] -= 1;
      } else {
        delete next[itemId];
      }
      return next;
    });
  };

  const cartTotal = useMemo(() => {
    return Object.entries(quantities).reduce((acc, [id, qty]) => {
      const item = munchiesItems.find((i) => i.id === id);
      return acc + (item ? item.price * qty : 0);
    }, 0);
  }, [quantities]);

  // Dynamic colors for categories
  const categoryTheme = useMemo(() => {
    if (mainCategory === "ride") {
      return {
        primary: "#FFB300", // Sunset Amber/Gold
        faint: "#FFF8E1", // Soft amber pastel background
        soft: "#FFE082" // Light amber border
      };
    } else if (mainCategory === "food") {
      return {
        primary: "#FF2E63", // Pink/red
        faint: "#FFEBEE", // Soft crimson pastel background
        soft: "#FFCDD2" // Light crimson border
      };
    } else {
      return {
        primary: "#00C853", // Green
        faint: "#E8F5E9", // Soft green pastel background
        soft: "#C8E6C9" // Light green border
      };
    }
  }, [mainCategory]);

  const categoryStores = useMemo(() => {
    if (mainCategory === "food") {
      return allStores.filter((s) =>
        ["restaurants", "burgers", "pizza"].includes(s.category.toLowerCase())
      );
    } else if (mainCategory === "provisions") {
      return allStores.filter((s) =>
        ["groceries", "pharmacy", "bakery", "daily needs", "fresh veg"].includes(
          s.category.toLowerCase()
        )
      );
    }
    return [];
  }, [allStores, mainCategory]);

  const previewFilter = pendingFilter ?? activeFilter;

  const previewStores = useMemo(() => {
    let result = categoryStores;
    if (previewFilter) {
      result = result.filter(
        (store) => store.category.toLowerCase() === previewFilter.toLowerCase()
      );
    }
    if (mainCategory === "food") {
      if (foodFilters.fastDelivery) {
        result = result.filter((s) => {
          const m = parseInt(s.eta) || 30;
          return m <= 25;
        });
      }
      if (foodFilters.topRated) {
        result = result.filter((s) => s.rating >= 4.5);
      }
      if (foodFilters.pureVeg) {
        result = result.filter((s) => s.name.toLowerCase().includes("veg") || s.featured);
      }
      if (foodFilters.offers) {
        result = result.filter((s) => s.highlight && s.highlight.length > 0);
      }
    }
    if (searchQuery.trim().length > 0) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (store) =>
          store.name.toLowerCase().includes(q) ||
          store.category.toLowerCase().includes(q) ||
          (store.highlight && store.highlight.toLowerCase().includes(q))
      );
    }
    return result;
  }, [previewFilter, categoryStores, searchQuery, foodFilters, mainCategory]);

  const filteredStores = useMemo(() => {
    let result = categoryStores;
    if (activeFilter) {
      result = result.filter(
        (store) => store.category.toLowerCase() === activeFilter.toLowerCase()
      );
    }
    if (mainCategory === "food") {
      if (foodFilters.fastDelivery) {
        result = result.filter((s) => {
          const m = parseInt(s.eta) || 30;
          return m <= 25;
        });
      }
      if (foodFilters.topRated) {
        result = result.filter((s) => s.rating >= 4.5);
      }
      if (foodFilters.pureVeg) {
        result = result.filter((s) => s.name.toLowerCase().includes("veg") || s.featured);
      }
      if (foodFilters.offers) {
        result = result.filter((s) => s.highlight && s.highlight.length > 0);
      }
    }
    if (searchQuery.trim().length > 0) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (store) =>
          store.name.toLowerCase().includes(q) ||
          store.category.toLowerCase().includes(q) ||
          (store.highlight && store.highlight.toLowerCase().includes(q))
      );
    }
    return result;
  }, [activeFilter, categoryStores, searchQuery, foodFilters, mainCategory]);

  const featuredOnly = useMemo(
    () => categoryStores.filter((store) => store.featured),
    [categoryStores]
  );

  const spotlightStore = !previewFilter ? featuredOnly[0] : previewStores[0] ?? null;

  const handleCategoryPress = (category: string) => {
    const nextFilter =
      previewFilter?.toLowerCase() === category.toLowerCase() ? null : category;

    if (filterTimer.current) {
      clearTimeout(filterTimer.current);
    }

    setPendingFilter(nextFilter);
    setIsFilterLoading(true);

    filterTimer.current = setTimeout(() => {
      setActiveFilter(nextFilter);
      setPendingFilter(null);
      setIsFilterLoading(false);
      filterTimer.current = null;
    }, 500);
  };

  const subCategories = useMemo(() => {
    if (mainCategory === "food") {
      return ["Restaurants", "Burgers", "Pizza"];
    }
    return ["Groceries", "Pharmacy", "Bakery"];
  }, [mainCategory]);

  // Main Category Captions
  const categoryCaption = useMemo(() => {
    if (mainCategory === "ride") {
      return "Direct route-aligned bike sharing for efficient and cost-effective commuting.";
    } else if (mainCategory === "food") {
      return "Zero delivery charge on meals matched with active neighborhood delivery routes.";
    }
    return "Fulfillment of daily essentials, groceries, and wellness products in 10-15 minutes.";
  }, [mainCategory]);

  return (
    <>
      {/* ─── Upper Side: Category Switcher Cards ─── */}
      <View style={styles.switcherContainer}>
        <SwitcherCard
          active={mainCategory === "ride"}
          label="RIDE"
          tag="COMMUTE"
          sublabel="Direct Transit"
          accentColor="#FFB300"
          onPress={() => handleMainCategoryChange("ride")}
        />
        <SwitcherCard
          active={mainCategory === "food"}
          label="FOOD"
          tag="RESTAURANTS"
          sublabel="Zero Fee Eats"
          accentColor="#FF2E63"
          onPress={() => handleMainCategoryChange("food")}
        />
        <SwitcherCard
          active={mainCategory === "provisions"}
          label="PROVISIONS"
          tag="ESSENTIALS"
          sublabel="10-Min Fast"
          accentColor="#00E676"
          onPress={() => handleMainCategoryChange("provisions")}
        />
      </View>

      {/* Category Slogan Highlight */}
      <AnimatedCaptionBar
        text={categoryCaption}
        primaryColor={categoryTheme.primary}
        faintColor={categoryTheme.faint}
        softColor={categoryTheme.soft}
        categoryKey={mainCategory}
      />

      {/* Live Corridor Matches Ticker */}
      <LiveTicker accentColor={categoryTheme.primary} />

      {/* ─── Down Side: Content ─── */}
      {mainCategory === "ride" ? (
        <RideBookingSection
          accentColor={categoryTheme.primary}
          isScheduleOpen={isScheduleOpen}
          setIsScheduleOpen={setIsScheduleOpen}
          scheduledTime={scheduledTime}
          setScheduledTime={setScheduledTime}
          scheduleSuccess={scheduleSuccess}
          setScheduleSuccess={setScheduleSuccess}
        />
      ) : (
        <>
          {/* Instamart Free Delivery Goal Bar (Only for Provisions) */}
          {mainCategory === "provisions" && (
            <View style={styles.deliveryGoalWrap}>
              <View style={styles.deliveryGoalHeader}>
                <Text style={styles.deliveryGoalTitle}>
                  {cartTotal >= 250
                    ? "Congratulations! You unlocked FREE express delivery!"
                    : `Add Rs ${250 - cartTotal} more for FREE express delivery`}
                </Text>
                <Text style={styles.deliveryGoalValue}>Rs {cartTotal} / Rs 250</Text>
              </View>
              <View style={styles.deliveryProgressBarBg}>
                <View
                  style={[
                    styles.deliveryProgressBarFill,
                    { width: `${(Math.min(250, cartTotal) / 250) * 100}%`, backgroundColor: "#00E676" }
                  ]}
                />
              </View>
            </View>
          )}

          {/* Glovo Signature Floating Category Bubbles Grid */}
          <View style={styles.glovoBubbleGridWrap}>
            <View style={styles.glovoBubbleHeaderRow}>
              <Text style={styles.glovoBubbleGridTitle}>What can we deliver for you?</Text>
              <Text style={styles.glovoBubbleGridSub}>Explore categories</Text>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.glovoBubbleScrollContent}
            >
              {glovoCategoriesList.map((cat, idx) => {
                const isActive = previewFilter?.toLowerCase() === cat.filterKey.toLowerCase();
                return (
                  <GlovoCategoryBubbleItem
                    key={cat.id}
                    item={cat}
                    active={isActive}
                    index={idx}
                    onPress={() => handleCategoryPress(cat.filterKey)}
                  />
                );
              })}
            </ScrollView>
          </View>

          <SearchBar
            label={
              mainCategory === "food"
                ? "Search restaurants, menu items, or cuisines..."
                : "Search grocery products, wellness items, or bakery..."
            }
            value={searchQuery}
            onChangeText={setSearchQuery}
          />

          {/* Interactive Food Filters Row (Only for Food) */}
          {mainCategory === "food" && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filterChipsScroll}
            >
              <Pressable
                onPress={() => setFoodFilters(p => ({ ...p, fastDelivery: !p.fastDelivery }))}
                style={[styles.filterChip, foodFilters.fastDelivery && { backgroundColor: "#FF2E63", borderColor: "#FF2E63" }]}
              >
                <Text style={[styles.filterChipText, foodFilters.fastDelivery && { color: "#FFFFFF" }]}>Fast Delivery (under 25 mins)</Text>
              </Pressable>
              <Pressable
                onPress={() => setFoodFilters(p => ({ ...p, topRated: !p.topRated }))}
                style={[styles.filterChip, foodFilters.topRated && { backgroundColor: "#FF2E63", borderColor: "#FF2E63" }]}
              >
                <Text style={[styles.filterChipText, foodFilters.topRated && { color: "#FFFFFF" }]}>Ratings 4.5+</Text>
              </Pressable>
              <Pressable
                onPress={() => setFoodFilters(p => ({ ...p, pureVeg: !p.pureVeg }))}
                style={[styles.filterChip, foodFilters.pureVeg && { backgroundColor: "#FF2E63", borderColor: "#FF2E63" }]}
              >
                <Text style={[styles.filterChipText, foodFilters.pureVeg && { color: "#FFFFFF" }]}>Pure Veg</Text>
              </Pressable>
              <Pressable
                onPress={() => setFoodFilters(p => ({ ...p, offers: !p.offers }))}
                style={[styles.filterChip, foodFilters.offers && { backgroundColor: "#FF2E63", borderColor: "#FF2E63" }]}
              >
                <Text style={[styles.filterChipText, foodFilters.offers && { color: "#FFFFFF" }]}>Great Offers</Text>
              </Pressable>
            </ScrollView>
          )}

          {/* Flash Deal countdown banner (Only for Provisions) */}
          {mainCategory === "provisions" && (
            <View style={styles.flashBanner}>
              <View style={styles.flashBadge}>
                <Text style={styles.flashBadgeText}>FLASH DEAL</Text>
              </View>
              <Text style={styles.flashText}>STAPLES STOCK CLEARANCE</Text>
              <Text style={styles.flashTimer}>ENDS IN {formattedFlashTime}</Text>
            </View>
          )}

          {/* Promo Deals Banners Carousel - Infinite loop */}
          <View style={{ marginBottom: spacing.md }}>
            <InfiniteLoopScroll
              itemWidth={260}
              gap={12}
              data={mainCategory === "food" ? [
                { tag: "EXPRESS FARE CLONE", title: "Direct Fare Cloner", sub: "Match active runners to clone fare down by 50% instantly." },
                { tag: "ZERO TAX STACK", title: "Free Route Stack", sub: "Eat for free delivery when stacked on active neighborhood routes." },
                { tag: "ROUTE DISCOUNTS", title: "Stacked Discounts", sub: "High-density hot stacks from local kitchens passing your lane." }
              ] : [
                { tag: "10-MIN SPEEDRUN", title: "Daily Staples Fast", sub: "Instant drop-offs by active route-aligned riders nearby." },
                { tag: "ROUTE MATCHED", title: "Milk & Munchies", sub: "Save Rs 100 when delivery runs stack with active lane orders." },
                { tag: "OTC QUICK ADD", title: "Health Quick-Add", sub: "Local pharmacy items stacked on on-route neighborhood runs." }
              ]}
              renderItem={(item, idx) => (
                <AnimatedPromoCard delay={0} bgColor={mainCategory === "food" ? "#451421" : "#143322"}>
                  <Text style={styles.promoTag}>{item.tag}</Text>
                  <Text style={styles.promoTitle}>{item.title}</Text>
                  <Text style={styles.promoSub}>{item.sub}</Text>
                </AnimatedPromoCard>
              )}
            />
          </View>

          {/* High-density grid visual depending on active category */}
          {mainCategory === "provisions" ? (
            <View style={styles.sectionSpacing}>
              <Text style={[styles.dashboardTitle, { color: categoryTheme.primary }]}>
                Essentials Deal Zones
              </Text>
              
              {/* Infinite scroll loop for provisions deals */}
              <InfiniteLoopScroll
                itemWidth={230}
                gap={16}
                data={[
                  { title: "Speedrun\nStaples", badgeText: "FLAT\n50%\nOFF", badgeBg: "#00E676", desc: "Order stacked farm fresh veg with half-price express delivery." },
                  { title: "Route\nRebate", badgeText: "SAVE\nRs 100", badgeBg: "#FFB300", desc: "Get instant cashback on grocery stacks aligned with active lanes." },
                  { title: "Pantry\nFeast", badgeText: "FLAT\n30%\nOFF", badgeBg: "#00E676", desc: "Local warehouse essentials stacked along active rider corridors." }
                ]}
                renderItem={(item) => (
                  <SwiggyDealCard
                    bgColor="#161824"
                    title={item.title}
                    titleColor="#FFFFFF"
                    badgeText={item.badgeText}
                    badgeBg={item.badgeBg}
                    desc={item.desc}
                  />
                )}
              />

              {/* Instamart-style 2x4 category grid (Crowded & structured category listing) */}
              <Text style={[styles.dashboardTitle, { color: categoryTheme.primary, marginTop: spacing.md }]}>
                Trending Categories
              </Text>
              <View style={styles.instamartGrid}>
                {instamartGridCategories.map((cat, index) => (
                  <Pressable
                    key={index}
                    style={styles.instamartGridCard}
                    onPress={() => handleCategoryPress(cat.filterKey)}
                  >
                    <Image source={{ uri: cat.image }} style={styles.instamartGridCardImg as any} />
                    <View style={styles.instamartGridLabelWrap}>
                      <Text style={styles.instamartGridCardLabel} numberOfLines={1}>{cat.name}</Text>
                      <View style={[styles.instamartGridTag, { borderColor: categoryTheme.primary }]}>
                        <Text style={[styles.instamartGridTagText, { color: categoryTheme.primary }]}>{cat.tag}</Text>
                      </View>
                    </View>
                  </Pressable>
                ))}
              </View>
            </View>
          ) : (
            <View style={styles.sectionSpacing}>
              <Text style={[styles.dashboardTitle, { color: categoryTheme.primary }]}>
                Cuisine Quick Select
              </Text>
              
              {/* Infinite loop scroll for cuisines selection list */}
              <InfiniteLoopScroll
                itemWidth={105}
                gap={12}
                data={foodCuisines}
                renderItem={(cuisine) => (
                  <HoverableCuisineCard
                    item={cuisine}
                    accentColor={categoryTheme.primary}
                    onPress={() => handleCategoryPress(cuisine.filterKey)}
                  />
                )}
              />

              <Text style={[styles.dashboardTitle, { color: categoryTheme.primary, marginTop: spacing.md }]}>
                Deal Feast Banners
              </Text>

              {/* Infinite scroll loop for deal vouchers */}
              <InfiniteLoopScroll
                itemWidth={230}
                gap={16}
                data={[
                  { title: "Top Brands\nTop Deals", badgeText: "FLAT\nRs 100\nOFF", badgeBg: "#FF2E63", desc: "Stacked meals from premium kitchens aligned with local runners." },
                  { title: "Deal\nFeast", badgeText: "GET\n70%\nOFF", badgeBg: "#00E676", desc: "Matched courier routes waive your delivery fee automatically." },
                  { title: "Direct\nFare Split", badgeText: "SPLIT\n50%\nSAVE", badgeBg: "#FFB300", desc: "Eat with nearby neighbors on route to clone your delivery costs down." }
                ]}
                renderItem={(item) => (
                  <SwiggyDealCard
                    bgColor="#161824"
                    title={item.title}
                    titleColor="#FFFFFF"
                    badgeText={item.badgeText}
                    badgeBg={item.badgeBg}
                    desc={item.desc}
                  />
                )}
              />
            </View>
          )}

          {/* Instamart-style Quick Add Munchies (Only for Provisions category) */}
          {mainCategory === "provisions" && onQuickAdd && (
            <View style={styles.sectionSpacing}>
              <SectionTitle title="Quick Add Essentials" action="Select Items" />
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.munchiesScroll}
              >
                {munchiesItems.map((item) => {
                  const qty = quantities[item.id] || 0;
                  return (
                    <View key={item.id} style={styles.munchyCard}>
                      <Image source={{ uri: item.image }} style={styles.munchyImage as any} />
                      <View style={styles.munchyInfo}>
                        <Text style={styles.munchyName} numberOfLines={1}>
                          {item.name}
                        </Text>
                        <Text style={styles.munchyUnit}>{item.unit}</Text>
                        <View style={styles.munchyPriceRow}>
                          <Text style={styles.munchyPrice}>Rs {item.price}</Text>
                          <QuantitySelector
                            count={qty}
                            onIncrement={() => handleIncrement(item.id, item)}
                            onDecrement={() => handleDecrement(item.id)}
                            accentColor={categoryTheme.primary}
                          />
                        </View>
                      </View>
                    </View>
                  );
                })}
              </ScrollView>
            </View>
          )}

          <View style={styles.sectionSpacing}>
            <SectionTitle
              title="Shop by category"
              action={`Within ${serviceRules.localityRadiusKm} km`}
            />
            <View style={styles.rowWrap}>
              {subCategories.map((category) => (
                <CategoryChip
                  key={category}
                  label={category}
                  solid={previewFilter?.toLowerCase() === category.toLowerCase()}
                  onPress={() => handleCategoryPress(category)}
                />
              ))}
            </View>
          </View>

          {isFilterLoading ? (
            <CartLoadingIndicator
              title={
                previewFilter
                  ? `Loading ${previewFilter.toLowerCase()} items`
                  : "Reloading nearby stores"
              }
              subtitle="Accessing inventory at closest merchant locations."
            />
          ) : null}

          {!isFilterLoading && !previewFilter && spotlightStore ? (
            <View style={styles.sectionSpacing}>
              <SectionTitle title="Featured now" />
              <FeaturedSpotlight store={spotlightStore} onPress={onStorePress} />
            </View>
          ) : null}

          {!isFilterLoading ? (
            <View style={styles.sectionSpacing}>
              <SectionTitle
                title={previewFilter ? `${previewFilter} stores` : "Popular near you"}
              />
              {filteredStores.length > 0 ? (
                filteredStores.map((store, index) => (
                  <StoreCardBlock
                    key={store.id}
                    store={store}
                    featured={store.featured}
                    onPress={onStorePress}
                    entranceIndex={index}
                  />
                ))
              ) : (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyTitle}>No stores in this category nearby</Text>
                  <Text style={styles.emptyBody}>
                    Try a different category or clear the filter to explore more.
                  </Text>
                </View>
              )}
            </View>
          ) : null}
        </>
      )}
    </>
  );
}

/* ─── Animated Caption Bar (cross-fade on category change) ─── */
function AnimatedCaptionBar({
  text,
  primaryColor,
  faintColor,
  softColor,
  categoryKey
}: {
  text: string;
  primaryColor: string;
  faintColor: string;
  softColor: string;
  categoryKey: string;
}) {
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;
  const prevKey = useRef(categoryKey);

  useEffect(() => {
    if (prevKey.current !== categoryKey) {
      prevKey.current = categoryKey;
      Animated.sequence([
        Animated.parallel([
          Animated.timing(fadeAnim, { toValue: 0, duration: 120, useNativeDriver: true }),
          Animated.timing(slideAnim, { toValue: -6, duration: 120, useNativeDriver: true })
        ]),
        Animated.parallel([
          Animated.timing(fadeAnim, { toValue: 1, duration: 280, easing: Easing.out(Easing.quad), useNativeDriver: true }),
          Animated.spring(slideAnim, { toValue: 0, friction: 8, tension: 120, useNativeDriver: true })
        ])
      ]).start();
    }
  }, [categoryKey, fadeAnim, slideAnim]);

  return (
    <Animated.View
      style={[
        styles.captionHighlightBar,
        {
          backgroundColor: faintColor,
          borderColor: softColor,
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }]
        }
      ]}
    >
      <Text style={[styles.captionHighlightText, { color: primaryColor }]}>
        {text}
      </Text>
    </Animated.View>
  );
}

/* ─── Animated Promo Card (entrance stagger) ─── */
function AnimatedPromoCard({
  delay = 0,
  bgColor,
  opacity = 1,
  children
}: {
  delay?: number;
  bgColor: string;
  opacity?: number;
  children: React.ReactNode;
}) {
  const enterAnim = useRef(new Animated.Value(0)).current;
  const enterX = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(enterAnim, { toValue: 1, duration: 380, delay, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.spring(enterX, { toValue: 0, friction: 9, tension: 100, delay, useNativeDriver: true } as any)
    ]).start();
  }, [enterAnim, enterX, delay]);

  return (
    <Animated.View
      style={[
        styles.promoCard,
        { backgroundColor: bgColor, opacity: enterAnim.interpolate({ inputRange: [0, 1], outputRange: [0, opacity] }), transform: [{ translateX: enterX }] }
      ]}
    >
      {children}
    </Animated.View>
  );
}

/* ─── Animated Quick Add Button ─── */
function AnimatedQuickAddBtn({
  accentColor,
  onPress
}: {
  accentColor: string;
  onPress: () => void;
}) {
  const scale = useRef(new Animated.Value(1)).current;
  const rotation = useRef(new Animated.Value(0)).current;

  const handlePress = () => {
    onPress();
    Animated.sequence([
      Animated.parallel([
        Animated.timing(scale, { toValue: 1.4, duration: 100, useNativeDriver: true }),
        Animated.timing(rotation, { toValue: 1, duration: 200, easing: Easing.out(Easing.back(2)), useNativeDriver: true })
      ]),
      Animated.spring(scale, { toValue: 1, friction: 4, tension: 200, useNativeDriver: true }),
    ]).start(() => rotation.setValue(0));
  };

  const rotate = rotation.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "90deg"] });

  return (
    <Pressable onPress={handlePress}>
      <Animated.View style={[styles.quickAddBtn, { backgroundColor: accentColor, transform: [{ scale }, { rotate }] }]}>
        <Text style={styles.quickAddBtnText}>+</Text>
      </Animated.View>
    </Pressable>
  );
}

/* ─── Swiggy-style 3D-emblem Deal Card ─── */
function SwiggyDealCard({
  bgColor,
  title,
  titleColor,
  badgeText,
  badgeBg,
  desc
}: {
  bgColor: string;
  title: string;
  titleColor: string;
  badgeText: string;
  badgeBg: string;
  desc: string;
}) {
  const [hovered, setHovered] = useState(false);
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.timing(scale, {
      toValue: hovered ? 1.05 : 1,
      duration: 150,
      useNativeDriver: true
    }).start();
  }, [hovered, scale]);

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <Pressable
        {...({
          onMouseEnter: () => setHovered(true),
          onMouseLeave: () => setHovered(false),
          onPressIn: () => setHovered(true),
          onPressOut: () => setHovered(false)
        } as any)}
        style={[styles.swiggyCard, { backgroundColor: "#FFFFFF", borderColor: badgeBg }]}
      >
        <Text style={[styles.swiggyCardTitle, { color: "#1E202C" }]}>
          {title.replace("\\n", "\n")}
        </Text>
        <View style={styles.swiggyCardContent}>
          <View style={[styles.swiggyEmblem, { backgroundColor: badgeBg + "12", borderColor: badgeBg, borderWidth: 1.5 }]}>
            <Text style={[styles.swiggyEmblemText, { color: badgeBg }]}>{badgeText.replace("\\n", "\n")}</Text>
          </View>
          <Text style={styles.swiggyCardDesc} numberOfLines={3}>{desc}</Text>
        </View>
      </Pressable>
    </Animated.View>
  );
}

/* ─── Overhauled Hoverable Card Cuisine (Image extended with LinearGradient overlay) ─── */
function HoverableCuisineCard({
  item,
  onPress,
  accentColor
}: {
  item: any;
  onPress: () => void;
  accentColor: string;
}) {
  const [hovered, setHovered] = useState(false);
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.timing(scale, {
      toValue: hovered ? 1.08 : 1,
      duration: 150,
      useNativeDriver: true
    }).start();
  }, [hovered, scale]);

  return (
    <Pressable
      onPress={onPress}
      {...({
        onPressIn: () => setHovered(true),
        onPressOut: () => setHovered(false),
        onMouseEnter: () => setHovered(true),
        onMouseLeave: () => setHovered(false)
      } as any)}
    >
      <Animated.View
        style={[
          styles.premiumCuisineCard,
          hovered && { borderColor: accentColor, borderWidth: 2.5 },
          { transform: [{ scale }] }
        ]}
      >
        <ImageBackground
          source={{ uri: item.image }}
          style={styles.premiumCuisineCardImgBg}
          imageStyle={{ borderRadius: 18 }}
        >
          <View style={[styles.cuisineFloatingTag, { position: "absolute", top: 8, right: 8, borderColor: accentColor }]}>
            <Text style={[styles.cuisineFloatingTagText, { color: accentColor }]}>{item.tag}</Text>
          </View>
          <LinearGradient
            colors={["rgba(11, 12, 16, 0.95)", "rgba(11, 12, 16, 0.2)", "transparent"]}
            start={{ x: 0.5, y: 1 }}
            end={{ x: 0.5, y: 0 }}
            style={styles.premiumCuisineCardOverlay}
          >
            <Text style={styles.premiumCuisineCardLabel}>{item.name}</Text>
          </LinearGradient>
        </ImageBackground>
      </Animated.View>
    </Pressable>
  );
}

/* ─── Glovo Signature Floating Category Bubble Component ─── */
const glovoCategoriesList = [
  { id: "food", name: "Food", sub: "Restaurants", icon: "🍔", bg: "#FFC244", ring: "#F2AB00", filterKey: "Restaurants" },
  { id: "groceries", name: "Supermarket", sub: "15-min drop", icon: "🛒", bg: "#00A082", ring: "#00836B", filterKey: "Groceries" },
  { id: "pharmacy", name: "Pharmacy", sub: "Meds & Care", icon: "💊", bg: "#2980B9", ring: "#1F618D", filterKey: "Pharmacy" },
  { id: "courier", name: "Express", sub: "Send Anything", icon: "📦", bg: "#8E44AD", ring: "#6C3483", filterKey: "Daily Needs" },
  { id: "munchies", name: "Snacks", sub: "Drinks & Chips", icon: "🍿", bg: "#FF5252", ring: "#C0392B", filterKey: "Bakery" },
  { id: "pastry", name: "Bakery", sub: "Pastry & Cakes", icon: "🥐", bg: "#FF9800", ring: "#D35400", filterKey: "Bakery" }
];

function GlovoCategoryBubbleItem({
  item,
  active,
  onPress,
  index
}: {
  item: typeof glovoCategoriesList[0];
  active: boolean;
  onPress: () => void;
  index: number;
}) {
  const scale = useRef(new Animated.Value(1)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const floatLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: index % 2 === 0 ? -4 : 4,
          duration: 1300 + index * 150,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 1300 + index * 150,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true
        })
      ])
    );
    floatLoop.start();
    return () => floatLoop.stop();
  }, [floatAnim, index]);

  const handlePress = () => {
    Animated.sequence([
      Animated.timing(scale, { toValue: 0.85, duration: 80, useNativeDriver: true }),
      Animated.spring(scale, { toValue: 1, friction: 4, tension: 220, useNativeDriver: true })
    ]).start();
    onPress();
  };

  return (
    <Animated.View
      style={[
        styles.glovoBubbleItemWrap,
        { transform: [{ translateY: floatAnim }, { scale }] }
      ]}
    >
      <Pressable onPress={handlePress} style={styles.glovoBubblePressable}>
        <View
          style={[
            styles.glovoBubbleCircle,
            { backgroundColor: item.bg, borderColor: active ? "#222222" : item.ring },
            active && styles.glovoBubbleActiveRing
          ]}
        >
          <Text style={styles.glovoBubbleIconText}>{item.icon}</Text>
          {active && <View style={styles.glovoBubbleActiveDot} />}
        </View>
        <Text style={[styles.glovoBubbleLabelText, active && styles.glovoBubbleLabelActive]}>
          {item.name}
        </Text>
        <Text style={styles.glovoBubbleSubText} numberOfLines={1}>{item.sub}</Text>
      </Pressable>
    </Animated.View>
  );
}

/* ─── Switcher Card Component ─── */
function SwitcherCard({
  active,
  label,
  tag,
  sublabel,
  accentColor,
  onPress
}: {
  active: boolean;
  label: string;
  tag: string;
  sublabel: string;
  accentColor: string;
  onPress: () => void;
}) {
  const scale = useRef(new Animated.Value(1)).current;
  const shimmerAnim = useRef(new Animated.Value(0)).current;
  const glowOpacity = useRef(new Animated.Value(0)).current;

  // Shimmer sweep on active
  useEffect(() => {
    if (active) {
      glowOpacity.setValue(0);
      Animated.timing(glowOpacity, { toValue: 1, duration: 250, useNativeDriver: true }).start();
      Animated.loop(
        Animated.sequence([
          Animated.timing(shimmerAnim, { toValue: 1, duration: 1200, easing: Easing.linear, useNativeDriver: true }),
          Animated.timing(shimmerAnim, { toValue: 0, duration: 0, useNativeDriver: true })
        ])
      ).start();
    } else {
      Animated.timing(glowOpacity, { toValue: 0, duration: 200, useNativeDriver: true }).start();
      shimmerAnim.stopAnimation();
      shimmerAnim.setValue(0);
    }
  }, [active, shimmerAnim, glowOpacity]);

  const handlePress = () => {
    Animated.sequence([
      Animated.timing(scale, { toValue: 0.90, duration: 70, useNativeDriver: true }),
      Animated.spring(scale, { toValue: 1, friction: 4, tension: 200, useNativeDriver: true })
    ]).start();
    onPress();
  };

  const shimmerTranslate = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-80, 160]
  });

  return (
    <Animated.View style={{ flex: 1, transform: [{ scale }] }}>
      <Pressable
        onPress={handlePress}
        style={[
          styles.switcherCard,
          active && { borderColor: accentColor, backgroundColor: accentColor + "10", borderWidth: 2 }
        ]}
      >
        {/* Shimmer highlight on active */}
        {active && (
          <Animated.View
            style={[
              styles.switcherShimmer,
              { transform: [{ translateX: shimmerTranslate }], opacity: glowOpacity }
            ]}
          />
        )}
        <View style={[styles.switcherTagWrap, active && { backgroundColor: accentColor }]}>
          <Text style={[styles.switcherTagText, active && { color: "#FAF6F0" }]}>
            {tag}
          </Text>
        </View>
        <Text style={[styles.switcherCardLabel, active && { color: accentColor }]}>
          {label}
        </Text>
        <Text style={[styles.switcherCardSub, active && { color: accentColor }]}>
          {sublabel}
        </Text>
      </Pressable>
    </Animated.View>
  );
}

/* ─── Ride Booking Section UI (Google Maps Vibe + Bike Only) ─── */
function RideBookingSection({
  accentColor,
  isScheduleOpen,
  setIsScheduleOpen,
  scheduledTime,
  setScheduledTime,
  scheduleSuccess,
  setScheduleSuccess
}: {
  accentColor: string;
  isScheduleOpen: boolean;
  setIsScheduleOpen: (val: boolean) => void;
  scheduledTime: string;
  setScheduledTime: (val: string) => void;
  scheduleSuccess: boolean;
  setScheduleSuccess: (val: boolean) => void;
}) {
  const [pickup, setPickup] = useState("Flat 301, Tower B, MG Road");
  const [dropoff, setDropoff] = useState("City Center Mall, Sector 15");
  const [vehicle, setVehicle] = useState<"bike" | "bikeprime" | "bikeeco">("bike");
  const [bookingState, setBookingState] = useState<"idle" | "finding" | "confirmed">("idle");
  
  const mapAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(mapAnim, {
          toValue: 1,
          duration: 6000,
          easing: Easing.linear,
          useNativeDriver: false
        }),
        Animated.timing(mapAnim, {
          toValue: 0,
          duration: 0,
          useNativeDriver: false
        })
      ])
    ).start();
  }, [mapAnim]);

  const handleBook = () => {
    setBookingState("finding");
    setTimeout(() => {
      setBookingState("confirmed");
    }, 2200);
  };

  const dotX = mapAnim.interpolate({
    inputRange: [0, 0.4, 0.8, 1],
    outputRange: ["25%", "55%", "65%", "78%"]
  });

  const dotY = mapAnim.interpolate({
    inputRange: [0, 0.4, 0.8, 1],
    outputRange: ["65%", "35%", "50%", "28%"]
  });

  const bikeDetails = {
    bike: { name: "Fork It Moto Express", rate: "Rs 42", eta: "3 min away" },
    bikeprime: { name: "Fork It Moto Premium", rate: "Rs 55", eta: "4 min away" },
    bikeeco: { name: "Fork It Moto Saver", rate: "Rs 35", eta: "6 min away" }
  };

  return (
    <View style={styles.rideCardContainer}>
      <Text style={[styles.rideHeading, { color: accentColor }]}>Book Aligned Transit</Text>
      <Text style={styles.rideSubheading}>
        Only displaying bike transit options that fully match your destination route.
      </Text>

      {bookingState === "idle" ? (
        <>
          {/* Pickup/Drop inputs */}
          <View style={styles.rideInputsWrap}>
            <View style={styles.inputRow}>
              <View style={[styles.inputDot, { backgroundColor: "#588157" }]} />
              <View style={{ flex: 1 }}>
                <Text style={styles.inputLabel}>PICKUP LOCATION</Text>
                <TextInput
                  style={styles.rideInput}
                  value={pickup}
                  onChangeText={setPickup}
                />
              </View>
            </View>

            <View style={styles.inputDivider} />

            <View style={styles.inputRow}>
              <View style={[styles.inputDot, { backgroundColor: accentColor }]} />
              <View style={{ flex: 1 }}>
                <Text style={styles.inputLabel}>DROP-OFF DESTINATION</Text>
                <TextInput
                  style={styles.rideInput}
                  value={dropoff}
                  onChangeText={setDropoff}
                  placeholder="Enter drop-off destination..."
                />
              </View>
            </View>
          </View>

          {/* Premium Google Maps Vector Mockup */}
          <View style={styles.mapWrap}>
            <View style={styles.gMapGrid}>
              <View style={[styles.gStreet, { top: "30%", width: "100%", height: 16 }]} />
              <View style={[styles.gStreet, { top: "65%", width: "100%", height: 12 }]} />
              <View style={[styles.gStreet, { left: "45%", height: "100%", width: 14 }]} />
              <View style={[styles.gStreet, { left: "75%", height: "100%", width: 10 }]} />
              <View style={styles.gRiver} />
              <View style={styles.gPark} />
            </View>

            <View style={styles.gMapControls}>
              <Text style={styles.gMapControlBtn}>+</Text>
              <Text style={styles.gMapControlBtn}>-</Text>
              <View style={styles.gMapCompass}>
                <View style={[styles.compassNeedle, { backgroundColor: accentColor }]} />
              </View>
            </View>

            <View style={styles.gMapsSearchOverlay}>
              <Text style={styles.gMapsSearchText}>Google Maps API - Live Feed</Text>
            </View>

            <View style={[styles.mapRouteLine, { borderColor: accentColor }]} />

            <View style={[styles.mapNode, { left: "20%", top: "60%" }]}>
              <View style={styles.nodeCoreGreen} />
              <Text style={styles.nodeText}>Start</Text>
            </View>

            <View style={[styles.mapNode, { left: "73%", top: "20%" }]}>
              <View style={[styles.nodeCoreRed, { backgroundColor: accentColor }]} />
              <Text style={styles.nodeText}>{dropoff || "Drop"}</Text>
            </View>

            <Animated.View style={[styles.mapVehicleBadge, { left: dotX, top: dotY, backgroundColor: accentColor }]}>
              <View style={styles.vehicleBadgeDot} />
              <Text style={styles.vehicleBadgeText}>Moto</Text>
            </Animated.View>

            <View style={[styles.mapSampleMarker, { left: "55%", top: "72%", backgroundColor: accentColor }]} />
            <View style={[styles.mapSampleMarker, { left: "30%", top: "18%", backgroundColor: accentColor }]} />
          </View>

          {/* High-density Mobility Stats Grid using Swiggy Deal Card Style */}
          <Text style={[styles.dashboardTitle, { color: accentColor }]}>Mobility Analytics</Text>
          <View style={styles.swiggyCardRow}>
            <SwiggyDealCard
              bgColor="#161824"
              title="Active Riders"
              titleColor="#FFFFFF"
              badgeText="42"
              badgeBg={accentColor}
              desc="Delivery partners active along your commute lane corridor."
            />
            <SwiggyDealCard
              bgColor="#161824"
              title="CO2 Saved"
              titleColor="#FFFFFF"
              badgeText="12.8 kg"
              badgeBg={accentColor}
              desc="Carbon emissions offset via shared stacked delivery routing."
            />
          </View>

          {/* Quick Rebook Commutes List */}
          <Text style={[styles.dashboardTitle, { color: accentColor }]}>Recent Commutes</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.commuteScroll}>
            <View style={[styles.commuteHistoryCard, { borderLeftColor: accentColor, borderLeftWidth: 3 }]}>
              <Text style={styles.commuteHistoryDest}>Home to Office</Text>
              <Text style={[styles.commuteHistoryFare, { color: accentColor }]}>SAVE 40% • Aligned Moto</Text>
              <Text style={styles.commuteHistoryRate}>Rs 42</Text>
            </View>
            <View style={[styles.commuteHistoryCard, { borderLeftColor: accentColor, borderLeftWidth: 3 }]}>
              <Text style={styles.commuteHistoryDest}>Sector 21 to City Center</Text>
              <Text style={[styles.commuteHistoryFare, { color: accentColor }]}>SAVE 35% • Premium Moto</Text>
              <Text style={styles.commuteHistoryRate}>Rs 55</Text>
            </View>
          </ScrollView>

          {/* Ride Preference Options */}
          <View style={styles.ridePreferences}>
            <View style={[styles.preferenceItem, { backgroundColor: accentColor + "15", borderColor: accentColor + "30" }]}>
              <Text style={[styles.preferenceText, { color: accentColor }]}>Quiet Ride</Text>
            </View>
            <View style={[styles.preferenceItem, { backgroundColor: accentColor + "15", borderColor: accentColor + "30" }]}>
              <Text style={[styles.preferenceText, { color: accentColor }]}>Helmet Included</Text>
            </View>
            <View style={[styles.preferenceItem, { backgroundColor: accentColor + "15", borderColor: accentColor + "30" }]}>
              <Text style={[styles.preferenceText, { color: accentColor }]}>Eco Route</Text>
            </View>
          </View>

          {/* Vehicle selector list */}
          <View style={styles.onlyDirectBadge}>
            <Text style={styles.onlyDirectText}>Verified: Direct Route-Aligned Commutes Only</Text>
          </View>

          <View style={styles.vehicleList}>
            {(Object.keys(bikeDetails) as Array<keyof typeof bikeDetails>).map((key) => {
              const item = bikeDetails[key];
              const isSelected = vehicle === key;
              return (
                <Pressable
                  key={key}
                  onPress={() => setVehicle(key)}
                  style={[
                    styles.vehicleItem,
                    isSelected && { borderColor: accentColor, backgroundColor: accentColor + "10", borderWidth: 2 }
                  ]}
                >
                  <View style={[styles.vehicleIndicatorIcon, { backgroundColor: accentColor + "20", borderColor: accentColor }]}>
                    <Text style={[styles.vehicleIndicatorIconText, { color: accentColor }]}>M</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                      <Text style={[styles.vehicleName, isSelected && { color: accentColor }]}>
                        {item.name}
                      </Text>
                      <View style={[styles.directPill, { backgroundColor: accentColor }]}>
                        <Text style={styles.directPillText}>100% aligned</Text>
                      </View>
                    </View>
                    <Text style={styles.vehicleEta}>{item.eta} • Direct to {dropoff}</Text>
                  </View>
                  <Text style={[styles.vehicleRate, isSelected && { color: accentColor }]}>
                    {item.rate}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {/* Uber-style Scheduling sheet */}
          {isScheduleOpen && (
            <View style={[styles.scheduleSheet, { borderColor: accentColor }]}>
              <Text style={styles.scheduleTitle}>Select Commute Slot</Text>
              <View style={styles.scheduleTimeRow}>
                {["09:00 AM", "10:30 AM", "05:30 PM", "06:00 PM"].map((t) => (
                  <Pressable
                    key={t}
                    onPress={() => setScheduledTime(t)}
                    style={[styles.timeChip, scheduledTime === t && { backgroundColor: accentColor }]}
                  >
                    <Text style={[styles.timeChipText, scheduledTime === t && { color: "#1E202C" }]}>{t}</Text>
                  </Pressable>
                ))}
              </View>
              <View style={{ flexDirection: "row", gap: 10, marginTop: 10 }}>
                <Pressable
                  onPress={() => {
                    if (scheduledTime) {
                      setScheduleSuccess(true);
                      setTimeout(() => {
                        setScheduleSuccess(false);
                        setIsScheduleOpen(false);
                      }, 2200);
                    }
                  }}
                  style={[styles.scheduleConfirmBtn, { backgroundColor: accentColor }]}
                >
                  <Text style={styles.scheduleConfirmBtnText}>Confirm Schedule</Text>
                </Pressable>
                <Pressable
                  onPress={() => setIsScheduleOpen(false)}
                  style={styles.scheduleCancelBtn}
                >
                  <Text style={styles.scheduleCancelBtnText}>Cancel</Text>
                </Pressable>
              </View>
              {scheduleSuccess && (
                <Text style={[styles.scheduleSuccessText, { color: accentColor }]}>Ride scheduled for {scheduledTime}</Text>
              )}
            </View>
          )}

          {/* CTA Book & Schedule Panel */}
          <View style={{ flexDirection: "row", gap: spacing.sm, marginTop: spacing.md }}>
            <View style={{ flex: 2 }}>
              <AnimatedBookButton
                accentColor={accentColor}
                label={`Confirm Ride (${bikeDetails[vehicle].rate})`}
                onPress={handleBook}
              />
            </View>
            <Pressable
              onPress={() => setIsScheduleOpen(true)}
              style={[styles.scheduleBtn, { borderColor: accentColor }]}
            >
              <Text style={[styles.scheduleBtnText, { color: accentColor }]}>Schedule</Text>
            </Pressable>
          </View>
        </>
      ) : bookingState === "finding" ? (
        <View style={styles.matchingWrap}>
          <PulseRings accentColor={accentColor} />
          <Text style={styles.matchingTitle}>Finding Direct Aligned Rider...</Text>
          <Text style={styles.matchingSubtitle}>
            Connecting you with an on-route delivery bike going directly to {dropoff}.
          </Text>
        </View>
      ) : (
        <AnimatedMatchedCard
          accentColor={accentColor}
          dropoff={dropoff}
          vehicle={vehicle}
          bikeDetails={bikeDetails}
          onCancel={() => setBookingState("idle")}
        />
      )}
    </View>
  );
}

/* ─── Pulse Rings (expanding concentric rings for finding state) ─── */
function PulseRings({ accentColor }: { accentColor: string }) {
  const ring1 = useRef(new Animated.Value(0)).current;
  const ring2 = useRef(new Animated.Value(0)).current;
  const ring3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const createPulse = (anim: Animated.Value, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(anim, { toValue: 1, duration: 1600, easing: Easing.out(Easing.quad), useNativeDriver: true }),
          Animated.timing(anim, { toValue: 0, duration: 0, useNativeDriver: true })
        ])
      );
    createPulse(ring1, 0).start();
    createPulse(ring2, 500).start();
    createPulse(ring3, 1000).start();
  }, [ring1, ring2, ring3]);

  const ringStyle = (anim: Animated.Value) => ({
    position: "absolute" as const,
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: accentColor,
    opacity: anim.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.7, 0.3, 0] }),
    transform: [{ scale: anim.interpolate({ inputRange: [0, 1], outputRange: [0.4, 1.8] }) }]
  });

  return (
    <View style={styles.pulseContainer}>
      <Animated.View style={ringStyle(ring1)} />
      <Animated.View style={ringStyle(ring2)} />
      <Animated.View style={ringStyle(ring3)} />
      <View style={[styles.pulseCore, { backgroundColor: accentColor + "30", borderColor: accentColor }]}>
        <Text style={[styles.matchingSpinner, { color: accentColor }]}>M</Text>
      </View>
    </View>
  );
}

/* ─── Animated Book Button (shimmer + press) ─── */
function AnimatedBookButton({
  accentColor,
  label,
  onPress
}: {
  accentColor: string;
  label: string;
  onPress: () => void;
}) {
  const scale = useRef(new Animated.Value(1)).current;
  const shimmer = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmer, { toValue: 1, duration: 1800, easing: Easing.linear, useNativeDriver: true }),
        Animated.timing(shimmer, { toValue: 0, duration: 0, useNativeDriver: true })
      ])
    ).start();
  }, [shimmer]);

  const handlePressIn = () => {
    Animated.spring(scale, { toValue: 0.95, friction: 8, tension: 300, useNativeDriver: true }).start();
  };
  const handlePressOut = () => {
    Animated.spring(scale, { toValue: 1, friction: 4, tension: 150, useNativeDriver: true }).start();
  };

  const shimmerX = shimmer.interpolate({ inputRange: [0, 1], outputRange: [-120, 320] });

  return (
    <Pressable onPress={onPress} onPressIn={handlePressIn} onPressOut={handlePressOut}>
      <Animated.View style={[styles.bookBtn, { backgroundColor: accentColor, transform: [{ scale }], overflow: "hidden" as never }]}>
        <Animated.View
          style={[
            styles.bookBtnShimmer,
            { transform: [{ translateX: shimmerX }] }
          ]}
        />
        <Text style={styles.bookBtnText}>{label}</Text>
      </Animated.View>
    </Pressable>
  );
}

/* ─── Animated Matched Card (spring bounce entrance) ─── */
function AnimatedMatchedCard({
  accentColor,
  dropoff,
  vehicle,
  bikeDetails,
  onCancel
}: {
  accentColor: string;
  dropoff: string;
  vehicle: "bike" | "bikeprime" | "bikeeco";
  bikeDetails: Record<string, { name: string; rate: string; eta: string }>;
  onCancel: () => void;
}) {
  const slideAnim = useRef(new Animated.Value(40)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const bounceScale = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 300, easing: Easing.out(Easing.quad), useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, friction: 7, tension: 100, useNativeDriver: true } as any),
      Animated.spring(bounceScale, { toValue: 1, friction: 6, tension: 120, useNativeDriver: true })
    ]).start();
  }, [fadeAnim, slideAnim, bounceScale]);

  return (
    <Animated.View
      style={[
        styles.matchedWrap,
        { opacity: fadeAnim, transform: [{ translateY: slideAnim }, { scale: bounceScale }] }
      ]}
    >
      <View style={[styles.driverCard, { backgroundColor: accentColor + "10", borderColor: accentColor + "25" }]}>
        <View style={[styles.driverAvatar, { borderColor: accentColor }]}>
          <Text style={[styles.driverAvatarText, { color: accentColor }]}>VS</Text>
        </View>
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
            <Text style={styles.driverName}>Vikram Singh</Text>
            <Text style={styles.driverRating}>Rating: 4.9</Text>
          </View>
          <Text style={styles.driverVehicle}>Hero Splendor • MH12-EF-4321</Text>
        </View>
      </View>

      <View style={styles.matchingTaglineWrap}>
        <Text style={[styles.matchingTaglineTitle, { color: accentColor }]}>ROUTE ALIGNED RIDESHARE</Text>
        <Text style={styles.matchingTaglineText}>
          Vikram is carrying a grocery order from More Daily Mart to Sector 15 along your route. By sharing this journey, you saved Rs 30 on standard rates!
        </Text>
      </View>

      <View style={styles.etaContainer}>
        <Text style={styles.etaText}>Rider Arriving in 3 Mins</Text>
        <Text style={styles.etaSub}>OTP: 4921 • Fare: {bikeDetails[vehicle].rate}</Text>
      </View>

      <Pressable
        style={[styles.cancelBtn, { borderColor: accentColor }]}
        onPress={onCancel}
      >
        <Text style={[styles.cancelBtnText, { color: accentColor }]}>Cancel Bike Request</Text>
      </Pressable>
    </Animated.View>
  );
}

/* ─── Live Ticker (rotating alignment banner) ─── */
function LiveTicker({ accentColor }: { accentColor: string }) {
  const [tickerIndex, setTickerIndex] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const messages = [
    "CORRIDOR MATCH: 14 deliveries aligned on MG Road lane - SAVE UP TO 55%",
    "ROUTE ALIGNED: 3 bike transits matched Sector 15 corridor - FARE CLONED 45%",
    "HOT LANE ALERT: 8 orders stacked on City Center Mall lane - DELIVERIES CONSOLIDATED",
    "COMMUTE STACK: High courier density on MG Road corridor - EXPRESS SAVINGS ACTIVE"
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      Animated.sequence([
        Animated.timing(fadeAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
        Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true })
      ]).start();
      setTimeout(() => {
        setTickerIndex((prev) => (prev + 1) % messages.length);
      }, 200);
    }, 4500);
    return () => clearInterval(interval);
  }, [fadeAnim]);

  return (
    <View style={styles.tickerContainer}>
      <View style={[styles.tickerBadge, { backgroundColor: accentColor + "15", borderColor: accentColor }]}>
        <View style={[styles.tickerPulseDot, { backgroundColor: accentColor }]} />
        <Text style={[styles.tickerBadgeText, { color: accentColor }]}>LIVE ALIGNMENTS</Text>
      </View>
      <Animated.Text style={[styles.tickerText, { opacity: fadeAnim }]} numberOfLines={1}>
        {messages[tickerIndex]}
      </Animated.Text>
    </View>
  );
}

/* ─── Instamart-style QuantitySelector with spring pop scale ─── */
function QuantitySelector({
  count,
  onIncrement,
  onDecrement,
  accentColor
}: {
  count: number;
  onIncrement: () => void;
  onDecrement: () => void;
  accentColor: string;
}) {
  const scale = useRef(new Animated.Value(1)).current;

  const triggerAnimation = () => {
    Animated.sequence([
      Animated.timing(scale, { toValue: 1.25, duration: 80, useNativeDriver: true }),
      Animated.spring(scale, { toValue: 1, friction: 3, tension: 200, useNativeDriver: true })
    ]).start();
  };

  const handleInc = () => {
    triggerAnimation();
    onIncrement();
  };

  const handleDec = () => {
    triggerAnimation();
    onDecrement();
  };

  if (count === 0) {
    return (
      <Pressable onPress={handleInc} style={[styles.instamartAddBtn, { borderColor: accentColor }]}>
        <Text style={[styles.instamartAddBtnText, { color: accentColor }]}>ADD</Text>
      </Pressable>
    );
  }

  return (
    <Animated.View style={[styles.instamartCounterWrap, { borderColor: accentColor, transform: [{ scale }] }]}>
      <Pressable onPress={handleDec} style={styles.counterBtn}>
        <Text style={[styles.counterBtnText, { color: accentColor }]}>-</Text>
      </Pressable>
      <Text style={styles.counterValue}>{count}</Text>
      <Pressable onPress={handleInc} style={styles.counterBtn}>
        <Text style={[styles.counterBtnText, { color: accentColor }]}>+</Text>
      </Pressable>
    </Animated.View>
  );
}

function FeaturedSpotlight({
  store,
  onPress
}: {
  store: Store;
  onPress: (store: Store) => void;
}) {
  return (
    <Card style={styles.spotlightCard} onPress={() => onPress(store)}>
      <View style={styles.storeImageWrap}>
        <StoreImageCard imageUri={store.image} storeName={store.name} />
        <View style={styles.imageOverlay}>
          <FeaturedBadge />
          <View style={styles.imageEtaPill}>
            <Text style={styles.imageEtaText}>{store.eta}</Text>
          </View>
        </View>
      </View>

      <View style={styles.spotlightHeader}>
        <View style={styles.storeText}>
          <Text style={styles.spotlightEyebrow}>Featured for your lane</Text>
          <Text style={styles.storeName}>{store.name}</Text>
          <Text style={styles.storeMeta}>
            {store.category} | {store.distanceKm} km away
          </Text>
        </View>
        <RatingPill rating={store.rating} caption="rated" />
      </View>

      <Text style={styles.storeHighlight}>{store.highlight}</Text>

      <View style={styles.metaRow}>
        <StoreMetaBadge label={store.category} tone="green" />
        <StoreMetaBadge label={`${store.distanceKm} km away`} tone="warm" />
        <StoreMetaBadge label={store.eta} tone="light" />
      </View>

      <Notice text={store.deliveryTag} />
    </Card>
  );
}

function StoreCardBlock({
  store,
  featured,
  onPress,
  entranceIndex = 0
}: {
  store: Store;
  featured?: boolean;
  onPress: (store: Store) => void;
  entranceIndex?: number;
}) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(22)).current;

  useEffect(() => {
    const delay = entranceIndex * 65;
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 420, delay, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, friction: 9, tension: 90, delay, useNativeDriver: true } as any)
    ]).start();
  }, [fadeAnim, slideAnim, entranceIndex]);

  return (
    <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
      <Card
        style={[styles.storeCard, featured && styles.storeCardFeatured]}
        onPress={() => onPress(store)}
      >
        <View style={styles.storeImageWrap}>
          <StoreImageCard imageUri={store.image} storeName={store.name} />
          <View style={styles.imageOverlay}>
            {featured ? (
              <FeaturedBadge />
            ) : (
              <View style={styles.categoryBadge}>
                <Text style={styles.categoryBadgeText}>{store.category}</Text>
              </View>
            )}
            <View style={styles.imageEtaPill}>
              <Text style={styles.imageEtaText}>{store.eta}</Text>
            </View>
          </View>
        </View>

        <View style={styles.storeHeader}>
          <View style={styles.storeText}>
            <Text style={styles.storeName}>{store.name}</Text>
            <Text style={styles.storeMeta}>
              {store.category} | {store.distanceKm} km away
            </Text>
          </View>
          <RatingPill rating={store.rating} caption="rated" />
        </View>

        <Text style={styles.storeHighlight}>{store.highlight}</Text>

        <View style={styles.metaRow}>
          <StoreMetaBadge label={store.category} tone="green" />
          <StoreMetaBadge label={store.eta} tone="light" />
        </View>

        <Notice text={store.deliveryTag} />
      </Card>
    </Animated.View>
  );
}

function StoreMetaBadge({
  label,
  tone
}: {
  label: string;
  tone: "green" | "warm" | "light";
}) {
  return (
    <View
      style={[
        styles.metaBadge,
        tone === "green" && styles.metaBadgeGreen,
        tone === "warm" && styles.metaBadgeWarm,
        tone === "light" && styles.metaBadgeLight
      ]}
    >
      <Text
        style={[
          styles.metaBadgeText,
          tone === "warm" && styles.metaBadgeWarmText
        ]}
      >
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  sectionSpacing: {
    gap: spacing.md
  },
  rowWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm
  },
  spotlightCard: {
    backgroundColor: colors.surface,
    borderColor: colors.line,
    borderWidth: 1,
    borderRadius: radius.md,
    overflow: "hidden"
  },
  storeCard: {
    backgroundColor: colors.surface,
    borderColor: colors.line,
    borderWidth: 1,
    borderRadius: radius.md,
    overflow: "hidden"
  },
  storeCardFeatured: {
    borderColor: colors.primarySoft,
    borderWidth: 2
  },
  storeImageWrap: {
    position: "relative"
  },
  imageOverlay: {
    position: "absolute",
    top: spacing.sm,
    left: spacing.sm,
    right: spacing.sm,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  imageEtaPill: {
    borderRadius: radius.pill,
    backgroundColor: "rgba(17, 17, 17, 0.76)",
    paddingHorizontal: 12,
    paddingVertical: 7
  },
  imageEtaText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "800"
  },
  categoryBadge: {
    borderRadius: radius.pill,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    paddingHorizontal: 12,
    paddingVertical: 7
  },
  categoryBadgeText: {
    color: colors.primaryDeep,
    fontSize: 12,
    fontWeight: "800"
  },
  spotlightHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: spacing.md
  },
  storeHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: spacing.md
  },
  storeText: {
    flex: 1,
    gap: 6
  },
  spotlightEyebrow: {
    fontSize: 12,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.6,
    color: colors.primaryMid
  },
  storeName: {
    fontSize: 19,
    fontWeight: "900",
    color: colors.ink
  },
  storeMeta: {
    color: colors.muted,
    fontSize: 14,
    fontWeight: "600"
  },
  storeHighlight: {
    color: colors.ink,
    fontSize: 15,
    lineHeight: 22
  },
  metaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm
  },
  metaBadge: {
    borderRadius: radius.pill,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)"
  },
  metaBadgeGreen: {
    backgroundColor: "rgba(0, 230, 118, 0.12)",
    borderColor: "rgba(0, 230, 118, 0.2)"
  },
  metaBadgeWarm: {
    backgroundColor: "rgba(255, 179, 0, 0.12)",
    borderColor: "rgba(255, 179, 0, 0.2)"
  },
  metaBadgeLight: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderColor: "rgba(255, 255, 255, 0.08)"
  },
  metaBadgeText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#00E676"
  },
  metaBadgeWarmText: {
    color: "#FFB300"
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 40,
    gap: 8
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#FFFFFF"
  },
  emptyBody: {
    fontSize: 13,
    color: "#8E95A5",
    textAlign: "center",
    lineHeight: 18
  },

  /* Switcher card */
  switcherContainer: {
    flexDirection: "row",
    gap: spacing.sm,
    marginBottom: spacing.xs
  },
  switcherCard: {
    flex: 1,
    height: 106,
    backgroundColor: "#161824",
    borderColor: "rgba(255, 255, 255, 0.08)",
    borderWidth: 1.5,
    borderRadius: radius.md,
    paddingVertical: 12,
    paddingHorizontal: 6,
    justifyContent: "space-between",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 2,
    overflow: "hidden" as never
  },
  switcherShimmer: {
    position: "absolute",
    top: -10,
    width: 40,
    height: 130,
    backgroundColor: "rgba(255,255,255,0.08)",
    transform: [{ rotate: "15deg" }]
  },
  switcherCardLabel: {
    fontSize: 14,
    fontWeight: "900",
    color: "#FFFFFF",
    letterSpacing: 1.1,
    textTransform: "uppercase"
  },
  switcherCardSub: {
    fontSize: 10,
    fontWeight: "700",
    color: "#8E95A5",
    textAlign: "center",
    letterSpacing: 0.2
  },
  switcherTagWrap: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    backgroundColor: "rgba(255, 255, 255, 0.06)",
    borderRadius: radius.pill
  },
  switcherTagText: {
    fontSize: 8,
    fontWeight: "800",
    color: "#8E95A5",
    letterSpacing: 0.5
  },

  /* Category Caption Slogan Highlight Bar */
  captionHighlightBar: {
    paddingVertical: 10,
    paddingHorizontal: spacing.md,
    borderWidth: 1.5,
    borderRadius: radius.sm,
    marginBottom: spacing.md,
    alignItems: "center"
  },
  captionHighlightText: {
    fontSize: 12,
    fontWeight: "800",
    textAlign: "center",
    letterSpacing: 0.5
  },

  /* Promo Deals Carousel */
  promoCarousel: {
    paddingRight: spacing.xl,
    gap: spacing.sm,
    marginBottom: spacing.md
  },
  promoCard: {
    width: 260,
    borderRadius: radius.md,
    padding: spacing.md,
    justifyContent: "center",
    gap: 4,
    borderWidth: 1.5,
    borderColor: "rgba(255, 255, 255, 0.08)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 2
  },
  promoTag: {
    fontSize: 9,
    fontWeight: "900",
    color: "#FFFFFF",
    letterSpacing: 1.5
  },
  promoTitle: {
    fontSize: 15,
    fontWeight: "900",
    color: "#FFFFFF"
  },
  promoSub: {
    fontSize: 11,
    color: "#8E95A5",
    lineHeight: 15,
    fontWeight: "700"
  },

  /* High-density dashboard styles */
  dashboardTitle: {
    fontSize: 14,
    fontWeight: "900",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginTop: spacing.xs,
    marginBottom: 6
  },
  dealCarousel: {
    gap: spacing.sm,
    paddingBottom: 4
  },
  dealGrid: {
    flexDirection: "row",
    gap: spacing.sm
  },

  /* Swiggy 3D-emblem Deal Cards */
  swiggyCardRow: {
    gap: spacing.md,
    paddingVertical: 4
  },
  swiggyCard: {
    width: 230,
    height: 140,
    borderRadius: 18,
    padding: spacing.md,
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 10,
    elevation: 3,
    borderWidth: 1.5
  },
  swiggyCardTitle: {
    fontSize: 15,
    fontWeight: "900",
    lineHeight: 18
  },
  swiggyCardContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md
  },
  swiggyEmblem: {
    width: 54,
    height: 54,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 4
  },
  swiggyEmblemText: {
    fontSize: 9,
    fontWeight: "900",
    textAlign: "center",
    lineHeight: 11
  },
  swiggyCardDesc: {
    flex: 1,
    fontSize: 10,
    color: "#8E95A5",
    lineHeight: 14,
    fontWeight: "700"
  },

  /* Overhauled Premium Full-Box Cuisine Card (Immersive Full Image Background) */
  premiumCuisineCard: {
    width: 105,
    height: 148,
    borderRadius: 18,
    borderColor: "rgba(255, 255, 255, 0.08)",
    borderWidth: 1.5,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3
  },
  premiumCuisineCardImgBg: {
    width: "100%",
    height: "100%",
    justifyContent: "flex-end"
  },
  premiumCuisineCardOverlay: {
    width: "100%",
    height: "100%",
    justifyContent: "flex-end",
    alignItems: "center",
    paddingBottom: 10,
    paddingHorizontal: 4
  },
  premiumCuisineCardLabel: {
    fontSize: 13,
    fontWeight: "900",
    color: "#FFFFFF",
    textAlign: "center",
    marginTop: 8,
    letterSpacing: 0.5,
    textShadowColor: "rgba(0, 0, 0, 0.75)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3
  },

  /* Graphical Circular Cuisines list */
  cuisinesRow: {
    gap: spacing.sm,
    paddingVertical: spacing.xs
  },
  cuisineItemWrapper: {
    alignItems: "center",
    gap: 6
  },
  cuisineCircle: {
    width: 78,
    height: 78,
    justifyContent: "flex-end",
    alignItems: "center",
    overflow: "hidden"
  },
  cuisineOverlay: {
    width: "100%",
    height: "100%",
    justifyContent: "flex-end",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.2)"
  },
  cuisineFloatingTag: {
    backgroundColor: "rgba(11, 12, 16, 0.88)",
    borderColor: "rgba(255, 255, 255, 0.12)",
    borderWidth: 1.5,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 3,
    elevation: 3,
    zIndex: 10
  },
  cuisineFloatingTagText: {
    fontSize: 8,
    fontWeight: "900",
    letterSpacing: 0.5,
    textAlign: "center"
  },
  cuisineTextLabel: {
    fontSize: 11,
    fontWeight: "900",
    color: "#FFFFFF",
    marginTop: 4
  },

  /* Munchies Instamart Style Quick Add Row */
  munchiesScroll: {
    paddingRight: spacing.md,
    gap: spacing.sm,
    paddingVertical: 4
  },
  munchyCard: {
    width: 140,
    backgroundColor: "#FFFFFF",
    borderColor: "#E9ECF4",
    borderWidth: 1.5,
    borderRadius: radius.md,
    overflow: "hidden"
  },
  munchyImage: {
    width: "100%",
    height: 100,
    backgroundColor: "#F5F6FA"
  },
  munchyInfo: {
    padding: spacing.sm,
    gap: 2
  },
  munchyName: {
    fontSize: 13,
    fontWeight: "800",
    color: "#1E202C"
  },
  munchyUnit: {
    fontSize: 11,
    color: "#7B829A",
    fontWeight: "600"
  },
  munchyPriceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 4
  },
  munchyPrice: {
    fontSize: 13,
    fontWeight: "900",
    color: "#1E202C"
  },
  quickAddBtn: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center"
  },
  quickAddBtnText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
    marginTop: -1
  },

  /* Google Maps Vector Styles */
  gMapGrid: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#F5F6FA"
  },
  gStreet: {
    position: "absolute",
    backgroundColor: "#FFFFFF",
    borderColor: "#E9ECF4",
    borderWidth: 1
  },
  gRiver: {
    position: "absolute",
    top: "45%",
    left: 0,
    width: "40%",
    height: 14,
    backgroundColor: "#90CAF9",
    borderRadius: 4
  },
  gPark: {
    position: "absolute",
    top: "10%",
    left: "60%",
    width: "35%",
    height: 40,
    backgroundColor: "#C8E6C9",
    borderRadius: 8
  },
  gMapControls: {
    position: "absolute",
    bottom: 8,
    right: 8,
    gap: 4,
    zIndex: 20,
    alignItems: "center"
  },
  gMapControlBtn: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    textAlign: "center",
    lineHeight: 24,
    fontSize: 14,
    fontWeight: "900",
    color: "#1E202C",
    borderWidth: 1,
    borderColor: "#E9ECF4",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    overflow: "hidden"
  },
  gMapCompass: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#161824",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3
  },
  compassNeedle: {
    width: 3,
    height: 14,
    borderRadius: 1.5,
    transform: [{ rotate: "45deg" }]
  },
  gMapsSearchOverlay: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "rgba(11, 12, 16, 0.85)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    zIndex: 10
  },
  gMapsSearchText: {
    color: "#FFFFFF",
    fontSize: 9,
    fontWeight: "800"
  },
  mapRouteLine: {
    position: "absolute",
    top: "30%",
    left: "22%",
    width: "55%",
    height: "35%",
    borderWidth: 4,
    borderStyle: "solid",
    borderTopLeftRadius: 0,
    borderBottomRightRadius: 0,
    borderTopRightRadius: 20,
    borderBottomLeftRadius: 20,
    zIndex: 5
  },
  mapSampleMarker: {
    position: "absolute",
    width: 8,
    height: 8,
    borderRadius: 4,
    borderColor: "#FFFFFF",
    borderWidth: 1.5,
    zIndex: 6,
    opacity: 0.8
  },

  /* Ride Hailing styles */
  rideCardContainer: {
    backgroundColor: "#FFFFFF",
    borderColor: "#E9ECF4",
    borderWidth: 1.5,
    borderRadius: radius.md,
    padding: spacing.md,
    gap: spacing.md
  },
  rideHeading: {
    fontSize: 22,
    color: "#1E202C",
    fontWeight: "900"
  },
  rideSubheading: {
    fontSize: 13,
    color: "#7B829A",
    lineHeight: 18,
    marginTop: -spacing.xs
  },
  rideInputsWrap: {
    borderWidth: 1.5,
    borderColor: "#E9ECF4",
    borderRadius: radius.sm,
    backgroundColor: "#F5F6FA",
    overflow: "hidden"
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.md
  },
  inputDivider: {
    height: 1,
    backgroundColor: "#E9ECF4",
    marginLeft: 38
  },
  inputDot: {
    width: 10,
    height: 10,
    borderRadius: 5
  },
  inputLabel: {
    fontSize: 10,
    fontWeight: "900",
    color: "#7B829A",
    letterSpacing: 0.5
  },
  rideInput: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1E202C",
    marginTop: 2,
    padding: 0
  },
  mapWrap: {
    height: 180,
    backgroundColor: "#F5F6FA",
    borderRadius: radius.sm,
    position: "relative",
    borderWidth: 1.5,
    borderColor: "#E9ECF4",
    overflow: "hidden"
  },
  mapNode: {
    position: "absolute",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    zIndex: 10
  },
  nodeCoreGreen: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#00E676",
    borderWidth: 2,
    borderColor: "#FFFFFF"
  },
  nodeCoreRed: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "#FFFFFF"
  },
  nodeText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#1E202C",
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderColor: "#E9ECF4",
    borderWidth: 1,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4
  },
  mapCarDot: {
    position: "absolute",
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 15
  },
  mapVehicleBadge: {
    position: "absolute",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: "#161824",
    gap: 4,
    zIndex: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4
  },
  vehicleBadgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#FFFFFF"
  },
  vehicleBadgeText: {
    color: "#FFFFFF",
    fontSize: 8,
    fontWeight: "900",
    textTransform: "uppercase"
  },
  ridePreferences: {
    flexDirection: "row",
    gap: spacing.sm,
    marginTop: -2
  },
  preferenceItem: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    borderRadius: radius.sm,
    borderWidth: 1
  },
  preferenceText: {
    fontSize: 12,
    fontWeight: "800"
  },
  onlyDirectBadge: {
    backgroundColor: "rgba(0, 230, 118, 0.12)",
    borderColor: "rgba(0, 230, 118, 0.2)",
    borderWidth: 1,
    borderRadius: radius.sm,
    paddingVertical: 6,
    paddingHorizontal: 12,
    alignSelf: "flex-start",
    marginTop: -spacing.xs
  },
  onlyDirectText: {
    fontSize: 11,
    color: "#00E676",
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.5
  },
  vehicleList: {
    gap: spacing.sm
  },
  vehicleItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.md,
    borderRadius: radius.sm,
    borderWidth: 1.5,
    borderColor: "rgba(255, 255, 255, 0.08)",
    backgroundColor: "#161824",
    gap: spacing.md
  },
  vehicleIndicatorIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1.5
  },
  vehicleIndicatorIconText: {
    fontSize: 14,
    fontWeight: "900"
  },
  vehicleName: {
    fontSize: 16,
    fontWeight: "800",
    color: "#FFFFFF"
  },
  vehicleEta: {
    fontSize: 12,
    color: "#8E95A5",
    fontWeight: "600",
    marginTop: 2
  },
  vehicleRate: {
    fontSize: 16,
    fontWeight: "900",
    color: "#FFFFFF"
  },
  directPill: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4
  },
  directPillText: {
    color: "#161824",
    fontSize: 9,
    fontWeight: "900",
    textTransform: "uppercase"
  },
  bookBtn: {
    borderRadius: radius.sm,
    paddingVertical: spacing.md,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 4
  },
  bookBtnText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 0.5
  },
  bookBtnShimmer: {
    position: "absolute",
    top: 0,
    bottom: 0,
    width: 60,
    backgroundColor: "rgba(255,255,255,0.18)",
    transform: [{ skewX: "-15deg" as never }]
  },

  /* Matching driver states */
  matchingWrap: {
    alignItems: "center",
    paddingVertical: 30,
    gap: spacing.md
  },
  pulseContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    position: "relative"
  },
  pulseRing: {
    position: "absolute",
    width: "100%",
    height: "100%",
    borderRadius: 40,
    borderWidth: 2,
    opacity: 0.4
  },
  matchingSpinner: {
    fontSize: 22,
    fontWeight: "900"
  },
  pulseCore: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2
  },
  matchingTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: "#FFFFFF"
  },
  matchingSubtitle: {
    fontSize: 13,
    color: "#8E95A5",
    textAlign: "center",
    lineHeight: 20,
    paddingHorizontal: 20
  },

  /* Matched states */
  matchedWrap: {
    gap: spacing.md
  },
  driverCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.md,
    borderRadius: radius.sm,
    borderWidth: 1.5,
    borderColor: "rgba(255, 255, 255, 0.08)",
    backgroundColor: "#1E202C",
    gap: spacing.md
  },
  driverAvatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "#161824",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1.5
  },
  driverAvatarText: {
    fontSize: 16,
    fontWeight: "900",
    color: "#FFFFFF"
  },
  driverName: {
    fontSize: 16,
    fontWeight: "800",
    color: "#FFFFFF"
  },
  driverRating: {
    fontSize: 12,
    fontWeight: "800",
    color: "#FFB300"
  },
  driverVehicle: {
    fontSize: 13,
    color: "#8E95A5",
    fontWeight: "600",
    marginTop: 2
  },
  matchingTaglineWrap: {
    backgroundColor: "#1E202C",
    borderColor: "rgba(255, 255, 255, 0.08)",
    borderWidth: 1.5,
    borderRadius: radius.sm,
    padding: spacing.md,
    gap: 6
  },
  matchingTaglineTitle: {
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 1,
    color: "#FFFFFF"
  },
  matchingTaglineText: {
    fontSize: 13,
    color: "#8E95A5",
    lineHeight: 19,
    fontWeight: "600"
  },
  etaContainer: {
    alignItems: "center",
    paddingVertical: spacing.sm,
    borderTopWidth: 1.5,
    borderBottomWidth: 1.5,
    borderColor: "rgba(255, 255, 255, 0.08)"
  },
  etaText: {
    fontSize: 18,
    fontWeight: "900",
    color: "#00E676"
  },
  etaSub: {
    fontSize: 13,
    color: "#8E95A5",
    fontWeight: "600",
    marginTop: 2
  },
  cancelBtn: {
    borderWidth: 2,
    borderRadius: radius.sm,
    paddingVertical: spacing.md,
    alignItems: "center",
    marginTop: spacing.xs
  },
  cancelBtnText: {
    fontSize: 15,
    fontWeight: "800"
  },

  /* Commute history list */
  commuteScroll: {
    gap: spacing.sm,
    paddingBottom: 4
  },
  commuteHistoryCard: {
    width: 210,
    backgroundColor: "#FFFFFF",
    borderColor: "#E9ECF4",
    borderWidth: 1.5,
    borderRadius: radius.sm,
    padding: spacing.md,
    gap: 4
  },
  commuteHistoryDest: {
    fontSize: 13,
    fontWeight: "900",
    color: "#1E202C"
  },
  commuteHistoryFare: {
    fontSize: 10,
    fontWeight: "900",
    textTransform: "uppercase",
    letterSpacing: 0.2
  },
  commuteHistoryRate: {
    fontSize: 14,
    color: "#1E202C",
    fontWeight: "900",
    marginTop: 2
  },

  /* Live Ticker styles */
  tickerContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderColor: "#E9ECF4",
    borderWidth: 1.5,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    marginBottom: spacing.xs,
    gap: 12,
    overflow: "hidden"
  },
  tickerBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6
  },
  tickerPulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3
  },
  tickerBadgeText: {
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 0.5
  },
  tickerText: {
    flex: 1,
    fontSize: 11,
    fontWeight: "700",
    color: "#1E202C",
    letterSpacing: 0.2
  },

  /* Instamart Free Delivery Goal Bar */
  deliveryGoalWrap: {
    backgroundColor: "#FFFFFF",
    borderColor: "rgba(0, 230, 118, 0.2)",
    borderWidth: 1.5,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md
  },
  deliveryGoalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8
  },
  deliveryGoalTitle: {
    fontSize: 12,
    fontWeight: "900",
    color: "#1E202C",
    letterSpacing: 0.2
  },
  deliveryGoalValue: {
    fontSize: 11,
    fontWeight: "900",
    color: "#00C853"
  },
  deliveryProgressBarBg: {
    height: 6,
    backgroundColor: "rgba(0, 0, 0, 0.06)",
    borderRadius: 3,
    overflow: "hidden"
  },
  deliveryProgressBarFill: {
    height: "100%",
    borderRadius: 3
  },

  /* Swiggy food filter chips */
  filterChipsScroll: {
    gap: 8,
    paddingVertical: spacing.xs,
    marginBottom: spacing.xs
  },
  filterChip: {
    borderWidth: 1.5,
    borderColor: "#E9ECF4",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "#FFFFFF"
  },
  filterChipText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#8E95A5"
  },

  /* Instamart Flash banner */
  flashBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFEBEE",
    borderColor: "#FFCDD2",
    borderWidth: 1,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    marginBottom: spacing.md,
    gap: 8
  },
  flashBadge: {
    backgroundColor: "#FF2E63",
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4
  },
  flashBadgeText: {
    fontSize: 9,
    fontWeight: "900",
    color: "#FFFFFF"
  },
  flashText: {
    flex: 1,
    fontSize: 11,
    fontWeight: "900",
    color: "#1E202C"
  },
  flashTimer: {
    fontSize: 11,
    fontWeight: "900",
    color: "#FF2E63"
  },

  /* Instamart 2x4 grid */
  instamartGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    justifyContent: "space-between"
  },
  instamartGridCard: {
    width: "48%",
    backgroundColor: "#FFFFFF",
    borderRadius: radius.md,
    borderColor: "#E9ECF4",
    borderWidth: 1.5,
    padding: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginVertical: 4
  },
  instamartGridCardImg: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#F5F6FA"
  },
  instamartGridLabelWrap: {
    flex: 1,
    gap: 4
  },
  instamartGridCardLabel: {
    fontSize: 12,
    fontWeight: "900",
    color: "#1E202C"
  },
  instamartGridTag: {
    alignSelf: "flex-start",
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 4,
    paddingVertical: 1
  },
  instamartGridTagText: {
    fontSize: 8,
    fontWeight: "900"
  },

  /* Instamart QuantitySelector styling */
  instamartAddBtn: {
    borderWidth: 1.5,
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 4,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    minWidth: 55
  },
  instamartAddBtnText: {
    fontSize: 11,
    fontWeight: "900"
  },
  instamartCounterWrap: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderRadius: 6,
    backgroundColor: "#FFFFFF",
    overflow: "hidden",
    minWidth: 70,
    justifyContent: "space-between"
  },
  counterBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    alignItems: "center",
    justifyContent: "center"
  },
  counterBtnText: {
    fontSize: 13,
    fontWeight: "900"
  },
  counterValue: {
    fontSize: 11,
    fontWeight: "900",
    color: "#1E202C"
  },

  /* Uber scheduling UI */
  scheduleBtn: {
    borderWidth: 2,
    borderRadius: radius.sm,
    paddingHorizontal: 20,
    justifyContent: "center",
    alignItems: "center",
    height: 48
  },
  scheduleBtnText: {
    fontSize: 14,
    fontWeight: "800"
  },
  scheduleSheet: {
    backgroundColor: "#FFFFFF",
    borderColor: "#E9ECF4",
    borderWidth: 1.5,
    borderRadius: radius.md,
    padding: spacing.md,
    marginTop: spacing.md,
    gap: 12
  },
  scheduleTitle: {
    fontSize: 13,
    fontWeight: "900",
    color: "#1E202C",
    letterSpacing: 0.5
  },
  scheduleTimeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8
  },
  timeChip: {
    borderWidth: 1.5,
    borderColor: "#E9ECF4",
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "#FFFFFF"
  },
  timeChipText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#7B829A"
  },
  scheduleConfirmBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: radius.sm,
    alignItems: "center",
    justifyContent: "center"
  },
  scheduleConfirmBtnText: {
    color: "#1E202C",
    fontSize: 13,
    fontWeight: "900"
  },
  scheduleCancelBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderWidth: 1.5,
    borderColor: "#E9ECF4",
    borderRadius: radius.sm,
    alignItems: "center",
    justifyContent: "center"
  },
  scheduleCancelBtnText: {
    color: "#7B829A",
    fontSize: 13,
    fontWeight: "800"
  },
  scheduleSuccessText: {
    fontSize: 11,
    fontWeight: "900",
    marginTop: 4,
    textAlign: "center"
  },
  /* Glovo Signature Floating Bubble Grid styles */
  glovoBubbleGridWrap: {
    marginVertical: spacing.sm,
    backgroundColor: "#FFFFFF",
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1.5,
    borderColor: "#E6E8EC",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3
  },
  glovoBubbleHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
    paddingHorizontal: 4
  },
  glovoBubbleGridTitle: {
    fontSize: 16,
    fontWeight: "900",
    color: "#222222"
  },
  glovoBubbleGridSub: {
    fontSize: 11,
    fontWeight: "800",
    color: "#00A082",
    textTransform: "uppercase",
    letterSpacing: 0.5
  },
  glovoBubbleScrollContent: {
    paddingHorizontal: 2,
    gap: 14,
    paddingVertical: 10
  },
  glovoBubbleItemWrap: {
    alignItems: "center",
    width: 82
  },
  glovoBubblePressable: {
    alignItems: "center"
  },
  glovoBubbleCircle: {
    width: 66,
    height: 66,
    borderRadius: 33,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    shadowColor: "#00A082",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
    position: "relative"
  },
  glovoBubbleActiveRing: {
    borderWidth: 4,
    borderColor: "#222222",
    transform: [{ scale: 1.08 }]
  },
  glovoBubbleActiveDot: {
    position: "absolute",
    top: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: "#222222",
    borderWidth: 2,
    borderColor: "#FFFFFF"
  },
  glovoBubbleIconText: {
    fontSize: 30
  },
  glovoBubbleLabelText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#222222",
    marginTop: 6,
    textAlign: "center"
  },
  glovoBubbleLabelActive: {
    fontWeight: "900",
    color: "#00A082"
  },
  glovoBubbleSubText: {
    fontSize: 9,
    fontWeight: "600",
    color: "#757575",
    marginTop: 1,
    textAlign: "center"
  }
});
