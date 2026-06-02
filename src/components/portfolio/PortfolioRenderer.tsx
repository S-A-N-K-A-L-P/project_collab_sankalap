"use client";

/**
 * Renders a full portfolio from its config + theme. Used BOTH by the public
 * page and the builder's live-preview pane (same component → preview === result).
 */

import { motion } from "framer-motion";
import {
  Github, Linkedin, Twitter, Mail, Globe, Link as LinkIcon,
  MapPin, ExternalLink, Briefcase,
} from "lucide-react";
import PortfolioBackground from "./PortfolioBackground";
import { getTheme, type LightBackgroundKind, type ThreeSceneKind, type CardStyle } from "./themes/registry";

export interface PortfolioData {
  handle?: string;
  isPublished?: boolean;
  heavy3d?: boolean;
  themeId?: string;
  accent?: string;
  headline?: string;
  tagline?: string;
  aboutLong?: string;
  sections?: { key: string; enabled: boolean; order: number }[];
  accent2?: string;
  bgOverride?: string;
  threeOverride?: string;
  card?: string;
  experience?: { role: string; org: string; start: string; end: string; summary: string }[];
  links?: { label: string; url: string; icon: string }[];
  seo?: { title?: string; description?: string };
  user?: { name?: string; avatar?: string; bio?: string; location?: string; skills?: string[]; github?: string; techStackPreference?: string };
  projects?: { _id: string; title: string; description?: string; coverImage?: string; liveUrl?: string; githubRepo?: string; techStack?: string[]; version?: string }[];
}

const ICONS: Record<string, any> = { github: Github, linkedin: Linkedin, twitter: Twitter, mail: Mail, globe: Globe, link: LinkIcon };

const DEFAULT_SECTIONS = ["hero", "about", "skills", "projects", "experience", "contact"];

