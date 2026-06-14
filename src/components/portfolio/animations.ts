/**
 * Portfolio motion + customization helpers.
 * - SECTION_ANIMS: entrance animation presets applied per section.
 * - CARD_STYLES / CARD_ANIMS: project-card looks + motion.
 * - resolveTokens: replaces {{db tokens}} in user text with real profile data.
 */

import type { Variants } from "framer-motion";

/* ── Section entrance animations ──────────────────────────────────────── */
export type SectionAnimKind = "rise" | "fade" | "slideLeft" | "zoom" | "blur" | "rotateIn" | "flipUp" | "bounce";

export const SECTION_ANIMS: Record<SectionAnimKind, { label: string; variants: Variants }> = {
  rise:      { label: "Rise up",    variants: { hidden: { opacity: 0, y: 28 }, show: { opacity: 1, y: 0 } } },
  fade:      { label: "Fade in",    variants: { hidden: { opacity: 0 },          show: { opacity: 1 } } },
  slideLeft: { label: "Slide in",   variants: { hidden: { opacity: 0, x: -40 }, show: { opacity: 1, x: 0 } } },
  zoom:      { label: "Zoom in",    variants: { hidden: { opacity: 0, scale: 0.9 }, show: { opacity: 1, scale: 1 } } },
  blur:      { label: "Blur in",    variants: { hidden: { opacity: 0, filter: "blur(10px)" }, show: { opacity: 1, filter: "blur(0px)" } } },
  rotateIn:  { label: "Rotate in",  variants: { hidden: { opacity: 0, rotate: -4, y: 24 }, show: { opacity: 1, rotate: 0, y: 0 } } },
  flipUp:    { label: "Flip up",    variants: { hidden: { opacity: 0, rotateX: 40, y: 20 }, show: { opacity: 1, rotateX: 0, y: 0 } } },
  bounce:    { label: "Bounce in",  variants: { hidden: { opacity: 0, y: 40 }, show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 14 } } } },
};
export const SECTION_ANIM_KINDS = Object.keys(SECTION_ANIMS) as SectionAnimKind[];

/* ── Project card styles ──────────────────────────────────────────────── */
export type CardStyleKind =
  | "glass" | "tilt3d" | "neon" | "polaroid" | "terminal" | "gradientBorder" | "spotlight" | "flip";

export const CARD_STYLES: { id: CardStyleKind; label: string; is3d?: boolean }[] = [
  { id: "glass",          label: "Glass" },
  { id: "gradientBorder", label: "Gradient Border" },
  { id: "neon",           label: "Neon Glow" },
  { id: "spotlight",      label: "Spotlight" },
  { id: "polaroid",       label: "Polaroid" },
  { id: "terminal",       label: "Terminal" },
  { id: "tilt3d",         label: "3D Tilt", is3d: true },
  { id: "flip",           label: "3D Flip", is3d: true },
];

/* ── Project card entrance animations ─────────────────────────────────── */
export type CardAnimKind = "rise" | "fade" | "zoom" | "flipIn" | "tiltIn";

export const CARD_ANIMS: Record<CardAnimKind, { label: string; variants: Variants }> = {
  rise:   { label: "Rise",     variants: { hidden: { opacity: 0, y: 24 },                 show: { opacity: 1, y: 0 } } },
  fade:   { label: "Fade",     variants: { hidden: { opacity: 0 },                         show: { opacity: 1 } } },
  zoom:   { label: "Zoom",     variants: { hidden: { opacity: 0, scale: 0.85 },            show: { opacity: 1, scale: 1 } } },
  flipIn: { label: "Flip in",  variants: { hidden: { opacity: 0, rotateY: 60 },            show: { opacity: 1, rotateY: 0 } } },
  tiltIn: { label: "Tilt in",  variants: { hidden: { opacity: 0, rotate: -6, y: 20 },      show: { opacity: 1, rotate: 0, y: 0 } } },
};
export const CARD_ANIM_KINDS = Object.keys(CARD_ANIMS) as CardAnimKind[];

/* ── DB token resolution ──────────────────────────────────────────────── */
export interface TokenSource {
  name?: string; bio?: string; location?: string; github?: string;
  handle?: string; headline?: string; tagline?: string;
  skills?: string[]; projectCount?: number;
}

export const AVAILABLE_TOKENS = [
  { token: "{{name}}",         desc: "Your display name" },
  { token: "{{headline}}",     desc: "Your headline" },
  { token: "{{tagline}}",      desc: "Your tagline" },
  { token: "{{bio}}",          desc: "Profile bio" },
  { token: "{{location}}",     desc: "Location" },
  { token: "{{github}}",       desc: "GitHub username" },
  { token: "{{handle}}",       desc: "Portfolio handle" },
  { token: "{{skills}}",       desc: "Skills, comma-separated" },
  { token: "{{skillCount}}",   desc: "Number of skills" },
  { token: "{{projectCount}}", desc: "Number of projects" },
];

export function resolveTokens(text: string | undefined, src: TokenSource): string {
  if (!text) return "";
  const map: Record<string, string> = {
    name: src.name || "",
    headline: src.headline || "",
    tagline: src.tagline || "",
    bio: src.bio || "",
    location: src.location || "",
    github: src.github || "",
    handle: src.handle || "",
    skills: (src.skills || []).join(", "),
    skillcount: String((src.skills || []).length),
    projectcount: String(src.projectCount ?? 0),
  };
  return text.replace(/\{\{\s*([a-zA-Z]+)\s*\}\}/g, (_m, k) => {
    const key = String(k).toLowerCase();
    return key in map ? map[key] : `{{${k}}}`;
  });
}
