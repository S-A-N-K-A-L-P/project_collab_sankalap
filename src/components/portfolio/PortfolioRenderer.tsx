"use client";

import { motion, type Variants } from "framer-motion";
import {
  Github, Linkedin, Twitter, Mail, Globe, Link as LinkIcon,
  MapPin, Briefcase,
} from "lucide-react";
import PortfolioBackground from "./PortfolioBackground";
import ProjectCard from "./ProjectCard";
import { getTheme, type LightBackgroundKind, type ThreeSceneKind, type CardStyle } from "./themes/registry";
import { SECTION_ANIMS, type SectionAnimKind, type CardStyleKind, type CardAnimKind, resolveTokens } from "./animations";

export interface PortfolioData {
  handle?: string;
  isPublished?: boolean;
  heavy3d?: boolean;
  themeId?: string;
  accent?: string;
  accent2?: string;
  bgOverride?: string;
  threeOverride?: string;
  card?: string;
  sectionAnim?: string;
  projectCardStyle?: string;
  projectCardAnim?: string;
  headline?: string;
  tagline?: string;
  aboutLong?: string;
  sections?: { key: string; enabled: boolean; order: number }[];
  experience?: { role: string; org: string; start: string; end: string; summary: string }[];
  links?: { label: string; url: string; icon: string }[];
  seo?: { title?: string; description?: string };
  user?: { name?: string; avatar?: string; bio?: string; location?: string; skills?: string[]; github?: string; techStackPreference?: string };
  projects?: { _id: string; title: string; description?: string; coverImage?: string; liveUrl?: string; githubRepo?: string; techStack?: string[]; version?: string }[];
}

