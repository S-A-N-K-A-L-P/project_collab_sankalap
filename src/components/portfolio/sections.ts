/**
 * Portfolio section catalog (v2). Sections are addable, ordered, content-bearing
 * blocks: { id, type, title, enabled, order, content }. 16 types.
 */

export type SectionType =
  | "hero" | "about" | "skills" | "projects" | "experience" | "education"
  | "certifications" | "links" | "affiliated_orgs" | "timeline" | "testimonials"
  | "gallery" | "stats" | "quote" | "custom" | "contact";

export interface PortfolioSection {
  id: string;
  type: SectionType;
  title: string;
  enabled: boolean;
  order: number;
  content: any;
}

export const SECTION_TYPES: { type: SectionType; label: string; icon: string; desc: string; unique?: boolean }[] = [
  { type: "hero",            label: "Hero",          icon: "✨", desc: "Name, headline, avatar", unique: true },
  { type: "about",           label: "About",         icon: "📝", desc: "A paragraph about you" },
  { type: "skills",          label: "Skills",        icon: "🛠️", desc: "Skill chips + levels" },
  { type: "projects",        label: "Projects",      icon: "📦", desc: "Featured + manual projects" },
  { type: "experience",      label: "Experience",    icon: "💼", desc: "Roles & timeline" },
  { type: "education",        label: "Education",     icon: "🎓", desc: "Schools & degrees" },
  { type: "certifications",  label: "Certifications", icon: "📜", desc: "Certs & credentials" },
  { type: "affiliated_orgs", label: "Organizations", icon: "🏛️", desc: "Affiliated orgs" },
  { type: "links",           label: "Links",         icon: "🔗", desc: "Standalone link list" },
  { type: "timeline",        label: "Timeline",      icon: "🗓️", desc: "Dated milestones" },
  { type: "testimonials",    label: "Testimonials",  icon: "💬", desc: "Quotes from people" },
  { type: "gallery",         label: "Gallery",       icon: "🖼️", desc: "Image grid" },
  { type: "stats",           label: "Stats",         icon: "📊", desc: "Numbers / metrics" },
  { type: "quote",           label: "Quote",         icon: "❝",  desc: "A quote or motto" },
  { type: "custom",          label: "Custom Text",   icon: "✍️", desc: "Any heading + text" },
  { type: "contact",         label: "Contact",       icon: "📬", desc: "Links & socials" },
];

export function defaultContentFor(type: SectionType): any {
  switch (type) {
    case "hero":            return { headline: "", tagline: "" };
    case "about":           return { body: "" };
    case "skills":          return { items: [] as any[] }; // string | { name, level }
    case "projects":        return { ids: [] as string[], manual: [] as any[] };
    case "experience":      return { items: [{ role: "", org: "", start: "", end: "", summary: "" }] };
    case "education":       return { items: [{ school: "", degree: "", start: "", end: "" }] };
    case "certifications":  return { items: [{ name: "", issuer: "", date: "", url: "", image: "" }] };
    case "affiliated_orgs": return { items: [{ name: "", role: "", period: "", url: "", logo: "" }] };
    case "links":           return { items: [{ label: "", url: "", icon: "link" }] };
    case "timeline":        return { items: [{ date: "", title: "", description: "" }] };
    case "testimonials":    return { items: [{ quote: "", person: "", role: "", avatar: "" }] };
    case "gallery":         return { items: [{ url: "", caption: "" }] };
    case "stats":           return { items: [{ label: "", value: "" }] };
    case "quote":           return { text: "", author: "" };
    case "custom":          return { body: "", image: "" };
    case "contact":         return { links: [] as any[] };
    default:                return {};
  }
}

export function defaultTitleFor(type: SectionType): string {
  const map: Record<SectionType, string> = {
    hero: "Hero", about: "About", skills: "Skills", projects: "Featured Projects",
    experience: "Experience", education: "Education", certifications: "Certifications",
    affiliated_orgs: "Organizations", links: "Links", timeline: "Timeline",
    testimonials: "Testimonials", gallery: "Gallery", stats: "Stats", quote: "Quote",
    custom: "Section", contact: "Get in touch",
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

export function defaultSections(): PortfolioSection[] {
  return ["hero", "about", "skills", "projects", "experience", "contact"]
    .map((t, i) => newSection(t as SectionType, i));
}

/* ── Starter templates (one-click section packs) ─────────────────────── */
export const STARTER_TEMPLATES: { id: string; label: string; types: SectionType[] }[] = [
  { id: "developer", label: "Developer", types: ["hero", "about", "skills", "projects", "experience", "certifications", "contact"] },
  { id: "student",   label: "Student",   types: ["hero", "about", "education", "skills", "projects", "certifications", "contact"] },
  { id: "designer",  label: "Designer",  types: ["hero", "about", "gallery", "projects", "testimonials", "links", "contact"] },
  { id: "minimal",   label: "Minimal",   types: ["hero", "about", "contact"] },
];

export function sectionsFromTypes(types: SectionType[]): PortfolioSection[] {
  return types.map((t, i) => newSection(t, i));
}

/* ── Legacy migration ────────────────────────────────────────────────── */
export function normalizeSections(pf: any): PortfolioSection[] {
  const existing: any[] = Array.isArray(pf?.sections) ? pf.sections : [];
  if (existing.length && existing[0]?.type && existing[0]?.content !== undefined) {
    return existing as PortfolioSection[];
  }
  const legacy = existing.length
    ? existing.map((s) => ({ key: s.key, enabled: s.enabled !== false, order: s.order ?? 0 }))
    : ["hero", "about", "skills", "projects", "experience", "contact"].map((k, i) => ({ key: k, enabled: true, order: i }));

  return legacy.map((s, i) => {
    const type = (s.key as SectionType) || "custom";
    const content = defaultContentFor(type);
    if (type === "hero") { content.headline = pf.headline || ""; content.tagline = pf.tagline || ""; }
    if (type === "about") { content.body = pf.aboutLong || ""; }
    if (type === "projects") { content.ids = pf.featuredProjectIds || []; }
    if (type === "experience" && Array.isArray(pf.experience) && pf.experience.length) content.items = pf.experience;
    if (type === "contact") { content.links = pf.links || []; }
    return { id: uid(), type, title: defaultTitleFor(type), enabled: s.enabled, order: s.order ?? i, content };
  });
}

/* ── JSON import sanitizer ───────────────────────────────────────────── */
const VALID_TYPES = new Set(SECTION_TYPES.map((t) => t.type));

export function sanitizeImportedSections(input: any): PortfolioSection[] | null {
  if (!Array.isArray(input)) return null;
  const out: PortfolioSection[] = [];
  input.forEach((s: any, i: number) => {
    if (!s || !VALID_TYPES.has(s.type)) return;
    out.push({
      id: uid(),
      type: s.type,
      title: typeof s.title === "string" && s.title ? s.title : defaultTitleFor(s.type),
      enabled: s.enabled !== false,
      order: i,
      content: { ...defaultContentFor(s.type), ...(s.content && typeof s.content === "object" ? s.content : {}) },
    });
  });
  return out;
}
