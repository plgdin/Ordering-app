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

    const link = document.createElement("link");
    link.href = "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800;900&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);

    const style = document.createElement("style");
    style.innerHTML = `
      * {
        font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
      }
    `;
    document.head.appendChild(style);

    document.documentElement.style.height = "100%";
    document.body.style.height = "100%";
    document.body.style.margin = "0";
    document.body.style.background = "#F5F6FA";

    const root = document.getElementById("root");
    if (root) {
      root.style.height = "100%";
      root.style.background = "#F5F6FA";
    }

    return cleanup;
  }, []);

  return <ClientApp />;
}