const ICONS: Record<string, any> = { github: Github, linkedin: Linkedin, twitter: Twitter, mail: Mail, globe: Globe, link: LinkIcon };
const DEFAULT_SECTIONS = ["hero", "about", "skills", "projects", "experience", "contact"];

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
  const skills = user.skills || [];
  const projects = data.projects || [];

  // DB token source
  const tokenSrc = {
    name: user.name, bio: user.bio, location: user.location, github: user.github,
    handle: data.handle, headline: data.headline, tagline: data.tagline,
    skills, projectCount: projects.length,
  };
  const tk = (s?: string) => resolveTokens(s, tokenSrc);

  // section entrance animation
  const animKind = (data.sectionAnim as SectionAnimKind) in SECTION_ANIMS ? (data.sectionAnim as SectionAnimKind) : "rise";
  const variants: Variants = SECTION_ANIMS[animKind].variants;
  const cardStyle = (data.projectCardStyle as CardStyleKind) || "glass";
  const cardAnim = (data.projectCardAnim as CardAnimKind) || "rise";

  const enabled = (key: string) => {
    const s = data.sections?.find((x) => x.key === key);
    return s ? s.enabled : DEFAULT_SECTIONS.includes(key);
  };

  const surfaceCard: React.CSSProperties = {
    background: p.surface,
    border: "1px solid " + (theme.card === "outline" ? accent + "33" : "rgba(255,255,255,0.10)"),
    backdropFilter: theme.card === "glass" ? "blur(12px)" : undefined,
  };
  const initials = (user.name || "?").split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();

  return (
    <div style={{ position: "relative", minHeight: "100%", overflow: "hidden", color: p.text, fontFamily: theme.font.body, background: p.bg }}>
      <PortfolioBackground theme={theme} heavy3d={!!data.heavy3d} contained={contained} />

      <div style={{ position: "relative", zIndex: 1, maxWidth: 900, margin: "0 auto", padding: "0 24px" }}>
        {/* Hero */}
        {enabled("hero") && (
          <section style={{ minHeight: "72vh", display: "flex", flexDirection: "column", justifyContent: "center", paddingTop: 72, paddingBottom: 36 }}>
            <motion.div initial="hidden" animate="show" variants={variants} transition={{ duration: 0.6 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 18, flexWrap: "wrap" }}>
                <div style={{ width: 84, height: 84, borderRadius: 20, overflow: "hidden", border: `2px solid ${accent}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, fontWeight: 800, color: accent, background: p.surface, flexShrink: 0 }}>
                  {user.avatar ? <img src={user.avatar} alt={user.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : initials}
                </div>
                <div>
                  {data.tagline && <p style={{ color: accent, fontWeight: 600, fontSize: 14, letterSpacing: 1, textTransform: "uppercase" }}>{tk(data.tagline)}</p>}
                  <h1 style={{ fontSize: 52, fontWeight: 800, lineHeight: 1.05, fontFamily: theme.font.heading, margin: "4px 0", color: p.text }}>{user.name || "Your Name"}</h1>
                  <p style={{ fontSize: 20, color: p.muted, maxWidth: 620 }}>{tk(data.headline) || user.bio || "Builder on S.A.N.K.A.L.P."}</p>
                  {user.location && <p style={{ display: "inline-flex", alignItems: "center", gap: 6, color: p.muted, fontSize: 14, marginTop: 10 }}><MapPin size={14} /> {user.location}</p>}
                </div>
              </div>
              {(data.links?.length || user.github) && (
                <div style={{ display: "flex", gap: 10, marginTop: 24, flexWrap: "wrap" }}>
                  {user.github && <a href={`https://github.com/${user.github}`} target="_blank" rel="noreferrer" style={pill(accent, p)}><Github size={15} /> GitHub</a>}
                  {(data.links || []).map((l, i) => { const Icon = ICONS[l.icon] || LinkIcon; return <a key={i} href={l.url} target="_blank" rel="noreferrer" style={pill(accent, p)}><Icon size={15} /> {l.label || l.icon}</a>; })}
                </div>
              )}
            </motion.div>
          </section>
        )}

        {enabled("about") && (tk(data.aboutLong) || user.bio) && (
          <Section title="About" accent={accent} variants={variants}>
            <p style={{ fontSize: 17, lineHeight: 1.7, color: p.text, whiteSpace: "pre-wrap" }}>{tk(data.aboutLong) || user.bio}</p>
          </Section>
        )}

        {enabled("skills") && skills.length > 0 && (
          <Section title="Skills" accent={accent} variants={variants}>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
              {skills.map((s) => <span key={s} style={{ ...surfaceCard, padding: "7px 14px", borderRadius: 999, fontSize: 14, fontWeight: 500, color: p.text }}>{s}</span>)}
            </div>
          </Section>
        )}

        {enabled("projects") && projects.length > 0 && (
          <Section title="Featured Projects" accent={accent} variants={variants}>
            <motion.div initial="hidden" whileInView="show" viewport={{ once: true, margin: "-60px" }}
              variants={{ show: { transition: { staggerChildren: 0.08 } } }}
              style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 18 }}>
              {projects.map((pr, i) => (
                <ProjectCard key={pr._id} project={pr} style={cardStyle} anim={cardAnim} index={i}
                  accent={accent} accent2={p.accent2} surface={p.surface} text={p.text} muted={p.muted} />
              ))}
            </motion.div>
          </Section>
        )}

        {enabled("experience") && (data.experience?.length ?? 0) > 0 && (
          <Section title="Experience" accent={accent} variants={variants}>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {data.experience!.map((e, i) => (
                <div key={i} style={{ ...surfaceCard, borderRadius: 14, padding: 16 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <Briefcase size={15} style={{ color: accent }} />
                    <h3 style={{ fontSize: 15, fontWeight: 700, color: p.text }}>{e.role}{e.org ? ` · ${e.org}` : ""}</h3>
                  </div>
                  {(e.start || e.end) && <p style={{ fontSize: 12, color: p.muted, marginTop: 2 }}>{e.start} – {e.end || "Present"}</p>}
                  {e.summary && <p style={{ fontSize: 14, color: p.text, marginTop: 8, lineHeight: 1.6 }}>{tk(e.summary)}</p>}
                </div>
              ))}
            </div>
          </Section>
        )}

        {enabled("contact") && (
          <Section title="Get in touch" accent={accent} variants={variants}>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
              {(data.links || []).map((l, i) => { const Icon = ICONS[l.icon] || LinkIcon; return <a key={i} href={l.url} target="_blank" rel="noreferrer" style={pill(accent, p)}><Icon size={15} /> {l.label || l.icon}</a>; })}
              {user.github && <a href={`https://github.com/${user.github}`} target="_blank" rel="noreferrer" style={pill(accent, p)}><Github size={15} /> {user.github}</a>}
            </div>
          </Section>
        )}

        <footer style={{ padding: "48px 0", textAlign: "center", color: p.muted, fontSize: 12 }}>
          Built on S.A.N.K.A.L.P. · {new Date().getFullYear()}
        </footer>
      </div>
    </div>
  );
}

function Section({ title, accent, variants, children }: { title: string; accent: string; variants: Variants; children: React.ReactNode }) {
  return (
    <motion.section initial="hidden" whileInView="show" viewport={{ once: true, margin: "-60px" }}
      variants={variants} transition={{ duration: 0.55 }} style={{ padding: "36px 0" }}>
      <h2 style={{ fontSize: 13, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: accent, marginBottom: 18 }}>{title}</h2>
      {children}
    </motion.section>
  );
}

function pill(accent: string, p: any): React.CSSProperties {
  return { display: "inline-flex", alignItems: "center", gap: 7, padding: "8px 14px", borderRadius: 999, border: `1px solid ${accent}44`, color: p.text, fontSize: 14, fontWeight: 500, textDecoration: "none", background: p.surface };
}
