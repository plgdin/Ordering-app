import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import React, { PropsWithChildren, useEffect, useMemo, useRef } from "react";
import {
  Animated,
  Easing,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle
} from "react-native";
import { colors, fonts, radius, shadow, spacing } from "./theme";

export type TabOption<T extends string> = {
  id: T;
  label: string;
};

export function PageShell<T extends string>({
  title,
  subtitle,
  activeTab,
  onTabChange,
  tabs,
  children
}: PropsWithChildren<{
  title: string;
  subtitle: string;
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
    <LinearGradient
      colors={[colors.canvas, "#E7F7ED", colors.surface]}
      style={[styles.background, webViewportStyle]}
    >
      <StatusBar style="dark" />
      <SafeAreaView style={[styles.safeArea, webViewportStyle]}>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.subtitle}>{subtitle}</Text>
          </View>
          <View style={styles.profileDot} />
        </View>
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
    </LinearGradient>
  );
}

export function HeroCard({
  eyebrow,
  title,
  body,
  accent
}: {
  eyebrow: string;
  title: string;
  body: string;
  accent: string;
}) {
  return (
    <LinearGradient
      colors={[colors.primaryDeep, colors.primary]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.heroCard}
    >
      <Text style={styles.eyebrow}>{eyebrow}</Text>
      <Text style={styles.heroTitle}>{title}</Text>
      <Text style={styles.heroBody}>{body}</Text>
      <View style={[styles.accentBadge, { backgroundColor: accent }]}>
        <Text style={styles.accentText}>Fast local fulfillment</Text>
      </View>
    </LinearGradient>
  );
}

export function Card({
  children,
  style
}: PropsWithChildren<{ style?: StyleProp<ViewStyle> }>) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function SectionTitle({
  title,
  action
}: {
  title: string;
  action?: string;
}) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {action ? <Text style={styles.sectionAction}>{action}</Text> : null}
    </View>
  );
}

export function Chip({ label, solid = false }: { label: string; solid?: boolean }) {
  return (
    <View style={[styles.chip, solid ? styles.chipSolid : styles.chipOutline]}>
      <Text style={[styles.chipText, solid && styles.chipSolidText]}>{label}</Text>
    </View>
  );
}

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

export function SearchBar({ label }: { label: string }) {
  return (
    <View style={styles.searchBar}>
      <Text style={styles.searchText}>{label}</Text>
    </View>
  );
}

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
        ? { backgroundColor: "#FFF6D9", borderColor: "#F6D986" }
        : { backgroundColor: colors.primarySoft, borderColor: "#B7E7C9" },
    [tone]
  );

  return (
    <View style={[styles.notice, toneStyle]}>
      <Text style={styles.noticeText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1
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
    backgroundColor: colors.primary,
    borderWidth: 4,
    borderColor: "#B6E6C8"
  },
  animatedBody: {
    flex: 1
  },
  scrollContent: {
    paddingBottom: 110,
    gap: spacing.md
  },
  heroCard: {
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.sm,
    ...shadow
  },
  eyebrow: {
    color: "#C9F2D9",
    textTransform: "uppercase",
    fontWeight: "700",
    letterSpacing: 1.1,
    fontSize: 12
  },
  heroTitle: {
    color: colors.surface,
    fontSize: 26,
    lineHeight: 32,
    fontWeight: "800"
  },
  heroBody: {
    color: "#E4FFF0",
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
    color: colors.ink,
    fontWeight: "700"
  },
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.line,
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.md,
    gap: spacing.sm,
    ...shadow
  },
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
    color: colors.primaryDeep,
    fontWeight: "700"
  },
  chip: {
    borderRadius: radius.pill,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginRight: 10,
    marginBottom: 10
  },
  chipOutline: {
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surface
  },
  chipSolid: {
    backgroundColor: colors.primary,
    borderWidth: 0
  },
  chipText: {
    color: colors.ink,
    fontWeight: "700"
  },
  chipSolidText: {
    color: colors.surface
  },
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
    color: colors.primaryDeep,
    fontWeight: "700"
  },
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
    color: colors.surface
  },
  searchBar: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 14
  },
  searchText: {
    color: colors.muted,
    fontSize: fonts.body
  },
  notice: {
    borderRadius: radius.md,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: 12
  },
  noticeText: {
    color: colors.ink,
    fontSize: fonts.body,
    lineHeight: 21,
    fontWeight: "600"
  }
});
