"use client";

import {
  Download, Zap, Bot, FolderGit2, TerminalSquare, Radar, Braces,
  Cable, Play, Network, Rss, Cpu, ShieldCheck, Sparkles, MonitorDown,
  CheckCircle2, ArrowRight,
} from "lucide-react";

const DOWNLOAD_URL =
  "https://drive.google.com/file/d/1_TGpFcbk50EXtMTTcDZD1SHFlyxDc70G/view?usp=sharing";

const STATS = [
  { value: "10+",  label: "Built-in dev tools" },
  { value: ".NET 9", label: "MAUI + Blazor Hybrid" },
  { value: "5",    label: "Runtimes auto-detected" },
  { value: "1-click", label: "Full-stack orchestration" },
];

const FEATURES = [
  { Icon: Bot,           color: "#a78bfa", title: "AI Dev Agent",         desc: "Groq-powered coding assistant that reads your workspace, drafts methodologies, and scopes tasks automatically." },
  { Icon: FolderGit2,    color: "#34d399", title: "Project Scaffolding",  desc: "Spin up multi-stack projects from templates — Mongo, Postgres, Flask, Spring, Next.js, Vite — in seconds." },
  { Icon: TerminalSquare,color: "#60a5fa", title: "Syncro CLI",           desc: "A unified command orchestrator with a smart parser and router for every dev operation." },
  { Icon: Radar,         color: "#fbbf24", title: "Environment Detection",desc: "Auto-detects your Node, Python, Java, .NET and Flutter installs so nothing is left to guesswork." },
  { Icon: Braces,        color: "#f472b6", title: "AST Engine",           desc: "Multi-language code parsing, configuration analysis and dependency mapping across your whole repo." },
  { Icon: Cable,         color: "#22d3ee", title: "Connector Workbench",  desc: "Maps frontend API calls to backend routes and generates the missing contract — zero manual glue." },
  { Icon: Play,          color: "#4ade80", title: "Runtime Orchestration",desc: "Run entire multi-project stacks with one click, with continuous health checks and live status." },
  { Icon: Network,       color: "#818cf8", title: "Universe Graph",       desc: "A living knowledge graph of your workspace — every service, route, and dependency, connected." },
  { Icon: Rss,           color: "#fb923c", title: "Platform Sync",        desc: "Feed, proposals, marketplace and your portfolio from S.A.N.K.A.L.P. — right inside the app." },
];

const TECH = [".NET 9", "MAUI", "Blazor Hybrid", "MudBlazor", "Groq AI", "LiteDB", "MongoDB", "Windows 10+"];

const REQUIREMENTS = [
  "Windows 10 (build 19041) or later",
  ".NET 9 Desktop Runtime",
  "4 GB RAM minimum (8 GB recommended)",
  "500 MB free disk space",
];

