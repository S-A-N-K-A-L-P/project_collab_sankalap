"use client";

/**
 * Lightweight portfolio backgrounds — pure CSS + <canvas>, NO three.js.
 * Statically importable; ships in the main bundle. The heavy three.js variant
 * lives in ./three/ThreeBackground and is loaded only via next/dynamic when the
 * user enables 3D (see PortfolioBackground).
 */

import { useEffect, useRef } from "react";
import type { LightBackgroundKind, PortfolioTheme } from "../themes/registry";

function reducedMotion() {
  if (typeof window === "undefined") return false;
  return window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
}

type CanvasMode =
  | "constellation" | "network" | "starfield" | "snow" | "rain"
  | "bubbles" | "fireflies" | "dots" | "ripple";

function CanvasField({ mode, theme }: { mode: CanvasMode; theme: PortfolioTheme }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0, w = 0, h = 0, t = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const reduced = reducedMotion();
    const accent = theme.palette.accent;
    const accent2 = theme.palette.accent2;
    const mouse = { x: 0.5, y: 0.5 };

    const resize = () => {
      w = canvas.clientWidth; h = canvas.clientHeight;
      canvas.width = w * dpr; canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const onResize = () => resize();
    const onMove = (e: MouseEvent) => {
      const r = canvas.getBoundingClientRect();
      mouse.x = (e.clientX - r.left) / r.width;
      mouse.y = (e.clientY - r.top) / r.height;
    };
    window.addEventListener("resize", onResize);
    window.addEventListener("mousemove", onMove);

    const N =
      mode === "network" ? 110 :
      mode === "constellation" ? 70 :
      mode === "starfield" ? 260 :
      mode === "snow" ? 140 :
      mode === "rain" ? 120 :
      mode === "bubbles" ? 60 :
      mode === "fireflies" ? 80 :
      mode === "dots" ? 0 : 0;

    type P = { x: number; y: number; z: number; vx: number; vy: number; r: number; ph: number };
    const pts: P[] = Array.from({ length: N }, () => ({
      x: Math.random(), y: Math.random(), z: Math.random() * 0.8 + 0.2,
      vx: (Math.random() - 0.5) * 0.0008, vy: (Math.random() - 0.5) * 0.0008,
      r: Math.random(), ph: Math.random() * Math.PI * 2,
    }));

    // ripple state
    const ripples: { t: number }[] = [];
    let lastRipple = 0;

    const hexA = (hex: string, a: number) =>
      hex + Math.floor(Math.max(0, Math.min(1, a)) * 255).toString(16).padStart(2, "0");

    const draw = () => {
      t += 0.016;
      ctx.clearRect(0, 0, w, h);

      if (mode === "starfield") {
        for (const p of pts) {
          if (!reduced) { p.z -= 0.0016; if (p.z <= 0.05) { p.x = Math.random(); p.y = Math.random(); p.z = 1; } }
          const px = (p.x - 0.5) / p.z + 0.5, py = (p.y - 0.5) / p.z + 0.5;
          const s = (1 - p.z) * 2.4, a = Math.min(1, (1 - p.z) * 1.2);
          ctx.beginPath(); ctx.arc(px * w, py * h, Math.max(0.2, s), 0, 7); ctx.fillStyle = `rgba(255,255,255,${a})`; ctx.fill();
        }
      } else if (mode === "snow") {
        for (const p of pts) {
          if (!reduced) { p.y += 0.0016 + p.z * 0.0016; p.x += Math.sin(t + p.ph) * 0.0004; }
          if (p.y > 1) { p.y = 0; p.x = Math.random(); }
          ctx.beginPath(); ctx.arc(p.x * w, p.y * h, p.z * 2.4, 0, 7);
          ctx.fillStyle = `rgba(255,255,255,${0.4 + p.z * 0.5})`; ctx.fill();
        }
      } else if (mode === "rain") {
        ctx.lineWidth = 1.2;
        for (const p of pts) {
          if (!reduced) { p.y += 0.01 + p.z * 0.02; } if (p.y > 1) { p.y = -0.1; p.x = Math.random(); }
          const len = 0.04 + p.z * 0.05;
          ctx.strokeStyle = hexA(accent, 0.15 + p.z * 0.4);
          ctx.beginPath(); ctx.moveTo(p.x * w, p.y * h); ctx.lineTo(p.x * w, (p.y + len) * h); ctx.stroke();
        }
      } else if (mode === "bubbles") {
        for (const p of pts) {
          if (!reduced) { p.y -= 0.0012 + p.z * 0.0016; p.x += Math.sin(t * 0.6 + p.ph) * 0.0003; }
          if (p.y < -0.05) { p.y = 1.05; p.x = Math.random(); }
          const rad = 3 + p.z * 16;
          ctx.beginPath(); ctx.arc(p.x * w, p.y * h, rad, 0, 7);
          ctx.strokeStyle = hexA(accent2, 0.25 + p.z * 0.3); ctx.lineWidth = 1; ctx.stroke();
        }
      } else if (mode === "fireflies") {
        for (const p of pts) {
          if (!reduced) { p.x += p.vx * 2; p.y += p.vy * 2; }
          if (p.x < 0 || p.x > 1) p.vx *= -1; if (p.y < 0 || p.y > 1) p.vy *= -1;
          const glow = 0.4 + Math.sin(t * 2 + p.ph) * 0.4;
          const g = ctx.createRadialGradient(p.x * w, p.y * h, 0, p.x * w, p.y * h, 14);
          g.addColorStop(0, hexA(accent, glow)); g.addColorStop(1, hexA(accent, 0));
          ctx.fillStyle = g; ctx.fillRect(p.x * w - 14, p.y * h - 14, 28, 28);
        }
      } else if (mode === "dots") {
        const gap = 34; const cols = Math.ceil(w / gap), rows = Math.ceil(h / gap);
        for (let i = 0; i <= cols; i++) for (let j = 0; j <= rows; j++) {
          const x = i * gap, y = j * gap;
          const pulse = reduced ? 1.4 : 1.4 + Math.sin(t * 1.5 + (i + j) * 0.4) * 0.9;
          ctx.beginPath(); ctx.arc(x, y, Math.max(0.4, pulse), 0, 7);
          ctx.fillStyle = hexA(accent, 0.5); ctx.fill();
        }
      } else if (mode === "ripple") {
        if (!reduced && t - lastRipple > 1.1) { ripples.push({ t }); lastRipple = t; }
        const cx = w * 0.5, cy = h * 0.5;
        for (let i = ripples.length - 1; i >= 0; i--) {
          const age = t - ripples[i].t; const rad = age * Math.max(w, h) * 0.18;
          const a = Math.max(0, 0.5 - age * 0.12);
          if (a <= 0) { ripples.splice(i, 1); continue; }
          ctx.beginPath(); ctx.arc(cx, cy, rad, 0, 7);
          ctx.strokeStyle = hexA(i % 2 ? accent2 : accent, a); ctx.lineWidth = 2; ctx.stroke();
        }
        if (reduced && ripples.length === 0) for (let k = 1; k <= 4; k++) {
          ctx.beginPath(); ctx.arc(cx, cy, k * Math.max(w, h) * 0.08, 0, 7);
          ctx.strokeStyle = hexA(accent, 0.18); ctx.lineWidth = 1.5; ctx.stroke();
        }
      } else {
        // constellation / network
        const linkDist = mode === "network" ? 150 : 120;
        for (const p of pts) {
          if (!reduced) { p.x += p.vx; p.y += p.vy; }
          if (p.x < 0 || p.x > 1) p.vx *= -1; if (p.y < 0 || p.y > 1) p.vy *= -1;
        }
        for (let i = 0; i < pts.length; i++) for (let j = i + 1; j < pts.length; j++) {
          const a = pts[i], b = pts[j];
          const dx = (a.x - b.x) * w, dy = (a.y - b.y) * h; const d = Math.hypot(dx, dy);
          if (d < linkDist) {
            ctx.strokeStyle = hexA(accent, (1 - d / linkDist) * 0.25); ctx.lineWidth = 0.6;
            ctx.beginPath(); ctx.moveTo(a.x * w, a.y * h); ctx.lineTo(b.x * w, b.y * h); ctx.stroke();
          }
        }
        for (const p of pts) {
          const near = Math.hypot((p.x - mouse.x) * w, (p.y - mouse.y) * h) < 140;
          ctx.beginPath(); ctx.arc(p.x * w, p.y * h, near ? 2.6 : 1.5, 0, 7);
          ctx.fillStyle = near ? accent2 : hexA(accent, 0.7); ctx.fill();
        }
      }

      raf = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("mousemove", onMove);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, theme.palette.accent, theme.palette.accent2]);

  return <canvas ref={ref} className="absolute inset-0 w-full h-full" style={{ display: "block" }} />;
}

