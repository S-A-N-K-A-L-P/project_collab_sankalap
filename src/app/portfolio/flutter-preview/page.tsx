"use client";

import { useEffect, useState } from "react";
import PortfolioRenderer, { type PortfolioData } from "@/components/portfolio/PortfolioRenderer";
import { getTheme } from "@/components/portfolio/themes/registry";
import { buildPreviewData } from "@/components/portfolio/previewData";
import { useSearchParams } from "next/navigation";

/**
 * Dedicated Client Component preview route for Flutter WebView.
 * Replicates the desktop standalone preview behavior.
 * Flutter opens this page and passes the Bearer token in the query params.
 * This page fetches /api/mobile/portfolio, builds the data, and renders it.
 * It exposes JS bridge functions for real-time delta updates.
 */
import { Suspense } from "react";

function FlutterPreviewContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [data, setData] = useState<PortfolioData | null>(null);
  const [localOverrides, setLocalOverrides] = useState<any>({});

  // 1. Fetch the data once the token is available
  useEffect(() => {
    if (!token) return;

    let alive = true;
    fetch("/api/mobile/portfolio", {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((r) => r.json())
      .then((d) => {
        if (alive && d.portfolio) {
          const previewData = buildPreviewData(d.portfolio, d.user, d.availableProjects || []);
          if (previewData) {
            previewData.heavy3d = false; // Disable heavy 3D for mobile WebViews
            setData(previewData);
          }
        }
      })
      .catch((e) => console.error("Failed to fetch mobile portfolio", e));

    return () => { alive = false; };
  }, [token]);

  // 2. Set up the JS Bridge hooks for real-time delta updates
  useEffect(() => {
    (window as any).updateTheme = (themeId: string) => {
      setLocalOverrides((prev: any) => ({ ...prev, themeId }));
    };
    (window as any).updateAccent = (accent: string) => {
      setLocalOverrides((prev: any) => ({ ...prev, accent }));
    };
    (window as any).updateAccent2 = (accent2: string) => {
      setLocalOverrides((prev: any) => ({ ...prev, accent2 }));
    };
    (window as any).updateBackground = (bg: string) => {
      setLocalOverrides((prev: any) => ({ ...prev, bgOverride: bg }));
    };
    (window as any).updateCardStyle = (card: string) => {
      setLocalOverrides((prev: any) => ({ ...prev, card }));
    };
    (window as any).updateSectionAnim = (anim: string) => {
      setLocalOverrides((prev: any) => ({ ...prev, sectionAnim: anim }));
    };
    (window as any).updateProjectCardAnim = (anim: string) => {
      setLocalOverrides((prev: any) => ({ ...prev, projectCardAnim: anim }));
    };
    (window as any).updateSections = (json: string) => {
      try {
        const sections = JSON.parse(json);
        setLocalOverrides((prev: any) => ({ ...prev, sections }));
      } catch (e) {
        console.error("Invalid sections json", e);
      }
    };

    if ((window as any).FlutterBridge) {
      (window as any).FlutterBridge.postMessage("READY");
    }
  }, []);

  // 3. Apply mobile-specific body styles (safe areas, overscroll bounce)
  const theme = getTheme(localOverrides.themeId || data?.themeId);
  useEffect(() => {
    const bg = theme.palette.bg;
    document.documentElement.style.background = bg;
    document.body.style.background = bg;
    
    document.body.style.paddingTop = "env(safe-area-inset-top)";
    document.body.style.paddingBottom = "env(safe-area-inset-bottom)";
    document.body.style.paddingLeft = "env(safe-area-inset-left)";
    document.body.style.paddingRight = "env(safe-area-inset-right)";
    
    document.documentElement.style.overscrollBehaviorY = "none";
  }, [theme.palette.bg]);

  if (!data) {
    return (
      <main style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: theme.palette.bg, color: theme.palette.muted, fontSize: 14 }}>
        {!token ? "Missing authentication token" : "Loading mobile preview…"}
      </main>
    );
  }

  // Merge server data with real-time JS bridge deltas
  const mergedData = {
    ...data,
    ...localOverrides,
    heavy3d: false, // Ensure it stays false
    bgOverride: data.heavy3d ? "constellation" : (localOverrides.bgOverride || data.bgOverride),
  };

  return (
    <main style={{ width: "100%", minHeight: "100vh", overflowX: "hidden" }}>
      <PortfolioRenderer data={mergedData} />
    </main>
  );
}

export default function FlutterPreviewPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>Loading...</div>}>
      <FlutterPreviewContent />
    </Suspense>
  );
}
