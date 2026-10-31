"use client";

import { motion } from "framer-motion";
import {
  ArrowDown, ArrowRight, Brain, Check, Database, FileStack, GitFork, Layers, Network, PackageOpen,
  Scale, Search, Sparkles, X,
} from "lucide-react";
import { Panel, Reveal, SectionHeading } from "./primitives";

/* ─── Where today's ecosystem breaks ────────────────────────────────────── */

const GAPS = [
  {
    group: "AI coding agents",
    tools: ["Cursor", "Codex", "Claude Code", "Antigravity", "Gemini CLI"],
    pains: [
      "Heavy token usage — whole files and long chat histories are re-sent turn after turn.",
      "Context is scoped to one repo or session; no real multi-project understanding.",
      "No automatic document import/export — specs and decisions are pasted in by hand.",
    ],
  },
  {
    group: "Autonomous agent platforms",
    tools: ["OpenHands"],
    pains: [
      "Long agent trajectories grow the prompt until budgets and context windows run out.",
      "Each task starts in an isolated workspace — little reuse of what earlier runs learned.",
      "No proposal, approval or org-level planning layer above the agent.",
    ],
  },
  {
    group: "Work & knowledge tools",
    tools: ["Jira", "Notion", "Confluence"],
    pains: [
      "Plan and document work, but cannot see code structure or cross-repo dependencies.",
      "Docs drift from the code; syncing them is a manual import/export chore.",
      "AI answers are limited to their own workspace, not your connected projects.",
    ],
  },
];

/* ─── How Madhyam closes the gap ────────────────────────────────────────── */

const PILLARS = [
  {
    icon: FileStack,
    title: "Cross-project document embedding",
    body: "Code, ADRs, API contracts, PRDs and runbooks from every connected project land in one permission-scoped vector index — with automatic import from and export to Confluence, Notion, Drive and Git.",
    instead: "Context that ends at the current repo or workspace.",
  },
  {
    icon: PackageOpen,
    title: "Smart context import / export",
    body: "Export a project's distilled context — architecture, contracts, conventions, decisions — as a versioned Context Pack. Import it into another project or agent session in a few thousand tokens.",
    instead: "Re-explaining your system to every new agent session.",
  },
  {
    icon: GitFork,
    title: "Multi-project connection detector",
    body: "Automatically links repositories that share OpenAPI/GraphQL contracts, schemas, packages, queues or env keys — so a backend change surfaces every mobile, web and service consumer.",
    instead: "Breaking a consumer you didn't know existed.",
  },
  {
    icon: Database,
    title: "Vector DB + Hindsight + RAG",
    body: "Retrieval brings in only what the task needs. Hindsight memory recalls what worked, what failed and what reviewers rejected in past runs — without replaying old transcripts.",
    instead: "Token exhaustion from full-file reads and endless chat history.",
  },
  {
    icon: Search,
    title: "Hybrid retrieval with rank fusion",
    body: "BM25 keyword search and dense embeddings over AST-aware chunks, merged with reciprocal-rank fusion and a cross-encoder re-ranker — precise on identifiers and on intent.",
    instead: "Embedding-only search that misses exact symbol names.",
  },
  {
    icon: Network,
    title: "Graph-aware context selection",
    body: "Personalized PageRank over the cross-repo symbol and dependency graph pulls in the callers, callees and contracts that actually matter to the change.",
    instead: "Nearest-neighbour snippets with no structural awareness.",
  },
  {
    icon: Scale,
    title: "Token budget optimizer",
    body: "Every task gets a budget. A knapsack packer picks the highest-value context, hierarchical summaries fill the rest, stable prefixes are cached and agents receive diffs, not files.",
    instead: "Unbounded prompts and unpredictable cost per task.",
  },
  {
    icon: Layers,
    title: "One graph from proposal to docs",
    body: "Proposal, tasks, agent runs, PRs, reviews and documentation share one versioned workflow — so context, approvals and audit trail travel together.",
    instead: "Copy-pasting between a tracker, a chat agent and a wiki.",
  },
];

/* ─── Context pipeline ──────────────────────────────────────────────────── */

const PIPELINE = [
  { t: "Cross-project indexer", d: "AST-aware chunks + doc embeddings → vector DB" },
  { t: "Connection detector", d: "Shared contracts, schemas, packages → project link graph" },
  { t: "Hybrid retrieval", d: "BM25 + dense vectors, reciprocal-rank fusion" },
  { t: "Graph expansion", d: "Personalized PageRank over symbol graph" },
  { t: "Re-rank & dedupe", d: "Cross-encoder + MMR diversity" },
  { t: "Hindsight memory", d: "Past outcomes & reviewer feedback" },
  { t: "Budget packer", d: "Knapsack selection, summaries, cached prefix" },
];

/* ─── Comparison matrix ─────────────────────────────────────────────────── */

