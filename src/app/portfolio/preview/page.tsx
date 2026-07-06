"use client";

import { useEffect, useState } from "react";
import PortfolioRenderer, { type PortfolioData } from "@/components/portfolio/PortfolioRenderer";
import { getTheme } from "@/components/portfolio/themes/registry";
import { buildPreviewData } from "@/components/portfolio/previewData";

/**
 * Dedicated live-preview route: renders ONLY the portfolio (no editor chrome),
 * inside its own real viewport so the portfolio's media queries fire correctly.
 *
 * Two modes, auto-detected:
 *  • Embedded in the editor's iframe (window.parent !== window) → renders the
 *    live, possibly-unsaved data the editor pushes via same-origin postMessage.
 *  • Standalone tab, opened by the "desktop" button with noopener (so there's
 *    no window handle to message) → self-fetches the saved draft from
 *    /api/portfolio/me and renders it at full desktop width.
 */
export default function PortfolioPreviewPage() {
  const [data, setData] = useState<PortfolioData | null>(null);

  useEffect(() => {
    const embedded = window.parent !== window;

    if (embedded) {
      const onMsg = (e: MessageEvent) => {
        if (e.origin !== window.location.origin) return;
        if (e.data?.type === "sankalp-preview" && e.data.data) setData(e.data.data);
      };
      window.addEventListener("message", onMsg);
      // Tell the editor we're ready so it pushes the current state immediately.
      window.parent.postMessage({ type: "sankalp-preview-ready" }, window.location.origin);
      return () => window.removeEventListener("message", onMsg);
    }

    // Standalone tab: render the saved draft.
    let alive = true;
    fetch("/api/portfolio/me")
      .then((r) => r.json())
      .then((d) => {
        if (alive) setData(buildPreviewData(d.portfolio, d.user, d.availableProjects || []));
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  const theme = getTheme(data?.themeId);

  // Paint the document root so the scrollbar gutter (which sits outside the
  // fixed background) matches the theme instead of showing the iframe's white.
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
          Loading preview…
        </div>
      )}
    </main>
  );
}
