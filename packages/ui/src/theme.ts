import { Platform } from "react-native";

export const colors = {
  primary: "#273C2C",
  primaryDeep: "#1A2A1E",
  primaryMid: "#3A5A40",
  primaryLight: "#5A8A66",
  primarySoft: "#DAE8DC",
  primaryFaint: "#EDF4EE",
  surface: "#FFFFFF",
  canvas: "#F0F4F1",
  line: "#D4DDD6",
  ink: "#111111",
  muted: "#5A6B5E",
  success: "#2D8B55",
  warning: "#D4960A",
  danger: "#D14343"
};

export const spacing = {
  xs: 6,
  sm: 10,
  md: 16,
  lg: 20,
  xl: 28,
  xxl: 36
};

export const radius = {
  sm: 12,
  md: 18,
  lg: 24,
  pill: 999
};

export const shadow = Platform.select({
  android: {
    elevation: 6
  },
  default: {
    shadowColor: "#1A2A1E",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 16
  }
});

export const fonts = {
  title: 30,
  heading: 20,
  body: 15,
  caption: 13
};
