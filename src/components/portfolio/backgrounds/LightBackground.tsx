"use client";

/**
 * Lightweight portfolio backgrounds — pure CSS + <canvas>, NO three.js.
 * This module is statically importable and ships in the main bundle.
 * The heavy three.js variant lives in ./three/ThreeBackground and is ONLY
 * loaded via next/dynamic when the user enables 3D (see PortfolioBackground).
 */

import { useEffect, useRef } from "react";
import type { LightBackgroundKind, PortfolioTheme } from "../themes/registry";

function prefersReducedMotion() {
  if (typeof window === "undefined") return false;
  return window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
}

/* ── Canvas: constellation / starfield ─────────────────────────────────── */
function CanvasField({ mode, theme }: { mode: "constellation" | "starfield"; theme: PortfolioTheme }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    let w = 0, h = 0, dpr = Math.min(window.devicePixelRatio || 1, 2);
    const reduced = prefersReducedMotion();

    const COUNT = mode === "constellation" ? 70 : 220;
    const pts = Array.from({ length: COUNT }, () => ({
      x: Math.random(), y: Math.random(),
      z: Math.random() * 0.8 + 0.2,
      vx: (Math.random() - 0.5) * 0.0006,
      vy: (Math.random() - 0.5) * 0.0006,
    }));
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

    const accent = theme.palette.accent;

    const draw = () => {
      ctx.clearRect(0, 0, w, h);

      if (mode === "starfield") {
        for (const p of pts) {
          if (!reduced) {
            // warp toward viewer
            p.z -= 0.0016;
            if (p.z <= 0.05) { p.x = Math.random(); p.y = Math.random(); p.z = 1; }
          }
          const px = (p.x - 0.5) / p.z + 0.5;
          const py = (p.y - 0.5) / p.z + 0.5;
          const size = (1 - p.z) * 2.4;
          const alpha = Math.min(1, (1 - p.z) * 1.2);
          ctx.beginPath();
          ctx.arc(px * w, py * h, Math.max(0.2, size), 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255,255,255,${alpha})`;
          ctx.fill();
        }
      } else {
        // constellation
        for (const p of pts) {
          if (!reduced) { p.x += p.vx; p.y += p.vy; }
          if (p.x < 0 || p.x > 1) p.vx *= -1;
          if (p.y < 0 || p.y > 1) p.vy *= -1;
        }
        // links
        for (let i = 0; i < pts.length; i++) {
          for (let j = i + 1; j < pts.length; j++) {
            const a = pts[i], b = pts[j];
            const dx = (a.x - b.x) * w, dy = (a.y - b.y) * h;
            const d = Math.hypot(dx, dy);
            if (d < 120) {
              ctx.strokeStyle = accent + Math.floor((1 - d / 120) * 40).toString(16).padStart(2, "0");
              ctx.lineWidth = 0.6;
              ctx.beginPath();
              ctx.moveTo(a.x * w, a.y * h);
              ctx.lineTo(b.x * w, b.y * h);
              ctx.stroke();
            }
          }
        }
        for (const p of pts) {
          const mdx = (p.x - mouse.x) * w, mdy = (p.y - mouse.y) * h;
          const near = Math.hypot(mdx, mdy) < 140;
          ctx.beginPath();
          ctx.arc(p.x * w, p.y * h, near ? 2.6 : 1.6, 0, Math.PI * 2);
          ctx.fillStyle = near ? accent : "rgba(255,255,255,0.6)";
          ctx.fill();
        }
      }

      if (!reduced) raf = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("mousemove", onMove);
    };
  }, [mode, theme]);

  return <canvas ref={ref} className="absolute inset-0 w-full h-full" style={{ display: "block" }} />;
}

/* ── Main dispatcher ───────────────────────────────────────────────────── */
export default function LightBackground({ kind, theme }: { kind: LightBackgroundKind; theme: PortfolioTheme }) {
  const a = theme.palette.accent;
  const a2 = theme.palette.accent2;
  const base = "absolute inset-0 overflow-hidden pointer-events-none";

  switch (kind) {
    case "constellation":
      return <div className={base}><CanvasField mode="constellation" theme={theme} /></div>;
    case "starfield":
      return <div className={base}><CanvasField mode="starfield" theme={theme} /></div>;

    case "aurora":
      return (
        <div className={base}>
          <div className="pf-aurora pf-aurora-1" style={{ background: a }} />
          <div className="pf-aurora pf-aurora-2" style={{ background: a2 }} />
          <div className="pf-aurora pf-aurora-3" style={{ background: a }} />
        </div>
      );

    case "mesh":
      return (
        <div className={base}>
          <div className="pf-mesh" style={{
            background: `radial-gradient(at 20% 20%, ${a}55 0px, transparent 50%),
                         radial-gradient(at 80% 0%, ${a2}55 0px, transparent 50%),
                         radial-gradient(at 0% 80%, ${a2}44 0px, transparent 50%),
                         radial-gradient(at 80% 80%, ${a}55 0px, transparent 50%)`,
          }} />
        </div>
      );

    case "waves":
      return (
        <div className={base}>
          <svg className="absolute bottom-0 left-0 w-full" viewBox="0 0 1440 320" preserveAspectRatio="none" style={{ height: "60%" }}>
            <path className="pf-wave pf-wave-1" fill={a + "33"} d="M0,160 C320,260 480,60 720,120 C960,180 1200,40 1440,120 L1440,320 L0,320 Z" />
            <path className="pf-wave pf-wave-2" fill={a2 + "2e"} d="M0,200 C360,120 600,260 900,180 C1140,120 1320,220 1440,180 L1440,320 L0,320 Z" />
          </svg>
        </div>
      );

    case "tilt3d":
      return (
        <div className={base} style={{ perspective: "1000px" }}>
          <div className="pf-tilt-grid">
            {Array.from({ length: 24 }).map((_, i) => (
              <span key={i} style={{ borderColor: a + "22" }} />
            ))}
          </div>
        </div>
      );

    case "terminal":
      return (
        <div className={base}>
          <div className="pf-terminal-scan" style={{ background: `repeating-linear-gradient(0deg, ${a}11 0px, ${a}11 1px, transparent 1px, transparent 3px)` }} />
        </div>
      );

    case "minimal":
    default:
      return (
        <div className={base}>
          <div style={{ position: "absolute", inset: 0, background: `radial-gradient(1200px 600px at 70% -10%, ${a}14, transparent 60%)` }} />
        </div>
      );
  }
}
