"use client";

import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { ExternalLink, Github } from "lucide-react";
import { CARD_ANIMS, type CardStyleKind, type CardAnimKind } from "./animations";

export interface PortfolioProject {
  _id: string; title: string; description?: string; coverImage?: string;
  liveUrl?: string; githubRepo?: string; techStack?: string[]; version?: string;
}

interface Props {
  project: PortfolioProject;
  style: CardStyleKind;
  anim: CardAnimKind;
  accent: string;
  accent2: string;
  surface: string;
  text: string;
  muted: string;
  index?: number;
  href?: string;
}

const T = { duration: 0.55, ease: [0.22, 1, 0.36, 1] as any };

export default function ProjectCard({ project, style, anim, accent, accent2, surface, text, muted, index = 0, href }: Props) {
  const variants = (CARD_ANIMS[anim] || CARD_ANIMS.rise).variants;
  const ref = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ rx: 0, ry: 0 });
  const [flipped, setFlipped] = useState(false);

  // Whole-card navigation to the project. Inner Live/Code links stopPropagation.
  const go = () => { if (href) window.open(href, href.startsWith("http") ? "_blank" : "_self"); };
  const stop = (e: React.MouseEvent) => e.stopPropagation();
  const clickable = !!href;

  const onTilt = (e: React.MouseEvent) => {
    if (style !== "tilt3d") return;
    const el = ref.current; if (!el) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    setTilt({ rx: -py * 12, ry: px * 12 });
  };
  const resetTilt = () => setTilt({ rx: 0, ry: 0 });

  const cover = (
    <div style={{ aspectRatio: "16/9", background: `linear-gradient(135deg, ${accent}33, ${accent2}22)`, overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
      {project.coverImage
        ? <img src={project.coverImage} alt={project.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        : <span style={{ fontSize: 38, fontWeight: 800, color: accent + "66" }}>{project.title?.[0]?.toUpperCase()}</span>}
    </div>
  );

  const body = (
    <div style={{ padding: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, color: text }}>{project.title}</h3>
        {project.version && <span style={{ fontSize: 11, color: muted }}>{project.version}</span>}
      </div>
      {project.description && <p style={{ fontSize: 13, color: muted, marginTop: 6, lineHeight: 1.5 }}>{project.description.slice(0, 110)}</p>}
      {project.techStack && project.techStack.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 10 }}>
          {project.techStack.slice(0, 4).map((t) => (
            <span key={t} style={{ fontSize: 11, color: accent, border: `1px solid ${accent}44`, borderRadius: 999, padding: "2px 8px" }}>{t}</span>
          ))}
        </div>
      )}
      <div style={{ display: "flex", gap: 12, marginTop: 12 }}>
        {project.liveUrl && <a onClick={stop} href={project.liveUrl} target="_blank" rel="noreferrer" style={{ color: accent, fontSize: 13, display: "inline-flex", alignItems: "center", gap: 4 }}><ExternalLink size={13} /> Live</a>}
        {project.githubRepo && <a onClick={stop} href={project.githubRepo} target="_blank" rel="noreferrer" style={{ color: muted, fontSize: 13, display: "inline-flex", alignItems: "center", gap: 4 }}><Github size={13} /> Code</a>}
      </div>
    </div>
  );

  // base wrapper styles per card design
  const radius = 16;
  let wrapStyle: React.CSSProperties = { borderRadius: radius, overflow: "hidden", position: "relative" };
  let className = "";

  switch (style) {
    case "glass":
      wrapStyle = { ...wrapStyle, background: surface, border: "1px solid rgba(255,255,255,0.12)", backdropFilter: "blur(12px)" };
      break;
    case "gradientBorder":
      wrapStyle = { ...wrapStyle, padding: 1.5, background: `linear-gradient(135deg, ${accent}, ${accent2})` };
      break;
    case "neon":
      wrapStyle = { ...wrapStyle, background: surface, border: `1px solid ${accent}`, boxShadow: `0 0 18px ${accent}55, inset 0 0 12px ${accent}22` };
      break;
    case "spotlight":
      wrapStyle = { ...wrapStyle, background: surface, border: "1px solid rgba(255,255,255,0.10)" };
      className = "pf-card-spotlight";
      break;
    case "polaroid":
      wrapStyle = { ...wrapStyle, background: "#fff", border: "1px solid rgba(0,0,0,0.08)", padding: 8, paddingBottom: 0, transform: `rotate(${(index % 2 ? 1 : -1) * 1.5}deg)` };
      break;
    case "terminal":
      wrapStyle = { ...wrapStyle, background: "#0b0e0b", border: `1px solid ${accent}55`, fontFamily: "'JetBrains Mono', monospace" };
      break;
    case "tilt3d":
      wrapStyle = { ...wrapStyle, background: surface, border: "1px solid rgba(255,255,255,0.12)", backdropFilter: "blur(12px)" };
      break;
    case "flip":
      wrapStyle = { ...wrapStyle, background: "transparent" };
      break;
  }

  // gradientBorder → inner content needs its own bg
  const inner = (content: React.ReactNode) =>
    style === "gradientBorder"
      ? <div style={{ background: surface, borderRadius: radius - 1, overflow: "hidden" }}>{content}</div>
      : content;

  const content = <>{cover}{body}</>;

  // 3D flip card
  if (style === "flip") {
    return (
      <motion.div variants={variants} transition={{ ...T, delay: index * 0.05 }}
        onClick={go} style={{ perspective: 1000, cursor: clickable ? "pointer" : "default" }}
        onMouseEnter={() => setFlipped(true)} onMouseLeave={() => setFlipped(false)}>
        <motion.div animate={{ rotateY: flipped ? 180 : 0 }} transition={{ duration: 0.6 }}
          style={{ transformStyle: "preserve-3d", position: "relative", borderRadius: radius }}>
          {/* front */}
          <div style={{ backfaceVisibility: "hidden", background: surface, border: "1px solid rgba(255,255,255,0.12)", borderRadius: radius, overflow: "hidden" }}>
            {cover}
            <div style={{ padding: 16 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: text }}>{project.title}</h3>
              <p style={{ fontSize: 12, color: muted, marginTop: 6 }}>Hover to flip →</p>
            </div>
          </div>
          {/* back */}
          <div style={{ position: "absolute", inset: 0, transform: "rotateY(180deg)", backfaceVisibility: "hidden", background: `linear-gradient(135deg, ${accent}, ${accent2})`, color: "#fff", borderRadius: radius, padding: 18, display: "flex", flexDirection: "column", justifyContent: "center" }}>
            <h3 style={{ fontSize: 16, fontWeight: 800 }}>{project.title}</h3>
            {project.description && <p style={{ fontSize: 13, marginTop: 8, lineHeight: 1.5, opacity: 0.95 }}>{project.description.slice(0, 140)}</p>}
            <div style={{ display: "flex", gap: 12, marginTop: 14 }}>
              {project.liveUrl && <a onClick={stop} href={project.liveUrl} target="_blank" rel="noreferrer" style={{ color: "#fff", fontSize: 13, display: "inline-flex", gap: 4, alignItems: "center" }}><ExternalLink size={13} /> Live</a>}
              {project.githubRepo && <a onClick={stop} href={project.githubRepo} target="_blank" rel="noreferrer" style={{ color: "#fff", fontSize: 13, display: "inline-flex", gap: 4, alignItems: "center" }}><Github size={13} /> Code</a>}
            </div>
          </div>
        </motion.div>
      </motion.div>
    );
  }

  // 3D tilt card
  if (style === "tilt3d") {
    return (
      <motion.div variants={variants} transition={{ ...T, delay: index * 0.05 }} style={{ perspective: 900 }}>
        <div ref={ref} onMouseMove={onTilt} onMouseLeave={resetTilt} onClick={go}
          style={{ ...wrapStyle, transform: `rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg)`, transition: "transform 120ms ease", transformStyle: "preserve-3d", cursor: clickable ? "pointer" : "default" }}>
          {content}
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div ref={ref} variants={variants} transition={{ ...T, delay: index * 0.05 }}
      whileHover={{ y: -4 }} className={className} onClick={go}
      style={{ ...wrapStyle, ["--accent" as any]: accent, cursor: clickable ? "pointer" : "default" }}
      onMouseMove={style === "spotlight" ? (e) => {
        const el = ref.current; if (!el) return; const r = el.getBoundingClientRect();
        el.style.setProperty("--mx", `${e.clientX - r.left}px`);
        el.style.setProperty("--my", `${e.clientY - r.top}px`);
      } : undefined}
    >
      {inner(content)}
    </motion.div>
  );
}
