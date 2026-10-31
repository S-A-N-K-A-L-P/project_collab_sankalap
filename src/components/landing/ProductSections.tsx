"use client";

import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight, Ban, BookOpen, Boxes, Braces, Building2, Check, ChevronRight, Cpu, Download, FileCheck2,
  FileCode2, FolderLock, FolderTree, Globe, GraduationCap, HardDrive, HeartPulse, KeyRound, Laptop,
  Lock, Minus, Plug, Radar, Rocket, ScrollText, Server, ShieldCheck, Sparkles, TerminalSquare,
} from "lucide-react";
import { Eyebrow, Feature, Panel, Reveal, SectionHeading, WindowChrome } from "./primitives";

/* ─── Who is Madhyam for ────────────────────────────────────────────────── */

const AUDIENCES = [
  {
    icon: GraduationCap,
    tag: "Student · Individual builder",
    title: "From idea to MVP",
    body: "Submit a project idea, validate technical feasibility, compare it with existing solutions, generate a proposal, build an architecture and implement an MVP with a personal coding agent.",
    flow: ["Idea", "Feasibility", "Proposal", "Architecture", "MVP"],
    accent: "#10B981",
  },
  {
    icon: Rocket,
    tag: "Startup · Engineering team",
    title: "From proposal to release",
    body: "Founders and tech leads convert approved proposals into tasks, assign work to developers or agents, connect repositories, manage PRs and coordinate releases.",
    flow: ["Proposal", "Tasks", "Developers + agents", "PRs", "Release"],
    accent: "#4F46E5",
  },
  {
    icon: Building2,
    tag: "Enterprise · Engineering org",
    title: "From policy to governed delivery",
    body: "Senior engineering managers coordinate departments, projects, policies and distributed agent runners — with code-level visibility, audit trails and centralized governance.",
    flow: ["Departments", "Policies", "Agent fleet", "Audit", "Governance"],
    accent: "#2563EB",
  },
];

