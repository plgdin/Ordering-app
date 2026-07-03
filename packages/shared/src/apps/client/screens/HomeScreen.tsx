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

const provisionsCategories = [
  { name: "Vegetables", filterKey: "Groceries", tag: "FRESH 40%", image: "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=200&h=280&fit=crop" },
  { name: "Milk & Dairy", filterKey: "Groceries", tag: "DAILY SAVE", image: "https://images.unsplash.com/photo-1563636619-e9143da7973b?w=200&h=280&fit=crop" },
  { name: "Wellness OTC", filterKey: "Pharmacy", tag: "10-MIN", image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=200&h=280&fit=crop" },
  { name: "Daily Bakery", filterKey: "Bakery", tag: "WARM BREAD", image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=200&h=280&fit=crop" }
];

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

  // Dynamic colors for categories
  const categoryTheme = useMemo(() => {
    if (mainCategory === "ride") {
      return {
        primary: "#B05B48",
        faint: "#F6ECE8",
        soft: "#E4C5BD"
      };
    } else if (mainCategory === "food") {
      return {
        primary: "#A8201A",
        faint: "#FAF0EF",
        soft: "#EAC7C0"
      };
    } else {
      return {
        primary: "#C88E52",
        faint: "#FAF6F0",
        soft: "#EAD6BD"
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
  }, [previewFilter, categoryStores, searchQuery]);

  const filteredStores = useMemo(() => {
    let result = categoryStores;
    if (activeFilter) {
      result = result.filter(
        (store) => store.category.toLowerCase() === activeFilter.toLowerCase()
      );
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
  }, [activeFilter, categoryStores, searchQuery]);

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
          accentColor="#B05B48"
          onPress={() => handleMainCategoryChange("ride")}
        />
        <SwitcherCard
          active={mainCategory === "food"}
          label="FOOD"
          tag="RESTAURANTS"
          sublabel="Zero Fee Eats"
          accentColor="#A8201A"
          onPress={() => handleMainCategoryChange("food")}
        />
        <SwitcherCard
          active={mainCategory === "provisions"}
          label="PROVISIONS"
          tag="ESSENTIALS"
          sublabel="10-Min Fast"
          accentColor="#C88E52"
          onPress={() => handleMainCategoryChange("provisions")}
        />
      </View>

      {/* Category Slogan Highlight */}
      <View
        style={[
          styles.captionHighlightBar,
          {
            backgroundColor: categoryTheme.faint,
            borderColor: categoryTheme.soft
          }
        ]}
      >
        <Text style={[styles.captionHighlightText, { color: categoryTheme.primary }]}>
          {categoryCaption}
        </Text>
      </View>

      {/* ─── Down Side: Content ─── */}
      {mainCategory === "ride" ? (
        <RideBookingSection accentColor={categoryTheme.primary} />
      ) : (
        <>
          <SearchBar
            label={
              mainCategory === "food"
                ? "Search restaurants, menu items, or cuisines..."
                : "Search grocery products, wellness items, or bakery..."
            }
            value={searchQuery}
            onChangeText={setSearchQuery}
          />

          {/* Promo Deals Banners Carousel - Gen Z Coded */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.promoCarousel}
          >
            {mainCategory === "food" ? (
              <>
                <View style={[styles.promoCard, { backgroundColor: "#A8201A" }]}>
                  <Text style={styles.promoTag}>FASTER THAN YOUR EX ⚡</Text>
                  <Text style={styles.promoTitle}>Direct Fare Cloner</Text>
                  <Text style={styles.promoSub}>Match active runners to clone fare down by 50% instantly.</Text>
                </View>
                <View style={[styles.promoCard, { backgroundColor: "#A8201A", opacity: 0.9 }]}>
                  <Text style={styles.promoTag}>NO CAP ZERO TAX 🍔</Text>
                  <Text style={styles.promoTitle}>Free Route Stack</Text>
                  <Text style={styles.promoSub}>Eat for free delivery when stacked on active neighborhood routes.</Text>
                </View>
                <View style={[styles.promoCard, { backgroundColor: "#A8201A", opacity: 0.8 }]}>
                  <Text style={styles.promoTag}>VIBE FEAST 🍕</Text>
                  <Text style={styles.promoTitle}>Stacked Discounts</Text>
                  <Text style={styles.promoSub}>High-density hot stacks from local kitchens passing your lane.</Text>
                </View>
              </>
            ) : (
              <>
                <View style={[styles.promoCard, { backgroundColor: "#C88E52" }]}>
                  <Text style={styles.promoTag}>SPEEDRUN 10-MINS 🛒</Text>
                  <Text style={styles.promoTitle}>Daily Staples Fast</Text>
                  <Text style={styles.promoSub}>Instant drop-offs by active route-aligned riders nearby.</Text>
                </View>
                <View style={[styles.promoCard, { backgroundColor: "#C88E52", opacity: 0.9 }]}>
                  <Text style={styles.promoTag}>ROUTE MATCHED 🥛</Text>
                  <Text style={styles.promoTitle}>Milk & Munchies</Text>
                  <Text style={styles.promoSub}>Save Rs 100 when delivery runs stack with active lane orders.</Text>
                </View>
                <View style={[styles.promoCard, { backgroundColor: "#C88E52", opacity: 0.8 }]}>
                  <Text style={styles.promoTag}>FAST AF OTC 💊</Text>
                  <Text style={styles.promoTitle}>Health Quick-Add</Text>
                  <Text style={styles.promoSub}>Local pharmacy items stacked on on-route neighborhood runs.</Text>
                </View>
              </>
            )}
            <View style={{ width: 24 }} />
          </ScrollView>

          {/* High-density grid visual depending on active category */}
          {mainCategory === "provisions" ? (
            <View style={styles.sectionSpacing}>
              <Text style={[styles.dashboardTitle, { color: categoryTheme.primary }]}>
                Essentials Deal Zones
              </Text>
              
              {/* High-Fidelity Swiggy 3D-emblem cards for provisions */}
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.swiggyCardRow}>
                <SwiggyDealCard
                  bgColor="#75E643"
                  title="Speedrun\nStaples"
                  titleColor="#155724"
                  badgeText="FLAT\n50%\nOFF"
                  badgeBg="#155724"
                  desc="Order stacked farm fresh veg with half-price express delivery."
                />
                <SwiggyDealCard
                  bgColor="#FFB84D"
                  title="Route\nRebate"
                  titleColor="#3E1A0F"
                  badgeText="SAVE\nRs 100"
                  badgeBg="#A8201A"
                  desc="Get instant cashback on grocery stacks aligned with active lanes."
                />
              </ScrollView>

              <Text style={[styles.dashboardTitle, { color: categoryTheme.primary }]}>
                Trending Categories
              </Text>

              {/* Graphical Image Cuisines Row with Interactive Pop-ups */}
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.cuisinesRow}>
                {provisionsCategories.map((cat, index) => (
                  <HoverableCuisineCard
                    key={index}
                    item={cat}
                    accentColor={categoryTheme.primary}
                    onPress={() => handleCategoryPress(cat.filterKey)}
                  />
                ))}
              </ScrollView>
            </View>
          ) : (
            <View style={styles.sectionSpacing}>
              <Text style={[styles.dashboardTitle, { color: categoryTheme.primary }]}>
                Cuisine Quick Select
              </Text>
              
              {/* Graphical Image Cuisines Row with Interactive Pop-ups */}
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.cuisinesRow}>
                {foodCuisines.map((cuisine, index) => (
                  <HoverableCuisineCard
                    key={index}
                    item={cuisine}
                    accentColor={categoryTheme.primary}
                    onPress={() => handleCategoryPress(cuisine.filterKey)}
                  />
                ))}
              </ScrollView>

              <Text style={[styles.dashboardTitle, { color: categoryTheme.primary }]}>
                Deal Feast Banners
              </Text>

              {/* Swiggy 3D Coin & Starburst Styled Vouchers */}
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.swiggyCardRow}>
                <SwiggyDealCard
                  bgColor="#75E643"
                  title="Top Brands\nTop Deals"
                  titleColor="#155724"
                  badgeText="FLAT\nRs 100\nOFF"
                  badgeBg="#155724"
                  desc="Stacked meals from premium kitchens aligned with local runners."
                />
                <SwiggyDealCard
                  bgColor="#FF8C66"
                  title="Deal\nFeast"
                  titleColor="#3E1A0F"
                  badgeText="GET\n70%\nOFF"
                  badgeBg="#A8201A"
                  desc="Matched courier routes waive your delivery fee automatically."
                />
              </ScrollView>
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
                {munchiesItems.map((item) => (
                  <View key={item.id} style={styles.munchyCard}>
                    <Image source={{ uri: item.image }} style={styles.munchyImage} />
                    <View style={styles.munchyInfo}>
                      <Text style={styles.munchyName} numberOfLines={1}>
                        {item.name}
                      </Text>
                      <Text style={styles.munchyUnit}>{item.unit}</Text>
                      <View style={styles.munchyPriceRow}>
                        <Text style={styles.munchyPrice}>Rs {item.price}</Text>
                        <Pressable
                          style={[styles.quickAddBtn, { backgroundColor: categoryTheme.primary }]}
                          onPress={() => handleQuickAdd(item)}
                        >
                          <Text style={styles.quickAddBtnText}>+</Text>
                        </Pressable>
                      </View>
                    </View>
                  </View>
                ))}
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
                filteredStores.map((store) => (
                  <StoreCardBlock
                    key={store.id}
                    store={store}
                    featured={store.featured}
                    onPress={onStorePress}
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
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onPressIn={() => setHovered(true)}
        onPressOut={() => setHovered(false)}
        style={[styles.swiggyCard, { backgroundColor: bgColor }]}
      >
        <Text style={[styles.swiggyCardTitle, { color: titleColor }]}>
          {title.replace("\\n", "\n")}
        </Text>
        <View style={styles.swiggyCardContent}>
          <View style={[styles.swiggyEmblem, { backgroundColor: badgeBg }]}>
            <Text style={styles.swiggyEmblemText}>{badgeText.replace("\\n", "\n")}</Text>
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
      onPressIn={() => setHovered(true)}
      onPressOut={() => setHovered(false)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
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
          <LinearGradient
            colors={["rgba(0,0,0,0.8)", "rgba(0,0,0,0.3)", "transparent"]}
            start={{ x: 0.5, y: 1 }}
            end={{ x: 0.5, y: 0 }}
            style={styles.premiumCuisineCardOverlay}
          >
            <View style={styles.cuisineFloatingTag}>
              <Text style={styles.cuisineFloatingTagText}>{item.tag}</Text>
            </View>
            <Text style={styles.premiumCuisineCardLabel}>{item.name}</Text>
          </LinearGradient>
        </ImageBackground>
      </Animated.View>
    </Pressable>
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

  const handlePress = () => {
    Animated.sequence([
      Animated.timing(scale, { toValue: 0.94, duration: 80, useNativeDriver: true }),
      Animated.timing(scale, { toValue: 1, duration: 80, useNativeDriver: true })
    ]).start();
    onPress();
  };

  return (
    <Animated.View style={{ flex: 1, transform: [{ scale }] }}>
      <Pressable
        onPress={handlePress}
        style={[
          styles.switcherCard,
          active && { borderColor: accentColor, backgroundColor: accentColor + "10", borderWidth: 2 }
        ]}
      >
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
function RideBookingSection({ accentColor }: { accentColor: string }) {
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
              bgColor="#F6ECE8"
              title="Active Riders"
              titleColor="#5C2518"
              badgeText="42"
              badgeBg={accentColor}
              desc="Delivery partners active along your commute lane corridor."
            />
            <SwiggyDealCard
              bgColor="#FAF0EF"
              title="CO2 Saved"
              titleColor="#6A1B29"
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

          {/* CTA Book Button */}
          <Pressable style={[styles.bookBtn, { backgroundColor: accentColor }]} onPress={handleBook}>
            <Text style={styles.bookBtnText}>Confirm Bike Ride ({bikeDetails[vehicle].rate})</Text>
          </Pressable>
        </>
      ) : bookingState === "finding" ? (
        <View style={styles.matchingWrap}>
          <View style={[styles.pulseContainer, { backgroundColor: accentColor + "25" }]}>
            <View style={[styles.pulseRing, { borderColor: accentColor }]} />
            <Text style={[styles.matchingSpinner, { color: accentColor }]}>...</Text>
          </View>
          <Text style={styles.matchingTitle}>Finding Direct Aligned Rider...</Text>
          <Text style={styles.matchingSubtitle}>
            Connecting you with an on-route delivery bike going directly to {dropoff}.
          </Text>
        </View>
      ) : (
        <View style={styles.matchedWrap}>
          <View style={[styles.driverCard, { backgroundColor: accentColor + "10", borderColor: accentColor + "25" }]}>
            <View style={[styles.driverAvatar, { borderColor: accentColor }]}>
              <Text style={[styles.driverAvatarText, { color: accentColor }]}>VS</Text>
            </View>
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                <Text style={styles.driverName}>Vikram Singh</Text>
                <Text style={styles.driverRating}>⭐ 4.9</Text>
              </View>
              <Text style={styles.driverVehicle}>Hero Splendor • MH12-EF-4321</Text>
            </View>
          </View>

          <View style={styles.matchingTaglineWrap}>
            <Text style={[styles.matchingTaglineTitle, { color: accentColor }]}>ROUTE ALIGNED RIDESHARE</Text>
            <Text style={styles.matchingTaglineText}>
              Vikram is carrying a grocery order from **More Daily Mart** to Sector 15 along your route. By sharing this journey, you saved **Rs 30** on standard rates!
            </Text>
          </View>

          <View style={styles.etaContainer}>
            <Text style={styles.etaText}>Rider Arriving in 3 Mins</Text>
            <Text style={styles.etaSub}>OTP: 4921 • Fare: {bikeDetails[vehicle].rate}</Text>
          </View>

          <Pressable
            style={[styles.cancelBtn, { borderColor: accentColor }]}
            onPress={() => setBookingState("idle")}
          >
            <Text style={[styles.cancelBtnText, { color: accentColor }]}>Cancel Bike Request</Text>
          </Pressable>
        </View>
      )}
    </View>
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
  onPress
}: {
  store: Store;
  featured?: boolean;
  onPress: (store: Store) => void;
}) {
  return (
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
    paddingVertical: 8
  },
  metaBadgeGreen: {
    backgroundColor: "#EAF6ED"
  },
  metaBadgeWarm: {
    backgroundColor: colors.primaryFaint
  },
  metaBadgeLight: {
    backgroundColor: "#FAF6F0"
  },
  metaBadgeText: {
    fontSize: 12,
    fontWeight: "800",
    color: colors.primaryMid
  },
  metaBadgeWarmText: {
    color: colors.primary
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 40,
    gap: 8
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: colors.ink
  },
  emptyBody: {
    fontSize: 14,
    color: colors.muted,
    textAlign: "center",
    lineHeight: 21
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
    backgroundColor: colors.surface,
    borderColor: colors.line,
    borderWidth: 1.5,
    borderRadius: radius.md,
    paddingVertical: 12,
    paddingHorizontal: 6,
    justifyContent: "space-between",
    alignItems: "center",
    shadowColor: colors.primaryDeep,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2
  },
  switcherCardLabel: {
    fontSize: 15,
    fontWeight: "950",
    color: colors.ink,
    letterSpacing: 1.2,
    textTransform: "uppercase"
  },
  switcherCardSub: {
    fontSize: 10,
    fontWeight: "800",
    color: colors.muted,
    textAlign: "center",
    letterSpacing: 0.2
  },
  switcherTagWrap: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    backgroundColor: colors.line,
    borderRadius: radius.pill
  },
  switcherTagText: {
    fontSize: 8,
    fontWeight: "955",
    color: colors.muted,
    letterSpacing: 0.5
  },

  /* Category Caption Slogan Highlight Bar */
  captionHighlightBar: {
    paddingVertical: 8,
    paddingHorizontal: spacing.md,
    borderWidth: 1.5,
    borderRadius: radius.sm,
    marginBottom: spacing.md,
    alignItems: "center"
  },
  captionHighlightText: {
    fontSize: 12,
    fontWeight: "900",
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
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2
  },
  promoTag: {
    fontSize: 9,
    fontWeight: "950",
    color: "#FAF6F0",
    letterSpacing: 1.5,
    fontFamily: '"Chalkboard SE", "Comic Sans MS", "Bangers", sans-serif'
  },
  promoTitle: {
    fontSize: 15,
    fontWeight: "900",
    color: "#FAF6F0"
  },
  promoSub: {
    fontSize: 11,
    color: "rgba(250, 246, 240, 0.8)",
    lineHeight: 15,
    fontWeight: "700"
  },

  /* High-density dashboard styles */
  dashboardTitle: {
    fontSize: 15,
    fontWeight: "900",
    textTransform: "uppercase",
    letterSpacing: 0.6,
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
    height: 150,
    borderRadius: 22,
    padding: spacing.md,
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1.5,
    borderColor: "rgba(0, 0, 0, 0.04)"
  },
  swiggyCardTitle: {
    fontSize: 16,
    fontWeight: "950",
    lineHeight: 20
  },
  swiggyCardContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md
  },
  swiggyEmblem: {
    width: 66,
    height: 66,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4
  },
  swiggyEmblemText: {
    color: "#FAF6F0",
    fontSize: 10,
    fontWeight: "950",
    textAlign: "center",
    lineHeight: 12
  },
  swiggyCardDesc: {
    flex: 1,
    fontSize: 10,
    color: "#4A4A4A",
    lineHeight: 14,
    fontWeight: "700"
  },

  /* Overhauled Premium Full-Box Cuisine Card (Immersive Full Image Background) */
  premiumCuisineCard: {
    width: 105,
    height: 148,
    borderRadius: 20,
    borderColor: colors.line,
    borderWidth: 1.5,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
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
    fontWeight: "950",
    color: "#FAF6F0",
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
    backgroundColor: "#FF4A52",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.pill,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 3,
    elevation: 3,
    zIndex: 10
  },
  cuisineFloatingTagText: {
    color: "#FAF6F0",
    fontSize: 8,
    fontWeight: "950",
    letterSpacing: 0.5,
    textAlign: "center",
    fontFamily: '"Chalkboard SE", "Comic Sans MS", "Bangers", sans-serif'
  },
  cuisineTextLabel: {
    fontSize: 11,
    fontWeight: "900",
    color: colors.ink,
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
    backgroundColor: colors.surface,
    borderColor: colors.line,
    borderWidth: 1,
    borderRadius: radius.md,
    overflow: "hidden"
  },
  munchyImage: {
    width: "100%",
    height: 100,
    backgroundColor: colors.primaryFaint
  },
  munchyInfo: {
    padding: spacing.sm,
    gap: 2
  },
  munchyName: {
    fontSize: 13,
    fontWeight: "800",
    color: colors.ink
  },
  munchyUnit: {
    fontSize: 11,
    color: colors.muted,
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
    color: colors.ink
  },
  quickAddBtn: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center"
  },
  quickAddBtnText: {
    color: "#FAF6F0",
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
    backgroundColor: "#E4F1EB"
  },
  gStreet: {
    position: "absolute",
    backgroundColor: "#FFFFFF",
    borderColor: "#E0E0E0",
    borderWidth: 0.5
  },
  gRiver: {
    position: "absolute",
    top: "45%",
    left: 0,
    width: "40%",
    height: 14,
    backgroundColor: "#A5C9EB",
    borderRadius: 4
  },
  gPark: {
    position: "absolute",
    top: "10%",
    left: "60%",
    width: "35%",
    height: 40,
    backgroundColor: "#CBE6D6",
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
    color: colors.ink,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
    overflow: "hidden"
  },
  gMapCompass: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
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
    backgroundColor: "rgba(47, 31, 23, 0.8)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    zIndex: 10
  },
  gMapsSearchText: {
    color: "#FAF6F0",
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
    backgroundColor: colors.surface,
    borderColor: colors.line,
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.md,
    gap: spacing.md
  },
  rideHeading: {
    fontSize: 22,
    fontWeight: "950"
  },
  rideSubheading: {
    fontSize: 14,
    color: colors.muted,
    lineHeight: 20,
    marginTop: -spacing.xs
  },
  rideInputsWrap: {
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.sm,
    backgroundColor: "#FAF6F0",
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
    backgroundColor: colors.line,
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
    color: colors.muted,
    letterSpacing: 0.5
  },
  rideInput: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.ink,
    marginTop: 2,
    padding: 0
  },
  mapWrap: {
    height: 180,
    backgroundColor: "#E4F1EB",
    borderRadius: radius.sm,
    position: "relative",
    borderWidth: 1,
    borderColor: colors.line,
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
    backgroundColor: "#588157",
    borderWidth: 2,
    borderColor: "#FAF6F0"
  },
  nodeCoreRed: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "#FAF6F0"
  },
  nodeText: {
    fontSize: 11,
    fontWeight: "800",
    color: colors.ink,
    backgroundColor: "rgba(250, 246, 240, 0.85)",
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
    borderWidth: 1,
    borderColor: "#FAF6F0",
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
    backgroundColor: "#FAF6F0"
  },
  vehicleBadgeText: {
    color: "#FAF6F0",
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
    backgroundColor: "#EBF6ED",
    borderColor: "#BADBBE",
    borderWidth: 1,
    borderRadius: radius.sm,
    paddingVertical: 6,
    paddingHorizontal: 12,
    alignSelf: "flex-start",
    marginTop: -spacing.xs
  },
  onlyDirectText: {
    fontSize: 11,
    color: "#2D8B55",
    fontWeight: "850",
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
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surface,
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
    color: colors.ink
  },
  vehicleEta: {
    fontSize: 12,
    color: colors.muted,
    fontWeight: "600",
    marginTop: 2
  },
  vehicleRate: {
    fontSize: 16,
    fontWeight: "900",
    color: colors.ink
  },
  directPill: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4
  },
  directPillText: {
    color: "#FAF6F0",
    fontSize: 9,
    fontWeight: "900",
    textTransform: "uppercase"
  },
  bookBtn: {
    borderRadius: radius.sm,
    paddingVertical: spacing.md,
    alignItems: "center",
    shadowColor: colors.primaryDeep,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 4
  },
  bookBtnText: {
    color: "#FAF6F0",
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 0.5
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
    fontSize: 24,
    fontWeight: "900"
  },
  matchingTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: colors.primaryDeep
  },
  matchingSubtitle: {
    fontSize: 13,
    color: colors.muted,
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
    borderWidth: 1,
    gap: spacing.md
  },
  driverAvatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "#FAF6F0",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1.5
  },
  driverAvatarText: {
    fontSize: 16,
    fontWeight: "900"
  },
  driverName: {
    fontSize: 16,
    fontWeight: "800",
    color: colors.primaryDeep
  },
  driverRating: {
    fontSize: 12,
    fontWeight: "800",
    color: colors.warning
  },
  driverVehicle: {
    fontSize: 13,
    color: colors.muted,
    fontWeight: "600",
    marginTop: 2
  },
  matchingTaglineWrap: {
    backgroundColor: "#F9EDE6",
    borderColor: "#EAC7C0",
    borderWidth: 1,
    borderRadius: radius.sm,
    padding: spacing.md,
    gap: 6
  },
  matchingTaglineTitle: {
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 1
  },
  matchingTaglineText: {
    fontSize: 13,
    color: colors.ink,
    lineHeight: 19,
    fontWeight: "600"
  },
  etaContainer: {
    alignItems: "center",
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.line
  },
  etaText: {
    fontSize: 18,
    fontWeight: "950",
    color: colors.success
  },
  etaSub: {
    fontSize: 13,
    color: colors.muted,
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
    backgroundColor: colors.surface,
    borderColor: colors.line,
    borderWidth: 1,
    borderRadius: radius.sm,
    padding: spacing.md,
    gap: 4
  },
  commuteHistoryDest: {
    fontSize: 13,
    fontWeight: "900",
    color: colors.ink
  },
  commuteHistoryFare: {
    fontSize: 10,
    fontWeight: "900",
    textTransform: "uppercase",
    letterSpacing: 0.2
  },
  commuteHistoryRate: {
    fontSize: 14,
    color: colors.ink,
    fontWeight: "900",
    marginTop: 2
  }
});
