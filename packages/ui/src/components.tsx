import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import React, { PropsWithChildren, useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Easing,
  Image,
  Modal,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleProp,
  StyleSheet,
  Text,
  TextInput,
  View,
  ViewStyle
} from "react-native";
import { AddressPinpointMap } from "./AddressPinpointMap";
import { colors, fonts, radius, shadow, spacing } from "./theme";

export type TabOption<T extends string> = {
  id: T;
  label: string;
};

/* ─── Address type ─── */
export type SavedAddress = {
  label: string;
  houseNo: string;
  street: string;
  area: string;
  city: string;
  pincode: string;
  landmark: string;
  directions: string;
  lat?: number;
  lng?: number;
};

/* ─── Page Shell ─── */
export function PageShell<T extends string>({
  title,
  subtitle,
  locationBar,
  activeTab,
  onTabChange,
  tabs,
  children
}: PropsWithChildren<{
  title?: string;
  subtitle?: string;
  locationBar?: React.ReactNode;
  activeTab: T;
  onTabChange: (tab: T) => void;
  tabs: TabOption<T>[];
}>) {
  const fade = useRef(new Animated.Value(0)).current;
  const lift = useRef(new Animated.Value(18)).current;
  const useNativeDriver = Platform.OS !== "web";
  const webViewportStyle = Platform.OS === "web" ? styles.webViewport : null;

  useEffect(() => {
    fade.setValue(0);
    lift.setValue(18);
    Animated.parallel([
      Animated.timing(fade, {
        toValue: 1,
        duration: 420,
        easing: Easing.out(Easing.cubic),
        useNativeDriver
      }),
      Animated.timing(lift, {
        toValue: 0,
        duration: 460,
        easing: Easing.out(Easing.cubic),
        useNativeDriver
      })
    ]).start();
  }, [activeTab, fade, lift, useNativeDriver]);

  return (
    <View style={[styles.background, webViewportStyle]}>
      <StatusBar style="dark" />
      <SafeAreaView style={[styles.safeArea, webViewportStyle]}>
        {locationBar}
        {title ? (
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>{title}</Text>
              {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
            </View>
            <View style={styles.profileDot} />
          </View>
        ) : null}
        <Animated.View
          style={[
            styles.animatedBody,
            { opacity: fade, transform: [{ translateY: lift }] }
          ]}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {children}
          </ScrollView>
        </Animated.View>
        <BottomTabs tabs={tabs} activeTab={activeTab} onTabChange={onTabChange} />
      </SafeAreaView>
    </View>
  );
}

/* ─── Location Bar ─── */
export function LocationBar({
  address,
  onEditAddress
}: {
  address: SavedAddress;
  onEditAddress: (addr: SavedAddress) => void;
}) {
  const [modalVisible, setModalVisible] = useState(false);
  const displayText = [address.houseNo, address.street, address.area]
    .filter(Boolean)
    .join(", ");

  return (
    <>
      <Pressable onPress={() => setModalVisible(true)} style={styles.locationBar}>
        <View style={styles.locationDot} />
        <View style={styles.locationContent}>
          <Text style={styles.locationLabel}>DELIVER TO</Text>
          <Text style={styles.locationAddress} numberOfLines={1}>
            {displayText || `${address.city} ${address.pincode}`}
          </Text>
        </View>
        <Text style={styles.locationChevron}>Change</Text>
      </Pressable>
      <AddressEditorModal
        visible={modalVisible}
        address={address}
        onSave={(newAddr) => {
          onEditAddress(newAddr);
          setModalVisible(false);
        }}
        onClose={() => setModalVisible(false)}
      />
    </>
  );
}

/* ─── Address Editor Modal ─── */
function AddressEditorModal({
  visible,
  address,
  onSave,
  onClose
}: {
  visible: boolean;
  address: SavedAddress;
  onSave: (addr: SavedAddress) => void;
  onClose: () => void;
}) {
  const [draft, setDraft] = useState<SavedAddress>(address);

  useEffect(() => {
    if (visible) setDraft(address);
  }, [visible, address]);

  const update = (field: keyof SavedAddress, value: string) =>
    setDraft((prev) => ({ ...prev, [field]: value }));

  if (!visible) return null;

  return (
    <View style={modalStyles.overlay}>
      <Pressable style={modalStyles.backdrop} onPress={onClose} />
      <View style={modalStyles.sheet}>
        <View style={modalStyles.header}>
          <Text style={modalStyles.headerTitle}>Edit delivery address</Text>
          <Pressable onPress={onClose} style={modalStyles.closeBtnWrap}>
            <Text style={modalStyles.closeBtn}>✕</Text>
          </Pressable>
        </View>

        <ScrollView style={modalStyles.scrollBody} showsVerticalScrollIndicator={false}>
          <AddressPinpointMap
            address={draft}
            onChange={(patch) => setDraft((prev) => ({ ...prev, ...patch }))}
          />

          <View style={modalStyles.form}>
            <FormField label="Label (e.g. Home, Office)" value={draft.label}
              onChangeText={(v) => update("label", v)} />
            <FormField label="House / Flat / Floor No." value={draft.houseNo}
              onChangeText={(v) => update("houseNo", v)} placeholder="e.g. Flat 301, Tower B" />
            <FormField label="Street / Road" value={draft.street}
              onChangeText={(v) => update("street", v)} placeholder="e.g. MG Road" />
            <FormField label="Area / Locality" value={draft.area}
              onChangeText={(v) => update("area", v)} placeholder="e.g. Sector 21" />
            <View style={modalStyles.row}>
              <View style={modalStyles.halfField}>
                <FormField label="City" value={draft.city}
                  onChangeText={(v) => update("city", v)} />
              </View>
              <View style={modalStyles.halfField}>
                <FormField label="Pincode" value={draft.pincode}
                  onChangeText={(v) => update("pincode", v)} keyboardType="numeric" />
              </View>
            </View>
            <FormField label="Nearby landmark" value={draft.landmark}
              onChangeText={(v) => update("landmark", v)} placeholder="e.g. Opposite City Mall" />
            <FormField label="Delivery directions (optional)" value={draft.directions}
              onChangeText={(v) => update("directions", v)}
              placeholder="e.g. Ring the bell twice, leave at the door"
              multiline />
          </View>
        </ScrollView>

        <Pressable style={modalStyles.saveBtn} onPress={() => onSave(draft)}>
          <Text style={modalStyles.saveBtnText}>Save address</Text>
        </Pressable>
      </View>
    </View>
  );
}

function FormField({
  label,
  value,
  onChangeText,
  placeholder,
  multiline = false,
  keyboardType
}: {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  placeholder?: string;
  multiline?: boolean;
  keyboardType?: "numeric" | "default";
}) {
  return (
    <View style={modalStyles.fieldWrap}>
      <Text style={modalStyles.fieldLabel}>{label}</Text>
      <TextInput
        style={[modalStyles.fieldInput, multiline && modalStyles.fieldMultiline]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.muted}
        multiline={multiline}
        keyboardType={keyboardType}
      />
    </View>
  );
}

/* ─── Hero Card (no emojis) ─── */
export function HeroCard({
  eyebrow,
  title,
  body,
  accent
}: {
  eyebrow?: string;
  title: string;
  body: string;
  accent: string;
}) {
  return (
    <LinearGradient
      colors={[colors.primaryDeep, colors.primaryMid]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.heroCard}
    >
      <View style={styles.heroGlowLarge} />
      <View style={styles.heroGlowSmall} />
      {eyebrow ? <Text style={styles.eyebrow}>{eyebrow}</Text> : null}
      <Text style={styles.heroTitle}>{title}</Text>
      <Text style={styles.heroBody}>{body}</Text>
      <View style={[styles.accentBadge, { backgroundColor: accent }]}>
        <Text style={styles.accentText}>Fast local fulfillment</Text>
      </View>
    </LinearGradient>
  );
}

/* ─── Store Image Card ─── */
export function StoreImageCard({
  imageUri,
  storeName
}: {
  imageUri?: string;
  storeName: string;
}) {
  if (imageUri) {
    return (
      <Image
        source={{ uri: imageUri }}
        style={styles.storeImage}
        resizeMode="cover"
      />
    );
  }
  // Fallback: coloured initials
  const initials = storeName
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  return (
    <LinearGradient
      colors={[colors.primaryMid, colors.primaryLight]}
      style={styles.storeImage}
    >
      <Text style={styles.storeImageInitials}>{initials}</Text>
    </LinearGradient>
  );
}

/* ─── Card ─── */
export function Card({
  children,
  style,
  onPress
}: PropsWithChildren<{ style?: StyleProp<ViewStyle>; onPress?: () => void }>) {
  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          styles.card,
          style,
          pressed && styles.cardPressed
        ]}
      >
        {children}
      </Pressable>
    );
  }
  return <View style={[styles.card, style]}>{children}</View>;
}