export function Audiences() {
  return (
    <section id="solutions" className="relative py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHeading
          center
          eyebrow="Who Madhyam is for"
          title={<>Three audiences. <span className="text-slate-500 dark:text-slate-400">One engineering intelligence platform.</span></>}
          lead="An AI-native platform that turns ideas into validated proposals, software architecture, coordinated agent execution and production-ready delivery."
        />
        <div className="mt-14 grid gap-6 lg:grid-cols-3">
          {AUDIENCES.map((a, i) => (
            <Reveal key={a.tag} delay={i * 0.08}>
              <Panel className="group h-full p-7 transition hover:-translate-y-1 hover:shadow-[0_30px_80px_-30px_rgba(15,23,42,0.3)]">
                <div className="absolute inset-x-0 top-0 h-1 rounded-t-2xl" style={{ background: a.accent }} />
                <div className="flex h-11 w-11 items-center justify-center rounded-xl" style={{ background: `${a.accent}14`, color: a.accent }}>
                  <a.icon className="h-5 w-5" />
                </div>
                <div className="mt-5 text-[11.5px] font-semibold uppercase tracking-[0.14em]" style={{ color: a.accent }}>{a.tag}</div>
                <h3 className="mt-2 text-[22px] font-semibold tracking-[-0.02em] text-slate-900 dark:text-white">{a.title}</h3>
                <p className="mt-3 text-[14.5px] leading-relaxed text-slate-600 dark:text-slate-400">{a.body}</p>
                <div className="mt-6 flex flex-wrap items-center gap-1.5">
                  {a.flow.map((f, k) => (
                    <span key={f} className="flex items-center gap-1.5">
                      <span className="rounded-md border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 px-2 py-1 text-[11.5px] font-medium text-slate-700 dark:text-slate-300">{f}</span>
                      {k < a.flow.length - 1 && <ChevronRight className="h-3 w-3 text-slate-400" />}
                    </span>
                  ))}
                </div>
              </Panel>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Senior manager / junior runner fleet ──────────────────────────────── */

const RUNNER_GROUPS = [
  { range: "Runner 01–03", role: "Coding agents", ids: ["01", "02", "03"], icon: FileCode2, c: "#4F46E5" },
  { range: "Runner 04–06", role: "Build & test agents", ids: ["04", "05", "06"], icon: TerminalSquare, c: "#2563EB" },
  { range: "Runner 07–08", role: "Review & security", ids: ["07", "08"], icon: ShieldCheck, c: "#7C5CFF" },
  { range: "Runner 09–10", role: "Docs & integration", ids: ["09", "10"], icon: BookOpen, c: "#10B981" },
];

export function AgentFleet() {
  return (
    <section id="agents" className="relative py-28">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-indigo-50/70 dark:via-indigo-500/[0.04] to-transparent" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHeading
          center
          eyebrow="Senior manager · Junior runners"
          title={<>A coordinated engineering workforce — <span className="text-slate-500 dark:text-slate-400">not ten independent chatbots.</span></>}
          lead="One senior manager agent plans, assigns and enforces policy. Junior runner PCs execute in parallel through a secure coordination service that tracks dependencies, heartbeats and every execution log."
        />

        <Reveal delay={0.1} className="mx-auto mt-14 max-w-5xl">
          {/* Senior */}
          <div className="mx-auto max-w-md">
            <Panel className="border-[#4F46E5]/40 p-5 text-center shadow-[0_20px_60px_-25px_rgba(79,70,229,0.5)]">
              <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-blue-600 text-white">
                <Sparkles className="h-5 w-5" />
              </div>
              <div className="mt-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-indigo-600 dark:text-indigo-400">PC 01 · Senior Manager Agent</div>
              <div className="mt-1 text-[13.5px] text-slate-600 dark:text-slate-400">Proposal decisions · task planning · assignment · oversight · approval policies</div>
            </Panel>
          </div>
          <div className="mx-auto h-8 w-px bg-gradient-to-b from-[#4F46E5] to-slate-300" />

          {/* Coordination service */}
          <Panel className="p-5">
            <div className="flex flex-col items-center gap-3 md:flex-row md:justify-between">
              <div className="flex items-center gap-2.5">
                <Server className="h-5 w-5 text-[#2563EB]" />
                <span className="text-[15px] font-semibold text-slate-900 dark:text-white">Madhyam Coordination Service</span>
              </div>
              <div className="flex flex-wrap justify-center gap-1.5">
                {["Secure task queue", "Agent registry", "Dependencies", "Heartbeats", "Execution logs", "Access control"].map((x) => (
                  <span key={x} className="rounded-md border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 px-2 py-1 text-[11.5px] font-medium text-slate-700 dark:text-slate-300">{x}</span>
                ))}
              </div>
            </div>
          </Panel>
          <div className="mx-auto h-8 w-px bg-slate-300 dark:bg-slate-700" />

          {/* Runners */}
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
            {RUNNER_GROUPS.map((g) => (
              <Panel key={g.range} className="p-4">
                <div className="flex items-center gap-2">
                  <g.icon className="h-4 w-4" style={{ color: g.c }} />
                  <span className="text-[12px] font-semibold uppercase tracking-[0.1em] text-slate-500 dark:text-slate-400">{g.range}</span>
                </div>
                <div className="mt-1.5 text-[14.5px] font-semibold text-slate-900 dark:text-white">{g.role}</div>
                <div className="mt-3 flex gap-1.5">
                  {g.ids.map((id, k) => (
                    <div key={id} className="flex flex-1 flex-col items-center rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 py-2">
                      <Laptop className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                      <span className="mt-1 font-mono text-[10.5px] text-slate-600 dark:text-slate-400">PC {id}</span>
                      <motion.span
                        className="mt-1 h-1.5 w-1.5 rounded-full"
                        style={{ background: g.c }}
                        animate={{ opacity: [1, 0.25, 1] }}
                        transition={{ duration: 1.6, repeat: Infinity, delay: k * 0.3 }}
                      />
                    </div>
                  ))}
                </div>
              </Panel>
            ))}
          </div>
        </Reveal>

        <div className="mx-auto mt-14 grid max-w-5xl gap-6 lg:grid-cols-2">
          <Reveal>
            <WindowChrome title="runner-05 · capability profile (auto-discovered)" className="h-full">
              <div className="grid grid-cols-2 gap-3 p-5 text-[12.5px]">
                {[
                  { icon: Boxes, k: "SDKs & runtimes", v: "Node 20 · Flutter 3.24 · Python 3.12 · JDK 21" },
                  { icon: Braces, k: "Compilers & tools", v: "tsc · dart · gcc 13 · docker · git" },
                  { icon: Cpu, k: "Compute", v: "8 cores · 32 GB RAM · 210 GB free" },
                  { icon: FolderTree, k: "Approved workspaces", v: "acme/api · acme/mobile" },
                ].map((r) => (
                  <div key={r.k} className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 p-3">
                    <div className="flex items-center gap-1.5 text-[10.5px] font-semibold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">
                      <r.icon className="h-3.5 w-3.5" /> {r.k}
                    </div>
                    <div className="mt-1.5 text-slate-800 dark:text-slate-200">{r.v}</div>
                  </div>
                ))}
                <div className="col-span-2 flex items-center gap-2 rounded-lg border border-[#10B981]/25 bg-[#10B981]/[0.07] px-3 py-2 text-[12px] text-emerald-700 dark:text-emerald-400">
                  <HeartPulse className="h-3.5 w-3.5" /> Heartbeat 4s ago · eligible for <span className="font-semibold">build &amp; test</span> jobs on acme/mobile
                </div>
              </div>
            </WindowChrome>
          </Reveal>
          <Reveal delay={0.08}>
            <Panel className="h-full p-6">
              <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-indigo-600 dark:text-indigo-400">
                <Lock className="h-3.5 w-3.5" /> Guardrails by default
              </div>
              <h3 className="mt-3 text-[20px] font-semibold tracking-[-0.02em] text-slate-900 dark:text-white">Runners execute only what policy allows.</h3>
              <ul className="mt-5 space-y-3.5 text-[14px] text-slate-600 dark:text-slate-400">
                {[
                  { icon: Ban, t: "No free software installs", d: "installation requires an explicit policy and approval." },
                  { icon: FolderLock, t: "File & path scoping", d: "agents read and write only inside allowed task globs." },
                  { icon: Globe, t: "Domain allow-lists", d: "no communication with unrestricted network destinations." },
                  { icon: HardDrive, t: "Sandboxed execution", d: "jobs run in isolated, approved repository workspaces." },
                  { icon: KeyRound, t: "Approval gates", d: "risky actions and merges wait for an authorized human." },
                ].map((g) => (
                  <li key={g.t} className="flex gap-3">
                    <g.icon className="mt-0.5 h-4 w-4 shrink-0 text-indigo-600 dark:text-indigo-400" />
                    <span><span className="font-semibold text-slate-900 dark:text-white">{g.t}</span> — {g.d}</span>
                  </li>
                ))}
              </ul>
            </Panel>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ─── Madhyam IDE + desktop agents ──────────────────────────────────────── */

const AGENTS = [
  { name: "Madhyam Agent", note: "Native", c: "#4F46E5" },
  { name: "Claude Code", note: "BYO agent", c: "#D97757" },
  { name: "Cursor", note: "BYO agent", c: "#334155" },
  { name: "GitHub Copilot", note: "BYO agent", c: "#2563EB" },
  { name: "OpenAI Codex", note: "BYO agent", c: "#0F172A" },
];

const TREE = [
  { d: 0, n: "acme-platform", t: "root" },
  { d: 1, n: "apps/mobile", t: "Flutter · Dart", c: "#2563EB" },
  { d: 1, n: "services/api", t: "Express · TS", c: "#4F46E5" },
  { d: 2, n: "auth/oauth.ts", t: "", active: true },
  { d: 1, n: "ml/ranker", t: "Python", c: "#B7791F" },
  { d: 1, n: "web/console", t: "Next.js", c: "#334155" },
  { d: 1, n: "infra", t: "Terraform", c: "#7C5CFF" },
];

export function MadhyamIDE() {
  const [agent, setAgent] = useState(0);
  return (
    <section id="ide" className="relative py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-end">
          <SectionHeading
            eyebrow="Madhyam IDE · Desktop agents"
            title={<>One IDE for every stack <span className="text-slate-500 dark:text-slate-400">your project spans.</span></>}
            lead="Madhyam IDE opens mobile, backend, ML and infrastructure code as one workspace. Run Madhyam's native agent — or bring the coding agent your team already uses — inside guarded, task-scoped sessions."
          />
          <Reveal className="flex flex-wrap gap-2">
            <Link href="/desktop" className="inline-flex items-center gap-2 rounded-xl bg-slate-900 dark:bg-white px-5 py-3 text-[14px] font-semibold text-white dark:text-slate-900 transition hover:bg-slate-800">
              <Download className="h-4 w-4" /> Download Madhyam IDE
            </Link>
            <span className="inline-flex items-center rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-4 py-3 text-[13px] text-slate-600 dark:text-slate-400">Windows · macOS · Linux</span>
          </Reveal>
        </div>

        <Reveal delay={0.1} className="mt-12">
          <WindowChrome title="Madhyam IDE — acme-platform (4 stacks · 3 repos)">
            <div className="grid min-h-[380px] gap-px bg-slate-200 dark:bg-slate-800 lg:grid-cols-[220px_1fr_300px]">
              {/* Explorer */}
              <div className="hidden bg-slate-50 dark:bg-slate-900 p-3 lg:block">
                <div className="px-1 text-[10.5px] font-semibold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">Explorer</div>
                <div className="mt-2 space-y-0.5 font-mono text-[12px]">
                  {TREE.map((f) => (
                    <div
                      key={f.n}
                      className={`flex items-center justify-between rounded px-1.5 py-1 ${f.active ? "bg-[#6366F1]/12 text-slate-900 dark:text-white" : "text-slate-600 dark:text-slate-400"}`}
                      style={{ paddingLeft: 6 + f.d * 12 }}
                    >
                      <span className="truncate">{f.n}</span>
                      {f.t && f.t !== "root" && (
                        <span className="ml-1 shrink-0 rounded px-1 text-[9.5px] font-sans font-semibold" style={{ color: f.c, background: `${f.c}14` }}>{f.t}</span>
                      )}
                    </div>
                  ))}
                </div>
                <div className="mt-4 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-2.5 text-[11px] text-slate-600 dark:text-slate-400">
                  <div className="flex items-center gap-1.5 font-semibold text-slate-800 dark:text-slate-200"><Radar className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" /> AST index</div>
                  <div className="mt-1">12,480 symbols · 3 repos · cross-stack refs resolved</div>
                </div>
              </div>

              {/* Editor */}
              <div className="flex flex-col bg-white dark:bg-slate-950">
                <div className="flex border-b border-slate-200 dark:border-slate-800 text-[11.5px]">
                  <span className="border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-3 py-2 font-medium text-slate-900 dark:text-white">oauth.ts</span>
                  <span className="border-r border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 px-3 py-2 text-slate-500 dark:text-slate-400">sign_in_screen.dart</span>
                  <span className="hidden bg-slate-50 dark:bg-slate-900 px-3 py-2 text-slate-500 dark:text-slate-400 sm:block">contract.yaml</span>
                </div>
                <div className="flex-1 overflow-x-auto p-4 font-mono text-[12px] leading-[1.9] text-slate-700 dark:text-slate-300">
                  {[
                    <><span className="text-[#7C5CFF]">export async function</span> <span className="text-[#2563EB]">exchangeToken</span>(code: <span className="text-[#4F46E5]">string</span>) {"{"}</>,
                    <>{"  "}<span className="text-[#7C5CFF]">const</span> res = <span className="text-[#7C5CFF]">await</span> provider.<span className="text-[#2563EB]">token</span>({"{ code }"});</>,
                    <>{"  "}<span className="text-slate-400">{"// ⟶ used by apps/mobile/lib/auth/sign_in_screen.dart:41"}</span></>,
                    <>{"  "}<span className="text-[#7C5CFF]">return</span> <span className="text-[#2563EB]">issueSession</span>(res.idToken);</>,
                    <>{"}"}</>,
                  ].map((line, i) => (
                    <div key={i} className={`flex whitespace-pre ${i === 2 ? "-mx-4 bg-[#6366F1]/10 px-4" : ""}`}>
                      <span className="mr-4 w-4 select-none text-right text-slate-400">{i + 1}</span>
                      <span>{line}</span>
                    </div>
                  ))}
                </div>
                <div className="border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 px-4 py-2.5 font-mono text-[11px] text-slate-600 dark:text-slate-400">
                  <span className="text-emerald-700 dark:text-emerald-400">✓ lint</span> · <span className="text-emerald-700 dark:text-emerald-400">✓ unit 48/48</span> · <span className="text-emerald-700 dark:text-emerald-400">✓ contract</span> · <span className="text-amber-600 dark:text-amber-400">◌ senior review pending</span>
                </div>
              </div>

              {/* Agent panel */}
              <div className="bg-slate-50 dark:bg-slate-900 p-4">
                <div className="text-[10.5px] font-semibold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">Agent</div>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {AGENTS.map((a, i) => (
                    <button
                      key={a.name}
                      onClick={() => setAgent(i)}
                      className={`rounded-md border px-2 py-1 text-[11px] font-semibold transition ${
                        agent === i ? "border-transparent text-white" : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700"
                      }`}
                      style={agent === i ? { background: a.c } : undefined}
                    >
                      {a.name}
                    </button>
                  ))}
                </div>
                <div className="mt-4 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-3 text-[12px]">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-900 dark:text-white">Task · OAuth token exchange</span>
                    <span className="rounded bg-[#6366F1]/12 px-1.5 text-[10px] font-semibold text-indigo-600 dark:text-indigo-400">{AGENTS[agent].note}</span>
                  </div>
                  <div className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">Running on <span className="font-medium text-slate-700 dark:text-slate-300">{AGENTS[agent].name}</span> · scope <span className="font-mono">services/api/auth/**</span></div>
                  <ol className="mt-3 space-y-1.5 text-slate-600 dark:text-slate-400">
                    {["Read acceptance criteria", "Edit oauth.ts", "Run tests + contract", "Open PR #412"].map((s, i) => (
                      <li key={s} className="flex items-center gap-2">
                        <span className={`flex h-4 w-4 items-center justify-center rounded-full text-[9px] ${i < 3 ? "bg-[#10B981] text-white" : "border border-slate-300 dark:border-slate-700 text-slate-400"}`}>
                          {i < 3 ? <Check className="h-2.5 w-2.5" /> : i + 1}
                        </span>
                        {s}
                      </li>
                    ))}
                  </ol>
                </div>
                <div className="mt-3 flex items-center gap-2 rounded-lg border border-[#B7791F]/25 bg-[#B7791F]/[0.06] px-3 py-2 text-[11px] text-amber-700 dark:text-amber-300">
                  <Lock className="h-3.5 w-3.5 shrink-0" /> Write to <span className="font-mono">infra/**</span> blocked by task policy
                </div>
              </div>
            </div>
          </WindowChrome>
        </Reveal>

        <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <Feature icon={<Boxes className="h-4 w-4" />} title="Cross multi-stack projects">Flutter, Express, Python, Next.js and Terraform in one workspace with shared task context.</Feature>
          <Feature icon={<Radar className="h-4 w-4" />} title="AST project intelligence">A symbol graph across repositories, so agents see who calls what before they change it.</Feature>
          <Feature icon={<Plug className="h-4 w-4" />} title="Bring your own agent">Run Madhyam Agent or connect Claude Code, Cursor, Copilot or Codex as task-scoped runners.</Feature>
          <Feature icon={<ShieldCheck className="h-4 w-4" />} title="Verify & complete gates">Lint, tests and contract checks must pass before the IDE can open a pull request.</Feature>
        </div>
        <p className="mt-8 text-[12px] text-slate-500 dark:text-slate-400">
          Third-party agent integrations are planned capabilities. Claude Code, Cursor, GitHub Copilot and OpenAI Codex are trademarks of their respective owners.
        </p>
      </div>
    </section>
  );
}

/* ─── Enterprise documentation + connectors ─────────────────────────────── */

const CONNECTORS: { n: string; c: string; live?: boolean }[] = [
  { n: "GitHub", c: "#0F172A", live: true },
  { n: "GitLab", c: "#E2432A" },
  { n: "Bitbucket", c: "#2684FF" },
  { n: "Azure DevOps", c: "#0078D4" },
  { n: "Jira", c: "#2684FF" },
  { n: "Linear", c: "#5E6AD2" },
  { n: "Slack", c: "#611F69" },
  { n: "Microsoft Teams", c: "#5059C9" },
  { n: "Confluence", c: "#1868DB" },
  { n: "Notion", c: "#0F172A" },
  { n: "Google Drive", c: "#1FA463" },
  { n: "SharePoint", c: "#038387" },
  { n: "Figma", c: "#A259FF" },
  { n: "Jenkins", c: "#D33833" },
  { n: "Sentry", c: "#362D59" },
  { n: "PagerDuty", c: "#06AC38" },
  { n: "AWS", c: "#FF9900" },
  { n: "Datadog", c: "#632CA6" },
];

export function DocsConnectors() {
  return (
    <section id="docs" className="relative py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHeading
          center
          eyebrow="Smart document writer · Connectors"
          title={<>Documentation that stays <span className="bg-gradient-to-r from-indigo-600 to-blue-600 dark:from-indigo-400 dark:to-blue-400 bg-clip-text text-transparent">in sync with the code.</span></>}
          lead="Madhyam drafts proposals, architecture records, API references and release notes from the workflow graph and merged PRs — then routes them through the same approval chain as the code."
        />

        <div className="mt-14 grid gap-6 lg:grid-cols-[1.1fr_1fr]">
          <Reveal>
            <WindowChrome title="Docs · Technical design — OAuth login" className="h-full">
              <div className="p-6">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-md bg-[#10B981]/10 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">Approved · v1.2</span>
                  <span className="rounded-md bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-[11px] font-medium text-slate-600 dark:text-slate-400">Controlled document</span>
                  <span className="rounded-md bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-[11px] font-medium text-slate-600 dark:text-slate-400">Owner: Platform team</span>
                </div>
                <h3 className="mt-4 text-[20px] font-semibold tracking-[-0.02em] text-slate-900 dark:text-white">OAuth login — technical design</h3>
                <div className="mt-4 space-y-3 text-[13px]">
                  {[
                    { s: "1. Context & goals", src: "from proposal P-118" },
                    { s: "2. Architecture & sequence", src: "from workflow graph v3" },
                    { s: "3. API contract", src: "synced from contract.yaml" },
                    { s: "4. Security review", src: "from runner-07 findings" },
                    { s: "5. Release notes", src: "auto-updated from PR #412, #87" },
                  ].map((r) => (
                    <div key={r.s} className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 px-3 py-2.5">
                      <span className="font-medium text-slate-800 dark:text-slate-200">{r.s}</span>
                      <span className="flex items-center gap-1 text-[11.5px] text-indigo-600 dark:text-indigo-400"><Sparkles className="h-3 w-3" /> {r.src}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-5 flex flex-wrap items-center gap-2 text-[11.5px] text-slate-500 dark:text-slate-400">
                  <ScrollText className="h-3.5 w-3.5" /> Audit: drafted by Madhyam · reviewed by K. Rao · approved by Eng Manager
                  <span className="ml-auto flex gap-1.5">
                    {["PDF", "DOCX", "Confluence"].map((x) => (
                      <span key={x} className="rounded border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-1.5 py-0.5 font-medium text-slate-600 dark:text-slate-400">{x}</span>
                    ))}
                  </span>
                </div>
              </div>
            </WindowChrome>
          </Reveal>

          <Reveal delay={0.08}>
            <Panel className="h-full p-6">
              <div className="grid grid-cols-2 gap-3 text-[13px]">
                {[
                  { icon: FileCheck2, t: "PRDs & proposals" },
                  { icon: Boxes, t: "Architecture / ADRs" },
                  { icon: Braces, t: "API references" },
                  { icon: BookOpen, t: "Runbooks & onboarding" },
                  { icon: ScrollText, t: "Release notes" },
                  { icon: ShieldCheck, t: "Compliance evidence" },
                ].map((d) => (
                  <div key={d.t} className="flex items-center gap-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 px-3 py-2.5 font-medium text-slate-800 dark:text-slate-200">
                    <d.icon className="h-4 w-4 text-indigo-600 dark:text-indigo-400" /> {d.t}
                  </div>
                ))}
              </div>
              <div className="mt-7 flex items-center justify-between">
                <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
                  <Plug className="h-3.5 w-3.5" /> Connectors
                </div>
                <div className="flex gap-3 text-[11px] text-slate-500 dark:text-slate-400">
                  <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-[#10B981]" /> Live</span>
                  <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-slate-300 dark:bg-slate-700" /> Planned</span>
                </div>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
                {CONNECTORS.map((c) => (
                  <div key={c.n} className="flex items-center gap-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-2 py-2">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-[10px] font-bold text-white" style={{ background: c.c }}>
                      {c.n.split(" ").map((w) => w[0]).join("").slice(0, 2)}
                    </span>
                    <span className="truncate text-[11.5px] font-medium text-slate-700 dark:text-slate-300">{c.n}</span>
                    <span className={`ml-auto h-1.5 w-1.5 shrink-0 rounded-full ${c.live ? "bg-[#10B981]" : "bg-slate-300 dark:bg-slate-700"}`} />
                  </div>
                ))}
              </div>
            </Panel>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ─── Pricing ───────────────────────────────────────────────────────────── */

// Indicative launch pricing — proposed packaging, edit here when plans are finalized.
const PLANS = [
  {
    name: "Student",
    icon: GraduationCap,
    monthly: 0,
    annual: 0,
    unit: "free for verified students",
    blurb: "Validate an idea and ship an MVP with your own coding agent.",
    cta: "Start free",
    href: "/register",
    points: ["Idea & proposal validation", "AI architecture planning", "1 personal coding agent", "Personal GitHub repos", "1 local runner PC"],
  },
  {
    name: "Startup",
    icon: Rocket,
    monthly: 29,
    annual: 24,
    unit: "per seat / month",
    blurb: "Turn approved proposals into coordinated team delivery.",
    cta: "Start 14-day trial",
    href: "/register",
    featured: true,
    points: ["Everything in Student", "Multiple coding agents", "Team repos & PR command center", "Configurable runner fleet", "Tech-lead approval workflows", "Delivery analytics"],
  },
  {
    name: "Enterprise",
    icon: Building2,
    monthly: null,
    annual: null,
    unit: "annual contract",
    blurb: "Governed, distributed agent execution across your organization.",
    cta: "Talk to sales",
    href: "#demo",
    points: ["Everything in Startup", "Organization-wide agents", "10+ scalable runner PCs", "Multi-level governance & audit", "Centralized security policies", "SSO, controlled docs & connectors"],
  },
];

type Cell = string | boolean;
const TIER_ROWS: [string, Cell, Cell, Cell][] = [
  ["Idea and proposal validation", true, true, true],
  ["AI architecture planning", true, true, true],
  ["Personal coding agent", "1", "Multiple", "Organization-wide"],
  ["GitHub integration", "Personal repos", "Team repos", "Multi-org repos"],
  ["AST project intelligence", "Personal projects", "Cross-project", "Organization-wide"],
  ["Agent orchestration", "Local", "Team-level", "Distributed fleet"],
  ["Junior runner PCs", "1 local", "Configurable", "10+ scalable"],
  ["Smart document writer", "Project docs", "Product / technical docs", "Controlled enterprise docs"],
  ["AI task assignment", "Personal", "Team", "Role / policy-based"],
  ["Approval workflows", "Self-review", "Tech lead", "Multi-level governance"],
  ["File and domain restrictions", "Basic", "Team policies", "Centralized security"],
  ["Analytics", "Personal progress", "Delivery analytics", "Cross-team intelligence"],
];

function CellView({ v }: { v: Cell }) {
  if (v === true) return <Check className="mx-auto h-4 w-4 text-[#10B981]" />;
  if (v === false) return <Minus className="mx-auto h-4 w-4 text-slate-300" />;
  return <span>{v}</span>;
}

export function Pricing() {
  const [annual, setAnnual] = useState(true);
  return (
    <section id="pricing" className="relative py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHeading
          center
          eyebrow="Pricing"
          title={<>Start as a builder. <span className="text-slate-500 dark:text-slate-400">Scale to an engineering org.</span></>}
          lead="Same engineering intelligence on every plan — tiers differ in agents, runners, governance and scale."
        />

        <Reveal className="mt-10 flex justify-center">
          <div className="inline-flex rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-1 text-[13px] font-semibold">
            {[false, true].map((a) => (
              <button
                key={String(a)}
                onClick={() => setAnnual(a)}
                className={`rounded-lg px-4 py-2 transition ${annual === a ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900" : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"}`}
              >
                {a ? "Annual" : "Monthly"}
                {a && <span className={`ml-2 rounded px-1.5 py-0.5 text-[10px] ${annual ? "bg-white/15" : "bg-[#6366F1]/12 text-indigo-600 dark:text-indigo-400"}`}>Save 17%</span>}
              </button>
            ))}
          </div>
        </Reveal>

        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          {PLANS.map((p, i) => {
            const price = annual ? p.annual : p.monthly;
            return (
              <Reveal key={p.name} delay={i * 0.08}>
                <div
                  className={`relative flex h-full flex-col rounded-2xl border bg-white dark:bg-slate-950 p-7 ${
                    p.featured ? "border-[#4F46E5] shadow-[0_30px_80px_-30px_rgba(79,70,229,0.55)]" : "border-slate-200 dark:border-slate-800 shadow-[0_20px_60px_-30px_rgba(15,23,42,0.18)]"
                  }`}
                >
                  {p.featured && (
                    <span className="absolute -top-3 left-7 rounded-full bg-gradient-to-r from-indigo-600 to-blue-600 dark:from-indigo-400 dark:to-blue-400 px-3 py-1 text-[11px] font-semibold text-white">
                      Most popular
                    </span>
                  )}
                  <div className="flex items-center gap-2.5">
                    <p.icon className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                    <span className="text-[18px] font-semibold text-slate-900 dark:text-white">{p.name}</span>
                  </div>
                  <p className="mt-2 text-[14px] text-slate-600 dark:text-slate-400">{p.blurb}</p>
                  <div className="mt-6 flex items-end gap-1.5">
                    <span className="text-[44px] font-semibold leading-none tracking-[-0.03em] text-slate-900 dark:text-white">
                      {price === null ? "Custom" : price === 0 ? "$0" : `$${price}`}
                    </span>
                  </div>
                  <div className="mt-2 text-[12.5px] text-slate-500 dark:text-slate-400">{p.unit}{price && annual ? ", billed annually" : ""}</div>
                  <Link
                    href={p.href}
                    className={`mt-6 inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-[14px] font-semibold transition ${
                      p.featured
                        ? "bg-gradient-to-r from-indigo-600 to-blue-600 text-white hover:brightness-110"
                        : "border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-900"
                    }`}
                  >
                    {p.cta} <ArrowRight className="h-4 w-4" />
                  </Link>
                  <ul className="mt-7 space-y-2.5 text-[14px] text-slate-700 dark:text-slate-300">
                    {p.points.map((x) => (
                      <li key={x} className="flex gap-2.5">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#4F46E5]" /> {x}
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            );
          })}
        </div>

        <Reveal delay={0.1} className="mt-16">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-[18px] font-semibold text-slate-900 dark:text-white">Compare plans</h3>
            <Eyebrow>Proposed packaging</Eyebrow>
          </div>
          <Panel className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-[13.5px]">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-[12px] uppercase tracking-[0.1em] text-slate-500 dark:text-slate-400">
                  <th className="px-5 py-4 font-semibold">Capability</th>
                  <th className="px-4 py-4 text-center font-semibold">Student</th>
                  <th className="bg-[#6366F1]/[0.06] px-4 py-4 text-center font-semibold text-indigo-600 dark:text-indigo-400">Startup</th>
                  <th className="px-4 py-4 text-center font-semibold">Enterprise</th>
                </tr>
              </thead>
              <tbody>
                {TIER_ROWS.map(([cap, s, t, e]) => (
                  <tr key={cap} className="border-b border-slate-100 dark:border-slate-800/60 last:border-0">
                    <td className="px-5 py-3.5 font-medium text-slate-800 dark:text-slate-200">{cap}</td>
                    <td className="px-4 py-3.5 text-center text-slate-600 dark:text-slate-400"><CellView v={s} /></td>
                    <td className="bg-[#6366F1]/[0.06] px-4 py-3.5 text-center text-slate-700 dark:text-slate-300"><CellView v={t} /></td>
                    <td className="px-4 py-3.5 text-center text-slate-600 dark:text-slate-400"><CellView v={e} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Panel>
          <p className="mt-4 text-center text-[12px] text-slate-500 dark:text-slate-400">
            Indicative launch pricing in USD. Packaging and prices are proposed and subject to change before general availability.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