const fade = {
  initial: { opacity: 0, y: 18 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-60px" },
  transition: { duration: 0.5 },
};

export default function PortfolioRenderer({ data }: { data: PortfolioData }) {
  const base = getTheme(data.themeId);

  // Build an EFFECTIVE theme by layering the user's customization overrides
  // on top of the chosen preset.
  const theme = {
    ...base,
    background: (data.bgOverride || base.background) as LightBackgroundKind,
    three: (data.threeOverride || base.three) as ThreeSceneKind,
    supports3d: base.supports3d || !!(data.threeOverride && data.threeOverride !== "none"),
    card: ((data.card || base.card) as CardStyle),
    palette: {
      ...base.palette,
      accent: data.accent || base.palette.accent,
      accent2: data.accent2 || base.palette.accent2,
    },
  };
  const accent = theme.palette.accent;
  const p = theme.palette;
  const user = data.user || {};
  const skills = user.skills || [];
  const projects = data.projects || [];

  const enabled = (key: string) => {
    const s = data.sections?.find((x) => x.key === key);
    if (s) return s.enabled;
    return DEFAULT_SECTIONS.includes(key);
  };

  const cardStyle: React.CSSProperties = {
    background: p.surface,
    borderColor: theme.card === "outline" ? accent + "33" : "rgba(255,255,255,0.10)",
    backdropFilter: theme.card === "glass" ? "blur(12px)" : undefined,
  };

  const initials = (user.name || "?").split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();

  return (
    <div style={{ color: p.text, fontFamily: theme.font.body, minHeight: "100%", position: "relative" }}>
      <PortfolioBackground theme={theme} heavy3d={!!data.heavy3d} />

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "0 24px" }}>
        {/* ── Hero ── */}
        {enabled("hero") && (
          <section style={{ minHeight: "78vh", display: "flex", flexDirection: "column", justifyContent: "center", paddingTop: 80, paddingBottom: 40 }}>
            <motion.div {...fade}>
              <div style={{ display: "flex", alignItems: "center", gap: 18, flexWrap: "wrap" }}>
                <div style={{
                  width: 84, height: 84, borderRadius: 20, overflow: "hidden",
                  border: `2px solid ${accent}`, display: "flex", alignItems: "center",
                  justifyContent: "center", fontSize: 28, fontWeight: 800, color: accent,
                  background: p.surface, flexShrink: 0,
                }}>
                  {user.avatar ? <img src={user.avatar} alt={user.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : initials}
                </div>
                <div>
                  {data.tagline && <p style={{ color: accent, fontWeight: 600, fontSize: 14, letterSpacing: 1, textTransform: "uppercase" }}>{data.tagline}</p>}
                  <h1 style={{ fontSize: 52, fontWeight: 800, lineHeight: 1.05, fontFamily: theme.font.heading, margin: "4px 0" }}>
                    {user.name || "Your Name"}
                  </h1>
                  <p style={{ fontSize: 20, color: p.muted, maxWidth: 620 }}>
                    {data.headline || user.bio || "Builder on S.A.N.K.A.L.P."}
                  </p>
                  {user.location && (
                    <p style={{ display: "inline-flex", alignItems: "center", gap: 6, color: p.muted, fontSize: 14, marginTop: 10 }}>
                      <MapPin size={14} /> {user.location}
                    </p>
                  )}
                </div>
              </div>

              {/* quick links */}
              {(data.links?.length || user.github) && (
                <div style={{ display: "flex", gap: 10, marginTop: 24, flexWrap: "wrap" }}>
                  {user.github && (
                    <a href={`https://github.com/${user.github}`} target="_blank" rel="noreferrer"
                       style={pill(accent, p)}><Github size={15} /> GitHub</a>
                  )}
                  {(data.links || []).map((l, i) => {
                    const Icon = ICONS[l.icon] || LinkIcon;
                    return <a key={i} href={l.url} target="_blank" rel="noreferrer" style={pill(accent, p)}><Icon size={15} /> {l.label || l.icon}</a>;
                  })}
                </div>
              )}
            </motion.div>
          </section>
        )}

        {/* ── About ── */}
        {enabled("about") && (data.aboutLong || user.bio) && (
          <Section title="About" accent={accent}>
            <p style={{ fontSize: 17, lineHeight: 1.7, color: p.text, whiteSpace: "pre-wrap" }}>
              {data.aboutLong || user.bio}
            </p>
          </Section>
        )}

        {/* ── Skills ── */}
        {enabled("skills") && skills.length > 0 && (
          <Section title="Skills" accent={accent}>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
              {skills.map((s) => (
                <span key={s} style={{ ...cardStyle, border: "1px solid", padding: "7px 14px", borderRadius: 999, fontSize: 14, fontWeight: 500 }}>{s}</span>
              ))}
            </div>
          </Section>
        )}

        {/* ── Projects ── */}
        {enabled("projects") && projects.length > 0 && (
          <Section title="Featured Projects" accent={accent}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 16 }}>
              {projects.map((pr) => (
                <motion.div key={pr._id} {...fade} style={{ ...cardStyle, border: "1px solid", borderRadius: 16, overflow: "hidden" }}>
                  <div style={{ aspectRatio: "16/9", background: `linear-gradient(135deg, ${accent}33, ${p.accent2}22)`, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
                    {pr.coverImage
                      ? <img src={pr.coverImage} alt={pr.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      : <span style={{ fontSize: 40, fontWeight: 800, color: accent + "66" }}>{pr.title?.[0]?.toUpperCase()}</span>}
                  </div>
                  <div style={{ padding: 16 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                      <h3 style={{ fontSize: 16, fontWeight: 700 }}>{pr.title}</h3>
                      {pr.version && <span style={{ fontSize: 11, color: p.muted }}>{pr.version}</span>}
                    </div>
                    {pr.description && <p style={{ fontSize: 13, color: p.muted, marginTop: 6, lineHeight: 1.5 }}>{pr.description.slice(0, 110)}</p>}
                    {pr.techStack && pr.techStack.length > 0 && (
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 10 }}>
                        {pr.techStack.slice(0, 4).map((t) => (
                          <span key={t} style={{ fontSize: 11, color: accent, border: `1px solid ${accent}44`, borderRadius: 999, padding: "2px 8px" }}>{t}</span>
                        ))}
                      </div>
                    )}
                    <div style={{ display: "flex", gap: 12, marginTop: 12 }}>
                      {pr.liveUrl && <a href={pr.liveUrl} target="_blank" rel="noreferrer" style={{ color: accent, fontSize: 13, display: "inline-flex", alignItems: "center", gap: 4 }}><ExternalLink size={13} /> Live</a>}
                      {pr.githubRepo && <a href={pr.githubRepo} target="_blank" rel="noreferrer" style={{ color: p.muted, fontSize: 13, display: "inline-flex", alignItems: "center", gap: 4 }}><Github size={13} /> Code</a>}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </Section>
        )}

        {/* ── Experience ── */}
        {enabled("experience") && (data.experience?.length ?? 0) > 0 && (
          <Section title="Experience" accent={accent}>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {data.experience!.map((e, i) => (
                <div key={i} style={{ ...cardStyle, border: "1px solid", borderRadius: 14, padding: 16 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <Briefcase size={15} style={{ color: accent }} />
                    <h3 style={{ fontSize: 15, fontWeight: 700 }}>{e.role}{e.org ? ` · ${e.org}` : ""}</h3>
                  </div>
                  {(e.start || e.end) && <p style={{ fontSize: 12, color: p.muted, marginTop: 2 }}>{e.start} – {e.end || "Present"}</p>}
                  {e.summary && <p style={{ fontSize: 14, color: p.text, marginTop: 8, lineHeight: 1.6 }}>{e.summary}</p>}
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* ── Contact ── */}
        {enabled("contact") && (
          <Section title="Get in touch" accent={accent}>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
              {(data.links || []).map((l, i) => {
                const Icon = ICONS[l.icon] || LinkIcon;
                return <a key={i} href={l.url} target="_blank" rel="noreferrer" style={pill(accent, p)}><Icon size={15} /> {l.label || l.icon}</a>;
              })}
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

function Section({ title, accent, children }: { title: string; accent: string; children: React.ReactNode }) {
  return (
    <motion.section {...fade} style={{ padding: "36px 0" }}>
      <h2 style={{ fontSize: 13, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: accent, marginBottom: 18 }}>{title}</h2>
      {children}
    </motion.section>
  );
}

function pill(accent: string, p: any): React.CSSProperties {
  return {
    display: "inline-flex", alignItems: "center", gap: 7, padding: "8px 14px",
    borderRadius: 999, border: `1px solid ${accent}44`, color: p.text,
    fontSize: 14, fontWeight: 500, textDecoration: "none", background: p.surface,
  };
}
