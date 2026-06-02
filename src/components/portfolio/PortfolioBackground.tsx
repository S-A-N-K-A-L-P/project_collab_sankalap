"use client";

/**
 * The 3D split point.
 *
 *   heavy3d === false  →  <LightBackground/>   (CSS/canvas, in main bundle)
 *   heavy3d === true   →  <ThreeBackground/>   (three.js, SEPARATE async chunk)
 *
 * `dynamic(() => import("./backgrounds/three/ThreeBackground"), { ssr:false })`
 * does NOT execute the import factory until <Heavy3D/> is actually rendered.
 * We only render it when `heavy3d` is true. Therefore, when 3D is off the
 * three.js chunk is never fetched — three.js does not load anywhere near the
 * running page. The light path has no static reference to three either.
 */

import dynamic from "next/dynamic";
import LightBackground from "./backgrounds/LightBackground";
import { type PortfolioTheme } from "./themes/registry";

// Defined at module scope (NOT inside render, to avoid remounts), but the
// import factory is lazy — only invoked when <Heavy3D/> first renders.
const Heavy3D = dynamic(() => import("./backgrounds/three/ThreeBackground"), {
  ssr: false,
  loading: () => null, // light bg already painted underneath while three loads
});

export default function PortfolioBackground({
  theme,
  heavy3d,
}: {
  theme: PortfolioTheme;
  heavy3d: boolean;
}) {
  const useThree = heavy3d && theme.supports3d && theme.three !== "none";

  return (
    <div
      aria-hidden
      className="fixed inset-0 -z-10 pointer-events-none"
      style={{ background: theme.palette.bg }}
    >
      {/* Lightweight layer always renders (also the fallback under 3D while it loads) */}
      <LightBackground kind={theme.background} theme={theme} />

      {/* Heavy 3D layer — three.js chunk loads ONLY when this mounts */}
      {useThree && <Heavy3D scene={theme.three} theme={theme} />}
    </div>
  );
}
