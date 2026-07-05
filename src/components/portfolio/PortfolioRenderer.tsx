"use client";

import { motion, type Variants } from "framer-motion";
import { Github, Linkedin, Twitter, Mail, Globe, Link as LinkIcon, MapPin, Briefcase, GraduationCap, Quote as QuoteIcon, ChevronDown, Award, Building2 } from "lucide-react";
import PortfolioBackground from "./PortfolioBackground";
import ProjectCard from "./ProjectCard";
import { getTheme, type LightBackgroundKind, type ThreeSceneKind, type CardStyle } from "./themes/registry";
import { SECTION_ANIMS, type SectionAnimKind, type CardStyleKind, type CardAnimKind, resolveTokens } from "./animations";
import { normalizeSections, type PortfolioSection } from "./sections";
import { logoFor } from "./techLogos";
import { sanitizeUrl, sanitizeImageSrc } from "@/lib/sanitize-url";

export interface PortfolioData {
  handle?: string;
  isPublished?: boolean;
  heavy3d?: boolean;
  themeId?: string;
  accent?: string; accent2?: string;
  bgOverride?: string; threeOverride?: string; card?: string;
  sectionAnim?: string; projectCardStyle?: string; projectCardAnim?: string;
  headline?: string; tagline?: string; aboutLong?: string;
  sections?: any[];
  experience?: { role: string; org: string; start: string; end: string; summary: string }[];
  links?: { label: string; url: string; icon: string }[];
  seo?: { title?: string; description?: string };
  user?: { name?: string; avatar?: string; bio?: string; location?: string; skills?: string[]; github?: string; techStackPreference?: string };
  projects?: { _id: string; title: string; description?: string; coverImage?: string; liveUrl?: string; githubRepo?: string; techStack?: string[]; version?: string }[];
}

const ICONS: Record<string, any> = { github: Github, linkedin: Linkedin, twitter: Twitter, mail: Mail, globe: Globe, link: LinkIcon };

