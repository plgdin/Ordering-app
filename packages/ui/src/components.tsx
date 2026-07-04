import { LinearGradient } from "expo-linear-gradient";
import MaskedView from '@react-native-masked-view/masked-view';
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
import { colors, fonts, radius, shadow, spacing, fontFamilies } from "./theme";

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

/* ─── 21st.dev Animations ─── */

export function AuroraBackground({ colors: blobColors = ["rgba(255,0,0,0.08)", "rgba(0,0,255,0.08)", "rgba(0,255,0,0.06)"] }: { colors?: string[] }) {
  const anim1 = useRef(new Animated.Value(0)).current;
  const anim2 = useRef(new Animated.Value(0)).current;
  const anim3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const createLoop = (anim: Animated.Value, duration: number) => Animated.loop(
      Animated.sequence([
        Animated.timing(anim, { toValue: 1, duration, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(anim, { toValue: 0, duration, easing: Easing.inOut(Easing.sin), useNativeDriver: true })
      ])
    );
    const loops = [createLoop(anim1, 14000), createLoop(anim2, 18000), createLoop(anim3, 22000)];
    loops.forEach(l => l.start());
    return () => loops.forEach(l => l.stop());
  }, [anim1, anim2, anim3]);

  const filterStyle = Platform.OS === 'web' ? { filter: 'blur(70px)' } : { opacity: 0.8 };

  return (
    <View style={[StyleSheet.absoluteFillObject, { overflow: 'hidden' }]} pointerEvents="none">
      <Animated.View style={[
        { position: 'absolute', top: '-10%', left: '-10%', width: '70%', height: '60%', borderRadius: 9999, backgroundColor: blobColors[0] },
        filterStyle as any,
        { transform: [
          { translateX: anim1.interpolate({ inputRange: [0, 1], outputRange: [0, 100] }) },
          { translateY: anim1.interpolate({ inputRange: [0, 1], outputRange: [0, 40] }) },
          { scale: anim1.interpolate({ inputRange: [0, 1], outputRange: [1, 1.1] }) }
        ] }
      ]} />
      <Animated.View style={[
        { position: 'absolute', top: '30%', right: '-20%', width: '80%', height: '70%', borderRadius: 9999, backgroundColor: blobColors[1] || blobColors[0] },
        filterStyle as any,
        { transform: [
          { translateX: anim2.interpolate({ inputRange: [0, 1], outputRange: [0, -80] }) },
          { translateY: anim2.interpolate({ inputRange: [0, 1], outputRange: [0, 60] }) },
          { scale: anim2.interpolate({ inputRange: [0, 1], outputRange: [1, 1.15] }) }
        ] }
      ]} />
      {blobColors[2] && (
        <Animated.View style={[
          { position: 'absolute', bottom: '-20%', left: '10%', width: '60%', height: '50%', borderRadius: 9999, backgroundColor: blobColors[2] },
          filterStyle as any,
          { transform: [
            { translateX: anim3.interpolate({ inputRange: [0, 1], outputRange: [0, 60] }) },
            { translateY: anim3.interpolate({ inputRange: [0, 1], outputRange: [0, -90] }) },
            { scale: anim3.interpolate({ inputRange: [0, 1], outputRange: [1, 1.2] }) }
          ] }
        ]} />
      )}
    </View>
  );
}

export function SpringButton({ onPress, children, style, scaleTo = 0.95, ...props }: React.ComponentProps<typeof Pressable> & { scaleTo?: number }) {
  const scale = useRef(new Animated.Value(1)).current;
  const shimmer = useRef(new Animated.Value(-1)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(shimmer, { toValue: 2, duration: 3000, easing: Easing.linear, useNativeDriver: true })
    );
    loop.start();
    return () => loop.stop();
  }, [shimmer]);

  const onPressIn = (e: any) => {
    Animated.spring(scale, { toValue: scaleTo, tension: 150, friction: 6, useNativeDriver: true }).start();
    props.onPressIn?.(e);
  };
  const onPressOut = (e: any) => {
    Animated.spring(scale, { toValue: 1, tension: 180, friction: 7, useNativeDriver: true }).start();
    props.onPressOut?.(e);
  };

  const translateX = shimmer.interpolate({
    inputRange: [-1, 2],
    outputRange: [-200, 400]
  });

  return (
    <Pressable onPress={onPress} onPressIn={onPressIn} onPressOut={onPressOut} {...props}>
      {(state) => {
        const customStyle = typeof style === 'function' ? style(state) : style;
        return (
          <Animated.View style={[customStyle, { transform: [{ scale }], overflow: 'hidden', position: 'relative' }] as any}>
            {typeof children === 'function' ? children(state) : children}
            {/* The Shiny Glare */}
            <Animated.View style={[StyleSheet.absoluteFillObject, { transform: [{ translateX }, { skewX: '-20deg' }], width: '50%' }]} pointerEvents="none">
              <LinearGradient 
                colors={["rgba(255,255,255,0)", "rgba(255,255,255,0.25)", "rgba(255,255,255,0)"]} 
                start={{ x: 0, y: 0 }} 
                end={{ x: 1, y: 0 }} 
                style={StyleSheet.absoluteFillObject} 
              />
            </Animated.View>
          </Animated.View>
        );
      }}
    </Pressable>
  );
}

