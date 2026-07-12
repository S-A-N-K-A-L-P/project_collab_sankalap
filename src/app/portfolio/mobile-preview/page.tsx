"use client";

import { useEffect, useState } from "react";
import PortfolioRenderer, { type PortfolioData } from "@/components/portfolio/PortfolioRenderer";
import { getTheme } from "@/components/portfolio/themes/registry";

/**
 * Dedicated live-preview route for Flutter WebView.
 * Instead of relying on cross-window postMessage (which requires an iframe),
 * this exposes a global `window.receivePortfolioUpdate` function that
 * Flutter's WebView can invoke via `runJavaScript`.
 */
export default function MobilePreviewPage() {
  const [data, setData] = useState<PortfolioData | null>(null);

  useEffect(() => {
    // 1. Expose function to Flutter
    (window as any).receivePortfolioUpdate = (jsonString: string) => {
      try {
        const parsed = JSON.parse(jsonString);
        setData(parsed);
      } catch (err) {
        console.error("Flutter sent invalid JSON to MobilePreviewPage", err);
      }
    };

    // 2. Notify Flutter that React is mounted and ready to receive the initial state
    if ((window as any).FlutterBridge) {
      (window as any).FlutterBridge.postMessage("READY");
    } else {
      // Fallback: If Flutter hasn't injected the bridge yet, we can't do much.
      // But Flutter will likely call receivePortfolioUpdate when its page finishes loading anyway.
      console.log("Mobile preview ready. Waiting for Flutter to send data...");
    }

    return () => {
      delete (window as any).receivePortfolioUpdate;
    };
  }, []);

  const theme = getTheme(data?.themeId);

  // Match the scrollbar gutter background to the theme
  useEffect(() => {
    const bg = theme.palette.bg;
    document.documentElement.style.background = bg;
    document.body.style.background = bg;
  }, [theme.palette.bg]);

  return (
    <main style={{ minHeight: "100vh", background: theme.palette.bg }}>
      {data ? (
        <PortfolioRenderer data={data} />
      ) : (
        <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", color: theme.palette.muted, fontSize: 14 }}>
          Loading mobile preview…
        </div>
      )}
    </main>
  );
}
