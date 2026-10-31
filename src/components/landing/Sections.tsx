"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Activity, AlertTriangle, ArrowRight, Bell, Bot, CalendarClock, Check, CheckCircle2, Clock, Eye,
  FileText, GitBranch, GitMerge, GitPullRequest, Inbox, LayoutDashboard, Lightbulb, ListChecks,
  MessageSquareText, Monitor, Network, Play, ShieldCheck, Smartphone, Sparkles, Users, Workflow,
} from "lucide-react";
import { Feature, Panel, Reveal, SectionHeading, WindowChrome } from "./primitives";

/* ─── Value strip ───────────────────────────────────────────────────────── */

export function ValueStrip() {
  const items = [
    { icon: LayoutDashboard, t: "Unified execution context", d: "Proposals, workflows, owners, PRs and milestones across connected tools." },
    { icon: MessageSquareText, t: "Natural-language control", d: "Describe what your team should build instead of hand-assembling every task." },
    { icon: ShieldCheck, t: "Human-governed automation", d: "AI recommends and coordinates; authorized reviewers approve sensitive changes." },
    { icon: Eye, t: "End-to-end visibility", d: "Follow a proposal from kickoff to merged PR and scheduled release." },
  ];
  return (
    <section className="relative border-y border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
      <div className="mx-auto grid max-w-7xl gap-px px-4 sm:grid-cols-2 sm:px-6 lg:grid-cols-4">
        {items.map((it, i) => (
          <Reveal key={it.t} delay={i * 0.06} className="px-2 py-10 sm:px-6">
            <it.icon className="h-5 w-5 text-[#6366F1]" />
            <h3 className="mt-4 text-[15px] font-semibold text-slate-900 dark:text-white">{it.t}</h3>
            <p className="mt-1.5 text-[14px] leading-relaxed text-slate-600 dark:text-slate-400">{it.d}</p>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

/* ─── Workflow Studio (Proposal → NLP → graph) ──────────────────────────── */

const PIPELINE: (string | string[])[] = [
  "Proposal", "Intent extraction", "Graph validation", ["Backend API", "Flutter UI"],
  "Contract verification", "GitHub PRs", "Senior review", "CI checks", "Merge gate", "Release schedule",
];

function PipelineGraph() {
  const [active, setActive] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setActive((a) => (a + 1) % (PIPELINE.length + 2)), 900);
    return () => clearInterval(t);
  }, []);
  const cls = (o: boolean) =>
    `rounded-lg border px-3 py-2 text-[12px] font-medium whitespace-nowrap transition-all duration-500 ${
      o ? "border-[#6366F1]/50 bg-[#6366F1]/12 text-slate-900 dark:text-white shadow-[0_0_24px_-8px_rgba(99,102,241,0.8)]" : "border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-500 dark:text-slate-400"
    }`;
  // Three lanes keep the graph readable without dangling connectors at wrap points.
  const rows = [[0, 1, 2, 3], [4, 5, 6], [7, 8, 9]];
  return (
    <div className="space-y-3">
      {rows.map((row, r) => (
        <div key={r} className="flex flex-wrap items-center gap-y-2">
          <span className="mr-2 w-5 font-mono text-[10px] text-slate-500 dark:text-slate-400">{r === 0 ? "▸" : "↳"}</span>
          {row.map((i, k) => {
            const step = PIPELINE[i];
            const on = i <= active;
            return (
              <div key={i} className="flex items-center">
                {Array.isArray(step) ? (
                  <div className="flex flex-col gap-1.5">
                    {step.map((s) => (
                      <div key={s} className={cls(on)}>
                        {s} <span className="ml-1 text-[10px] text-indigo-600/80 dark:text-indigo-400/80">∥</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className={cls(on)}>{step}</div>
                )}
                {k < row.length - 1 && (
                  <div className={`mx-1.5 h-px w-4 transition-colors duration-500 ${i < active ? "bg-[#6366F1]" : "bg-slate-200 dark:bg-slate-800"}`} />
                )}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}

export function WorkflowStudio() {
  return (
    <section id="workflow-studio" className="relative py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHeading
          eyebrow="Proposal Initiator · NLP Workflow Designer"
          title={<>Describe the outcome.<br /><span className="text-slate-500 dark:text-slate-400">The AI structures the work.</span></>}
          lead="An engineering manager submits a proposal in plain English. The NLP agent extracts deliverables, roles, dependencies, deadlines, test requirements and approval gates — then produces a structured workflow graph for review."
        />

        <div className="mt-14 grid gap-6 lg:grid-cols-[1fr_1.25fr]">
          <Reveal>
            <WindowChrome title="Prompt composer" className="h-full">
              <div className="p-5">
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-600 to-blue-600 text-[11px] font-bold text-[#0B1220]">EM</div>
                  <p className="rounded-xl rounded-tl-sm border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 p-4 text-[14px] leading-relaxed text-slate-700 dark:text-slate-300">
                    “Build OAuth login for our Flutter and Express application. Assign backend and mobile work in parallel,
                    verify API contracts, require senior engineer PR review, run automated tests and schedule release after approval.”
                  </p>
                </div>
                <div className="mt-5 grid grid-cols-2 gap-2 text-[12px]">
                  {[
                    ["Deliverables", "OAuth API · Sign-in UI"],
                    ["Roles", "Backend · Mobile · Senior reviewer"],
                    ["Dependencies", "API contract → merge"],
                    ["Gates", "PR review · CI · Release"],
                  ].map(([k, v]) => (
                    <div key={k} className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 p-3">
                      <div className="text-[10.5px] font-semibold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">{k}</div>
                      <div className="mt-1 text-slate-800 dark:text-slate-200">{v}</div>
                    </div>
                  ))}
                </div>
                <div className="mt-5 flex gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-800 px-3 py-2 text-[12px] font-semibold text-slate-700 dark:text-slate-300"><Play className="h-3.5 w-3.5" /> Simulate</span>
                  <span className="inline-flex items-center gap-1.5 rounded-lg bg-[#6366F1] px-3 py-2 text-[12px] font-semibold text-[#0B1220]"><Check className="h-3.5 w-3.5" /> Publish</span>
                </div>
              </div>
            </WindowChrome>
          </Reveal>

          <Reveal delay={0.1}>
            <WindowChrome title="Workflow canvas · generated (illustrative)" className="h-full">
              <div className="p-5">
                <PipelineGraph />
                <div className="mt-6 grid gap-2 sm:grid-cols-3">
                  {[
                    { t: "No cycles detected", ok: true },
                    { t: "All tasks have owners", ok: true },
                    { t: "Release depends on merge gate", ok: true },
                  ].map((v) => (
                    <div key={v.t} className="flex items-center gap-2 rounded-lg border border-[#10B981]/20 bg-[#10B981]/[0.06] px-3 py-2 text-[12px] text-emerald-700 dark:text-emerald-400">
                      <CheckCircle2 className="h-3.5 w-3.5 shrink-0" /> {v.t}
                    </div>
                  ))}
                </div>
              </div>
            </WindowChrome>
          </Reveal>
        </div>

        <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <Feature icon={<FileText className="h-4 w-4" />} title="Proposal Initiator">Captures objective, scope, priority, repository and due date.</Feature>
          <Feature icon={<Sparkles className="h-4 w-4" />} title="NLP-to-Workflow Agent">Compiles instructions into an editable dependency graph with explicit tasks and decisions.</Feature>
          <Feature icon={<ListChecks className="h-4 w-4" />} title="Validation & Simulation">Checks cycles, missing owners, invalid steps and unreachable nodes before publication.</Feature>
          <Feature icon={<ShieldCheck className="h-4 w-4" />} title="Proposal Governance">Tech leads review, adjust, version and approve workflows before activation.</Feature>
        </div>
      </div>
    </section>
  );
}

/* ─── Task assignment & orchestration ───────────────────────────────────── */

const TEAM = [
  { n: "Aarav", r: "Backend", load: 62, task: "OAuth token exchange", st: "In progress", c: "#6366F1" },
  { n: "Meera", r: "Mobile", load: 48, task: "Flutter sign-in UI", st: "In progress", c: "#2563EB" },
  { n: "Kabir", r: "Senior reviewer", load: 85, task: "Review #412, #87", st: "Review", c: "#93C5FD" },
  { n: "Isha", r: "QA", load: 30, task: "Contract tests", st: "Blocked", c: "#F5B454" },
];

export function Assignment() {
  return (
    <section id="how-it-works" className="relative py-28">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-slate-300 to-transparent" />
      <div className="mx-auto grid max-w-7xl items-center gap-14 px-4 sm:px-6 lg:grid-cols-2">
        <div>
          <SectionHeading
            eyebrow="AI Task Assignment · Orchestration"
            title={<>The right developer. The right task. <span className="text-slate-500 dark:text-slate-400">The right moment.</span></>}
            lead="Madhyam recommends ownership from repository context, skills, availability, workload and dependencies. Leads accept or override; agents coordinate approved automation steps."
          />
          <div className="mt-10 space-y-6">
            <Feature icon={<Users className="h-4 w-4" />} title="AI Task Assigner">Proposes engineer, reviewer, priority and planned completion date.</Feature>
            <Feature icon={<Network className="h-4 w-4" />} title="Dependency intelligence">Tasks unblock only once prerequisite PRs, tests or reviews are satisfied.</Feature>
            <Feature icon={<Bot className="h-4 w-4" />} title="Coding-agent handoff">Objectives, acceptance criteria and repo context carry into a guarded coding-agent session — then changes, tests and PR status return to the same workflow.</Feature>
            <Feature icon={<ShieldCheck className="h-4 w-4" />} title="Manager approval gate">Review task proposals, risky actions and milestones with a full audit trail.</Feature>
          </div>
        </div>

        <Reveal delay={0.1}>
          <WindowChrome title="Team allocation · OAuth login">
            <div className="p-5">
              <div className="space-y-2.5">
                {TEAM.map((m) => (
                  <div key={m.n} className="flex items-center gap-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 p-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[12px] font-bold text-[#0B1220]" style={{ background: m.c }}>
                      {m.n[0]}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[13.5px] font-semibold text-slate-900 dark:text-white">{m.n}</span>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400">{m.r}</span>
                      </div>
                      <div className="truncate text-[12px] text-slate-600 dark:text-slate-400">{m.task}</div>
                    </div>
                    <div className="hidden w-28 sm:block">
                      <div className="flex justify-between text-[10px] text-slate-500 dark:text-slate-400"><span>Load</span><span>{m.load}%</span></div>
                      <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-slate-50 dark:bg-slate-900">
                        <motion.div
                          className="h-full rounded-full"
                          style={{ background: m.load > 80 ? "#F5B454" : m.c }}
                          initial={{ width: 0 }}
                          whileInView={{ width: `${m.load}%` }}
                          viewport={{ once: true }}
                          transition={{ duration: 1, ease: "easeOut" }}
                        />
                      </div>
                    </div>
                    <span className={`shrink-0 rounded-md px-2 py-1 text-[10.5px] font-semibold ${
                      m.st === "Blocked" ? "bg-[#F5B454]/10 text-amber-600 dark:text-amber-400" : m.st === "Review" ? "bg-[#93C5FD]/10 text-blue-600 dark:text-blue-400" : "bg-[#6366F1]/10 text-indigo-600 dark:text-indigo-400"
                    }`}>{m.st}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex items-start gap-3 rounded-xl border border-[#6366F1]/25 bg-[#6366F1]/[0.06] p-3.5">
                <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-indigo-600 dark:text-indigo-400" />
                <div className="text-[12.5px] leading-relaxed text-slate-700 dark:text-slate-300">
                  <span className="font-semibold text-slate-900 dark:text-white">Suggested:</span> assign contract tests to Isha once{" "}
                  <span className="font-mono text-indigo-600 dark:text-indigo-400">#412</span> merges. Kabir is at 85% review load.
                  <div className="mt-2 flex gap-2">
                    <span className="rounded-md bg-[#6366F1] px-2.5 py-1 text-[11px] font-semibold text-[#0B1220]">Accept</span>
                    <span className="rounded-md border border-slate-200 dark:border-slate-800 px-2.5 py-1 text-[11px] font-semibold text-slate-700 dark:text-slate-300">Override</span>
                  </div>
                </div>
              </div>
            </div>
          </WindowChrome>
        </Reveal>
      </div>
    </section>
  );
}

/* ─── GitHub PR command center & scheduler ──────────────────────────────── */

export function GitHubIntelligence() {
  const cols = [
    { t: "Open", icon: GitPullRequest, prs: [["#418", "chore: rotate OAuth secrets"]] },
    { t: "In review", icon: Eye, prs: [["#412", "feat(api): token exchange"], ["#87", "feat(mobile): sign-in"]] },
    { t: "CI checks", icon: Activity, prs: [["#409", "test: contract suite"]] },
    { t: "Merge gate", icon: GitMerge, prs: [["#401", "refactor: session store"]] },
  ];
  return (
    <section id="github" className="relative py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHeading
          center
          eyebrow="GitHub PR Command Center · Intelligent Scheduler"
          title={<>From code changes to <span className="bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">predictable releases.</span></>}
          lead="Link proposals and tasks to repositories, branches, commits, pull requests and CI checks. The scheduler keeps review queues and release plans aligned with real progress."
        />

        <Reveal delay={0.1} className="mt-14">
          <WindowChrome title="PR pipeline · acme/api + acme/mobile">
            <div className="grid gap-px bg-slate-200 dark:bg-slate-800 md:grid-cols-4">
              {cols.map((c) => (
                <div key={c.t} className="bg-white dark:bg-slate-950 p-4">
                  <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">
                    <c.icon className="h-3.5 w-3.5" /> {c.t}
                    <span className="ml-auto rounded bg-slate-50 dark:bg-slate-900 px-1.5 font-mono text-[10px]">{c.prs.length}</span>
                  </div>
                  <div className="mt-3 space-y-2">
                    {c.prs.map(([n, t]) => (
                      <div key={n} className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 p-3">
                        <div className="font-mono text-[11px] text-indigo-600 dark:text-indigo-400">{n}</div>
                        <div className="mt-1 text-[12.5px] text-slate-700 dark:text-slate-300">{t}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className="grid gap-px border-t border-slate-200 dark:border-slate-800 bg-slate-200 dark:bg-slate-800 md:grid-cols-[1.4fr_1fr]">
              <div className="bg-white dark:bg-slate-950 p-5">
                <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">Dependency-aware sprint</div>
                <div className="mt-4 space-y-2.5">
                  {[
                    { l: "API", s: 0, w: 40, c: "#6366F1" },
                    { l: "Mobile", s: 5, w: 45, c: "#2563EB" },
                    { l: "Review", s: 45, w: 22, c: "#F5B454", warn: true },
                    { l: "Release", s: 70, w: 22, c: "#10B981" },
                  ].map((b) => (
                    <div key={b.l} className="flex items-center gap-3">
                      <span className="w-14 text-[11px] text-slate-500 dark:text-slate-400">{b.l}</span>
                      <div className="relative h-5 flex-1 rounded bg-slate-50 dark:bg-slate-900">
                        <motion.div
                          className="absolute top-0 h-full rounded"
                          style={{ left: `${b.s}%`, background: b.c, opacity: 0.85 }}
                          initial={{ width: 0 }}
                          whileInView={{ width: `${b.w}%` }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.9, ease: "easeOut" }}
                        />
                        {b.warn && <AlertTriangle className="absolute top-0.5 h-4 w-4 text-[#0B1220]" style={{ left: `calc(${b.s}% + 4px)` }} />}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-white dark:bg-slate-950 p-5">
                <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">
                  <Lightbulb className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" /> Insight
                </div>
                <p className="mt-3 text-[13.5px] leading-relaxed text-slate-700 dark:text-slate-300">
                  The API review queue is delaying <span className="font-semibold text-slate-900 dark:text-white">three dependent tasks</span>.
                  Consider assigning an eligible secondary reviewer.
                </p>
                <div className="mt-3 text-[11px] text-slate-500 dark:text-slate-400">Based on review wait times for #412, #409 · illustrative</div>
              </div>
            </div>
          </WindowChrome>
        </Reveal>

        <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-5">
          <Feature icon={<GitBranch className="h-4 w-4" />} title="GitHub integration">Tasks linked to issues, branches, PRs, reviewers and status checks.</Feature>
          <Feature icon={<GitPullRequest className="h-4 w-4" />} title="PR management">Reviewer suggestions, stale-PR flags and human merge approvals.</Feature>
          <Feature icon={<CalendarClock className="h-4 w-4" />} title="Smart scheduling">Coding, reviews and releases scheduled by dependency and deadline.</Feature>
          <Feature icon={<AlertTriangle className="h-4 w-4" />} title="Bottleneck detection">Slow approvals, overloaded reviewers and blocked chains, from event history.</Feature>
          <Feature icon={<Activity className="h-4 w-4" />} title="Predictive insights">Delivery ranges and reassignment ideas once enough history exists.</Feature>
        </div>
      </div>
    </section>
  );
}

/* ─── Web + Mobile ──────────────────────────────────────────────────────── */

export function MobileSection() {
  const screens = [
    { icon: LayoutDashboard, t: "Executive overview", d: "Project health, active proposals, deadline risk and release status." },
    { icon: ListChecks, t: "My tasks", d: "Assigned work, upcoming reviews, blockers and due dates." },
    { icon: Inbox, t: "PR & approval inbox", d: "PR summaries, CI results and permitted approval actions." },
    { icon: Bell, t: "Schedule & alerts", d: "Milestones, reminders, escalations and review-window changes." },
    { icon: Lightbulb, t: "AI insights", d: "Readable bottleneck explanations and suggested next actions." },
  ];
  return (
    <section id="mobile" className="relative py-28">
      <div className="mx-auto grid max-w-7xl items-center gap-16 px-4 sm:px-6 lg:grid-cols-[1fr_1.1fr]">
        <Reveal className="order-2 flex justify-center lg:order-1">
          <div className="relative">
            <div className="absolute -inset-10 rounded-full bg-[radial-gradient(closest-side,rgba(99,102,241,0.14),transparent)]" />
            <div className="relative w-[290px] rounded-[44px] border border-slate-200 dark:border-slate-800 bg-[#0a101c] p-3 shadow-[0_40px_100px_-30px_rgba(15,23,42,0.35)]">
              <div className="overflow-hidden rounded-[34px] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 dark:bg-slate-950">
                <div className="mx-auto mt-2 h-5 w-24 rounded-full bg-black" />
                <div className="px-4 pb-6 pt-4">
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">Good morning, Priya</div>
                  <div className="text-[17px] font-semibold text-slate-900 dark:text-white">Delivery overview</div>
                  <div className="mt-4 grid grid-cols-2 gap-2">
                    {[["Active", "6", "#6366F1"], ["At risk", "1", "#F5B454"], ["In review", "4", "#93C5FD"], ["Released", "12", "#10B981"]].map(([l, v, c]) => (
                      <div key={l} className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 p-3">
                        <div className="text-[10px] text-slate-500 dark:text-slate-400">{l}</div>
                        <div className="text-[20px] font-semibold" style={{ color: c }}>{v}</div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 text-[10.5px] font-semibold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">Approval inbox</div>
                  <div className="mt-2 space-y-2">
                    {[["#412 token exchange", "CI ✓ · 2 approvals"], ["Release: OAuth v1", "Awaiting you"]].map(([t, s]) => (
                      <div key={t} className="flex items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 p-2.5">
                        <GitPullRequest className="h-3.5 w-3.5 text-[#6366F1]" />
                        <div className="min-w-0 flex-1">
                          <div className="truncate text-[11.5px] text-slate-900 dark:text-white">{t}</div>
                          <div className="text-[10px] text-slate-500 dark:text-slate-400">{s}</div>
                        </div>
                        <span className="rounded-md bg-[#6366F1] px-2 py-0.5 text-[10px] font-semibold text-[#0B1220]">Approve</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 flex items-start gap-2 rounded-xl border border-[#F5B454]/20 bg-[#F5B454]/[0.06] p-2.5 text-[10.5px] leading-snug text-amber-700 dark:text-amber-300">
                    <Clock className="mt-px h-3.5 w-3.5 shrink-0" /> Review queue may push release by ~2 days.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Reveal>

        <div className="order-1 lg:order-2">
          <SectionHeading
            eyebrow="Web + Mobile Command Center"
            title={<>Your delivery pipeline, <span className="text-slate-500 dark:text-slate-400">wherever your team works.</span></>}
            lead="A connected mobile companion gives managers and developers actionable visibility without opening the IDE."
          />
          <div className="mt-10 grid gap-6 sm:grid-cols-2">
            {screens.map((s) => (
              <Feature key={s.t} icon={<s.icon className="h-4 w-4" />} title={s.t}>{s.d}</Feature>
            ))}
          </div>
          <div className="mt-8 flex flex-wrap gap-2.5">
            {[
              { k: "Download on the", t: "App Store", icon: Smartphone },
              { k: "Get it on", t: "Google Play", icon: Play },
            ].map((b) => (
              <span key={b.t} className="inline-flex items-center gap-2.5 rounded-xl bg-slate-900 dark:bg-slate-800 px-4 py-2.5 text-white">
                <b.icon className="h-5 w-5" />
                <span className="leading-tight">
                  <span className="block text-[9.5px] uppercase tracking-wider text-slate-300">{b.k}</span>
                  <span className="block text-[14px] font-semibold">{b.t}</span>
                </span>
              </span>
            ))}
            <span className="self-center rounded-full bg-[#6366F1]/12 px-3 py-1 text-[11px] font-semibold text-indigo-600 dark:text-indigo-400">iOS &amp; Android · Coming soon</span>
          </div>
          <div className="mt-10 grid grid-cols-3 gap-2">
            {[
              { icon: Workflow, t: "Web", d: "Planning & graph orchestration" },
              { icon: Monitor, t: "Madhyam IDE", d: "Guarded agent execution" },
              { icon: Smartphone, t: "Mobile", d: "Monitoring, decisions, alerts" },
            ].map((x) => (
              <Panel key={x.t} className="p-4">
                <x.icon className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                <div className="mt-2 text-[13px] font-semibold text-slate-900 dark:text-white">{x.t}</div>
                <div className="mt-0.5 text-[11.5px] leading-snug text-slate-500 dark:text-slate-400">{x.d}</div>
              </Panel>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── Journey ───────────────────────────────────────────────────────────── */

export function Journey() {
  const steps = [
    { t: "Initiate", d: "A tech lead types the OAuth proposal and selects connected GitHub repositories." },
    { t: "Generate", d: "NLP extracts backend, mobile, tests, reviewer roles and deadlines; the validator shows a publishable graph." },
    { t: "Assign", d: "AI suggests developers and reviewers. The manager confirms; dependent tasks enter the schedule." },
    { t: "Execute", d: "Tasks progress, PRs appear in the command center, and CI plus senior review gates protect merges." },
    { t: "Optimize", d: "Madhyam surfaces blocked tasks and review latency, suggests a reviewer, and mirrors it on mobile." },
  ];
  return (
    <section className="relative py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHeading center eyebrow="Product experience" title="A connected delivery journey" />
        <div className="relative mt-16 grid gap-6 md:grid-cols-5">
          <div className="absolute left-0 right-0 top-5 hidden h-px bg-gradient-to-r from-[#10B981]/0 via-[#6366F1]/50 to-[#2563EB]/0 md:block" />
          {steps.map((s, i) => (
            <Reveal key={s.t} delay={i * 0.08} className="relative">
              <div className="relative z-10 flex h-10 w-10 items-center justify-center rounded-full border border-[#6366F1]/40 bg-white dark:bg-slate-950 dark:bg-slate-950 font-mono text-[13px] font-semibold text-indigo-600 dark:text-indigo-400">
                {String(i + 1).padStart(2, "0")}
              </div>
              <h3 className="mt-5 text-[17px] font-semibold text-slate-900 dark:text-white">{s.t}</h3>
              <p className="mt-2 text-[14px] leading-relaxed text-slate-600 dark:text-slate-400">{s.d}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Architecture ──────────────────────────────────────────────────────── */

export function Architecture() {
  const layer = (items: string[], accent = false) => (
    <div className={`grid gap-2 ${items.length === 3 ? "grid-cols-3" : "grid-cols-1"}`}>
      {items.map((t) => (
        <div
          key={t}
          className={`rounded-xl border px-4 py-3 text-center text-[13px] font-medium ${
            accent ? "border-[#6366F1]/40 bg-[#6366F1]/10 text-slate-900 dark:text-white" : "border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300"
          }`}
        >
          {t}
        </div>
      ))}
    </div>
  );
  const arrow = <div className="mx-auto h-5 w-px bg-gradient-to-b from-slate-300 to-[#6366F1]/50" />;
  return (
    <section className="relative py-28">
      <div className="mx-auto grid max-w-7xl gap-16 px-4 sm:px-6 lg:grid-cols-[1fr_1.1fr]">
        <div>
          <SectionHeading
            eyebrow="Architecture"
            title={<>An engineering <span className="text-slate-500 dark:text-slate-400">execution fabric.</span></>}
            lead="The innovation is continuity, not another task board. One intent compiles into a versioned workflow, assigns humans and coding agents, tracks GitHub changes, enforces review gates and learns from recorded delivery delays."
          />
          <ul className="mt-10 space-y-4">
            {[
              ["Intent-to-execution continuity", "Acceptance criteria, code context and dependencies move with each step."],
              ["Manager-governed coding agents", "Policy gates control risky operations and merges."],
              ["Multi-repository dependency intelligence", "Mobile, backend and API contract work as one coordinated graph."],
              ["Evidence-first optimization", "Recommendations cite historical events and waiting durations — not generic AI claims."],
              ["Progressive scalability", "Org-scoped roles, versioned workflows and queue-backed execution."],
            ].map(([t, d]) => (
              <li key={t} className="flex gap-3">
                <Check className="mt-1 h-4 w-4 shrink-0 text-[#6366F1]" />
                <div className="text-[14.5px] leading-relaxed text-slate-600 dark:text-slate-400"><span className="font-semibold text-slate-900 dark:text-white">{t}.</span> {d}</div>
              </li>
            ))}
          </ul>
        </div>
        <Reveal delay={0.1}>
          <Panel className="p-6">
            {layer(["Technical Manager · Developer · Reviewer"])}
            {arrow}
            {layer(["Madhyam Web + Mobile"])}
            {arrow}
            {layer(["Proposal Initiator + NLP Agent"], true)}
            {arrow}
            {layer(["Workflow Compiler + Graph Validator"], true)}
            {arrow}
            {layer(["Versioned Workflow Engine"], true)}
            {arrow}
            {layer(["AI Task Assigner", "Scheduler", "Approval Inbox"])}
            {arrow}
            {layer(["GitHub + CI Integration"])}
            {arrow}
            {layer(["Madhyam IDE + Junior Runners / AgentGuard"])}
            {arrow}
            {layer(["Event Log + Process Mining → Bottlenecks + AI Recommendations"], true)}
          </Panel>
        </Reveal>
      </div>
    </section>
  );
}

/* ─── Competitive landscape ─────────────────────────────────────────────── */

type Mark = "y" | "p" | "n" | "v";
const MARK: Record<Mark, { s: string; c: string; l: string }> = {
  y: { s: "✓", c: "text-emerald-700 dark:text-emerald-400", l: "Native / strong" },
  p: { s: "◐", c: "text-slate-600 dark:text-slate-400", l: "Via integrations or setup" },
  n: { s: "—", c: "text-slate-500 dark:text-slate-400", l: "Not central" },
  v: { s: "◇", c: "text-indigo-600 dark:text-indigo-400", l: "Madhyam planned" },
};
const ROWS: [string, Mark, Mark, Mark][] = [
  ["Docs, tasks and project planning", "y", "y", "y"],
  ["Natural-language automation / workflow creation", "p", "y", "p"],
  ["AI coding agent works from managed tasks", "p", "y", "y"],
  ["GitHub PR / CI status integration", "y", "y", "y"],
  ["One editable graph spanning cross-repo tasks, approvals and agent jobs", "n", "p", "p"],
  ["Consistent proposal → coding-agent → PR → release context", "p", "p", "p"],
  ["Evidence-based review bottleneck analysis and workflow redesign", "p", "p", "p"],
  ["Unified web planning + guarded desktop execution + mobile inbox", "n", "p", "p"],
];

export function Landscape() {
  return (
    <section className="relative py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeading
          center
          eyebrow="Competitive landscape"
          title="Where Madhyam creates a smoother path"
          lead="Product-fit comparisons, not claims that others lack AI. Madhyam's opportunity is an integrated, low-friction orchestration layer — especially across multiple codebases."
        />
        <Reveal delay={0.1} className="mt-12">
          <Panel className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-[13.5px]">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-[11.5px] uppercase tracking-[0.1em] text-slate-500 dark:text-slate-400">
                  <th className="px-5 py-4 font-semibold">Capability</th>
                  <th className="px-4 py-4 text-center font-semibold">Notion + AI</th>
                  <th className="px-4 py-4 text-center font-semibold">Jira + Rovo</th>
                  <th className="px-4 py-4 text-center font-semibold">GitHub + Copilot</th>
                  <th className="bg-[#6366F1]/[0.06] px-4 py-4 text-center font-semibold text-indigo-600 dark:text-indigo-400">Madhyam AI</th>
                </tr>
              </thead>
              <tbody>
                {ROWS.map(([cap, a, b, c]) => (
                  <tr key={cap} className="border-b border-slate-200 dark:border-slate-800 last:border-0">
                    <td className="px-5 py-3.5 text-slate-700 dark:text-slate-300">{cap}</td>
                    {[a, b, c].map((m, i) => (
                      <td key={i} className={`px-4 py-3.5 text-center text-[15px] ${MARK[m].c}`} title={MARK[m].l}>{MARK[m].s}</td>
                    ))}
                    <td className="bg-[#6366F1]/[0.06] px-4 py-3.5 text-center text-[15px] text-indigo-600 dark:text-indigo-400" title={MARK.v.l}>◇</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Panel>
          <div className="mt-4 flex flex-wrap justify-center gap-x-5 gap-y-2 text-[12px] text-slate-500 dark:text-slate-400">
            {(Object.keys(MARK) as Mark[]).map((k) => (
              <span key={k}><span className={MARK[k].c}>{MARK[k].s}</span> {MARK[k].l}</span>
            ))}
            <span>· Public documentation as of Oct 2026; varies by plan.</span>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ─── Final CTA + footer ────────────────────────────────────────────────── */

export function FinalCTA() {
  return (
    <section id="demo" className="relative overflow-hidden !bg-indigo-600 px-6 py-24">
      <div className="relative z-10 mx-auto max-w-5xl text-center">
        <Reveal>
          <h2 className="text-4xl font-black leading-tight text-white md:text-6xl">
            Turn your next engineering proposal into an executable workflow.
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-xl text-indigo-100 opacity-80">
            Start with a single repository and team. Scale to multi-repo projects, multiple squads and org-wide workflow policies.
          </p>
        </Reveal>
        <div className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link href="/register">
            <motion.span
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-3 rounded-2xl border border-blue-500 bg-blue-600 px-10 py-5 text-sm font-black uppercase tracking-widest text-white shadow-2xl shadow-blue-500/40 transition-colors hover:bg-blue-700"
            >
              <span className="font-mono text-blue-200 opacity-60">03_</span> Create a Proposal <ArrowRight className="h-4 w-4" />
            </motion.span>
          </Link>
          <Link href="/login">
            <motion.span
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-3 rounded-2xl bg-white px-10 py-5 text-sm font-black uppercase tracking-widest text-indigo-700"
            >
              <span className="font-mono opacity-40">04_</span> Request a Demo
            </motion.span>
          </Link>
        </div>
      </div>

      {/* Abstract shapes */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        className="pointer-events-none absolute -left-1/2 -top-1/2 aspect-square w-full rounded-full border-4 border-white/10"
      />
      <motion.div
        animate={{ rotate: -360 }}
        transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
        className="pointer-events-none absolute -bottom-1/2 -right-1/3 aspect-square w-2/3 rounded-full border-2 border-dashed border-white/10"
      />
    </section>
  );
}
