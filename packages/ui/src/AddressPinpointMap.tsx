import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { colors, radius, spacing } from "./theme";

type AddressShape = {
  area: string;
  city: string;
  pincode: string;
};

export function AddressPinpointMap({
  address
}: {
  address: AddressShape;
  onChange: (patch: Partial<AddressShape & { lat?: number; lng?: number }>) => void;
}) {
  return (
    <View style={styles.card}>
      <View style={styles.routeHorizontal} />
      <View style={styles.routeVertical} />
      <View style={[styles.marker, styles.markerLeft]} />
      <View style={[styles.marker, styles.markerRight]} />
      <View style={[styles.marker, styles.markerBottom]} />
      <View style={styles.pinWrap}>
        <View style={styles.pinShadow} />
        <View style={styles.pin}>
          <View style={styles.pinCore} />
        </View>
      </View>
      <View style={styles.copy}>
        <Text style={styles.title}>Google Maps pinpoint is available on web</Text>
        <Text style={styles.subtitle}>
          Open the web build to place the pin accurately on a real map.
        </Text>
        <Text style={styles.caption}>
          {address.area || address.city}, {address.pincode}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    height: 180,
    backgroundColor: "#EAF5ED",
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: "#D1E3D6",
    marginTop: spacing.lg,
    marginBottom: spacing.md,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center"
  },
  routeHorizontal: {
    position: "absolute",
    width: "68%" as never,
    height: 18,
    backgroundColor: "#D7EADF",
    borderRadius: 999
  },
  routeVertical: {
    position: "absolute",
    width: 18,
    height: "120%" as never,
    backgroundColor: "#D7EADF",
    borderRadius: 999
  },
  marker: {
    position: "absolute",
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: "#79B682"
  },
  markerLeft: {
    left: 48,
    top: 62
  },
  markerRight: {
    right: 42,
    top: 50
  },
  markerBottom: {
    right: 70,
    bottom: 32
  },
  pinWrap: {
    alignItems: "center"
  },
  pinShadow: {
    width: 22,
    height: 8,
    borderRadius: 999,
    backgroundColor: "rgba(21, 38, 26, 0.16)",
    marginBottom: -4
  },
  pin: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F27E46",
    borderWidth: 4,
    borderColor: "#FFF4EE",
    alignItems: "center",
    justifyContent: "center"
  },
  pinCore: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#FFF4EE"
  },
  copy: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 18,
    alignItems: "center",
    gap: 6,
    paddingHorizontal: spacing.md
  },
  title: {
    fontSize: 14,
    fontWeight: "800",
    color: colors.primaryDeep,
    textAlign: "center"
  },
  subtitle: {
    fontSize: 12,
    lineHeight: 18,
    color: colors.muted,
    textAlign: "center"
  },
  caption: {
    fontSize: 13,
    color: colors.muted,
    textAlign: "center"
  }
});