/* ─── Section Title ─── */
export function SectionTitle({
  title,
  action,
  onActionPress
}: {
  title: string;
  action?: string;
  onActionPress?: () => void;
}) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {action ? (
        <Pressable onPress={onActionPress}>
          <Text style={styles.sectionAction}>{action}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

/* ─── Category Chip (no emoji, with swoosh animation) ─── */
export function CategoryChip({
  label,
  solid = false,
  onPress
}: {
  label: string;
  solid?: boolean;
  onPress?: () => void;
}) {
  const scale = useRef(new Animated.Value(1)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  const useNativeDriver = Platform.OS !== "web";

  const handlePress = useCallback(() => {
    onPress?.();
    scale.setValue(0.94);
    translateY.setValue(2);
    Animated.parallel([
      Animated.spring(scale, {
        toValue: 1,
        friction: 5,
        tension: 180,
        useNativeDriver
      }),
      Animated.spring(translateY, {
        toValue: 0,
        friction: 6,
        tension: 170,
        useNativeDriver
      })
    ]).start();
  }, [onPress, scale, translateY, useNativeDriver]);

  return (
    <Animated.View
      style={[
        styles.categoryChipWrap,
        { transform: [{ scale }, { translateY }] }
      ]}
    >
      <Pressable onPress={handlePress}>
        <View
          style={[
            styles.categoryChip,
            solid ? styles.categoryChipSolid : styles.categoryChipOutline
          ]}
        >
          <Text style={[styles.categoryChipText, solid && styles.chipSolidText]}>
            {label}
          </Text>
        </View>
      </Pressable>
    </Animated.View>
  );
}

export function RatingPill({
  rating,
  caption = "rated"
}: {
  rating: number;
  caption?: string;
}) {
  return (
    <LinearGradient
      colors={["#FF8A3D", "#FFB347", "#FFD769"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.ratingPill}
    >
      <View style={styles.ratingPillDot} />
      <View style={styles.ratingPillCopy}>
        <Text style={styles.ratingPillValue}>{rating.toFixed(1)}</Text>
        <Text style={styles.ratingPillCaption}>{caption}</Text>
      </View>
    </LinearGradient>
  );
}

export function CartLoadingIndicator({
  title = "Finding the best aisle for you",
  subtitle = "Loading nearby stores and filling your cart."
}: {
  title?: string;
  subtitle?: string;
}) {
  const progress = useRef(new Animated.Value(0)).current;
  const bob = useRef(new Animated.Value(0)).current;
  const useNativeDriver = Platform.OS !== "web";

  useEffect(() => {
    const progressLoop = Animated.loop(
      Animated.parallel([
        Animated.timing(progress, {
          toValue: 1,
          duration: 2100,
          easing: Easing.inOut(Easing.cubic),
          useNativeDriver
        }),
        Animated.sequence([
          Animated.timing(bob, {
            toValue: 1,
            duration: 520,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver
          }),
          Animated.timing(bob, {
            toValue: 0,
            duration: 520,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver
          })
        ])
      ])
    );

    progressLoop.start();

    return () => {
      progressLoop.stop();
      progress.stopAnimation();
      bob.stopAnimation();
    };
  }, [bob, progress, useNativeDriver]);

  const cartLift = bob.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -4]
  });

  const wheelRotate = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "200deg"]
  });

  const basketItemAnimatedStyle = (index: number) => {
    const start = index * 0.2;
    const peak = start + 0.18;
    const settle = peak + 0.14;

    return {
      opacity: progress.interpolate({
        inputRange: [0, start, peak, 1],
        outputRange: [0, 0, 1, 1],
        extrapolate: "clamp"
      }),
      transform: [
        {
          translateY: progress.interpolate({
            inputRange: [0, start, peak, settle, 1],
            outputRange: [-18, -18, -4, 0, 0],
            extrapolate: "clamp"
          })
        },
        {
          scale: progress.interpolate({
            inputRange: [0, peak, 1],
            outputRange: [0.7, 1, 1],
            extrapolate: "clamp"
          })
        }
      ]
    };
  };

  const dropAnimatedStyle = (index: number) => {
    const start = index * 0.2;
    const peak = start + 0.18;
    const settle = peak + 0.12;

    return {
      opacity: progress.interpolate({
        inputRange: [0, start, peak, settle, 1],
        outputRange: [0, 0, 1, 0, 0],
        extrapolate: "clamp"
      }),
      transform: [
        {
          translateY: progress.interpolate({
            inputRange: [0, start, peak, settle, 1],
            outputRange: [-12, -12, 8, 26, 26],
            extrapolate: "clamp"
          })
        },
        {
          scale: progress.interpolate({
            inputRange: [0, peak, settle, 1],
            outputRange: [0.8, 1, 0.92, 0.92],
            extrapolate: "clamp"
          })
        }
      ]
    };
  };

  return (
    <View style={styles.cartLoader}>
      <View style={styles.cartLoaderArt}>
        {[0, 1, 2].map((index) => (
          <Animated.View
            key={`drop-${index}`}
            style={[
              styles.cartLoaderDrop,
              index === 1 && styles.cartLoaderDropMid,
              index === 2 && styles.cartLoaderDropRight,
              dropAnimatedStyle(index)
            ]}
          />
        ))}
        <Animated.View
          style={[styles.cartLoaderCart, { transform: [{ translateY: cartLift }] }]}
        >
          <View style={styles.cartLoaderHandle} />
          <View style={styles.cartLoaderBasket}>
            {[0, 1, 2].map((index) => (
              <Animated.View
                key={`item-${index}`}
                style={[
                  styles.cartLoaderItem,
                  index === 1 && styles.cartLoaderItemMid,
                  index === 2 && styles.cartLoaderItemRight,
                  basketItemAnimatedStyle(index)
                ]}
              />
            ))}
          </View>
          <View style={styles.cartLoaderBase} />
          <Animated.View
            style={[
              styles.cartLoaderWheel,
              styles.cartLoaderWheelLeft,
              { transform: [{ rotate: wheelRotate }] }
            ]}
          />
          <Animated.View
            style={[
              styles.cartLoaderWheel,
              styles.cartLoaderWheelRight,
              { transform: [{ rotate: wheelRotate }] }
            ]}
          />
        </Animated.View>
      </View>
      <Text style={styles.cartLoaderTitle}>{title}</Text>
      <Text style={styles.cartLoaderSubtitle}>{subtitle}</Text>
    </View>
  );
}

