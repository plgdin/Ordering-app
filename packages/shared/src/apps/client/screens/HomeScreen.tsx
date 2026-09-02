import React, { useEffect, useMemo, useRef, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { serviceRules } from "@nearnow/config";
import { categories, verticals, Store } from "@nearnow/core";
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

export function ClientHomeScreen({
  onStorePress
}: {
  onStorePress: (store: Store) => void;
}) {
  const [activeVertical, setActiveVertical] = useState<string>("Restaurants");
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [pendingFilter, setPendingFilter] = useState<string | null>(null);
  const [isFilterLoading, setIsFilterLoading] = useState(false);
  const filterTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const stores = useClientStores();

  useEffect(() => {
    return () => {
      if (filterTimer.current) {
        clearTimeout(filterTimer.current);
      }
    };
  }, []);

  const previewFilter = pendingFilter ?? activeFilter;

  const previewStores = useMemo(() => {
    if (!previewFilter) return stores;
    return stores.filter(
      (store) => store.category.toLowerCase() === previewFilter.toLowerCase()
    );
  }, [previewFilter, stores]);

  const filteredStores = useMemo(() => {
    if (!activeFilter) return stores;
    return stores.filter(
      (store) => store.category.toLowerCase() === activeFilter.toLowerCase()
    );
  }, [activeFilter, stores]);

  const featuredOnly = useMemo(() => stores.filter((store) => store.featured), [stores]);

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
    }, 650);
  };

  return (
    <>
      <SearchBar label="Search restaurants, dishes, cuisines..." />

      <View style={styles.verticalsContainer}>
        {verticals.map((vertical) => (
          <Card
            key={vertical}
            style={[
              styles.verticalCard,
              activeVertical === vertical && styles.activeVerticalCard
            ]}
            onPress={() => {
              setActiveVertical(vertical);
              setActiveFilter(null);
            }}
          >
            <Text
              style={[
                styles.verticalText,
                activeVertical === vertical && styles.activeVerticalText
              ]}
            >
              {vertical}
            </Text>
          </Card>
        ))}
      </View>

      {activeVertical === "Restaurants" ? (
        <>
          <HeroCard
            eyebrow="CRAVINGS SATISFIED"
            title="Food delivery that feels fast, fresh, and reliable."
            body="Order from your favorite restaurants and get hot food delivered to your door in minutes."
            accent="#F6D57A"
          />

      <View style={styles.sectionSpacing}>
        <SectionTitle
          title="Top cuisines for you"
          action={`Within ${serviceRules.localityRadiusKm} km`}
        />
        <View style={styles.rowWrap}>
          {categories.map((category) => (
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
              ? `Loading ${previewFilter.toLowerCase()} options`
              : "Reloading nearby restaurants"
          }
          subtitle="A fresh cart is being filled with the best options around you."
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
            title={previewFilter ? `${previewFilter} options` : "Popular restaurants near you"}
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
              <Text style={styles.emptyTitle}>No restaurants found</Text>
              <Text style={styles.emptyBody}>
                Try a different category or clear the filter to explore more.
              </Text>
            </View>
          )}
        </View>
      ) : null}
        </>
      ) : (
        <View style={styles.comingSoonContainer}>
          <Text style={styles.comingSoonTitle}>{activeVertical}</Text>
          <Text style={styles.comingSoonBody}>
            This feature will be implemented in the future. Check back later!
          </Text>
        </View>
      )}
    </>
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
  verticalsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginBottom: spacing.md
  },
  verticalCard: {
    flex: 1,
    minWidth: '45%',
    padding: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderColor: '#E5E7EB',
    borderWidth: 1,
    borderRadius: radius.md,
  },
  activeVerticalCard: {
    backgroundColor: colors.primaryDeep,
    borderColor: colors.primaryDeep,
  },
  verticalText: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.ink
  },
  activeVerticalText: {
    color: '#FFFFFF'
  },
  comingSoonContainer: {
    padding: spacing.xl,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F9FAFB",
    borderRadius: radius.lg,
    marginTop: spacing.xl
  },
  comingSoonTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: colors.ink,
    marginBottom: spacing.sm
  },
  comingSoonBody: {
    fontSize: 16,
    color: colors.muted,
    textAlign: "center"
  },
  sectionSpacing: {
    gap: spacing.lg
  },
  rowWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm
  },
  spotlightCard: {
    backgroundColor: "#FCF8F1",
    borderColor: "#F0DFC3"
  },
  storeCard: {
    backgroundColor: "#FFFFFF",
    borderColor: "#D8E4DA"
  },
  storeCardFeatured: {
    borderColor: "#F0DFC3"
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
    backgroundColor: "rgba(255,255,255,0.9)",
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
    color: "#C27215"
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
    backgroundColor: "#FFF3E1"
  },
  metaBadgeLight: {
    backgroundColor: "#F3F7F4"
  },
  metaBadgeText: {
    fontSize: 12,
    fontWeight: "800",
    color: colors.primaryMid
  },
  metaBadgeWarmText: {
    color: "#B86B08"
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
  }
});