const CANVAS_MODES: Record<string, CanvasMode> = {
  constellation: "constellation", network: "network", starfield: "starfield",
  snow: "snow", rain: "rain", bubbles: "bubbles", fireflies: "fireflies",
  dots: "dots", ripple: "ripple",
};

export default function LightBackground({ kind, theme }: { kind: LightBackgroundKind; theme: PortfolioTheme }) {
  const a = theme.palette.accent, a2 = theme.palette.accent2;
  const base = "absolute inset-0 overflow-hidden pointer-events-none";

  if (CANVAS_MODES[kind]) {
    return <div className={base}><CanvasField mode={CANVAS_MODES[kind]} theme={theme} /></div>;
  }

  switch (kind) {
    case "aurora":
      return (<div className={base}>
        <div className="pf-aurora pf-aurora-1" style={{ background: a }} />
        <div className="pf-aurora pf-aurora-2" style={{ background: a2 }} />
        <div className="pf-aurora pf-aurora-3" style={{ background: a }} />
      </div>);

    case "nebula":
      return (<div className={base}>
        <div className="pf-aurora pf-aurora-1" style={{ background: a, opacity: 0.35, filter: "blur(120px)" }} />
        <div className="pf-aurora pf-aurora-2" style={{ background: a2, opacity: 0.3, filter: "blur(120px)" }} />
        <div className="pf-aurora pf-aurora-3" style={{ background: a2, opacity: 0.25, filter: "blur(120px)" }} />
        <div style={{ position: "absolute", inset: 0, background: `radial-gradient(circle at 50% 40%, ${a}10, transparent 60%)` }} />
      </div>);

    case "mesh":
      return (<div className={base}><div className="pf-mesh" style={{
        background: `radial-gradient(at 20% 20%, ${a}55 0, transparent 50%),
                     radial-gradient(at 80% 0%, ${a2}55 0, transparent 50%),
                     radial-gradient(at 0% 80%, ${a2}44 0, transparent 50%),
                     radial-gradient(at 80% 80%, ${a}55 0, transparent 50%)`,
      }} /></div>);

    case "gradient":
      return (<div className={base}><div className="pf-gradient" style={{
        background: `linear-gradient(120deg, ${theme.palette.bg}, ${a}55, ${a2}55, ${theme.palette.bg})`,
        backgroundSize: "300% 300%",
      }} /></div>);

    case "conic":
      return (<div className={base}><div className="pf-conic" style={{
        background: `conic-gradient(from 0deg at 50% 50%, ${a}33, ${a2}33, ${a}33)`,
      }} /></div>);

    case "waves":
      return (<div className={base}>
        <svg className="absolute bottom-0 left-0 w-full" viewBox="0 0 1440 320" preserveAspectRatio="none" style={{ height: "60%" }}>
          <path className="pf-wave-1" fill={a + "33"} d="M0,160 C320,260 480,60 720,120 C960,180 1200,40 1440,120 L1440,320 L0,320 Z" />
          <path className="pf-wave-2" fill={a2 + "2e"} d="M0,200 C360,120 600,260 900,180 C1140,120 1320,220 1440,180 L1440,320 L0,320 Z" />
        </svg>
      </div>);

    case "grid":
      return (<div className={base} style={{ perspective: "600px" }}>
        <div className="pf-synthgrid" style={{
          backgroundImage: `linear-gradient(${a}44 1px, transparent 1px), linear-gradient(90deg, ${a}44 1px, transparent 1px)`,
        }} />
        <div style={{ position: "absolute", inset: 0, background: `linear-gradient(to top, ${theme.palette.bg}, transparent 55%)` }} />
      </div>);

    case "tilt3d":
      return (<div className={base} style={{ perspective: "1000px" }}>
        <div className="pf-tilt-grid">{Array.from({ length: 24 }).map((_, i) => <span key={i} style={{ borderColor: a + "22" }} />)}</div>
      </div>);

    case "spotlight":
      return (<div className={base}><div className="pf-spotlight" style={{
        background: `radial-gradient(600px circle at var(--x,50%) var(--y,40%), ${a}22, transparent 60%)`,
      }} /></div>);

    case "orbs":
      return (<div className={base}>
        <div className="pf-orb pf-aurora-1" style={{ background: a, width: "30vw", height: "30vw", filter: "blur(60px)" }} />
        <div className="pf-orb pf-aurora-2" style={{ background: a2, width: "24vw", height: "24vw", filter: "blur(60px)" }} />
        <div className="pf-orb pf-aurora-3" style={{ background: a, width: "20vw", height: "20vw", filter: "blur(60px)" }} />
      </div>);

    case "noise":
      return (<div className={base}>
        <div className="pf-conic" style={{ background: `conic-gradient(from 90deg, ${a}22, ${a2}22, ${a}22)`, filter: "blur(40px)" }} />
        <div className="pf-mesh" style={{ background: `radial-gradient(at 30% 70%, ${a2}33 0, transparent 45%), radial-gradient(at 70% 30%, ${a}33 0, transparent 45%)` }} />
      </div>);

    case "terminal":
      return (<div className={base}>
        <div className="pf-terminal-scan" style={{ background: `repeating-linear-gradient(0deg, ${a}11 0, ${a}11 1px, transparent 1px, transparent 3px)` }} />
      </div>);

    case "minimal":
    default:
      return (<div className={base}>
        <div style={{ position: "absolute", inset: 0, background: `radial-gradient(1200px 600px at 70% -10%, ${a}14, transparent 60%)` }} />
      </div>);
  }
}