/* ─── Chip ─── */
export function Chip({ label, solid = false }: { label: string; solid?: boolean }) {
  return (
    <View style={[styles.chip, solid ? styles.chipSolid : styles.chipOutline]}>
      <Text style={[styles.chipText, solid && styles.chipSolidText]}>{label}</Text>
    </View>
  );
}

/* ─── Metric Card ─── */
export function MetricCard({
  label,
  value,
  trend
}: {
  label: string;
  value: string;
  trend: string;
}) {
  return (
    <Card style={styles.metricCard}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricTrend}>{trend}</Text>
    </Card>
  );
}

/* ─── Bottom Tabs ─── */
export function BottomTabs<T extends string>({
  tabs,
  activeTab,
  onTabChange
}: {
  tabs: TabOption<T>[];
  activeTab: T;
  onTabChange: (tab: T) => void;
}) {
  return (
    <View style={styles.tabBar}>
      {tabs.map((tab) => {
        const active = tab.id === activeTab;
        return (
          <Pressable
            key={tab.id}
            onPress={() => onTabChange(tab.id)}
            style={[styles.tabButton, active && styles.tabButtonActive]}
          >
            <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>
              {tab.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

/* ─── Search Bar (no emoji) ─── */
export function SearchBar({ label }: { label: string }) {
  return (
    <View style={styles.searchBar}>
      <View style={styles.searchIconCircle}>
        <Text style={styles.searchIconText}>S</Text>
      </View>
      <Text style={styles.searchText}>{label}</Text>
    </View>
  );
}

/* ─── Notice ─── */
export function Notice({
  tone = "success",
  text
}: {
  tone?: "success" | "warning";
  text: string;
}) {
  const toneStyle = useMemo(
    () =>
      tone === "warning"
        ? { backgroundColor: "#FFF8E6", borderColor: "#E8CC6A" }
        : { backgroundColor: colors.primaryFaint, borderColor: colors.primarySoft },
    [tone]
  );

  return (
    <View style={[styles.notice, toneStyle]}>
      <Text style={styles.noticeText}>{text}</Text>
    </View>
  );
}

/* ─── Featured Badge ─── */
export function FeaturedBadge() {
  return (
    <View style={styles.featuredBadge}>
      <Text style={styles.featuredBadgeText}>Featured</Text>
    </View>
  );
}

/* ────────────────── Styles ────────────────── */
const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: colors.canvas
  },
  webViewport: {
    minHeight: "100vh" as never,
    width: "100%" as never
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.md
  },
  title: {
    fontSize: fonts.title,
    fontWeight: "800",
    color: colors.ink
  },
  subtitle: {
    marginTop: 4,
    fontSize: fonts.body,
    color: colors.muted
  },
  profileDot: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.primaryMid,
    borderWidth: 3,
    borderColor: colors.primarySoft
  },
  animatedBody: {
    flex: 1
  },
  scrollContent: {
    paddingBottom: 110,
    gap: spacing.xl
  },
  /* Location bar */
  locationBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.primarySoft,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    marginBottom: spacing.md,
    gap: 10,
    ...shadow
  },
  locationDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primaryMid
  },
  locationContent: {
    flex: 1
  },
  locationLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.primaryMid,
    letterSpacing: 0.8
  },
  locationAddress: {
    fontSize: fonts.body,
    fontWeight: "600",
    color: colors.ink,
    marginTop: 2
  },
  locationChevron: {
    fontSize: 13,
    color: colors.primaryMid,
    fontWeight: "700"
  },
  /* Hero */
  heroCard: {
    borderRadius: radius.lg,
    padding: spacing.xl,
    gap: spacing.sm,
    overflow: "hidden",
    ...shadow
  },
  heroGlowLarge: {
    position: "absolute",
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: "rgba(255, 214, 112, 0.18)",
    top: -36,
    right: -32
  },
  heroGlowSmall: {
    position: "absolute",
    width: 94,
    height: 94,
    borderRadius: 47,
    backgroundColor: "rgba(133, 200, 155, 0.18)",
    bottom: -18,
    right: 56
  },
  eyebrow: {
    color: colors.primarySoft,
    textTransform: "uppercase",
    fontWeight: "700",
    letterSpacing: 1.1,
    fontSize: 12
  },
  heroTitle: {
    color: "#FFFFFF",
    fontSize: 26,
    lineHeight: 32,
    fontWeight: "800"
  },
  heroBody: {
    color: "#D4E8D9",
    fontSize: fonts.body,
    lineHeight: 22
  },
  accentBadge: {
    alignSelf: "flex-start",
    borderRadius: radius.pill,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginTop: 8
  },
  accentText: {
    color: colors.primaryDeep,
    fontWeight: "700",
    fontSize: 13
  },
  /* Store image */
  storeImage: {
    width: "100%" as never,
    height: 160,
    borderRadius: radius.md,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden"
  },
  storeImageInitials: {
    color: "#FFFFFF",
    fontSize: 32,
    fontWeight: "800",
    letterSpacing: 2
  },
  /* Card */
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.line,
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.md,
    gap: spacing.sm,
    ...shadow
  },
  cardPressed: {
    opacity: 0.88,
    transform: [{ scale: 0.985 }]
  },
  /* Section */
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4
  },
  sectionTitle: {
    fontSize: fonts.heading,
    fontWeight: "800",
    color: colors.ink
  },
  sectionAction: {
    fontSize: fonts.caption,
    color: colors.primaryMid,
    fontWeight: "700"
  },
  /* Category chip */
  categoryChipWrap: {
    borderRadius: radius.pill
  },
  categoryChip: {
    borderRadius: radius.pill,
    paddingHorizontal: 18,
    paddingVertical: 12
  },
  categoryChipOutline: {
    borderWidth: 1.5,
    borderColor: "#D7DFD8",
    backgroundColor: "#FFFFFF"
  },
  categoryChipSolid: {
    backgroundColor: "#254734",
    borderWidth: 1,
    borderColor: "#254734",
    ...shadow
  },
  categoryChipText: {
    color: colors.ink,
    fontWeight: "700",
    fontSize: 14
  },
  ratingPill: {
    minWidth: 94,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderRadius: radius.pill,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderWidth: 1,
    borderColor: "#FFE1A8",
    flexShrink: 0
  },
  ratingPillDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#FFF6DA",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.7)"
  },
  ratingPillCopy: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 4
  },
  ratingPillValue: {
    color: "#4B2202",
    fontWeight: "900",
    fontSize: 15
  },
  ratingPillCaption: {
    color: "#7A3D00",
    fontWeight: "700",
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: 0.5
  },
  /* Chip */
  chip: {
    borderRadius: radius.pill,
    paddingHorizontal: 14,
    paddingVertical: 10
  },
  chipOutline: {
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surface
  },
  chipSolid: {
    backgroundColor: colors.primaryMid,
    borderWidth: 0
  },
  chipText: {
    color: colors.ink,
    fontWeight: "700"
  },
  chipSolidText: {
    color: "#FFFFFF"
  },
  /* Metric */
  metricCard: {
    flex: 1
  },
  metricLabel: {
    fontSize: fonts.caption,
    color: colors.muted
  },
  metricValue: {
    fontSize: 24,
    fontWeight: "800",
    color: colors.ink
  },
  metricTrend: {
    fontSize: fonts.caption,
    color: colors.primaryMid,
    fontWeight: "700"
  },
  /* Tab bar */
  tabBar: {
    position: "absolute",
    left: spacing.md,
    right: spacing.md,
    bottom: spacing.md,
    backgroundColor: "#FFFFFFF0",
    borderRadius: 26,
    padding: 8,
    borderWidth: 1,
    borderColor: colors.line,
    flexDirection: "row",
    gap: 8,
    ...shadow
  },
  tabButton: {
    flex: 1,
    borderRadius: 20,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center"
  },
  tabButtonActive: {
    backgroundColor: colors.primary
  },
  tabLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.muted
  },
  tabLabelActive: {
    color: "#FFFFFF"
  },
  /* Search */
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: "#DCE7DE",
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 14,
    ...shadow
  },
  searchIconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#E6F3E7",
    alignItems: "center",
    justifyContent: "center"
  },
  searchIconText: {
    color: colors.primaryMid,
    fontWeight: "800",
    fontSize: 13
  },
  searchText: {
    color: colors.muted,
    fontSize: fonts.body,
    flex: 1
  },
  /* Notice */
  notice: {
    borderRadius: radius.md,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: 12
  },
  noticeText: {
    color: colors.primaryDeep,
    fontSize: fonts.body,
    lineHeight: 21,
    fontWeight: "600"
  },
  /* Featured badge */
  featuredBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#FFF2D9",
    borderColor: "#FFDDA3",
    borderWidth: 1,
    borderRadius: radius.pill,
    paddingHorizontal: 12,
    paddingVertical: 5
  },
  featuredBadgeText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#9A5A00"
  },
  cartLoader: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#D8E4DA",
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
    gap: spacing.sm,
    ...shadow
  },
  cartLoaderArt: {
    width: 140,
    height: 104,
    alignItems: "center",
    justifyContent: "flex-end"
  },
  cartLoaderDrop: {
    position: "absolute",
    top: 10,
    left: 42,
    width: 18,
    height: 16,
    borderRadius: 6,
    backgroundColor: "#79B682"
  },
  cartLoaderDropMid: {
    left: 61,
    width: 16,
    height: 14,
    backgroundColor: "#FFB347"
  },
  cartLoaderDropRight: {
    left: 79,
    width: 20,
    height: 18,
    backgroundColor: "#EF7A52"
  },
  cartLoaderCart: {
    width: 116,
    height: 72,
    alignItems: "center",
    justifyContent: "flex-end"
  },
  cartLoaderHandle: {
    position: "absolute",
    width: 30,
    height: 22,
    top: 6,
    left: 6,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderColor: colors.primaryDeep,
    borderTopLeftRadius: 14
  },
  cartLoaderBasket: {
    width: 76,
    height: 42,
    borderWidth: 4,
    borderColor: colors.primaryDeep,
    borderRadius: 16,
    backgroundColor: "#F6FBF7",
    overflow: "hidden",
    justifyContent: "flex-end",
    paddingHorizontal: 8,
    paddingBottom: 6,
    gap: 4
  },
  cartLoaderItem: {
    width: 18,
    height: 12,
    borderRadius: 5,
    backgroundColor: "#79B682"
  },
  cartLoaderItemMid: {
    width: 24,
    backgroundColor: "#FFB347"
  },
  cartLoaderItemRight: {
    width: 28,
    backgroundColor: "#EF7A52"
  },
  cartLoaderBase: {
    width: 92,
    height: 4,
    borderRadius: 999,
    backgroundColor: "#DFE9E1",
    marginTop: 8
  },
  cartLoaderWheel: {
    position: "absolute",
    bottom: 0,
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 3,
    borderColor: colors.primaryDeep,
    backgroundColor: "#FFFFFF"
  },
  cartLoaderWheelLeft: {
    left: 24
  },
  cartLoaderWheelRight: {
    right: 24
  },
  cartLoaderTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: colors.ink,
    textAlign: "center"
  },
  cartLoaderSubtitle: {
    fontSize: 14,
    lineHeight: 21,
    color: colors.muted,
    textAlign: "center"
  }
});

