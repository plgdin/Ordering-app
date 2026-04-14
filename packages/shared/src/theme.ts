import { Platform } from "react-native";

export const colors = {
  primary: "#0E8A4D",
  primaryDeep: "#075C31",
  primarySoft: "#DDF8E9",
  surface: "#FFFFFF",
  canvas: "#F4FBF6",
  line: "#D6E6DA",
  ink: "#111111",
  muted: "#5A6B60",
  success: "#1FA866",
  warning: "#E9A31B",
  danger: "#DD4C4C"
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
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.08,
    shadowRadius: 20
  }
});

export const fonts = {
  title: 30,
  heading: 20,
  body: 15,
  caption: 13
};
