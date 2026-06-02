/**
 * Portfolio theme registry — 40+ presets.
 * Each theme pairs a LIGHTWEIGHT 2D background (CSS/canvas, no three.js) with an
 * optional three.js scene. three.js is loaded ONLY when the user enables 3D
 * (see PortfolioBackground.tsx) — it is never imported on the light path.
 *
 * Users can further customize: override the 2D effect, the 3D scene, the accent
 * colors and the card style (stored on the Portfolio doc).
 */

export type LightBackgroundKind =
  | "aurora" | "mesh" | "gradient" | "conic" | "nebula"
  | "constellation" | "network" | "starfield" | "snow" | "rain"
  | "bubbles" | "fireflies" | "dots" | "ripple"
  | "grid" | "tilt3d" | "waves" | "spotlight" | "orbs" | "noise"
  | "terminal" | "minimal";

export type ThreeSceneKind =
  | "none" | "particles" | "globe" | "ribbons" | "crystals"
  | "torusfield" | "waves3d" | "helix" | "boxes" | "rings" | "grid3d";

export type ThemeCategory =
  | "Gradient" | "Particles" | "3D" | "Nature" | "Retro" | "Abstract" | "Minimal" | "Dark";

export type CardStyle = "glass" | "solid" | "outline";

export interface Palette {
  bg: string; surface: string; text: string; muted: string; accent: string; accent2: string;
}
export interface PortfolioTheme {
  id: string;
  name: string;
  category: ThemeCategory;
  background: LightBackgroundKind;
  three: ThreeSceneKind;
  supports3d: boolean;
  palette: Palette;
  card: CardStyle;
  font: { heading: string; body: string };
}

const SANS = { heading: "'Inter', sans-serif", body: "'Inter', sans-serif" };
const MONO = { heading: "'JetBrains Mono', monospace", body: "'JetBrains Mono', monospace" };
const SERIF = { heading: "'Georgia', serif", body: "'Inter', sans-serif" };

// pal(bg, accent, accent2, text, muted, surface)
function pal(bg: string, accent: string, accent2: string,
  text = "#f5f7ff", muted = "#9aa4c4", surface = "rgba(255,255,255,0.06)"): Palette {
  return { bg, surface, text, muted, accent, accent2 };
}
const LIGHT_TEXT = { text: "#111827", muted: "#6b7280", surface: "#ffffff" };
function lpal(bg: string, accent: string, accent2: string): Palette {
  return { bg, surface: LIGHT_TEXT.surface, text: LIGHT_TEXT.text, muted: LIGHT_TEXT.muted, accent, accent2 };
}

function mk(
  id: string, name: string, category: ThemeCategory,
  background: LightBackgroundKind, three: ThreeSceneKind, palette: Palette,
  card: CardStyle = "glass", font = SANS
): PortfolioTheme {
  return { id, name, category, background, three, supports3d: three !== "none", palette, card, font };
}

