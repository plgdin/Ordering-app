import { Platform } from "react-native";

export const colors = {
  // Glovo Signature Brand Colors
  primary: "#FFC244", // Glovo Vibrant Yellow
  primaryDeep: "#222222", // Glovo Slate Black / Headers
  primaryMid: "#FFB000", // Glovo Deep Yellow
  primaryLight: "#00A082", // Glovo Emerald Teal / Secondary Accent
  primarySoft: "#E8ECF2", // Soft slate border lines
  primaryFaint: "#FFF8E7", // Faint Glovo Yellow Tint

  // Glovo Specific Palette Tokens
  glovoYellow: "#FFC244",
  glovoYellowDeep: "#F2AB00",
  glovoYellowTint: "#FFF8E7",
  glovoTeal: "#00A082",
  glovoTealDark: "#00836B",
  glovoTealTint: "#E6F5F2",
  glovoDark: "#222222",
  glovoGray: "#666666",
  glovoLightGray: "#EFEFF4",
  glovoRed: "#FF5252",
  glovoOrange: "#FF9800",
  glovoPurple: "#8E44AD",
  glovoBlue: "#2980B9",

  // Base Surface & Canvas
  surface: "#FFFFFF",
  canvas: "#F4F4F6", // Glovo clean background
  line: "#E6E8EC",
  ink: "#222222",
  muted: "#757575",
  success: "#00A082",
  warning: "#FF9800",
  danger: "#FF5252"
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 28
};

export const radius = {
  sm: 10,
  md: 16,
  lg: 22,
  pill: 999
};

export const shadow = Platform.select({
  android: {
    elevation: 4
  },
  default: {
    shadowColor: "#1E202C",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 14
  }
});

export const glovoBubbleShadow = Platform.select({
  android: {
    elevation: 6
  },
  default: {
    shadowColor: "#00A082",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 12
  }
});

export const fonts = {
  title: 26,
  heading: 18,
  body: 13,
  caption: 11
};


