"use client";

import { motion, type Variants } from "framer-motion";
import { Github, Linkedin, Twitter, Mail, Globe, Link as LinkIcon, MapPin, Briefcase, GraduationCap, Quote as QuoteIcon, ChevronDown, Award, Building2, Users, FolderOpen, ShieldCheck, Calendar, Rocket } from "lucide-react";
import PortfolioBackground from "./PortfolioBackground";
import ProjectCard from "./ProjectCard";
import { getTheme, type LightBackgroundKind, type ThreeSceneKind, type CardStyle } from "./themes/registry";
import { SECTION_ANIMS, type SectionAnimKind, type CardStyleKind, type CardAnimKind, resolveTokens } from "./animations";
import { normalizeSections, type PortfolioSection } from "./sections";
import { logoFor } from "./techLogos";
import { sanitizeUrl, sanitizeImageSrc } from "@/lib/sanitize-url";
import JoinButton from "@/components/org/JoinButton";

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
  user?: { name?: string; avatar?: string; bio?: string; location?: string; skills?: string[]; github?: string; twitter?: string; linkedin?: string; techStackPreference?: string };
  projects?: { _id: string; title: string; description?: string; coverImage?: string; liveUrl?: string; githubRepo?: string; techStack?: string[]; version?: string }[];
  
  orgMode?: boolean;
  org?: {
    _id?: string;
    name?: string;
    slug?: string;
    logo?: string;
    bannerImage?: string;
    tagline?: string;
    charter?: string;
    category?: string;
    themeColor?: string;
    socialLinks?: { github?: string; twitter?: string; linkedin?: string; discord?: string };
    website?: string;
    email?: string;
    stats?: { memberCount: number; projectCount: number; completedProjectCount: number };
    trustScore?: { completionRate: number; avgResponseDays: number; founderVerified: boolean; kycVerified: boolean };
    visibility?: string;
    orgType?: string;
  };
  orgMembers?: Array<{ _id: string; userId: { _id: string; name: string; avatar: string; handle: string }; role: string; xpInOrg: number }>;
  orgProjects?: Array<{ _id: string; title: string; description?: string; coverImage?: string; liveUrl?: string; githubRepo?: string; techStack?: string[]; status: string }>;
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
  const org = data.org || {};

  const tokenSrc = data.orgMode
    ? {
        name: org.name,
        bio: org.charter,
        location: org.category,
        github: org.socialLinks?.github,
        handle: org.slug,
        headline: org.tagline,
        tagline: org.tagline,
        skills: [] as string[],
        projectCount: data.orgProjects?.length || 0,
      }
    : {
        name: user.name,
        bio: user.bio,
        location: user.location,
        github: user.github,
        handle: data.handle,
        headline: data.headline,
        tagline: data.tagline,
        skills: user.skills || [],
        projectCount: projects.length,
      };

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
  const initials = data.orgMode
    ? (org.name || "?").split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase()
    : (user.name || "?").split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();

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

  const sections: PortfolioSection[] = normalizeSections(data)
    .filter((s) => s.enabled)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  const renderSection = (sec: PortfolioSection) => {
    const c = sec.content || {};
    switch (sec.type) {
      case "hero": {
        const logo = data.orgMode ? org.logo : user.avatar;
        const displayName = data.orgMode ? org.name : user.name;
        const headline = data.orgMode
          ? (tk(c.headline || data.headline) || org.tagline || "Community on S.A.N.K.A.L.P.")
          : (tk(c.headline || data.headline) || user.bio || "Builder on S.A.N.K.A.L.P.");
        const tagline = tk(c.tagline || data.tagline);
        return (
          <section key={sec.id} style={{ position: "relative", minHeight: "70vh", display: "flex", flexDirection: "column", justifyContent: "center", paddingTop: 72, paddingBottom: 36 }}>
            <motion.div initial="hidden" animate="show" variants={variants} transition={{ duration: 0.6 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 18, flexWrap: "wrap" }}>
                <div style={{ width: 84, height: 84, borderRadius: 20, overflow: "hidden", border: `2px solid ${accent}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, fontWeight: 800, color: accent, background: p.surface, flexShrink: 0 }}>
                  {logo ? <img src={sanitizeImageSrc(logo)} alt={displayName} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : initials}
                </div>
                <div>
                  {tagline && <p style={{ color: accent, fontWeight: 600, fontSize: 14, letterSpacing: 1, textTransform: "uppercase" }}>{tagline}</p>}
                  <h1 style={{ fontSize: 52, fontWeight: 800, lineHeight: 1.05, fontFamily: theme.font.heading, margin: "4px 0", color: p.text }}>{displayName || "Unnamed"}</h1>
                  <p style={{ fontSize: 20, color: p.muted, maxWidth: 620 }}>{headline}</p>
                  {!data.orgMode && user.location && <p style={{ display: "inline-flex", alignItems: "center", gap: 6, color: p.muted, fontSize: 14, marginTop: 10 }}><MapPin size={14} /> {user.location}</p>}
                  {data.orgMode && org.category && <p style={{ display: "inline-flex", alignItems: "center", gap: 6, color: p.muted, fontSize: 14, marginTop: 10 }}><Building2 size={14} /> {org.category.toUpperCase().replace("_", " ")}</p>}
                </div>
              </div>
            </motion.div>
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
        const body = tk(c.body) || (data.orgMode ? org.charter : user.bio);
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
        const manual = (c.manual || []).filter((m: any) => m.title).map((m: any, i: number) => ({
          _id: `manual-${i}`, title: m.title, description: m.description, coverImage: m.image,
          liveUrl: m.live, githubRepo: m.repo, techStack: Array.isArray(m.tags) ? m.tags : (typeof m.tags === "string" ? m.tags.split(",").map((t: string) => t.trim()).filter(Boolean) : []),
        }));
        const all = [...(data.orgMode ? (data.orgProjects || []) : projects), ...manual];
        if (!all.length) return empty(sec, "Add projects");
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
        const links = (c.links?.length ? c.links : (data.orgMode ? [] : data.links)) || [];
        const github = data.orgMode ? org.socialLinks?.github : user.github;
        const twitter = data.orgMode ? org.socialLinks?.twitter : user.twitter;
        const linkedin = data.orgMode ? org.socialLinks?.linkedin : user.linkedin;

        if (!links.length && !github && !twitter && !linkedin && !org.website && !org.email) return null;
        return <Wrap key={sec.id} title={sec.title} accent={accent} variants={variants}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
            {links.map((l: any, i: number) => { const Icon = ICONS[l.icon] || LinkIcon; const safeUrl = sanitizeUrl(l.url); return safeUrl ? <a key={i} href={safeUrl} target="_blank" rel="noreferrer" style={pill(accent, p)}><Icon size={15} /> {l.label || l.icon}</a> : null; })}
            {github && <a href={`https://github.com/${github}`} target="_blank" rel="noreferrer" style={pill(accent, p)}><Github size={15} /> GitHub</a>}
            {twitter && <a href={`https://twitter.com/${twitter}`} target="_blank" rel="noreferrer" style={pill(accent, p)}><Twitter size={15} /> Twitter</a>}
            {linkedin && <a href={linkedin.startsWith("http") ? linkedin : `https://linkedin.com/in/${linkedin}`} target="_blank" rel="noreferrer" style={pill(accent, p)}><Linkedin size={15} /> LinkedIn</a>}
            {org.website && <a href={sanitizeUrl(org.website)!} target="_blank" rel="noreferrer" style={pill(accent, p)}><Globe size={15} /> Website</a>}
            {org.email && <a href={`mailto:${org.email}`} style={pill(accent, p)}><Mail size={15} /> {org.email}</a>}
          </div>
        </Wrap>;
      }

      case "mission": {
        const body = tk(c.body) || org.charter;
        if (!body) return empty(sec, "Mission / Charter text is required");
        return (
          <Wrap key={sec.id} title={sec.title} accent={accent} variants={variants}>
            <div style={{ ...surfaceCard, borderRadius: 16, padding: 24 }}>
              <p style={{ fontSize: 17, lineHeight: 1.7, color: p.text, whiteSpace: "pre-wrap" }}>{body}</p>
              {(c.foundedDate || c.founderName) && (
                <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", marginTop: 20, paddingTop: 16, display: "flex", gap: 16, fontSize: 13, color: p.muted }}>
                  {c.founderName && <span>Founder: <strong>{c.founderName}</strong></span>}
                  {c.foundedDate && <span>Est: <strong>{c.foundedDate}</strong></span>}
                </div>
              )}
            </div>
          </Wrap>
        );
      }
      case "team": {
        const members = data.orgMembers || [];
        if (!members.length) return empty(sec, "Team members populate here automatically");
        const limit = Number(c.limit) || 12;
        const visibleMembers = members.slice(0, limit);

        return (
          <Wrap key={sec.id} title={sec.title} accent={accent} variants={variants}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 14 }}>
              {visibleMembers.map((m, i) => {
                const u = m.userId || {};
                const nameInitials = (u.name || "?").split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
                return (
                  <div key={m._id || i} style={{ ...surfaceCard, borderRadius: 16, padding: 16, display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: 10 }}>
                    <div style={{ width: 60, height: 60, borderRadius: "50%", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", background: `linear-gradient(135deg, ${accent}, ${p.accent2})`, color: "#fff", fontSize: 18, fontWeight: 700 }}>
                      {u.avatar ? <img src={sanitizeImageSrc(u.avatar)} alt={u.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : nameInitials}
                    </div>
                    <div>
                      <p style={{ fontSize: 14, fontWeight: 700, color: p.text, margin: 0 }}>{u.name || "Member"}</p>
                      {c.showRoles && <span style={{ display: "inline-block", fontSize: 11, fontWeight: 600, color: accent, textTransform: "uppercase", marginTop: 2 }}>{m.role}</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          </Wrap>
        );
      }
      case "projects_showcase": {
        const all = data.orgProjects || [];
        if (!all.length) return empty(sec, "Completed projects showcase will display here");
        const limit = Number(c.limit) || 6;
        const visible = all.slice(0, limit);

        return (
          <Wrap key={sec.id} title={sec.title} accent={accent} variants={variants}>
            <motion.div initial="hidden" whileInView="show" viewport={{ once: true, margin: "-60px" }} variants={{ show: { transition: { staggerChildren: 0.08 } } }}
              style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 18 }}>
              {visible.map((pr, i) => (
                <ProjectCard key={pr._id} project={pr} style={cardStyle} anim={cardAnim} index={i} accent={accent} accent2={p.accent2} surface={p.surface} text={p.text} muted={p.muted} href={sanitizeUrl(pr.liveUrl) || `/showcase/${pr._id}`} />
              ))}
            </motion.div>
          </Wrap>
        );
      }
      case "org_stats": {
        if (!data.org) return null;
        return (
          <Wrap key={sec.id} title={sec.title} accent={accent} variants={variants}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 14 }}>
              {c.showMembers && (
                <div style={{ ...surfaceCard, borderRadius: 16, padding: 20, textAlign: "center" }}>
                  <Users size={24} style={{ color: accent, margin: "0 auto 8px" }} />
                  <div style={{ fontSize: 32, fontWeight: 800, color: p.text }}>{org.stats?.memberCount || 0}</div>
                  <div style={{ fontSize: 12, color: p.muted, marginTop: 4 }}>Active Members</div>
                </div>
              )}
              {c.showProjects && (
                <div style={{ ...surfaceCard, borderRadius: 16, padding: 20, textAlign: "center" }}>
                  <FolderOpen size={24} style={{ color: accent, margin: "0 auto 8px" }} />
                  <div style={{ fontSize: 32, fontWeight: 800, color: p.text }}>{org.stats?.projectCount || 0}</div>
                  <div style={{ fontSize: 12, color: p.muted, marginTop: 4 }}>Projects Launched</div>
                </div>
              )}
              {c.showTrustScore && org.trustScore && (
                <div style={{ ...surfaceCard, borderRadius: 16, padding: 20, textAlign: "center", gridColumn: "span 2" }}>
                  <ShieldCheck size={24} style={{ color: "rgb(52, 211, 153)", margin: "0 auto 8px" }} />
                  <div style={{ fontSize: 32, fontWeight: 800, color: "rgb(52, 211, 153)" }}>
                    {Math.round(org.trustScore.completionRate || 0)}%
                  </div>
                  <div style={{ fontSize: 12, color: p.muted, marginTop: 4 }}>Project Completion Rate</div>
                </div>
              )}
            </div>
          </Wrap>
        );
      }
      case "roadmap": {
        const items = c.items || [];
        if (!items.length || (items.length === 1 && !items[0].title)) return empty(sec, "Add roadmap milestones");
        return (
          <Wrap key={sec.id} title={sec.title} accent={accent} variants={variants}>
            <div style={{ position: "relative", paddingLeft: 24 }}>
              <div style={{ position: "absolute", left: 6, top: 4, bottom: 4, width: 2, background: accent + "33" }} />
              {items.map((item: any, i: number) => (
                <div key={i} style={{ position: "relative", marginBottom: 20 }}>
                  <span style={{ position: "absolute", left: -24, top: 3, width: 14, height: 14, borderRadius: "50%", background: item.status === "completed" ? "rgb(52, 211, 153)" : accent, border: `3px solid ${p.bg}` }} />
                  <div style={{ ...surfaceCard, borderRadius: 14, padding: 16 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8, flexWrap: "wrap" }}>
                      <h4 style={{ fontSize: 15, fontWeight: 700, color: p.text, margin: 0 }}>{item.title}</h4>
                      {item.date && <span style={{ fontSize: 11, fontWeight: 600, color: accent }}>{item.date}</span>}
                    </div>
                    {item.description && <p style={{ fontSize: 13, color: p.muted, marginTop: 6, lineHeight: 1.5 }}>{item.description}</p>}
                    <span style={{ display: "inline-block", fontSize: 10, fontWeight: 700, padding: "2px 6px", borderRadius: 4, marginTop: 8,
                      background: item.status === "completed" ? "rgba(52, 211, 153, 0.15)" : item.status === "in-progress" ? "rgba(99, 102, 241, 0.15)" : "rgba(255,255,255,0.06)",
                      color: item.status === "completed" ? "rgb(110, 231, 183)" : item.status === "in-progress" ? "rgb(165, 180, 252)" : p.muted }}>
                      {item.status?.toUpperCase() || "PLANNED"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Wrap>
        );
      }
      case "sponsors": {
        const items = c.items || [];
        if (!items.length || (items.length === 1 && !items[0].name)) return empty(sec, "Add partner/sponsor logos");
        return (
          <Wrap key={sec.id} title={sec.title} accent={accent} variants={variants}>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 16, alignItems: "center", justifyContent: "center" }}>
              {items.map((sp: any, i: number) => {
                const inner = sp.logo ? (
                  <img src={sanitizeImageSrc(sp.logo)} alt={sp.name} style={{ height: 48, objectFit: "contain", filter: "grayscale(1) opacity(0.7) contrast(1.5)", transition: "all 0.3s" }} />
                ) : (
                  <span style={{ fontSize: 14, fontWeight: 600, color: p.muted }}>{sp.name}</span>
                );
                return sp.url ? (
                  <a key={i} href={sanitizeUrl(sp.url)!} target="_blank" rel="noreferrer" style={{ textDecoration: "none" }}>{inner}</a>
                ) : (
                  <div key={i}>{inner}</div>
                );
              })}
            </div>
          </Wrap>
        );
      }
      case "events": {
        const items = c.items || [];
        if (!items.length || (items.length === 1 && !items[0].title)) return empty(sec, "Add upcoming organization events");
        return (
          <Wrap key={sec.id} title={sec.title} accent={accent} variants={variants}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 14 }}>
              {items.map((ev: any, i: number) => {
                const inner = (
                  <div style={{ ...surfaceCard, borderRadius: 16, padding: 16, display: "flex", flexDirection: "column", gap: 8, height: "100%" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: accent, fontWeight: 600 }}>
                      <Calendar size={13} /> {ev.date || "TBD"}
                    </div>
                    <h4 style={{ fontSize: 15, fontWeight: 700, color: p.text, margin: 0 }}>{ev.title}</h4>
                    {ev.description && <p style={{ fontSize: 13, color: p.muted, lineHeight: 1.5, margin: 0 }}>{ev.description}</p>}
                  </div>
                );
                return ev.url ? (
                  <a key={i} href={sanitizeUrl(ev.url)!} target="_blank" rel="noreferrer" style={{ textDecoration: "none" }}>{inner}</a>
                ) : (
                  <div key={i}>{inner}</div>
                );
              })}
            </div>
          </Wrap>
        );
      }
      case "join_cta": {
        if (!data.org) return null;
        return (
          <Wrap key={sec.id} title={sec.title} accent={accent} variants={variants}>
            <div style={{ ...surfaceCard, borderRadius: 20, padding: "36px 24px", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
              <Rocket size={36} style={{ color: accent }} />
              <div>
                <h3 style={{ fontSize: 22, fontWeight: 800, color: p.text, margin: 0 }}>Become a Member</h3>
                <p style={{ fontSize: 14, color: p.muted, marginTop: 4, maxWidth: 440 }}>
                  Join {org.name} to collaborate on projects, submit proposals, and participate in governance.
                </p>
              </div>

              {c.benefits?.length > 0 && (
                <ul style={{ listStyle: "none", padding: 0, margin: "8px 0", display: "flex", flexDirection: "column", gap: 6, alignItems: "center", fontSize: 13, color: p.text }}>
                  {c.benefits.map((b: string, idx: number) => (
                    <li key={idx} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ color: "rgb(52, 211, 153)" }}>✓</span> {b}
                    </li>
                  ))}
                </ul>
              )}

              <JoinButton slug={org.slug!} orgType={org.orgType} visibility={org.visibility} orgName={org.name} />

              {c.showMemberCount && (
                <span style={{ fontSize: 11, color: p.muted }}>
                  Current members: <strong>{org.stats?.memberCount || 0}</strong>
                </span>
              )}
            </div>
          </Wrap>
        );
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
