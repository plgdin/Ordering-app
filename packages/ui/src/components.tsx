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
  const lift = useRef(new Animated.Value(24)).current;
  const headerScale = useRef(new Animated.Value(0.96)).current;
  const headerOpacity = useRef(new Animated.Value(0)).current;
  const useNativeDriver = Platform.OS !== "web";
  const webViewportStyle = Platform.OS === "web" ? styles.webViewport : null;

  useEffect(() => {
    fade.setValue(0);
    lift.setValue(24);
    headerScale.setValue(0.96);
    headerOpacity.setValue(0);
    Animated.parallel([
      Animated.timing(headerOpacity, {
        toValue: 1,
        duration: 300,
        easing: Easing.out(Easing.quad),
        useNativeDriver
      }),
      Animated.spring(headerScale, {
        toValue: 1,
        friction: 8,
        tension: 120,
        useNativeDriver
      }),
      Animated.timing(fade, {
        toValue: 1,
        duration: 480,
        delay: 80,
        easing: Easing.out(Easing.cubic),
        useNativeDriver
      }),
      Animated.spring(lift, {
        toValue: 0,
        friction: 10,
        tension: 90,
        delay: 60,
        useNativeDriver
      } as any)
    ]).start();
  }, [activeTab, fade, lift, headerScale, headerOpacity, useNativeDriver]);

  return (
    <View style={[styles.background, webViewportStyle]}>
      <StatusBar style="dark" />
      <SafeAreaView style={[styles.safeArea, webViewportStyle]}>
        {locationBar}
        {title ? (
          <Animated.View
            style={[
              styles.header,
              { opacity: headerOpacity, transform: [{ scale: headerScale }] }
            ]}
          >
            <View>
              <Text style={styles.title}>{title}</Text>
              {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
            </View>
            <AnimatedProfileDot />
          </Animated.View>
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

function AnimatedProfileDot() {
  const useNativeDriver = Platform.OS !== "web";
  const glowScale = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowScale, { toValue: 1.18, duration: 1800, easing: Easing.inOut(Easing.sin), useNativeDriver }),
        Animated.timing(glowScale, { toValue: 1, duration: 1800, easing: Easing.inOut(Easing.sin), useNativeDriver })
      ])
    ).start();
  }, [glowScale, useNativeDriver]);
  return (
    <Animated.View style={[styles.profileDot, { transform: [{ scale: glowScale }] }]} />
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
  const useNativeDriver = Platform.OS !== "web";
  const displayText = [address.houseNo, address.street, address.area]
    .filter(Boolean)
    .join(", ");

  // Pulsing location dot
  const dotPulse = useRef(new Animated.Value(1)).current;
  const dotOpacity = useRef(new Animated.Value(0.5)).current;
  const pressScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(dotPulse, { toValue: 1.5, duration: 900, easing: Easing.out(Easing.quad), useNativeDriver }),
          Animated.timing(dotPulse, { toValue: 1, duration: 900, easing: Easing.in(Easing.quad), useNativeDriver })
        ]),
        Animated.sequence([
          Animated.timing(dotOpacity, { toValue: 0.15, duration: 900, useNativeDriver }),
          Animated.timing(dotOpacity, { toValue: 0.5, duration: 900, useNativeDriver })
        ])
      ])
    ).start();
  }, [dotPulse, dotOpacity, useNativeDriver]);

  const handlePressIn = () => {
    Animated.spring(pressScale, { toValue: 0.97, friction: 8, tension: 200, useNativeDriver }).start();
  };
  const handlePressOut = () => {
    Animated.spring(pressScale, { toValue: 1, friction: 6, tension: 120, useNativeDriver }).start();
  };

  return (
    <>
      <Animated.View style={{ transform: [{ scale: pressScale }] }}>
        <Pressable
          onPress={() => setModalVisible(true)}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          style={styles.locationBar}
        >
          <View style={styles.locationDotWrap}>
            <Animated.View
              style={[styles.locationDotRing, { transform: [{ scale: dotPulse }], opacity: dotOpacity }]}
            />
            <View style={styles.locationDot} />
          </View>
          <View style={styles.locationContent}>
            <Text style={styles.locationLabel}>DELIVER TO</Text>
            <Text style={styles.locationAddress} numberOfLines={1}>
              {displayText || `${address.city} ${address.pincode}`}
            </Text>
          </View>
          <Text style={styles.locationChevron}>Change ›</Text>
        </Pressable>
      </Animated.View>
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
  const useNativeDriver = Platform.OS !== "web";
  const scale = useRef(new Animated.Value(1)).current;
  const shadowAnim = useRef(new Animated.Value(0)).current;

  const handlePressIn = () => {
    Animated.parallel([
      Animated.spring(scale, { toValue: 0.974, friction: 8, tension: 300, useNativeDriver }),
      Animated.timing(shadowAnim, { toValue: 1, duration: 100, useNativeDriver: false })
    ]).start();
  };
  const handlePressOut = () => {
    Animated.parallel([
      Animated.spring(scale, { toValue: 1, friction: 5, tension: 100, useNativeDriver }),
      Animated.timing(shadowAnim, { toValue: 0, duration: 200, useNativeDriver: false })
    ]).start();
  };

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        <Animated.View
          style={[
            styles.card,
            style,
            { transform: [{ scale }] }
          ]}
        >
          {children}
        </Animated.View>
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
  const useNativeDriver = Platform.OS !== "web";
  const lineWidth = useRef(new Animated.Value(0)).current;
  const titleOpacity = useRef(new Animated.Value(0)).current;
  const titleX = useRef(new Animated.Value(-8)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(titleOpacity, { toValue: 1, duration: 350, easing: Easing.out(Easing.cubic), useNativeDriver }),
      Animated.spring(titleX, { toValue: 0, friction: 9, tension: 120, useNativeDriver }),
      Animated.timing(lineWidth, { toValue: 1, duration: 500, delay: 150, easing: Easing.out(Easing.quad), useNativeDriver: false })
    ]).start();
  }, [title, lineWidth, titleOpacity, titleX, useNativeDriver]);

  return (
    <View style={styles.sectionHeader}>
      <View>
        <Animated.Text style={[styles.sectionTitle, { opacity: titleOpacity, transform: [{ translateX: titleX }] }]}>
          {title}
        </Animated.Text>
        <Animated.View
          style={[
            styles.sectionUnderline,
            { transform: [{ scaleX: lineWidth }], transformOrigin: "left" as never }
          ]}
        />
      </View>
      {action ? (
        <Pressable onPress={onActionPress}>
          <Text style={styles.sectionAction}>{action}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

/* ─── Category Chip (with ripple + spring animation) ─── */
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
  const ripple = useRef(new Animated.Value(0)).current;
  const rippleOpacity = useRef(new Animated.Value(0)).current;
  const useNativeDriver = Platform.OS !== "web";

  const handlePress = useCallback(() => {
    onPress?.();
    // Ripple burst
    ripple.setValue(0);
    rippleOpacity.setValue(0.35);
    // Spring press
    scale.setValue(0.91);
    Animated.parallel([
      Animated.spring(scale, { toValue: 1, friction: 4, tension: 200, useNativeDriver }),
      Animated.timing(ripple, { toValue: 1, duration: 400, easing: Easing.out(Easing.quad), useNativeDriver: false }),
      Animated.timing(rippleOpacity, { toValue: 0, duration: 400, delay: 100, useNativeDriver: false })
    ]).start();
  }, [onPress, scale, ripple, rippleOpacity, useNativeDriver]);

  const rippleSize = ripple.interpolate({ inputRange: [0, 1], outputRange: [0, 120] });

  return (
    <Animated.View
      style={[
        styles.categoryChipWrap,
        { transform: [{ scale }] }
      ]}
    >
      <Pressable onPress={handlePress} style={{ overflow: "hidden" as never }}>
        <View
          style={[
            styles.categoryChip,
            solid ? styles.categoryChipSolid : styles.categoryChipOutline
          ]}
        >
          <Animated.View
            style={[
              styles.chipRipple,
              {
                width: rippleSize,
                height: rippleSize,
                borderRadius: ripple.interpolate({ inputRange: [0, 1], outputRange: [0, 60] }),
                opacity: rippleOpacity,
                backgroundColor: solid ? "rgba(255,255,255,0.4)" : colors.primarySoft
              }
            ]}
          />
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
  const palette =
    rating > 4
      ? {
          colors: ["#1D5B33", "#2C7A46", "#489E62"],
          borderColor: "#B7DBC2",
          dotColor: "#E9F8EE",
          valueColor: "#FFFFFF",
          captionColor: "#DBF3E3"
        }
      : rating > 3.5
        ? {
            colors: ["#8FD19E", "#A9DEB0", "#C3EAC5"],
            borderColor: "#D5EDD7",
            dotColor: "#F7FFF8",
            valueColor: "#1D4D2E",
            captionColor: "#356B45"
          }
        : {
            colors: ["#FF8A3D", "#FFB347", "#FFD769"],
            borderColor: "#FFE1A8",
            dotColor: "#FFF6DA",
            valueColor: "#4B2202",
            captionColor: "#7A3D00"
          };

  return (
    <LinearGradient
      colors={palette.colors as [string, string, ...string[]]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.ratingPill, { borderColor: palette.borderColor }]}
    >
      <View style={[styles.ratingPillDot, { backgroundColor: palette.dotColor }]} />
      <View style={styles.ratingPillCopy}>
        <Text style={[styles.ratingPillValue, { color: palette.valueColor }]}>
          {rating.toFixed(1)}
        </Text>
        <Text style={[styles.ratingPillCaption, { color: palette.captionColor }]}>
          {caption}
        </Text>
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
    } as any;
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
    } as any;
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
  const useNativeDriver = Platform.OS !== "web";
  const activeIndex = tabs.findIndex((t) => t.id === activeTab);
  const indicatorX = useRef(new Animated.Value(activeIndex)).current;
  const tabWidth = 100 / tabs.length;

  useEffect(() => {
    Animated.spring(indicatorX, {
      toValue: activeIndex,
      friction: 8,
      tension: 120,
      useNativeDriver: false
    }).start();
  }, [activeIndex, indicatorX]);

  const indicatorLeft = indicatorX.interpolate({
    inputRange: tabs.map((_, i) => i),
    outputRange: tabs.map((_, i) => `${i * tabWidth}%` as unknown as number)
  });

  return (
    <View style={styles.tabBar}>
      <Animated.View
        style={[
          styles.tabIndicator,
          { left: indicatorLeft, width: `${tabWidth}%` as never }
        ]}
      />
      {tabs.map((tab) => {
        const active = tab.id === activeTab;
        return (
          <AnimatedTabButton
            key={tab.id}
            tab={tab}
            active={active}
            onPress={() => onTabChange(tab.id)}
            useNativeDriver={useNativeDriver}
          />
        );
      })}
    </View>
  );
}

function AnimatedTabButton<T extends string>({
  tab,
  active,
  onPress,
  useNativeDriver
}: {
  tab: TabOption<T>;
  active: boolean;
  onPress: () => void;
  useNativeDriver: boolean;
}) {
  const bounce = useRef(new Animated.Value(1)).current;
  const prevActive = useRef(active);

  useEffect(() => {
    if (active && !prevActive.current) {
      Animated.sequence([
        Animated.timing(bounce, { toValue: 0.82, duration: 80, useNativeDriver }),
        Animated.spring(bounce, { toValue: 1, friction: 4, tension: 220, useNativeDriver })
      ]).start();
    }
    prevActive.current = active;
  }, [active, bounce, useNativeDriver]);

  return (
    <Pressable
      onPress={onPress}
      style={styles.tabButton}
    >
      <Animated.Text
        style={[
          styles.tabLabel,
          active && styles.tabLabelActive,
          { transform: [{ scale: bounce }] }
        ]}
      >
        {tab.label}
      </Animated.Text>
    </Pressable>
  );
}

/* ─── Search Bar (with focus glow ring) ─── */
export function SearchBar({
  label,
  value,
  onChangeText
}: {
  label: string;
  value?: string;
  onChangeText?: (text: string) => void;
}) {
  const [focused, setFocused] = useState(false);
  const useNativeDriver = Platform.OS !== "web";
  const glowAnim = useRef(new Animated.Value(0)).current;
  const iconScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(glowAnim, {
        toValue: focused ? 1 : 0,
        duration: 250,
        easing: Easing.out(Easing.quad),
        useNativeDriver: false
      }),
      Animated.spring(iconScale, {
        toValue: focused ? 1.15 : 1,
        friction: 6,
        tension: 180,
        useNativeDriver
      })
    ]).start();
  }, [focused, glowAnim, iconScale, useNativeDriver]);

  const borderColor = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["#DCE7DE", colors.primaryMid]
  });
  const shadowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.04, 0.18]
  });

  return (
    <Animated.View
      style={[
        styles.searchBar,
        { borderColor, shadowOpacity, shadowColor: colors.primaryMid }
      ]}
    >
      <Animated.View
        style={[styles.searchIconCircle, { transform: [{ scale: iconScale }], backgroundColor: focused ? colors.primarySoft : "#E6F3E7" }]}
      >
        <Text style={[styles.searchIconText, focused && { color: colors.primaryDeep }]}>⌕</Text>
      </Animated.View>
      <TextInput
        style={styles.searchText}
        placeholder={label}
        placeholderTextColor={colors.muted}
        value={value}
        onChangeText={onChangeText}
        autoCapitalize="none"
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      />
    </Animated.View>
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
    borderWidth: 1.5,
    borderColor: colors.line,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    marginBottom: spacing.md,
    gap: 10,
    ...shadow
  },
  locationDotWrap: {
    width: 18,
    height: 18,
    justifyContent: "center",
    alignItems: "center"
  },
  locationDotRing: {
    position: "absolute",
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "rgba(0, 230, 118, 0.2)"
  },
  locationDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#00E676"
  },
  locationContent: {
    flex: 1
  },
  locationLabel: {
    fontSize: 10,
    fontWeight: "800",
    color: "#00E676",
    letterSpacing: 0.8
  },
  locationAddress: {
    fontSize: fonts.body,
    fontWeight: "600",
    color: colors.ink,
    marginTop: 2
  },
  locationChevron: {
    fontSize: 12,
    color: "#00E676",
    fontWeight: "700"
  },
  /* Hero */
  heroCard: {
    borderRadius: radius.lg,
    padding: spacing.xl,
    gap: spacing.sm,
    overflow: "hidden",
    borderWidth: 1.5,
    borderColor: colors.line,
    ...shadow
  },
  heroGlowLarge: {
    position: "absolute",
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: "rgba(255, 46, 99, 0.12)",
    top: -36,
    right: -32
  },
  heroGlowSmall: {
    position: "absolute",
    width: 94,
    height: 94,
    borderRadius: 47,
    backgroundColor: "rgba(0, 230, 118, 0.12)",
    bottom: -18,
    right: 56
  },
  eyebrow: {
    color: "#FF2E63",
    textTransform: "uppercase",
    fontWeight: "800",
    letterSpacing: 1.1,
    fontSize: 11
  },
  heroTitle: {
    color: colors.ink,
    fontSize: 24,
    lineHeight: 30,
    fontWeight: "900"
  },
  heroBody: {
    color: colors.muted,
    fontSize: fonts.body,
    lineHeight: 20
  },
  accentBadge: {
    alignSelf: "flex-start",
    borderRadius: radius.pill,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginTop: 8
  },
  accentText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 12
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
    borderWidth: 1.5,
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
    fontWeight: "900",
    color: colors.ink,
    letterSpacing: 0.5
  },
  sectionUnderline: {
    height: 3,
    width: 40,
    backgroundColor: "#FFC244", // Glovo Yellow Accent
    borderRadius: 999,
    marginTop: 4,
    opacity: 0.95
  },
  sectionAction: {
    fontSize: fonts.caption,
    color: "#00A082", // Glovo Emerald Teal
    fontWeight: "800"
  },
  /* Category chip */
  categoryChipWrap: {
    borderRadius: radius.pill
  },
  categoryChip: {
    borderRadius: radius.pill,
    paddingHorizontal: 18,
    paddingVertical: 12,
    overflow: "hidden" as never,
    alignItems: "center",
    justifyContent: "center"
  },
  chipRipple: {
    position: "absolute",
    alignSelf: "center"
  },
  categoryChipOutline: {
    borderWidth: 1.5,
    borderColor: colors.line,
    backgroundColor: colors.surface
  },
  categoryChipSolid: {
    backgroundColor: "#00A082", // Glovo Emerald Teal
    borderWidth: 1,
    borderColor: "#00A082",
    ...shadow
  },
  categoryChipText: {
    color: "#FFFFFF",
    fontWeight: "800",
    fontSize: 13
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
    borderColor: colors.line,
    flexShrink: 0
  },
  ratingPillDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#FFB300",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.7)"
  },
  ratingPillCopy: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 4
  },
  ratingPillValue: {
    color: colors.ink,
    fontWeight: "900",
    fontSize: 15
  },
  ratingPillCaption: {
    color: "#FFB300",
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
    backgroundColor: "#FF2E63",
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
    fontWeight: "900",
    color: colors.ink
  },
  metricTrend: {
    fontSize: fonts.caption,
    color: "#FF2E63",
    fontWeight: "700"
  },
  /* Tab bar */
  tabBar: {
    position: "absolute",
    left: spacing.md,
    right: spacing.md,
    bottom: spacing.md,
    backgroundColor: "#FFFFFF",
    borderRadius: 28,
    padding: 6,
    borderWidth: 1.5,
    borderColor: "#E6E8EC",
    flexDirection: "row",
    gap: 0,
    ...shadow
  },
  tabIndicator: {
    position: "absolute",
    top: 6,
    bottom: 6,
    backgroundColor: "#FFC244", // Glovo Yellow
    borderRadius: 22,
    zIndex: 0
  },
  tabButton: {
    flex: 1,
    borderRadius: 22,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1
  },
  tabButtonActive: {},
  tabLabel: {
    fontSize: 13,
    fontWeight: "800",
    color: "#757575"
  },
  tabLabelActive: {
    color: "#222222" // Glovo Dark Slate on Yellow
  },
  /* Search */
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.line,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 14,
    ...shadow
  },
  searchIconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(0, 0, 0, 0.04)",
    alignItems: "center",
    justifyContent: "center"
  },
  searchIconText: {
    color: "#FF2E63",
    fontWeight: "800",
    fontSize: 16
  },
  searchText: {
    color: colors.ink,
    fontSize: fonts.body,
    flex: 1
  },
  /* Notice */
  notice: {
    borderRadius: radius.md,
    borderWidth: 1.5,
    paddingHorizontal: spacing.md,
    paddingVertical: 12
  },
  noticeText: {
    fontSize: fonts.body,
    lineHeight: 18,
    fontWeight: "700"
  },
  /* Featured badge */
  featuredBadge: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(255, 179, 0, 0.15)",
    borderColor: "rgba(255, 179, 0, 0.3)",
    borderWidth: 1,
    borderRadius: radius.pill,
    paddingHorizontal: 12,
    paddingVertical: 5
  },
  featuredBadgeText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#FFB300"
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
