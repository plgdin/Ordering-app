import { Platform } from "react-native";

export const colors = {
  primary: "#A8201A",
  primaryDeep: "#5C0D11",
  primaryMid: "#8B1E22",
  primaryLight: "#C33C3C",
  primarySoft: "#EAC7C0",
  primaryFaint: "#F7EDE2",
  surface: "#FAF6F0",
  canvas: "#F5EBE0",
  line: "#E3D5CA",
  ink: "#2F1F17",
  muted: "#7F6D64",
  success: "#588157",
  warning: "#D4A373",
  danger: "#A8201A"
};

export const categoryPalettes = {
  food: {
    primary: "#9B1B15",
    deep: "#4A0704",
    mid: "#C94A44",
    light: "#FAF2EA",
    soft: "#E9DCC9",
    surface: "#FFFDF9",
    canvas: "#FAF2EA",
    line: "#E6D8C8"
  },
  provisions: {
    primary: "#075E4E",
    deep: "#022D25",
    mid: "#2BA88A",
    light: "#F0FAF7",
    soft: "#A8E0D1",
    surface: "#FFFFFF",
    canvas: "#F0FAF7",
    line: "#D2EDE7"
  },
  ride: {
    primary: "#3F36C5",
    deep: "#120E43",
    mid: "#7C73FA",
    light: "#F5F6FF",
    soft: "#C4C1F7",
    surface: "#FFFFFF",
    canvas: "#F5F6FF",
    line: "#DDD9FC"
  }
};

export const fontFamilies = {
  display: Platform.OS === "web" ? "Outfit, sans-serif" : "System",
  body: Platform.OS === "web" ? "Inter, sans-serif" : "System"
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