export function BorderBeamCard({ children, style, colors: beamColors = ["#000", "transparent", "transparent"] }: { children: React.ReactNode, style?: StyleProp<ViewStyle>, colors?: string[] }) {
  const spin = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(spin, { toValue: 1, duration: 3500, easing: Easing.linear, useNativeDriver: true })
    );
    loop.start();
    return () => loop.stop();
  }, [spin]);

  const spinRotate = spin.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"]
  });

  const flatStyle = StyleSheet.flatten(style) || {};
  const { 
    padding, paddingHorizontal, paddingVertical, paddingTop, paddingBottom, paddingLeft, paddingRight, paddingStart, paddingEnd, 
    borderRadius, backgroundColor, 
    ...outerStyle 
  } = flatStyle as any;

  const innerPadding = {
    padding, paddingHorizontal, paddingVertical, paddingTop, paddingBottom, paddingLeft, paddingRight, paddingStart, paddingEnd,
  };
  const bRadius = borderRadius || 0;
  const bgColor = backgroundColor || "transparent";

  return (
    <View style={[outerStyle, { overflow: 'hidden', position: 'relative', backgroundColor: 'transparent', borderRadius: bRadius }]}>
      <Animated.View style={[
        StyleSheet.absoluteFillObject, 
        { 
          width: '200%', 
          height: '200%', 
          top: '-50%', 
          left: '-50%', 
          transform: [{ rotate: spinRotate }],
          alignItems: 'center',
          justifyContent: 'center'
        }
      ]}>
        <LinearGradient 
          colors={[beamColors[0], beamColors[1] || 'transparent', beamColors[2] || 'transparent']} 
          start={{ x: 0.5, y: 0.5 }} 
          end={{ x: 1, y: 1 }} 
          style={{ width: '50%', height: '50%', position: 'absolute', bottom: '50%', right: '50%' }} 
        />
        <LinearGradient 
          colors={['transparent', beamColors[0], 'transparent']} 
          start={{ x: 0, y: 0 }} 
          end={{ x: 1, y: 0 }} 
          style={{ width: '100%', height: 4, position: 'absolute', top: '50%', right: '50%' }} 
        />
      </Animated.View>
      <View style={[innerPadding, { flex: 1, margin: 2, backgroundColor: bgColor, borderRadius: Math.max(0, bRadius - 2), overflow: 'hidden' }]}>
        {children}
      </View>
    </View>
  );
}

export function ShimmerText({ children, style, shimmerColor = "rgba(255,255,255,0.9)" }: { children: string, style?: StyleProp<ViewStyle>, shimmerColor?: string }) {
  const move = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(move, { toValue: 1, duration: 2500, easing: Easing.linear, useNativeDriver: true })
    );
    loop.start();
    return () => loop.stop();
  }, [move]);

  const translateX = move.interpolate({
    inputRange: [0, 1],
    outputRange: [-150, 250]
  });

  return (
    <MaskedView
      maskElement={<Text style={[style, { backgroundColor: 'transparent' }]}>{children}</Text>}
    >
      <Text style={[style, { opacity: 0.5 }]}>{children}</Text>
      <Animated.View style={[StyleSheet.absoluteFillObject, { transform: [{ translateX }, { skewX: '-15deg' }], width: 100 }]} pointerEvents="none">
         <LinearGradient 
           colors={["transparent", shimmerColor, "transparent"]} 
           start={{ x: 0, y: 0 }} 
           end={{ x: 1, y: 0 }} 
           style={StyleSheet.absoluteFillObject} 
         />
      </Animated.View>
    </MaskedView>
  );
}

