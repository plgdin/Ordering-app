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

    // Load Outfit and Inter fonts dynamically on web
    const styleId = "google-fonts-injection";
    if (!document.getElementById(styleId)) {
      const style = document.createElement("style");
      style.id = styleId;
      style.appendChild(
        document.createTextNode(
          `@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Outfit:wght@500;700;800;900&display=swap');
           * {
             font-family: 'Inter', sans-serif;
           }`
        )
      );
      document.head.appendChild(style);
    }

    const root = document.getElementById("root");
    if (root) {
      root.style.height = "100%";
    }

    return cleanup;
  }, []);

  return <ClientApp />;
}
