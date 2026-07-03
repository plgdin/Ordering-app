import React, { useEffect, useRef } from "react";
import { Animated, Easing, StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { colors, radius, spacing } from "./theme";

export function ForkItSplash({ onFinish }: { onFinish: () => void }) {
  const scale = useRef(new Animated.Value(0.3)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const textY = useRef(new Animated.Value(20)).current;
  const containerOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // 1. Logo POP animation (Spring + Fade)
    Animated.parallel([
      Animated.spring(scale, {
        toValue: 1,
        tension: 40,
        friction: 6,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();

    // 2. Text elements fade in and slide up
    Animated.delay(500).start(() => {
      Animated.parallel([
        Animated.timing(textOpacity, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(textY, {
          toValue: 0,
          duration: 800,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start();
    });

    // 3. Fade out splash screen and finish after 2.6s
    const timer = setTimeout(() => {
      Animated.timing(containerOpacity, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }).start(() => {
        onFinish();
      });
    }, 2500);

    return () => clearTimeout(timer);
  }, [onFinish, scale, opacity, textOpacity, textY, containerOpacity]);

  return (
    <Animated.View style={[styles.outerContainer, { opacity: containerOpacity }]}>
      <LinearGradient
        colors={[colors.primaryDeep, colors.primaryMid]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientContainer}
      >
        <View style={styles.centerWrap}>
          {/* Popping Logo Emblem */}
          <Animated.View
            style={[
              styles.logoCircle,
              {
                opacity,
                transform: [{ scale }],
              },
            ]}
          >
            {/* Custom Geometric Fork Emblem */}
            <View style={styles.forkEmblem}>
              {/* Prongs */}
              <View style={styles.prongsRow}>
                <View style={styles.prong} />
                <View style={styles.prongGap} />
                <View style={styles.prong} />
                <View style={styles.prongGap} />
                <View style={styles.prong} />
                <View style={styles.prongGap} />
                <View style={styles.prong} />
              </View>
              {/* Head Base */}
              <View style={styles.forkBase} />
              {/* Stem */}
              <View style={styles.forkStem} />
            </View>
          </Animated.View>

          {/* Texts */}
          <Animated.View
            style={{
              opacity: textOpacity,
              transform: [{ translateY: textY }],
              alignItems: "center",
              marginTop: spacing.xl,
            }}
          >
            <Text style={styles.appName}>FORK IT</Text>
            <View style={styles.taglineBorder}>
              <Text style={styles.tagline}>Efficient Neighborhood Commerce & Transit</Text>
            </View>
          </Animated.View>
        </View>

        {/* Bottom subtle copyright / branding */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>A route-aligned sharing platform</Text>
        </View>
      </LinearGradient>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 9999,
  },
  gradientContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  centerWrap: {
    alignItems: "center",
    justifyContent: "center",
  },
  logoCircle: {
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: colors.surface,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: colors.primaryDeep,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
    borderWidth: 4,
    borderColor: "#EAD6BD", // beige highlight border
  },
  forkEmblem: {
    alignItems: "center",
    justifyContent: "center",
    width: 60,
    height: 60,
  },
  prongsRow: {
    flexDirection: "row",
    height: 20,
    alignItems: "flex-end",
  },
  prong: {
    width: 4,
    height: 20,
    backgroundColor: colors.primaryMid,
    borderRadius: 2,
  },
  prongGap: {
    width: 4,
  },
  forkBase: {
    width: 28,
    height: 12,
    backgroundColor: colors.primaryMid,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    marginTop: -2,
  },
  forkStem: {
    width: 4,
    height: 22,
    backgroundColor: colors.primaryMid,
    borderRadius: 2,
  },
  appName: {
    fontSize: 42,
    fontWeight: "900",
    color: "#FAF6F0", // Beige
    letterSpacing: 4,
    textShadowColor: "rgba(0,0,0,0.15)",
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 6,
  },
  taglineBorder: {
    marginTop: spacing.xs,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "rgba(250, 246, 240, 0.3)",
    paddingVertical: 6,
    paddingHorizontal: 16,
  },
  tagline: {
    fontSize: 14,
    fontWeight: "600",
    color: "#EAD6BD", // beige accent
    letterSpacing: 2,
    textTransform: "uppercase",
  },
  footer: {
    position: "absolute",
    bottom: 50,
  },
  footerText: {
    color: "rgba(250, 246, 240, 0.4)",
    fontSize: 12,
    letterSpacing: 1.5,
    textTransform: "uppercase",
    fontWeight: "700",
  },
});
