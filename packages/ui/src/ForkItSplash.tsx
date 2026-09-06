import React, { useEffect, useRef } from "react";
import { Animated, Easing, StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { colors, radius, spacing } from "./theme";

export function ForkItSplash({ onFinish }: { onFinish: () => void }) {
  const scale = useRef(new Animated.Value(0.2)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const textY = useRef(new Animated.Value(24)).current;
  const pulseRing = useRef(new Animated.Value(0.8)).current;
  const containerOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // 1. Glovo Emblem POP animation (Spring + Fade)
    Animated.parallel([
      Animated.spring(scale, {
        toValue: 1,
        tension: 50,
        friction: 5,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();

    // 2. Pulse background ring loop
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseRing, {
          toValue: 1.25,
          duration: 1200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseRing, {
          toValue: 0.85,
          duration: 1200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();

    // 3. Text elements slide up & reveal
    Animated.delay(400).start(() => {
      Animated.parallel([
        Animated.timing(textOpacity, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(textY, {
          toValue: 0,
          duration: 700,
          easing: Easing.out(Easing.back(1.5)),
          useNativeDriver: true,
        }),
      ]).start();
    });

    // 4. Smooth exit after 2.4s
    const timer = setTimeout(() => {
      Animated.timing(containerOpacity, {
        toValue: 0,
        duration: 450,
        useNativeDriver: true,
      }).start(() => {
        onFinish();
      });
    }, 2400);

    return () => clearTimeout(timer);
  }, [onFinish, scale, opacity, textOpacity, textY, pulseRing, containerOpacity]);

  return (
    <Animated.View style={[styles.outerContainer, { opacity: containerOpacity }]}>
      <LinearGradient
        colors={[colors.glovoYellow, "#FFB000"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0.8, y: 1 }}
        style={styles.gradientContainer}
      >
        <View style={styles.centerWrap}>
          {/* Animated Glow Ring */}
          <Animated.View
            style={[
              styles.glowRing,
              {
                transform: [{ scale: pulseRing }],
              },
            ]}
          />

          {/* Glovo Popping Logo Circle */}
          <Animated.View
            style={[
              styles.logoCircle,
              {
                opacity,
                transform: [{ scale }],
              },
            ]}
          >
            {/* Custom Glovo Style Pin & Fork Emblem */}
            <View style={styles.glovoEmblem}>
              <View style={styles.pinCircle}>
                <Text style={styles.emblemEmoji}>🟡</Text>
              </View>
              <View style={styles.prongsRow}>
                <View style={styles.prong} />
                <View style={styles.prongGap} />
                <View style={styles.prong} />
                <View style={styles.prongGap} />
                <View style={styles.prong} />
              </View>
              <View style={styles.forkBase} />
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
            <Text style={styles.appName}>GLOVO</Text>
            <View style={styles.taglineBadge}>
              <Text style={styles.tagline}>Anything Delivered in Minutes</Text>
            </View>
          </Animated.View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <View style={styles.footerPill}>
            <Text style={styles.footerDot}>🟢</Text>
            <Text style={styles.footerText}>Fast Food • Supermarket • Anything</Text>
          </View>
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
    position: "relative",
  },
  glowRing: {
    position: "absolute",
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: "rgba(255, 255, 255, 0.28)",
  },
  logoCircle: {
    width: 136,
    height: 136,
    borderRadius: 68,
    backgroundColor: "#00A082", // Glovo Emerald Teal Circle
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 18,
    elevation: 12,
    borderWidth: 4,
    borderColor: "#FFFFFF",
  },
  glovoEmblem: {
    alignItems: "center",
    justifyContent: "center",
    width: 64,
    height: 64,
  },
  pinCircle: {
    position: "absolute",
    top: -6,
  },
  emblemEmoji: {
    fontSize: 16,
  },
  prongsRow: {
    flexDirection: "row",
    height: 18,
    alignItems: "flex-end",
  },
  prong: {
    width: 4,
    height: 18,
    backgroundColor: "#FFC244",
    borderRadius: 2,
  },
  prongGap: {
    width: 4,
  },
  forkBase: {
    width: 24,
    height: 10,
    backgroundColor: "#FFC244",
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    marginTop: -2,
  },
  forkStem: {
    width: 4,
    height: 20,
    backgroundColor: "#FFC244",
    borderRadius: 2,
  },
  appName: {
    fontSize: 44,
    fontWeight: "900",
    color: "#222222", // Glovo Dark Slate
    letterSpacing: 4,
    textShadowColor: "rgba(255, 255, 255, 0.4)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  taglineBadge: {
    marginTop: spacing.sm,
    backgroundColor: "#222222",
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: radius.pill,
  },
  tagline: {
    fontSize: 13,
    fontWeight: "800",
    color: "#FFC244", // Glovo Yellow
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  footer: {
    position: "absolute",
    bottom: 50,
  },
  footerPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.85)",
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: radius.pill,
    gap: 8,
  },
  footerDot: {
    fontSize: 10,
  },
  footerText: {
    color: "#222222",
    fontSize: 12,
    letterSpacing: 0.5,
    fontWeight: "700",
  },
});