/* ─── Page Shell ─── */
export function PageShell<T extends string>({
  title,
  subtitle,
  locationBar,
  activeTab,
  onTabChange,
  tabs,
  backgroundColor,
  auroraColors,
  children
}: PropsWithChildren<{
  title?: string;
  subtitle?: string;
  locationBar?: React.ReactNode;
  activeTab: T;
  onTabChange: (tab: T) => void;
  tabs: TabOption<T>[];
  backgroundColor?: string;
  auroraColors?: string[];
}>) {
  const fade = useRef(new Animated.Value(0)).current;
  const lift = useRef(new Animated.Value(15)).current;
  const slideX = useRef(new Animated.Value(20)).current;
  const useNativeDriver = Platform.OS !== "web";
  const webViewportStyle = Platform.OS === "web" ? styles.webViewport : null;

  useEffect(() => {
    fade.setValue(0);
    lift.setValue(15);
    slideX.setValue(20);
    Animated.parallel([
      Animated.timing(fade, {
        toValue: 1,
        duration: 250,
        useNativeDriver
      }),
      Animated.spring(lift, {
        toValue: 0,
        tension: 60,
        friction: 8,
        useNativeDriver
      }),
      Animated.spring(slideX, {
        toValue: 0,
        tension: 60,
        friction: 8,
        useNativeDriver
      })
    ]).start();
  }, [activeTab, fade, lift, slideX, useNativeDriver]);

  return (
    <View style={[styles.background, webViewportStyle, backgroundColor ? { backgroundColor } : null]}>
      {auroraColors && <AuroraBackground colors={auroraColors} />}
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
            { opacity: fade, transform: [{ translateY: lift }, { translateX: slideX }] }
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
      colors={palette.colors}
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
export function SearchBar({
  label,
  value,
  onChangeText
}: {
  label: string;
  value?: string;
  onChangeText?: (text: string) => void;
}) {
  return (
    <View style={styles.searchBar}>
      <View style={styles.searchIconCircle}>
        <Text style={styles.searchIconText}>S</Text>
      </View>
      <TextInput
        style={styles.searchText}
        placeholder={label}
        placeholderTextColor={colors.muted}
        value={value}
        onChangeText={onChangeText}
        autoCapitalize="none"
      />
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
    fontFamily: fontFamilies.display,
    fontSize: fonts.title,
    fontWeight: "800",
    color: colors.ink
  },
  subtitle: {
    fontFamily: fontFamilies.body,
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
    fontFamily: fontFamilies.body,
    fontSize: 11,
    fontWeight: "700",
    color: colors.primaryMid,
    letterSpacing: 0.8
  },
  locationAddress: {
    fontFamily: fontFamilies.body,
    fontSize: fonts.body,
    fontWeight: "600",
    color: colors.ink,
    marginTop: 2
  },
  locationChevron: {
    fontFamily: fontFamilies.body,
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
    fontFamily: fontFamilies.body,
    color: colors.primarySoft,
    textTransform: "uppercase",
    fontWeight: "700",
    letterSpacing: 1.1,
    fontSize: 12
  },
  heroTitle: {
    fontFamily: fontFamilies.display,
    color: "#FFFFFF",
    fontSize: 26,
    lineHeight: 32,
    fontWeight: "800"
  },
  heroBody: {
    fontFamily: fontFamilies.body,
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
    fontFamily: fontFamilies.body,
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
    fontFamily: fontFamilies.display,
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
    fontFamily: fontFamilies.display,
    fontSize: fonts.heading,
    fontWeight: "800",
    color: colors.ink
  },
  sectionAction: {
    fontFamily: fontFamilies.body,
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
    fontFamily: fontFamilies.display,
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
    fontFamily: fontFamilies.display,
    color: "#4B2202",
    fontWeight: "900",
    fontSize: 15
  },
  ratingPillCaption: {
    fontFamily: fontFamilies.body,
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
    fontFamily: fontFamilies.body,
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
    fontFamily: fontFamilies.body,
    fontSize: fonts.caption,
    color: colors.muted
  },
  metricValue: {
    fontFamily: fontFamilies.display,
    fontSize: 24,
    fontWeight: "800",
    color: colors.ink
  },
  metricTrend: {
    fontFamily: fontFamilies.body,
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
    fontFamily: fontFamilies.display,
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
    fontFamily: fontFamilies.body,
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
    fontFamily: fontFamilies.body,
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
    fontFamily: fontFamilies.body,
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
    fontFamily: fontFamilies.display,
    fontSize: 17,
    fontWeight: "800",
    color: colors.ink,
    textAlign: "center"
  },
  cartLoaderSubtitle: {
    fontFamily: fontFamilies.body,
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
    fontFamily: fontFamilies.display,
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
    fontFamily: fontFamilies.display,
    fontSize: 14,
    fontWeight: "700",
    color: colors.primaryDeep
  },
  mapSubtext: {
    fontFamily: fontFamilies.body,
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
    fontFamily: fontFamilies.body,
    fontSize: 13,
    fontWeight: "700",
    color: colors.muted
  },
  fieldInput: {
    fontFamily: fontFamilies.body,
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
    fontFamily: fontFamilies.body,
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
    fontFamily: fontFamilies.display,
    color: "#FFFFFF",
    fontWeight: "800",
    fontSize: 16
  }
});