export default function SyncroDesktopLanding() {
  return (
    <div className="min-h-full bg-background text-foreground">
      {/* ── HERO ──────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        {/* glow */}
        <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 w-[900px] h-[900px] rounded-full opacity-30 blur-3xl"
          style={{ background: "radial-gradient(circle, #6366f1 0%, transparent 60%)" }} />
        <div className="pointer-events-none absolute top-20 -right-40 w-[500px] h-[500px] rounded-full opacity-20 blur-3xl"
          style={{ background: "radial-gradient(circle, #a78bfa 0%, transparent 60%)" }} />

        <div className="relative max-w-5xl mx-auto px-6 pt-20 pb-16 text-center">
          {/* logo mark */}
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl mb-6 shadow-2xl"
            style={{ background: "linear-gradient(135deg, #6366f1, #4f46e5)", boxShadow: "0 12px 40px rgba(99,102,241,0.45)" }}>
            <Zap className="w-11 h-11 text-white" fill="white" />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 mb-4 rounded-full border border-border bg-card text-xs font-medium text-muted">
            <Sparkles className="w-3.5 h-3.5 text-primary" /> Native Windows desktop client
          </div>

          <h1 className="text-4xl sm:text-6xl font-black tracking-tight mb-4">
            Syncro <span className="bg-clip-text text-transparent" style={{ backgroundImage: "linear-gradient(135deg, #818cf8, #a78bfa)" }}>Desktop</span>
          </h1>
          <p className="text-base sm:text-xl text-muted max-w-2xl mx-auto mb-8 leading-relaxed">
            The all-in-one developer cockpit for the S.A.N.K.A.L.P. community — AI agent,
            project scaffolding, Git automation, and full-stack orchestration in a single native app.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <a href={DOWNLOAD_URL} target="_blank" rel="noreferrer"
              className="group inline-flex items-center gap-2.5 px-7 py-3.5 rounded-2xl text-white font-bold text-base shadow-xl transition-all hover:scale-[1.03]"
              style={{ background: "linear-gradient(135deg, #6366f1, #4f46e5)", boxShadow: "0 10px 30px rgba(99,102,241,0.4)" }}>
              <Download className="w-5 h-5 group-hover:translate-y-0.5 transition-transform" />
              Download Now
            </a>
            <a href="#features"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl border border-border bg-card font-semibold text-foreground hover:bg-background transition-colors">
              Explore features <ArrowRight className="w-4 h-4" />
            </a>
          </div>

          <p className="mt-4 text-xs text-muted flex items-center justify-center gap-1.5">
            <MonitorDown className="w-3.5 h-3.5" /> For Windows 10 &amp; 11 · Free for community members
          </p>
        </div>

        {/* stats bar */}
        <div className="relative max-w-4xl mx-auto px-6 pb-16">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {STATS.map((s) => (
              <div key={s.label} className="bg-card border border-border rounded-2xl p-4 text-center">
                <p className="text-2xl font-black text-foreground">{s.value}</p>
                <p className="text-[11px] text-muted mt-1 leading-tight">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ──────────────────────────────────────── */}
      <section id="features" className="max-w-6xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight mb-3">Everything a developer needs</h2>
          <p className="text-muted max-w-2xl mx-auto">
            Syncro Desktop folds your entire local workflow and the S.A.N.K.A.L.P. platform into one place.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map(({ Icon, color, title, desc }) => (
            <div key={title}
              className="group bg-card border border-border rounded-2xl p-5 transition-all hover:-translate-y-1 hover:shadow-xl hover:border-primary/30">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110"
                style={{ background: `${color}1a`, border: `1px solid ${color}33` }}>
                <Icon className="w-5 h-5" style={{ color }} />
              </div>
              <h3 className="font-bold text-foreground mb-1.5">{title}</h3>
              <p className="text-sm text-muted leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── TECH STACK ────────────────────────────────────── */}
      <section className="max-w-4xl mx-auto px-6 py-8">
        <div className="bg-card border border-border rounded-3xl p-8 text-center">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted uppercase tracking-widest mb-4">
            <Cpu className="w-4 h-4" /> Built with
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2">
            {TECH.map((t) => (
              <span key={t} className="px-3.5 py-1.5 rounded-full bg-background border border-border text-sm font-medium text-foreground">
                {t}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── DOWNLOAD + REQUIREMENTS ───────────────────────── */}
      <section className="max-w-5xl mx-auto px-6 py-16">
        <div className="relative overflow-hidden rounded-3xl border border-border p-8 sm:p-12"
          style={{ background: "linear-gradient(135deg, rgba(99,102,241,0.12), rgba(168,139,250,0.06))" }}>
          <div className="pointer-events-none absolute -top-24 -right-24 w-72 h-72 rounded-full opacity-30 blur-3xl"
            style={{ background: "radial-gradient(circle, #6366f1 0%, transparent 60%)" }} />

          <div className="relative grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-3xl font-black tracking-tight mb-3">Ready to build faster?</h2>
              <p className="text-muted mb-6 leading-relaxed">
                Download Syncro Desktop and get the AI agent, scaffolding, and full-stack
                orchestration running on your machine in minutes.
              </p>
              <a href={DOWNLOAD_URL} target="_blank" rel="noreferrer"
                className="group inline-flex items-center gap-2.5 px-7 py-3.5 rounded-2xl text-white font-bold shadow-xl transition-all hover:scale-[1.03]"
                style={{ background: "linear-gradient(135deg, #6366f1, #4f46e5)", boxShadow: "0 10px 30px rgba(99,102,241,0.4)" }}>
                <Download className="w-5 h-5 group-hover:translate-y-0.5 transition-transform" />
                Download Now
              </a>
              <p className="mt-3 text-xs text-muted flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> Hosted on Google Drive · opens in a new tab
              </p>
            </div>

            <div className="bg-card border border-border rounded-2xl p-6">
              <p className="text-sm font-bold text-foreground mb-4">System requirements</p>
              <ul className="space-y-2.5">
                {REQUIREMENTS.map((r) => (
                  <li key={r} className="flex items-start gap-2.5 text-sm text-muted">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    {r}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-muted mt-8">
          Syncro Desktop · The native companion to S.A.N.K.A.L.P.
        </p>
      </section>
    </div>
  );
}
