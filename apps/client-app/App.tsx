import "expo-dev-client";
import { ClientApp } from "@nearnow/shared";
import React, { useEffect } from "react";
import { Platform } from "react-native";

export default function App() {
  useEffect(() => {
    if (Platform.OS !== "web") {
      return;
    }

    document.documentElement.style.height = "100%";
    document.body.style.height = "100%";
    document.body.style.margin = "0";
    document.body.style.background = "#F4FBF6";

    const root = document.getElementById("root");
    if (root) {
      root.style.height = "100%";
    }
  }, []);

  return <ClientApp />;
}