/* ─── Modal Styles ─── */
const modalStyles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
    zIndex: 1000
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    maxHeight: "92%" as never,
    ...shadow
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.line
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: colors.ink
  },
  closeBtnWrap: {
    padding: 8,
    marginRight: -8
  },
  closeBtn: {
    fontSize: 20,
    color: colors.muted
  },
  scrollBody: {
    paddingHorizontal: spacing.lg
  },
  mapPlaceholder: {
    height: 180,
    backgroundColor: "#EAF5ED",
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: "#D1E3D6",
    marginTop: spacing.lg,
    marginBottom: spacing.md,
    overflow: "hidden"
  },
  mapRoadHorizontal: {
    position: "absolute",
    width: "68%" as never,
    height: 18,
    backgroundColor: "#D7EADF",
    borderRadius: 999,
    top: "50%" as never,
    left: "16%" as never,
    marginTop: -9
  },
  mapRoadVertical: {
    position: "absolute",
    width: 18,
    height: "120%" as never,
    backgroundColor: "#D7EADF",
    borderRadius: 999,
    left: "50%" as never,
    top: "-10%" as never,
    marginLeft: -9
  },
  mapMarker: {
    position: "absolute",
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: "#79B682"
  },
  mapMarkerLeft: {
    left: 48,
    top: 62
  },
  mapMarkerRight: {
    right: 42,
    top: 50
  },
  mapMarkerBottom: {
    right: 70,
    bottom: 32
  },
  mapPulse: {
    position: "absolute",
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#F6D57A"
  },
  mapPinWrap: {
    position: "absolute",
    marginLeft: -20,
    marginTop: -42,
    alignItems: "center"
  },
  mapPinShadow: {
    width: 22,
    height: 8,
    borderRadius: 999,
    backgroundColor: "rgba(21, 38, 26, 0.16)",
    marginBottom: -4
  },
  mapPin: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F27E46",
    borderWidth: 4,
    borderColor: "#FFF4EE",
    alignItems: "center",
    justifyContent: "center",
    ...Platform.select({
      android: { elevation: 5 },
      default: {
        shadowColor: "#D55F26",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.22,
        shadowRadius: 12
      }
    })
  },
  mapPinCore: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#FFF4EE"
  },
  mapShimmer: {
    position: "absolute",
    top: -10,
    width: 42,
    height: 220,
    backgroundColor: "rgba(255,255,255,0.22)"
  },
  mapCopy: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 18,
    alignItems: "center",
    gap: 8,
    paddingHorizontal: spacing.md
  },
  mapText: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.primaryDeep
  },
  mapSubtext: {
    fontSize: 13,
    color: colors.muted,
    textAlign: "center"
  },
  form: {
    gap: spacing.md,
    paddingBottom: spacing.lg
  },
  row: {
    flexDirection: "row",
    gap: spacing.md
  },
  halfField: {
    flex: 1
  },
  fieldWrap: {
    gap: 6
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.muted
  },
  fieldInput: {
    backgroundColor: colors.primaryFaint,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.line,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: colors.ink
  },
  fieldMultiline: {
    minHeight: 72,
    textAlignVertical: "top" as never
  },
  saveBtn: {
    backgroundColor: colors.primary,
    margin: spacing.lg,
    borderRadius: radius.md,
    paddingVertical: 16,
    alignItems: "center"
  },
  saveBtnText: {
    color: "#FFFFFF",
    fontWeight: "800",
    fontSize: 16
  }
});
