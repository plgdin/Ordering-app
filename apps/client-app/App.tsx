import "expo-dev-client";
import { ClientApp } from "@nearnow/shared";
import { registerSupabaseAutoRefresh } from "@nearnow/supabase";
import React, { useEffect } from "react";
import { Platform } from "react-native";

export default function App() {
  useEffect(() => {
    const cleanup = registerSupabaseAutoRefresh();

    if (Platform.OS !== "web") {
      return cleanup;
    }

    document.documentElement.style.height = "100%";
    document.body.style.height = "100%";
    document.body.style.margin = "0";
    document.body.style.background = "#F0F4F1";

    const root = document.getElementById("root");
    if (root) {
      root.style.height = "100%";
    }

    return cleanup;
  }, []);

  return <ClientApp />;
}
