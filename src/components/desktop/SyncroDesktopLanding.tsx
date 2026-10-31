"use client";

import {
  Download, Zap, Bot, FolderGit2, TerminalSquare, Radar, Braces,
  Cable, Play, Network, Rss, Cpu, ShieldCheck, Sparkles, MonitorDown,
  CheckCircle2, ArrowRight,
} from "lucide-react";

const DOWNLOAD_URL =
  "https://drive.google.com/file/d/1_TGpFcbk50EXtMTTcDZD1SHFlyxDc70G/view?usp=sharing";

const STATS = [
  { value: "10+",     label: "Built-in dev tools" },
  { value: ".NET 9",  label: "MAUI + Blazor Hybrid" },
  { value: "5",       label: "Runtimes auto-detected" },
  { value: "1-Click", label: "Full-stack orchestration" },
];

const FEATURES = [
  { Icon: Bot,            color: "#6257E8", title: "AI Dev Agent",          desc: "Groq-powered coding assistant that reads your workspace, drafts methodologies, and scopes tasks automatically." },
  { Icon: FolderGit2,     color: "#20B981", title: "Project Scaffolding",   desc: "Spin up multi-stack projects from templates — Mongo, Postgres, Flask, Spring, Next.js, Vite — in seconds." },
  { Icon: TerminalSquare, color: "#6257E8", title: "Syncro CLI",            desc: "A unified command orchestrator with a smart parser and router for every dev operation." },
  { Icon: Radar,          color: "#F59E0B", title: "Environment Detection", desc: "Auto-detects your Node, Python, Java, .NET and Flutter installs so nothing is left to guesswork." },
  { Icon: Braces,         color: "#9A8AEF", title: "AST Engine",            desc: "Multi-language code parsing, configuration analysis and dependency mapping across your whole repo." },
  { Icon: Cable,          color: "#0D9488", title: "Connector Workbench",   desc: "Maps frontend API calls to backend routes and generates the missing contract — zero manual glue." },
  { Icon: Play,           color: "#20B981", title: "Runtime Orchestration", desc: "Run entire multi-project stacks with one click, with continuous health checks and live status." },
  { Icon: Network,        color: "#6257E8", title: "Universe Graph",        desc: "A living knowledge graph of your workspace — every service, route, and dependency, connected." },
  { Icon: Rss,            color: "#F59E0B", title: "Platform Sync",         desc: "Feed, proposals, marketplace and your portfolio from Madhyam AI — right inside the app." },
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
    <div className="min-h-full bg-background text-foreground space-y-10 pb-12">
      {/* ── HERO ──────────────────────────────────────────── */}
      <section className="saas-card-featured p-8 sm:p-12 text-center relative overflow-hidden">
        <div className="relative max-w-3xl mx-auto">
          {/* Logo mark */}
          <div
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-5"
            style={{
              background: "linear-gradient(135deg, #6257E8 0%, #9A8AEF 100%)",
              boxShadow: "0 8px 24px -4px rgba(98, 87, 232, 0.40)",
            }}
          >
            <Zap className="w-8 h-8 text-white" fill="white" />
          </div>

          <div className=" block mb-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-primary/15 bg-primary-light text-xs font-semibold text-primary">
              <Sparkles className="w-3.5 h-3.5" /> Native Windows Desktop Workstation
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-foreground mb-3">
            Syncro <span className="text-primary">Desktop</span>
          </h1>
          <p className="text-sm sm:text-base text-muted max-w-2xl mx-auto mb-7 leading-relaxed">
            The technical developer cockpit for the Madhyam AI ecosystem — AI agent,
            project scaffolding, Git automation, and full-stack runtime orchestration in a single native client.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <a
              href={DOWNLOAD_URL}
              target="_blank"
              rel="noreferrer"
              className="group inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary hover:bg-primary-hover text-white font-semibold text-sm shadow-[0_4px_14px_-2px_rgba(98,87,232,0.45)] transition-all"
            >
              <Download className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" />
              Download for Windows
            </a>
            <a
              href="#features"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl border border-border bg-card font-semibold text-sm text-foreground hover:border-primary/35 transition-all"
            >
              Explore Capabilities <ArrowRight className="w-4 h-4 text-primary" />
            </a>
          </div>

          <p className="mt-4 text-xs text-muted flex items-center justify-center gap-1.5">
            <MonitorDown className="w-3.5 h-3.5 text-primary" /> For Windows 10 &amp; 11 · Free for community builders
          </p>
        </div>

        {/* Stats bar */}
        <div className="relative max-w-4xl mx-auto mt-10 pt-8 border-t border-primary/10">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
            {STATS.map((s) => (
              <div key={s.label} className="saas-card p-4 text-center">
                <p className="text-xl font-bold text-primary tabular-nums">{s.value}</p>
                <p className="text-xs font-medium text-muted mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ──────────────────────────────────────── */}
      <section id="features" className="max-w-6xl mx-auto space-y-6">
        <div className="text-center space-y-1.5">
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Operational Architecture &amp; Tooling</h2>
          <p className="text-sm text-muted max-w-xl mx-auto">
            Syncro Desktop folds your local engineering workflow and the Madhyam AI platform into one unified interface.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map(({ Icon, color, title, desc }) => (
            <div
              key={title}
              className="group saas-card p-5 transition-all hover:border-primary/35 hover:shadow-[var(--shadow-md)]"
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center mb-3.5"
                style={{ background: `${color}15`, border: `1px solid ${color}28` }}
              >
                <Icon className="w-5 h-5" style={{ color }} />
              </div>
              <h3 className="text-sm font-bold text-foreground mb-1">{title}</h3>
              <p className="text-xs text-muted leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── TECH STACK ────────────────────────────────────── */}
      <section className="max-w-4xl mx-auto">
        <div className="saas-card p-6 text-center space-y-3">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary uppercase tracking-wider">
            <Cpu className="w-3.5 h-3.5" /> Core Runtime Stack
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2">
            {TECH.map((t) => (
              <span key={t} className="px-3 py-1 rounded-full bg-primary-light border border-primary/15 text-xs font-semibold text-primary">
                {t}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── DOWNLOAD + REQUIREMENTS ───────────────────────── */}
      <section className="max-w-5xl mx-auto">
        <div className="saas-card-featured p-6 sm:p-8">
          <div className="grid md:grid-cols-2 gap-6 items-center">
            <div className="space-y-3">
              <h2 className="text-2xl font-bold tracking-tight text-foreground">Ready to build faster?</h2>
              <p className="text-sm text-muted leading-relaxed">
                Download Syncro Desktop and get the AI agent, project scaffolding, and full-stack
                orchestration running on your machine in minutes.
              </p>
              <div className="pt-1">
                <a
                  href={DOWNLOAD_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white font-semibold text-sm shadow-[0_3px_12px_-2px_rgba(98,87,232,0.42)] transition-all"
                >
                  <Download className="w-4 h-4" />
                  Download Installer
                </a>
              </div>
              <p className="text-xs text-muted flex items-center gap-1.5 pt-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> Verified release · opens in a new tab
              </p>
            </div>

            <div className="saas-card p-5">
              <p className="text-xs font-bold uppercase tracking-wider text-muted mb-3">System Requirements</p>
              <ul className="space-y-2">
                {REQUIREMENTS.map((r) => (
                  <li key={r} className="flex items-start gap-2.5 text-xs text-foreground">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    {r}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
