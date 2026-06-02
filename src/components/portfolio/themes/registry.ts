/**
 * Portfolio theme registry.
 * Each theme has a LIGHTWEIGHT background (CSS/canvas, no three.js) and a
 * `supports3d` flag. When the user enables "3D heavy render", themes that
 * support it upgrade to a three.js background (loaded dynamically — see
 * PortfolioBackground.tsx). three.js is NEVER imported unless that happens.
 */

export type LightBackgroundKind =
  | "aurora" | "mesh" | "constellation" | "starfield"
  | "tilt3d" | "waves" | "minimal" | "terminal";

export type ThreeSceneKind = "globe" | "particles" | "ribbons" | "none";

export interface PortfolioTheme {
  id: string;
  name: string;
  description: string;
  background: LightBackgroundKind;   // lightweight default
  three: ThreeSceneKind;             // heavy-3D variant ("none" = no 3D for this theme)
  supports3d: boolean;
  palette: {
    bg: string;
    surface: string;
    text: string;
    muted: string;
    accent: string;
    accent2: string;
  };
  card: "glass" | "solid" | "outline";
  font: { heading: string; body: string };
}

export const THEMES: PortfolioTheme[] = [
  {
    id: "aurora", name: "Aurora",
    description: "Drifting northern-lights gradient.",
    background: "aurora", three: "ribbons", supports3d: true,
    palette: { bg: "#0b1020", surface: "rgba(255,255,255,0.06)", text: "#f5f7ff", muted: "#9aa4c4", accent: "#7c5cff", accent2: "#22d3ee" },
    card: "glass", font: { heading: "'Inter', sans-serif", body: "'Inter', sans-serif" },
  },
  {
    id: "mesh", name: "Midnight Mesh",
    description: "Animated mesh-gradient.",
    background: "mesh", three: "none", supports3d: false,
    palette: { bg: "#0a0a12", surface: "rgba(255,255,255,0.05)", text: "#f0eefc", muted: "#9b96b8", accent: "#ec4899", accent2: "#8b5cf6" },
    card: "glass", font: { heading: "'Inter', sans-serif", body: "'Inter', sans-serif" },
  },
  {
    id: "constellation", name: "Constellation",
    description: "Particle network reacting to your cursor.",
    background: "constellation", three: "particles", supports3d: true,
    palette: { bg: "#05070f", surface: "rgba(255,255,255,0.05)", text: "#e6f1ff", muted: "#8aa0c0", accent: "#38bdf8", accent2: "#a78bfa" },
    card: "outline", font: { heading: "'Inter', sans-serif", body: "'Inter', sans-serif" },
  },
  {
    id: "starfield", name: "Starfield Warp",
    description: "Parallax stars warping past.",
    background: "starfield", three: "particles", supports3d: true,
    palette: { bg: "#020208", surface: "rgba(255,255,255,0.06)", text: "#f8fafc", muted: "#94a3b8", accent: "#f59e0b", accent2: "#06b6d4" },
    card: "glass", font: { heading: "'Inter', sans-serif", body: "'Inter', sans-serif" },
  },
  {
    id: "tilt3d", name: "Tilt Deck",
    description: "Perspective cards with mouse parallax.",
    background: "tilt3d", three: "globe", supports3d: true,
    palette: { bg: "#0f1115", surface: "rgba(255,255,255,0.06)", text: "#f4f4f5", muted: "#a1a1aa", accent: "#6366f1", accent2: "#14b8a6" },
    card: "glass", font: { heading: "'Inter', sans-serif", body: "'Inter', sans-serif" },
  },
  {
    id: "waves", name: "Ocean Waves",
    description: "Layered animated SVG waves.",
    background: "waves", three: "none", supports3d: false,
    palette: { bg: "#041625", surface: "rgba(255,255,255,0.06)", text: "#eaf6ff", muted: "#8fb3c9", accent: "#06b6d4", accent2: "#3b82f6" },
    card: "solid", font: { heading: "'Inter', sans-serif", body: "'Inter', sans-serif" },
  },
  {
    id: "minimal", name: "Minimal Light",
    description: "Clean, calm, light — content-first.",
    background: "minimal", three: "none", supports3d: false,
    palette: { bg: "#f7f7f8", surface: "#ffffff", text: "#111827", muted: "#6b7280", accent: "#4f46e5", accent2: "#0ea5e9" },
    card: "outline", font: { heading: "'Inter', sans-serif", body: "'Inter', sans-serif" },
  },
  {
    id: "terminal", name: "Terminal",
    description: "Mono, green-on-black hacker aesthetic.",
    background: "terminal", three: "none", supports3d: false,
    palette: { bg: "#0a0e0a", surface: "rgba(0,255,128,0.04)", text: "#c8ffd0", muted: "#5f9e6f", accent: "#22c55e", accent2: "#84cc16" },
    card: "outline", font: { heading: "'JetBrains Mono', monospace", body: "'JetBrains Mono', monospace" },
  },
];

export const DEFAULT_THEME_ID = "aurora";

export function getTheme(id?: string): PortfolioTheme {
  return THEMES.find((t) => t.id === id) ?? THEMES[0];
}