export const THEMES: PortfolioTheme[] = [
  // ── Gradient ───────────────────────────────────────────────
  mk("aurora", "Aurora", "Gradient", "aurora", "ribbons", pal("#0b1020", "#7c5cff", "#22d3ee")),
  mk("mesh", "Midnight Mesh", "Gradient", "mesh", "none", pal("#0a0a12", "#ec4899", "#8b5cf6")),
  mk("sunset", "Sunset", "Gradient", "gradient", "ribbons", pal("#1a0b14", "#fb7185", "#f59e0b")),
  mk("oceanic", "Oceanic", "Gradient", "gradient", "waves3d", pal("#041625", "#06b6d4", "#3b82f6")),
  mk("conic", "Prism", "Gradient", "conic", "rings", pal("#0a0612", "#a855f7", "#22d3ee")),
  mk("nebula", "Nebula", "Gradient", "nebula", "particles", pal("#070313", "#c026d3", "#6366f1")),
  mk("magma", "Magma", "Gradient", "gradient", "crystals", pal("#160606", "#f97316", "#ef4444")),
  mk("emerald", "Emerald Haze", "Gradient", "aurora", "globe", pal("#031a12", "#10b981", "#34d399")),

  // ── Particles ──────────────────────────────────────────────
  mk("constellation", "Constellation", "Particles", "constellation", "particles", pal("#05070f", "#38bdf8", "#a78bfa"), "outline"),
  mk("network", "Network", "Particles", "network", "particles", pal("#070b14", "#6366f1", "#22d3ee"), "outline"),
  mk("starfield", "Starfield Warp", "Particles", "starfield", "particles", pal("#020208", "#f59e0b", "#06b6d4")),
  mk("fireflies", "Fireflies", "Nature", "fireflies", "particles", pal("#06100a", "#a3e635", "#facc15")),
  mk("snowfall", "Snowfall", "Nature", "snow", "none", pal("#0a1018", "#e2e8f0", "#93c5fd")),
  mk("matrixrain", "Matrix Rain", "Retro", "rain", "none", pal("#030803", "#22c55e", "#16a34a"), "outline", MONO),
  mk("bubbles", "Bubbles", "Nature", "bubbles", "none", pal("#04121a", "#22d3ee", "#38bdf8")),
  mk("dotgrid", "Dot Grid", "Abstract", "dots", "grid3d", pal("#0b0d12", "#818cf8", "#22d3ee"), "outline"),
  mk("ripple", "Ripple", "Abstract", "ripple", "rings", pal("#06090f", "#0ea5e9", "#8b5cf6")),

  // ── 3D-forward (still light by default; 3D on toggle) ──────
  mk("globe", "Globe", "3D", "minimal", "globe", pal("#070a12", "#6366f1", "#14b8a6")),
  mk("crystals", "Crystals", "3D", "minimal", "crystals", pal("#0a0712", "#a855f7", "#22d3ee")),
  mk("torus", "Torus Field", "3D", "minimal", "torusfield", pal("#0b0b10", "#f43f5e", "#8b5cf6")),
  mk("helix", "Helix", "3D", "minimal", "helix", pal("#050810", "#22d3ee", "#6366f1")),
  mk("cubes", "Floating Cubes", "3D", "minimal", "boxes", pal("#0c0c0f", "#f59e0b", "#6366f1")),
  mk("rings3d", "Orbital Rings", "3D", "minimal", "rings", pal("#06080f", "#06b6d4", "#a78bfa")),
  mk("wavefield", "Wave Field", "3D", "minimal", "waves3d", pal("#04101a", "#06b6d4", "#3b82f6")),
  mk("grid3d", "Grid 3D", "3D", "grid", "grid3d", pal("#080a10", "#818cf8", "#22d3ee"), "outline"),

  // ── Retro / synthwave ──────────────────────────────────────
  mk("synthwave", "Synthwave", "Retro", "grid", "grid3d", pal("#160829", "#ff2d95", "#00e0ff")),
  mk("vaporwave", "Vaporwave", "Retro", "gradient", "boxes", pal("#1a0b2e", "#ff6ad5", "#26d9ff")),
  mk("terminal", "Terminal", "Retro", "terminal", "none", pal("#0a0e0a", "#22c55e", "#84cc16"), "outline", MONO),
  mk("amber", "Amber CRT", "Retro", "terminal", "none", pal("#120a02", "#f59e0b", "#fbbf24"), "outline", MONO),
  mk("outrun", "Outrun", "Retro", "grid", "rings", pal("#0d0524", "#fb37ff", "#ffae00")),

  // ── Abstract ───────────────────────────────────────────────
  mk("spotlight", "Spotlight", "Abstract", "spotlight", "none", pal("#08080c", "#6366f1", "#ec4899")),
  mk("orbs", "Floating Orbs", "Abstract", "orbs", "particles", pal("#0a0814", "#8b5cf6", "#22d3ee")),
  mk("noise", "Plasma", "Abstract", "noise", "crystals", pal("#0c0710", "#d946ef", "#06b6d4")),
  mk("tiltdeck", "Tilt Deck", "Abstract", "tilt3d", "globe", pal("#0f1115", "#6366f1", "#14b8a6")),
  mk("waves", "Ocean Waves", "Nature", "waves", "waves3d", pal("#041625", "#06b6d4", "#3b82f6"), "solid"),

  // ── Dark / mono ────────────────────────────────────────────
  mk("obsidian", "Obsidian", "Dark", "minimal", "particles", pal("#0a0a0a", "#e5e7eb", "#9ca3af"), "outline"),
  mk("carbon", "Carbon", "Dark", "dots", "none", pal("#0d0d0f", "#a1a1aa", "#71717a"), "outline", MONO),
  mk("ink", "Ink", "Dark", "noise", "none", pal("#08080a", "#f4f4f5", "#52525b"), "solid", SERIF),
  mk("midnight", "Midnight", "Dark", "constellation", "globe", pal("#020617", "#60a5fa", "#a78bfa")),

  // ── Minimal / light ────────────────────────────────────────
  mk("minimal", "Minimal Light", "Minimal", "minimal", "none", lpal("#f7f7f8", "#4f46e5", "#0ea5e9"), "outline"),
  mk("paper", "Paper", "Minimal", "minimal", "none", lpal("#fbfbf9", "#111827", "#6b7280"), "outline", SERIF),
  mk("frost", "Frost", "Minimal", "mesh", "none", lpal("#eef2f7", "#2563eb", "#06b6d4"), "outline"),
  mk("sand", "Sand", "Minimal", "gradient", "none", lpal("#f6f1e7", "#b45309", "#0d9488"), "outline"),
  mk("mint", "Mint", "Minimal", "spotlight", "none", lpal("#f0fdf6", "#059669", "#0ea5e9"), "outline"),
  mk("rose", "Rose", "Minimal", "aurora", "none", lpal("#fdf2f6", "#e11d48", "#7c3aed"), "outline"),
];

export const DEFAULT_THEME_ID = "aurora";

export const ALL_BACKGROUNDS: LightBackgroundKind[] = [
  "aurora", "mesh", "gradient", "conic", "nebula",
  "constellation", "network", "starfield", "snow", "rain",
  "bubbles", "fireflies", "dots", "ripple",
  "grid", "tilt3d", "waves", "spotlight", "orbs", "noise",
  "terminal", "minimal",
];

export const ALL_THREE_SCENES: ThreeSceneKind[] = [
  "particles", "globe", "ribbons", "crystals", "torusfield",
  "waves3d", "helix", "boxes", "rings", "grid3d",
];

export const THEME_CATEGORIES: ThemeCategory[] =
  ["Gradient", "Particles", "3D", "Nature", "Retro", "Abstract", "Dark", "Minimal"];

export function getTheme(id?: string): PortfolioTheme {
  return THEMES.find((t) => t.id === id) ?? THEMES[0];
}