type Mark = "y" | "p" | "n";
const ROWS: [string, Mark, Mark, Mark, Mark][] = [
  ["Multi-project / cross-repo understanding", "p", "p", "n", "y"],
  ["Automatic document import & export across projects", "n", "n", "p", "y"],
  ["Portable context packs between projects and agents", "n", "n", "n", "y"],
  ["Multi-project connection detection", "n", "n", "n", "y"],
  ["Token budgeting via RAG + vector memory", "p", "p", "n", "y"],
  ["Hindsight memory of past runs and reviews", "p", "p", "n", "y"],
  ["Proposal → task → agent → PR → docs in one graph", "n", "p", "p", "y"],
  ["Governed multi-agent fleet with human approvals", "p", "p", "p", "y"],
];
const MARK: Record<Mark, { el: React.ReactNode; label: string }> = {
  y: { el: <Check className="mx-auto h-4 w-4 text-[#4F46E5]" />, label: "Core capability" },
  p: { el: <span className="text-[15px] text-slate-400">◐</span>, label: "Partial / via setup" },
  n: { el: <X className="mx-auto h-4 w-4 text-slate-300" />, label: "Not a core flow" },
};

export function WhyMadhyam() {
  return (
    <section id="why" className="relative py-28">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-indigo-50/70 dark:via-indigo-500/[0.04] to-transparent" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHeading
          center
          eyebrow="Why Madhyam"
          title={<>Built for the gaps <span className="text-slate-500 dark:text-slate-400">today&apos;s tools leave open.</span></>}
          lead="Coding agents write code. Trackers plan work. Wikis hold documents. None of them share one memory of your projects — so teams pay for it in tokens, rework and stale docs."
        />

        {/* Gaps */}
        <div className="mt-14 grid gap-5 lg:grid-cols-3">
          {GAPS.map((g, i) => (
            <Reveal key={g.group} delay={i * 0.08}>
              <Panel className="h-full p-6">
                <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">{g.group}</div>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {g.tools.map((t) => (
                    <span key={t} className="rounded-md border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 px-2 py-1 text-[12px] font-semibold text-slate-700 dark:text-slate-300">{t}</span>
                  ))}
                </div>
                <ul className="mt-5 space-y-3">
                  {g.pains.map((p) => (
                    <li key={p} className="flex gap-2.5 text-[13.5px] leading-relaxed text-slate-600 dark:text-slate-400">
                      <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#E5484D]/10">
                        <X className="h-2.5 w-2.5 text-rose-600" />
                      </span>
                      {p}
                    </li>
                  ))}
                </ul>
              </Panel>
            </Reveal>
          ))}
        </div>

        {/* Pillars */}
        <Reveal className="mt-20 flex items-center gap-3">
          <Sparkles className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
          <h3 className="text-[22px] font-semibold tracking-[-0.02em] text-slate-900 dark:text-white">How Madhyam closes the gap</h3>
        </Reveal>
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {PILLARS.map((p, i) => (
            <Reveal key={p.title} delay={(i % 4) * 0.06}>
              <Panel className="flex h-full flex-col p-5 transition hover:-translate-y-0.5">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500/10 to-blue-500/10 text-indigo-600 dark:text-indigo-400">
                  <p.icon className="h-5 w-5" />
                </div>
                <h4 className="mt-4 text-[15.5px] font-semibold text-slate-900 dark:text-white">{p.title}</h4>
                <p className="mt-2 flex-1 text-[13.5px] leading-relaxed text-slate-600 dark:text-slate-400">{p.body}</p>
                <div className="mt-4 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 px-3 py-2 text-[12px] text-slate-500 dark:text-slate-400">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">Replaces:</span> {p.instead}
                </div>
              </Panel>
            </Reveal>
          ))}
        </div>

        {/* Pipeline + token comparison */}
        <div className="mt-20 grid gap-6 lg:grid-cols-[1.15fr_1fr]">
          <Reveal>
            <Panel className="h-full p-6">
              <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-indigo-600 dark:text-indigo-400">
                <Brain className="h-3.5 w-3.5" /> Smart token usage — the context pipeline
              </div>
              <div className="mt-5 space-y-1.5">
                {PIPELINE.map((s, i) => (
                  <div key={s.t}>
                    <div className="flex items-center gap-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-4 py-2.5">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#6366F1]/12 font-mono text-[11px] font-semibold text-indigo-600 dark:text-indigo-400">
                        {i + 1}
                      </span>
                      <span className="text-[13.5px] font-semibold text-slate-900 dark:text-white">{s.t}</span>
                      <span className="ml-auto hidden text-right text-[12px] text-slate-500 dark:text-slate-400 sm:block">{s.d}</span>
                    </div>
                    {i < PIPELINE.length - 1 && <ArrowDown className="mx-auto my-0.5 h-3 w-3 text-slate-300" />}
                  </div>
                ))}
                <div className="flex items-center justify-center gap-2 pt-2 text-[13px] font-semibold text-indigo-600 dark:text-indigo-400">
                  <ArrowRight className="h-4 w-4" /> Lean, task-specific prompt to any agent
                </div>
              </div>
            </Panel>
          </Reveal>

          <Reveal delay={0.08}>
            <Panel className="flex h-full flex-col p-6">
              <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">Tokens per task · cross-repo change</div>
              <div className="mt-6 space-y-6">
                {[
                  { l: "Typical agent session", sub: "full files + chat history, re-sent each turn", v: 100, n: "~120k", c: "#E5484D" },
                  { l: "Madhyam context pipeline", sub: "retrieved, ranked and budgeted context", v: 9, n: "~11k", c: "#4F46E5" },
                ].map((b) => (
                  <div key={b.l}>
                    <div className="flex items-baseline justify-between">
                      <span className="text-[14px] font-semibold text-slate-900 dark:text-white">{b.l}</span>
                      <span className="font-mono text-[14px] font-semibold" style={{ color: b.c }}>{b.n}</span>
                    </div>
                    <div className="text-[12px] text-slate-500 dark:text-slate-400">{b.sub}</div>
                    <div className="mt-2 h-3 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                      <motion.div
                        className="h-full rounded-full"
                        style={{ background: b.c }}
                        initial={{ width: 0 }}
                        whileInView={{ width: `${b.v}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 1.1, ease: "easeOut" }}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-8 grid grid-cols-3 gap-2 text-center">
                {[
                  ["Context", "only what the task needs"],
                  ["Memory", "outcomes, not transcripts"],
                  ["Cost", "bounded per task"],
                ].map(([k, v]) => (
                  <div key={k} className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 p-3">
                    <div className="text-[13px] font-semibold text-slate-900 dark:text-white">{k}</div>
                    <div className="mt-0.5 text-[11.5px] leading-snug text-slate-500 dark:text-slate-400">{v}</div>
                  </div>
                ))}
              </div>
              <p className="mt-auto pt-6 text-[11.5px] text-slate-500 dark:text-slate-400">
                Illustrative target, not a benchmark. Actual savings depend on repository size, task scope and the agent used.
              </p>
            </Panel>
          </Reveal>
        </div>

        {/* Matrix */}
        <Reveal delay={0.05} className="mt-20">
          <h3 className="text-[22px] font-semibold tracking-[-0.02em] text-slate-900 dark:text-white">Side by side</h3>
          <Panel className="mt-6 overflow-x-auto">
            <table className="w-full min-w-[820px] text-left text-[13.5px]">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-[11.5px] uppercase tracking-[0.1em] text-slate-500 dark:text-slate-400">
                  <th className="px-5 py-4 font-semibold">Capability</th>
                  <th className="px-4 py-4 text-center font-semibold">
                    AI coding agents
                    <div className="mt-1 text-[10px] font-medium normal-case tracking-normal text-slate-400">Cursor · Codex · Claude Code · Antigravity · Gemini</div>
                  </th>
                  <th className="px-4 py-4 text-center font-semibold">OpenHands</th>
                  <th className="px-4 py-4 text-center font-semibold">
                    Jira / Notion
                    <div className="mt-1 text-[10px] font-medium normal-case tracking-normal text-slate-400">incl. Rovo &amp; Notion AI</div>
                  </th>
                  <th className="bg-[#6366F1]/[0.08] px-4 py-4 text-center font-semibold text-indigo-600 dark:text-indigo-400">Madhyam AI</th>
                </tr>
              </thead>
              <tbody>
                {ROWS.map(([cap, a, b, c, m]) => (
                  <tr key={cap} className="border-b border-slate-100 dark:border-slate-800/60 last:border-0">
                    <td className="px-5 py-3.5 font-medium text-slate-800 dark:text-slate-200">{cap}</td>
                    {[a, b, c].map((v, i) => (
                      <td key={i} className="px-4 py-3.5 text-center" title={MARK[v].label}>{MARK[v].el}</td>
                    ))}
                    <td className="bg-[#6366F1]/[0.08] px-4 py-3.5 text-center" title={MARK[m].label}>{MARK[m].el}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Panel>
          <div className="mt-4 flex flex-wrap justify-center gap-x-5 gap-y-2 text-[12px] text-slate-500 dark:text-slate-400">
            {(Object.keys(MARK) as Mark[]).map((k) => (
              <span key={k} className="inline-flex items-center gap-1.5"><span className="inline-flex w-4 justify-center">{MARK[k].el}</span> {MARK[k].label}</span>
            ))}
          </div>
          <p className="mx-auto mt-3 max-w-3xl text-center text-[11.5px] leading-relaxed text-slate-500 dark:text-slate-400">
            Product-fit comparison of typical default workflows based on public documentation as of October 2026; capabilities vary by
            version, plan and configuration. Madhyam column reflects the product design, parts of which are in development.
            All product names are trademarks of their respective owners.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
