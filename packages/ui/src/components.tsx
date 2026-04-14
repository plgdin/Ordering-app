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
          {/* Map placeholder */}
          <View style={modalStyles.mapPlaceholder}>
            <View style={modalStyles.mapPin} />
            <Text style={modalStyles.mapText}>
              Drag the map to pinpoint your location
            </Text>
            <Text style={modalStyles.mapSubtext}>
              {draft.area || draft.city}, {draft.pincode}
            </Text>
          </View>

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
  const translateX = useRef(new Animated.Value(0)).current;
  const useNativeDriver = Platform.OS !== "web";

  const handlePress = useCallback(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(scale, {
          toValue: 0.88,
          duration: 100,
          easing: Easing.out(Easing.cubic),
          useNativeDriver
        }),
        Animated.timing(translateX, {
          toValue: 10,
          duration: 160,
          easing: Easing.out(Easing.cubic),
          useNativeDriver
        })
      ]),
      Animated.parallel([
        Animated.spring(scale, {
          toValue: 1,
          friction: 4,
          tension: 200,
          useNativeDriver
        }),
        Animated.spring(translateX, {
          toValue: 0,
          friction: 5,
          tension: 180,
          useNativeDriver
        })
      ])
    ]).start(() => {
      onPress?.();
    });
  }, [onPress, scale, translateX, useNativeDriver]);

  return (
    <Animated.View style={{ transform: [{ scale }, { translateX }] }}>
      <Pressable onPress={handlePress}>
        <View style={[styles.categoryChip, solid ? styles.categoryChipSolid : styles.categoryChipOutline]}>
          <Text style={[styles.categoryChipText, solid && styles.chipSolidText]}>{label}</Text>
        </View>
      </Pressable>
    </Animated.View>
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
    ...shadow
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
  categoryChip: {
    borderRadius: radius.pill,
    paddingHorizontal: 18,
    paddingVertical: 12
  },
  categoryChipOutline: {
    borderWidth: 1.5,
    borderColor: colors.line,
    backgroundColor: colors.surface
  },
  categoryChipSolid: {
    backgroundColor: colors.primary,
    borderWidth: 0
  },
  categoryChipText: {
    color: colors.ink,
    fontWeight: "700",
    fontSize: 14
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
    borderColor: colors.line,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 14
  },
  searchIconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primaryFaint,
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
    backgroundColor: colors.primaryFaint,
    borderColor: colors.primarySoft,
    borderWidth: 1,
    borderRadius: radius.pill,
    paddingHorizontal: 12,
    paddingVertical: 5
  },
  featuredBadgeText: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.primaryMid
  }
});

/* ─── Modal Styles ─── */
const modalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end"
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
  closeBtn: {
    fontSize: 20,
    color: colors.muted,
    padding: 4
  },
  scrollBody: {
    paddingHorizontal: spacing.lg
  },
  mapPlaceholder: {
    height: 180,
    backgroundColor: colors.primaryFaint,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.primarySoft,
    justifyContent: "center",
    alignItems: "center",
    marginTop: spacing.lg,
    marginBottom: spacing.md,
    gap: 8
  },
  mapPin: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.primaryMid,
    borderWidth: 3,
    borderColor: colors.surface
  },
  mapText: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.primaryDeep
  },
  mapSubtext: {
    fontSize: 13,
    color: colors.muted
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
