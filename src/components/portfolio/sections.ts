/**
 * Portfolio section catalog. Sections are now addable, ordered, content-bearing
 * blocks. Each section: { id, type, title, enabled, order, content }.
 * Content is type-specific (see DEFAULT_CONTENT). The renderer renders each
 * section by type from its own content (profile data is used as a fallback for
 * hero/skills/projects/contact when content is empty).
 */

export type SectionType =
  | "hero" | "about" | "skills" | "projects" | "experience"
  | "education" | "custom" | "gallery" | "stats" | "quote" | "contact";

export interface PortfolioSection {
  id: string;
  type: SectionType;
  title: string;
  enabled: boolean;
  order: number;
  content: any;
}

export const SECTION_TYPES: { type: SectionType; label: string; icon: string; desc: string; unique?: boolean }[] = [
  { type: "hero",       label: "Hero",        icon: "✨", desc: "Name, headline, avatar", unique: true },
  { type: "about",      label: "About",       icon: "📝", desc: "A paragraph about you" },
  { type: "skills",     label: "Skills",      icon: "🛠️", desc: "Skill chips" },
  { type: "projects",   label: "Projects",    icon: "📦", desc: "Featured projects" },
  { type: "experience", label: "Experience",  icon: "💼", desc: "Roles & timeline" },
  { type: "education",  label: "Education",    icon: "🎓", desc: "Schools & degrees" },
  { type: "custom",     label: "Custom Text", icon: "✍️", desc: "Any heading + text" },
  { type: "gallery",    label: "Gallery",     icon: "🖼️", desc: "Image grid" },
  { type: "stats",      label: "Stats",       icon: "📊", desc: "Numbers / metrics" },
  { type: "quote",      label: "Quote",       icon: "❝",  desc: "A quote or motto" },
  { type: "contact",    label: "Contact",     icon: "📬", desc: "Links & socials" },
];

export function defaultContentFor(type: SectionType): any {
  switch (type) {
    case "hero":       return { headline: "", tagline: "" };
    case "about":      return { body: "" };
    case "skills":     return { items: [] as string[] };
    case "projects":   return { ids: [] as string[] };
    case "experience": return { items: [{ role: "", org: "", start: "", end: "", summary: "" }] };
    case "education":  return { items: [{ school: "", degree: "", start: "", end: "" }] };
    case "custom":     return { body: "" };
    case "gallery":    return { items: [{ url: "", caption: "" }] };
    case "stats":      return { items: [{ label: "", value: "" }] };
    case "quote":      return { text: "", author: "" };
    case "contact":    return { links: [] as { label: string; url: string; icon: string }[] };
    default:           return {};
  }
}

export function defaultTitleFor(type: SectionType): string {
  const map: Record<SectionType, string> = {
    hero: "Hero", about: "About", skills: "Skills", projects: "Featured Projects",
    experience: "Experience", education: "Education", custom: "Section",
    gallery: "Gallery", stats: "Stats", quote: "Quote", contact: "Get in touch",
  };
  return map[type];
}

export function uid(): string {
  try { if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID(); } catch {}
  return `s_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
}

export function newSection(type: SectionType, order: number): PortfolioSection {
  return { id: uid(), type, title: defaultTitleFor(type), enabled: true, order, content: defaultContentFor(type) };
}

/** Default starter layout for a brand-new portfolio. */
export function defaultSections(): PortfolioSection[] {
  return [
    "hero", "about", "skills", "projects", "experience", "contact",
  ].map((t, i) => newSection(t as SectionType, i));
}

/**
 * Migrate a portfolio's sections to the new content-bearing shape.
 * Old shape was { key, enabled, order } with content living in top-level fields.
 */
export function normalizeSections(pf: any): PortfolioSection[] {
  const existing: any[] = Array.isArray(pf?.sections) ? pf.sections : [];
  // Already new shape?
  if (existing.length && existing[0]?.type && existing[0]?.content !== undefined) {
    return existing as PortfolioSection[];
  }

  // Build from legacy { key } sections (or defaults), pulling content from top-level fields.
  const legacyKeys = existing.length ? existing.map((s) => ({ key: s.key, enabled: s.enabled !== false, order: s.order ?? 0 }))
    : ["hero", "about", "skills", "projects", "experience", "contact"].map((k, i) => ({ key: k, enabled: true, order: i }));

  return legacyKeys.map((s, i) => {
    const type = (s.key as SectionType) || "custom";
    const content = defaultContentFor(type);
    if (type === "hero") { content.headline = pf.headline || ""; content.tagline = pf.tagline || ""; }
    if (type === "about") { content.body = pf.aboutLong || ""; }
    if (type === "projects") { content.ids = pf.featuredProjectIds || []; }
    if (type === "experience" && Array.isArray(pf.experience) && pf.experience.length) { content.items = pf.experience; }
    if (type === "contact") { content.links = pf.links || []; }
    return { id: uid(), type, title: defaultTitleFor(type), enabled: s.enabled, order: s.order ?? i, content };
  });
}
