"use client";

import React, { useEffect, useState } from "react";
import PortfolioRenderer from "@/components/portfolio/PortfolioRenderer";

export default function MobilePortfolioShell({ initialData }: { initialData: any }) {
  const [localOverrides, setLocalOverrides] = useState<any>({});

  // Merge server data with real-time JS bridge deltas
  const data = {
    ...initialData,
    ...localOverrides,
    // Mobile optimizations
    heavy3d: false, // Force 2D on mobile to prevent crashes
    threeOverride: initialData.heavy3d ? "" : initialData.threeOverride,
    bgOverride: initialData.heavy3d ? "constellation" : (localOverrides.bgOverride || initialData.bgOverride),
  };

  useEffect(() => {
    // Expose delta-update functions to Flutter
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

    // Signal Flutter that bridge is ready
    if ((window as any).FlutterBridge) {
      (window as any).FlutterBridge.postMessage("READY");
    }
  }, []);

  useEffect(() => {
    // Add mobile-specific CSS overrides
    document.body.style.paddingTop = "env(safe-area-inset-top)";
    document.body.style.paddingBottom = "env(safe-area-inset-bottom)";
    document.body.style.paddingLeft = "env(safe-area-inset-left)";
    document.body.style.paddingRight = "env(safe-area-inset-right)";
    
    // Disable overscroll bounce
    document.documentElement.style.overscrollBehaviorY = "none";
  }, []);

  return (
    <div style={{ width: "100%", minHeight: "100vh", overflowX: "hidden" }}>
      <PortfolioRenderer data={data} />
    </div>
  );
}