export default function PortfolioRenderer({ data, contained = false }: { data: PortfolioData; contained?: boolean }) {
  const base = getTheme(data.themeId);
  const theme = {
    ...base,
    background: (data.bgOverride || base.background) as LightBackgroundKind,
    three: (data.threeOverride || base.three) as ThreeSceneKind,
    supports3d: base.supports3d || !!(data.threeOverride && data.threeOverride !== "none"),
    card: ((data.card || base.card) as CardStyle),
    palette: { ...base.palette, accent: data.accent || base.palette.accent, accent2: data.accent2 || base.palette.accent2 },
  };
  const p = theme.palette;
  const accent = p.accent;
  const user = data.user || {};
  const projects = data.projects || [];

  const tokenSrc = { name: user.name, bio: user.bio, location: user.location, github: user.github, handle: data.handle, headline: data.headline, tagline: data.tagline, skills: user.skills || [], projectCount: projects.length };
  const tk = (s?: string) => resolveTokens(s, tokenSrc);

  const animKind = (data.sectionAnim as SectionAnimKind) in SECTION_ANIMS ? (data.sectionAnim as SectionAnimKind) : "rise";
  const variants: Variants = SECTION_ANIMS[animKind].variants;
  const cardStyle = (data.projectCardStyle as CardStyleKind) || "glass";
  const cardAnim = (data.projectCardAnim as CardAnimKind) || "rise";

  const surfaceCard: React.CSSProperties = {
    background: p.surface,
    border: "1px solid " + (theme.card === "outline" ? accent + "33" : "rgba(255,255,255,0.10)"),
    backdropFilter: theme.card === "glass" ? "blur(12px)" : undefined,
  };
  const initials = (user.name || "?").split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();

  // Empty section: show a dashed placeholder ONLY in the builder preview
  // (contained); on the public page an empty section renders nothing.
  const empty = (sec: PortfolioSection, hint: string) => {
    if (!contained) return null;
    return (
      <Wrap key={sec.id} title={sec.title} accent={accent} variants={variants}>
        <div style={{ border: `1.5px dashed ${p.muted}55`, borderRadius: 12, padding: 20, textAlign: "center", color: p.muted, fontSize: 13 }}>
          {hint} — this section is empty (hidden on the live page).
        </div>
      </Wrap>
    );
  };

  // Sections (normalize legacy → new shape so old data still renders)
  const sections: PortfolioSection[] = normalizeSections(data)
    .filter((s) => s.enabled)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  const renderSection = (sec: PortfolioSection) => {
    const c = sec.content || {};
    switch (sec.type) {
      case "hero": {
        const headline = tk(c.headline || data.headline) || user.bio || "Builder on S.A.N.K.A.L.P.";
        const tagline = tk(c.tagline || data.tagline);
        return (
          <section key={sec.id} style={{ position: "relative", minHeight: "70vh", display: "flex", flexDirection: "column", justifyContent: "center", paddingTop: 72, paddingBottom: 36 }}>
            <motion.div initial="hidden" animate="show" variants={variants} transition={{ duration: 0.6 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 18, flexWrap: "wrap" }}>
                <div style={{ width: 84, height: 84, borderRadius: 20, overflow: "hidden", border: `2px solid ${accent}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, fontWeight: 800, color: accent, background: p.surface, flexShrink: 0 }}>
                  {user.avatar ? <img src={sanitizeImageSrc(user.avatar)} alt={user.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : initials}
                </div>
                <div>
                  {tagline && <p style={{ color: accent, fontWeight: 600, fontSize: 14, letterSpacing: 1, textTransform: "uppercase" }}>{tagline}</p>}
                  <h1 style={{ fontSize: 52, fontWeight: 800, lineHeight: 1.05, fontFamily: theme.font.heading, margin: "4px 0", color: p.text }}>{user.name || "Your Name"}</h1>
                  <p style={{ fontSize: 20, color: p.muted, maxWidth: 620 }}>{headline}</p>
                  {user.location && <p style={{ display: "inline-flex", alignItems: "center", gap: 6, color: p.muted, fontSize: 14, marginTop: 10 }}><MapPin size={14} /> {user.location}</p>}
                </div>
              </div>
            </motion.div>
            {/* animated scroll cue */}
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}
              style={{ position: "absolute", left: "50%", bottom: 24, transform: "translateX(-50%)", color: p.muted }}>
              <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 1.6, repeat: Infinity }}>
                <ChevronDown size={22} style={{ color: accent }} />
              </motion.div>
            </motion.div>
          </section>
        );
      }
      case "about": {
        const body = tk(c.body) || user.bio;
        if (!body) return null;
        return <Wrap key={sec.id} title={sec.title} accent={accent} variants={variants}><p style={{ fontSize: 17, lineHeight: 1.7, color: p.text, whiteSpace: "pre-wrap" }}>{body}</p></Wrap>;
      }
      case "skills": {
        const raw: any[] = (c.items?.length ? c.items : (user.skills || []));
        const items = raw.map((s) => (typeof s === "string" ? { name: s, level: undefined } : s)).filter((s) => s?.name);
        if (!items.length) return empty(sec, "Add skills");
        const hasLevels = items.some((s: any) => typeof s.level === "number" && s.level > 0);
        return <Wrap key={sec.id} title={sec.title} accent={accent} variants={variants}>
          {hasLevels ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px,1fr))", gap: 14 }}>
              {items.map((s: any, i: number) => {
                const logo = logoFor(s.name); const lvl = Math.max(0, Math.min(100, Number(s.level) || 0));
                return (
                  <div key={i}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                      {logo && <img src={logo} alt="" style={{ width: 18, height: 18, objectFit: "contain", background: "rgba(255,255,255,0.85)", borderRadius: 4, padding: 2 }} />}
                      <span style={{ fontSize: 13, fontWeight: 600, color: p.text }}>{s.name}</span>
                      {lvl > 0 && <span style={{ marginLeft: "auto", fontSize: 11, color: p.muted }}>{lvl}%</span>}
                    </div>
                    <div style={{ height: 6, borderRadius: 999, background: p.muted + "33", overflow: "hidden" }}>
                      <motion.div initial={{ width: 0 }} whileInView={{ width: `${lvl}%` }} viewport={{ once: true }} transition={{ duration: 0.8 }}
                        style={{ height: "100%", borderRadius: 999, background: `linear-gradient(90deg, ${accent}, ${p.accent2})` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
              {items.map((s: any, i: number) => {
                const logo = logoFor(s.name);
                return (
                  <span key={i} style={{ ...surfaceCard, display: "inline-flex", alignItems: "center", gap: 8, padding: logo ? "6px 14px 6px 8px" : "7px 14px", borderRadius: 999, fontSize: 14, fontWeight: 500, color: p.text }}>
                    {logo && <img src={logo} alt="" style={{ width: 20, height: 20, objectFit: "contain", background: "rgba(255,255,255,0.85)", borderRadius: 5, padding: 2 }} />}
                    {s.name}
                  </span>
                );
              })}
            </div>
          )}
        </Wrap>;
      }
      case "projects": {
        // merge DB projects (resolved into data.projects) + manual project cards
        const manual = (c.manual || []).filter((m: any) => m.title).map((m: any, i: number) => ({
          _id: `manual-${i}`, title: m.title, description: m.description, coverImage: m.image,
          liveUrl: m.live, githubRepo: m.repo, techStack: Array.isArray(m.tags) ? m.tags : (typeof m.tags === "string" ? m.tags.split(",").map((t: string) => t.trim()).filter(Boolean) : []),
        }));
        const all = [...projects, ...manual];
        if (!all.length) return empty(sec, "Add projects (pick from your work or add manually)");
        return <Wrap key={sec.id} title={sec.title} accent={accent} variants={variants}>
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true, margin: "-60px" }} variants={{ show: { transition: { staggerChildren: 0.08 } } }}
            style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 18 }}>
            {all.map((pr, i) => <ProjectCard key={pr._id} project={pr} style={cardStyle} anim={cardAnim} index={i} accent={accent} accent2={p.accent2} surface={p.surface} text={p.text} muted={p.muted} href={sanitizeUrl(pr.liveUrl) || (pr._id.startsWith("manual") ? undefined : `/showcase/${pr._id}`)} />)}
          </motion.div>
        </Wrap>;
      }
      case "experience": {
        const items = (c.items?.length ? c.items : data.experience) || [];
        const valid = items.filter((e: any) => e.role || e.org || e.summary);
        if (!valid.length) return null;
        return <Wrap key={sec.id} title={sec.title} accent={accent} variants={variants}>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {valid.map((e: any, i: number) => (
              <div key={i} style={{ ...surfaceCard, borderRadius: 14, padding: 16 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}><Briefcase size={15} style={{ color: accent }} /><h3 style={{ fontSize: 15, fontWeight: 700, color: p.text }}>{e.role}{e.org ? ` · ${e.org}` : ""}</h3></div>
                {(e.start || e.end) && <p style={{ fontSize: 12, color: p.muted, marginTop: 2 }}>{e.start} – {e.end || "Present"}</p>}
                {e.summary && <p style={{ fontSize: 14, color: p.text, marginTop: 8, lineHeight: 1.6 }}>{tk(e.summary)}</p>}
              </div>
            ))}
          </div>
        </Wrap>;
      }
      case "education": {
        const items = (c.items || []).filter((e: any) => e.school || e.degree);
        if (!items.length) return null;
        return <Wrap key={sec.id} title={sec.title} accent={accent} variants={variants}>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {items.map((e: any, i: number) => (
              <div key={i} style={{ ...surfaceCard, borderRadius: 14, padding: 16 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}><GraduationCap size={15} style={{ color: accent }} /><h3 style={{ fontSize: 15, fontWeight: 700, color: p.text }}>{e.degree}{e.school ? ` · ${e.school}` : ""}</h3></div>
                {(e.start || e.end) && <p style={{ fontSize: 12, color: p.muted, marginTop: 2 }}>{e.start} – {e.end || "Present"}</p>}
              </div>
            ))}
          </div>
        </Wrap>;
      }
      case "certifications": {
        const items = (c.items || []).filter((e: any) => e.name);
        if (!items.length) return empty(sec, "Add certifications");
        return <Wrap key={sec.id} title={sec.title} accent={accent} variants={variants}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px,1fr))", gap: 12 }}>
            {items.map((e: any, i: number) => {
              const inner = (
                <div style={{ ...surfaceCard, borderRadius: 14, padding: 14, display: "flex", gap: 12, alignItems: "center", height: "100%" }}>
                  {e.image ? <img src={sanitizeImageSrc(e.image)} alt="" style={{ width: 40, height: 40, objectFit: "contain", borderRadius: 8 }} /> : <Award size={26} style={{ color: accent }} />}
                  <div style={{ minWidth: 0 }}>
                    <p style={{ fontSize: 14, fontWeight: 700, color: p.text }}>{e.name}</p>
                    <p style={{ fontSize: 12, color: p.muted }}>{[e.issuer, e.date].filter(Boolean).join(" · ")}</p>
                  </div>
                </div>
              );
              const safeUrl = sanitizeUrl(e.url);
              return safeUrl ? <a key={i} href={safeUrl} target="_blank" rel="noreferrer" style={{ textDecoration: "none" }}>{inner}</a> : <div key={i}>{inner}</div>;
            })}
          </div>
        </Wrap>;
      }
      case "affiliated_orgs": {
        const items = (c.items || []).filter((e: any) => e.name);
        if (!items.length) return empty(sec, "Add organizations");
        return <Wrap key={sec.id} title={sec.title} accent={accent} variants={variants}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px,1fr))", gap: 12 }}>
            {items.map((e: any, i: number) => {
              const inner = (
                <div style={{ ...surfaceCard, borderRadius: 14, padding: 14, display: "flex", gap: 12, alignItems: "center", height: "100%" }}>
                  {e.logo ? <img src={sanitizeImageSrc(e.logo)} alt="" style={{ width: 40, height: 40, objectFit: "contain", borderRadius: 8, background: "rgba(255,255,255,0.85)", padding: 3 }} /> : <Building2 size={26} style={{ color: accent }} />}
                  <div style={{ minWidth: 0 }}>
                    <p style={{ fontSize: 14, fontWeight: 700, color: p.text }}>{e.name}</p>
                    <p style={{ fontSize: 12, color: p.muted }}>{[e.role, e.period].filter(Boolean).join(" · ")}</p>
                  </div>
                </div>
              );
              const safeUrl = sanitizeUrl(e.url);
              return safeUrl ? <a key={i} href={safeUrl} target="_blank" rel="noreferrer" style={{ textDecoration: "none" }}>{inner}</a> : <div key={i}>{inner}</div>;
            })}
          </div>
        </Wrap>;
      }
      case "links": {
        const items = (c.items || []).filter((l: any) => l.url);
        if (!items.length) return empty(sec, "Add links");
        return <Wrap key={sec.id} title={sec.title} accent={accent} variants={variants}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
            {items.map((l: any, i: number) => { const Icon = ICONS[l.icon] || LinkIcon; const safeUrl = sanitizeUrl(l.url); return safeUrl ? <a key={i} href={safeUrl} target="_blank" rel="noreferrer" style={pill(accent, p)}><Icon size={15} /> {l.label || l.icon}</a> : null; })}
          </div>
        </Wrap>;
      }
      case "timeline": {
        const items = (c.items || []).filter((e: any) => e.title || e.date);
        if (!items.length) return empty(sec, "Add timeline milestones");
        return <Wrap key={sec.id} title={sec.title} accent={accent} variants={variants}>
          <div style={{ position: "relative", paddingLeft: 22 }}>
            <div style={{ position: "absolute", left: 5, top: 4, bottom: 4, width: 2, background: accent + "44" }} />
            {items.map((e: any, i: number) => (
              <div key={i} style={{ position: "relative", marginBottom: 18 }}>
                <span style={{ position: "absolute", left: -22, top: 3, width: 12, height: 12, borderRadius: "50%", background: accent, border: `2px solid ${p.bg}` }} />
                {e.date && <p style={{ fontSize: 12, color: accent, fontWeight: 600 }}>{e.date}</p>}
                <p style={{ fontSize: 15, fontWeight: 700, color: p.text }}>{e.title}</p>
                {e.description && <p style={{ fontSize: 13, color: p.muted, marginTop: 2, lineHeight: 1.5 }}>{tk(e.description)}</p>}
              </div>
            ))}
          </div>
        </Wrap>;
      }
      case "testimonials": {
        const items = (c.items || []).filter((e: any) => e.quote);
        if (!items.length) return empty(sec, "Add testimonials");
        return <Wrap key={sec.id} title={sec.title} accent={accent} variants={variants}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px,1fr))", gap: 14 }}>
            {items.map((e: any, i: number) => (
              <div key={i} style={{ ...surfaceCard, borderRadius: 16, padding: 18 }}>
                <QuoteIcon size={18} style={{ color: accent }} />
                <p style={{ fontSize: 14, color: p.text, lineHeight: 1.6, margin: "8px 0 12px", fontStyle: "italic" }}>{e.quote}</p>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  {e.avatar && <img src={sanitizeImageSrc(e.avatar)} alt="" style={{ width: 32, height: 32, borderRadius: "50%", objectFit: "cover" }} />}
                  <div><p style={{ fontSize: 13, fontWeight: 700, color: p.text }}>{e.person}</p>{e.role && <p style={{ fontSize: 11, color: p.muted }}>{e.role}</p>}</div>
                </div>
              </div>
            ))}
          </div>
        </Wrap>;
      }
      case "custom": {
        const body = tk(c.body);
        if (!body && !c.image) return empty(sec, "Add text or an image");
        return <Wrap key={sec.id} title={sec.title} accent={accent} variants={variants}>
          {c.image && <img src={sanitizeImageSrc(c.image)} alt="" style={{ maxWidth: "100%", borderRadius: 14, marginBottom: 14 }} />}
          {body && <p style={{ fontSize: 16, lineHeight: 1.7, color: p.text, whiteSpace: "pre-wrap" }}>{body}</p>}
        </Wrap>;
      }
      case "gallery": {
        const items = (c.items || []).filter((g: any) => g.url);
        if (!items.length) return null;
        return <Wrap key={sec.id} title={sec.title} accent={accent} variants={variants}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px,1fr))", gap: 12 }}>
            {items.map((g: any, i: number) => (
              <figure key={i} style={{ ...surfaceCard, borderRadius: 12, overflow: "hidden", margin: 0 }}>
                <img src={sanitizeImageSrc(g.url)} alt={g.caption || ""} style={{ width: "100%", aspectRatio: "4/3", objectFit: "cover", display: "block" }} />
                {g.caption && <figcaption style={{ padding: "8px 10px", fontSize: 12, color: p.muted }}>{g.caption}</figcaption>}
              </figure>
            ))}
          </div>
        </Wrap>;
      }
      case "stats": {
        const items = (c.items || []).filter((s: any) => s.label || s.value);
        if (!items.length) return null;
        return <Wrap key={sec.id} title={sec.title} accent={accent} variants={variants}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px,1fr))", gap: 12 }}>
            {items.map((s: any, i: number) => (
              <div key={i} style={{ ...surfaceCard, borderRadius: 14, padding: "18px 14px", textAlign: "center" }}>
                <div style={{ fontSize: 30, fontWeight: 800, color: accent }}>{tk(s.value)}</div>
                <div style={{ fontSize: 12, color: p.muted, marginTop: 4 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </Wrap>;
      }
      case "quote": {
        if (!c.text) return null;
        return <Wrap key={sec.id} title={sec.title} accent={accent} variants={variants}>
          <blockquote style={{ ...surfaceCard, borderRadius: 16, padding: 24, borderLeft: `4px solid ${accent}` }}>
            <QuoteIcon size={20} style={{ color: accent }} />
            <p style={{ fontSize: 20, lineHeight: 1.5, color: p.text, margin: "10px 0", fontStyle: "italic" }}>{tk(c.text)}</p>
            {c.author && <cite style={{ fontSize: 13, color: p.muted }}>— {c.author}</cite>}
          </blockquote>
        </Wrap>;
      }
      case "contact": {
        const links = (c.links?.length ? c.links : data.links) || [];
        if (!links.length && !user.github) return null;
        return <Wrap key={sec.id} title={sec.title} accent={accent} variants={variants}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
            {links.map((l: any, i: number) => { const Icon = ICONS[l.icon] || LinkIcon; const safeUrl = sanitizeUrl(l.url); return safeUrl ? <a key={i} href={safeUrl} target="_blank" rel="noreferrer" style={pill(accent, p)}><Icon size={15} /> {l.label || l.icon}</a> : null; })}
            {user.github && <a href={`https://github.com/${user.github}`} target="_blank" rel="noreferrer" style={pill(accent, p)}><Github size={15} /> {user.github}</a>}
          </div>
        </Wrap>;
      }
      default: return null;
    }
  };

  return (
    <div style={{ position: "relative", minHeight: "100%", overflow: "hidden", color: p.text, fontFamily: theme.font.body, background: p.bg }}>
      <PortfolioBackground theme={theme} heavy3d={!!data.heavy3d} contained={contained} />
      <div style={{ position: "relative", zIndex: 1, maxWidth: 900, margin: "0 auto", padding: "0 24px" }}>
        {sections.map(renderSection)}
        <footer style={{ padding: "48px 0", textAlign: "center", color: p.muted, fontSize: 12 }}>
          Built on S.A.N.K.A.L.P. · {new Date().getFullYear()}
        </footer>
      </div>
    </div>
  );
}

function Wrap({ title, accent, variants, children }: { title: string; accent: string; variants: Variants; children: React.ReactNode }) {
  return (
    <motion.section initial="hidden" whileInView="show" viewport={{ once: true, margin: "-60px" }} variants={variants} transition={{ duration: 0.55 }} style={{ padding: "36px 0" }}>
      {title && <h2 style={{ fontSize: 13, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: accent, marginBottom: 18 }}>{title}</h2>}
      {children}
    </motion.section>
  );
}
function pill(accent: string, p: any): React.CSSProperties {
  return { display: "inline-flex", alignItems: "center", gap: 7, padding: "8px 14px", borderRadius: 999, border: `1px solid ${accent}44`, color: p.text, fontSize: 14, fontWeight: 500, textDecoration: "none", background: p.surface };
}
