"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion, type Variants } from "framer-motion";
import { ArrowRight, Check, CircleDot, GitPullRequest, Loader2, MousePointer2 } from "lucide-react";
import { Eyebrow, WindowChrome } from "./primitives";
import { MadhyamLogo } from "@/components/brand/MadhyamLogo";

const PROMPT =
  "Build OAuth login for our Flutter and Express app. Run backend and mobile work in parallel, verify API contracts, require senior PR review, then schedule release.";

const NODES = [
  { id: "intent", label: "Intent extraction", x: 11, y: 50 },
  { id: "validate", label: "Graph validation", x: 31, y: 50 },
  { id: "api", label: "Backend API", x: 52, y: 22 },
  { id: "ui", label: "Flutter UI", x: 52, y: 78 },
  { id: "contract", label: "Contract verify", x: 70, y: 50 },
  { id: "review", label: "Senior review", x: 89, y: 50 },
];
const EDGES: [string, string][] = [
  ["intent", "validate"], ["validate", "api"], ["validate", "ui"], ["api", "contract"], ["ui", "contract"], ["contract", "review"],
];
const STAGE: Record<string, number> = { intent: 1, validate: 2, api: 3, ui: 3, contract: 4, review: 5 };

function useTyped(text: string, speed = 22) {
  const [n, setN] = useState(0);
  useEffect(() => {
    if (n >= text.length) return;
    const t = setTimeout(() => setN(n + 1), speed);
    return () => clearTimeout(t);
  }, [n, text, speed]);
  return { shown: text.slice(0, n), done: n >= text.length };
}

function HeroDashboard() {
  const { shown, done } = useTyped(PROMPT);
  const [stage, setStage] = useState(0);

  useEffect(() => {
    if (!done) return;
    const t = setInterval(() => setStage((s) => (s >= 6 ? 6 : s + 1)), 650);
    return () => clearInterval(t);
  }, [done]);

  const pos = Object.fromEntries(NODES.map((n) => [n.id, n]));

  return (
    <WindowChrome title="madhyam.ai / workspace / oauth-login" className="text-left">
      <div className="grid gap-px bg-slate-200 dark:bg-slate-800 lg:grid-cols-[0.9fr_1.4fr]">
        {/* Proposal composer */}
        <div className="bg-white dark:bg-slate-950 p-5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">Technical proposal</span>
            <span className="rounded-md bg-[#6366F1]/10 px-2 py-0.5 text-[10px] font-semibold text-indigo-600 dark:text-indigo-400">P1 · Q4 sprint</span>
          </div>
          <div className="mt-3 min-h-[124px] rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 p-3.5 font-mono text-[12.5px] leading-relaxed text-slate-700 dark:text-slate-300">
            {shown}
            {!done && <span className="ml-0.5 inline-block h-3.5 w-[7px] translate-y-0.5 animate-pulse bg-[#6366F1]" />}
          </div>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {["acme/api", "acme/mobile", "Due Nov 28"].map((c) => (
              <span key={c} className="rounded-md border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 px-2 py-1 font-mono text-[10.5px] text-slate-600 dark:text-slate-400">{c}</span>
            ))}
          </div>
          <div className="mt-4 flex items-center gap-2 text-[12px]">
            {stage < 6 ? (
              <span className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                <Loader2 className="h-3.5 w-3.5 animate-spin text-[#6366F1]" /> {done ? "Compiling workflow graph…" : "Reading intent…"}
              </span>
            ) : (
              <span className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
                <Check className="h-3.5 w-3.5" /> 9 tasks · 3 approval gates · 0 validation errors
              </span>
            )}
          </div>
        </div>

        {/* Workflow graph + PR queue */}
        <div className="bg-white dark:bg-slate-950 p-5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">Live workflow graph</span>
            <span className="flex items-center gap-1.5 text-[10.5px] text-slate-500 dark:text-slate-400">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#10B981]" /> v3 · draft
            </span>
          </div>
          <div className="relative mt-3 h-[150px]">
            <svg className="absolute inset-0 h-full w-full" preserveAspectRatio="none" viewBox="0 0 100 100">
              {EDGES.map(([a, b]) => {
                const A = pos[a], B = pos[b];
                const on = stage >= STAGE[b];
                return (
                  <path
                    key={a + b}
                    d={`M${A.x} ${A.y} C${(A.x + B.x) / 2} ${A.y}, ${(A.x + B.x) / 2} ${B.y}, ${B.x} ${B.y}`}
                    stroke={on ? "#6366F1" : "rgba(255,255,255,0.10)"}
                    strokeWidth={on ? 0.7 : 0.5}
                    fill="none"
                    vectorEffect="non-scaling-stroke"
                    style={{ transition: "stroke .5s" }}
                  />
                );
              })}
            </svg>
            {NODES.map((n) => {
              const on = stage >= STAGE[n.id];
              return (
                <div
                  key={n.id}
                  className="absolute -translate-x-1/2 -translate-y-1/2"
                  style={{ left: `${n.x}%`, top: `${n.y}%` }}
                >
                  <div
                    className={`whitespace-nowrap rounded-lg border px-2 py-1 text-[10.5px] font-medium transition-all duration-500 ${
                      on
                        ? "border-[#6366F1]/50 bg-[#6366F1]/15 text-slate-900 dark:text-white shadow-[0_0_20px_-4px_rgba(99,102,241,0.6)]"
                        : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-500 dark:text-slate-400"
                    }`}
                  >
                    {n.label}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-4 space-y-1.5">
            {[
              { pr: "#412", t: "feat(api): OAuth token exchange", s: "CI passing", c: "text-emerald-700 dark:text-emerald-400" },
              { pr: "#87", t: "feat(mobile): sign-in screen", s: "Review requested", c: "text-blue-600 dark:text-blue-400" },
            ].map((r, i) => (
              <motion.div
                key={r.pr}
                initial={{ opacity: 0, x: 8 }}
                animate={stage >= 6 ? { opacity: 1, x: 0 } : {}}
                transition={{ delay: i * 0.15 }}
                className="flex items-center gap-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 px-3 py-2 text-[11.5px]"
              >
                <GitPullRequest className="h-3.5 w-3.5 text-[#6366F1]" />
                <span className="font-mono text-slate-500 dark:text-slate-400">{r.pr}</span>
                <span className="truncate text-slate-700 dark:text-slate-300">{r.t}</span>
                <span className={`ml-auto flex shrink-0 items-center gap-1 ${r.c}`}>
                  <CircleDot className="h-3 w-3" /> {r.s}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Sprint timeline */}
      <div className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-5 py-4">
        <div className="flex items-center justify-between text-[10.5px] text-slate-500 dark:text-slate-400">
          <span className="font-semibold uppercase tracking-[0.14em]">Release timeline</span>
          <span className="font-mono">Nov 03 → Nov 28</span>
        </div>
        <div className="relative mt-3 grid grid-cols-12 gap-1">
          {[
            { s: 1, e: 5, l: "Backend API", c: "from-[#6366F1] to-[#4338CA]" },
            { s: 1, e: 6, l: "Flutter UI", c: "from-[#2563EB] to-[#1D4ED8]" },
            { s: 6, e: 8, l: "Contract + review", c: "from-[#93C5FD] to-[#60A5FA]" },
            { s: 9, e: 12, l: "Release", c: "from-[#10B981] to-[#059669]" },
          ].map((b) => (
            <div
              key={b.l}
              className={`col-span-12 h-5 rounded-md bg-gradient-to-r ${b.c} px-2 text-[10px] font-semibold leading-5 text-[#0B1220]`}
              style={{ gridColumn: `${b.s} / ${b.e + 1}` }}
            >
              <span className="truncate">{b.l}</span>
            </div>
          ))}
        </div>
      </div>
    </WindowChrome>
  );
}

// Floating background orbs — same deterministic field as the original landing hero.
const ORBS = Array.from({ length: 20 }, (_, i) => ({
  width: 100 + ((i * 37) % 400),
  height: 100 + ((i * 53) % 400),
  left: `${(i * 13) % 100}%`,
  top: `${(i * 29) % 100}%`,
  x: ((i * 19) % 100) - 50,
  y: ((i * 23) % 100) - 50,
  duration: 10 + ((i * 7) % 10),
}));

const HEADLINE = ["From", "developer", "intent", "to"];
const HEADLINE_ACCENT = ["intelligent", "execution."];

const headlineContainer: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.35 } },
};
const headlineWord: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 200 } },
};

export function Hero() {
  return (
    <section id="product" className="relative overflow-hidden pt-32 pb-24 sm:pt-40">
      {/* Background micro-animations */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {ORBS.map((orb, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-indigo-500/10 blur-xl dark:bg-indigo-400/5"
            style={{ width: orb.width, height: orb.height, left: orb.left, top: orb.top }}
            animate={{ x: [0, orb.x], y: [0, orb.y], scale: [1, 1.2, 1] }}
            transition={{ duration: orb.duration, repeat: Infinity, ease: "linear" }}
          />
        ))}
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mx-auto max-w-4xl text-center">
          <motion.div
            initial={{ scale: 0, opacity: 0, rotate: -10 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
            className="mb-8 flex justify-center"
          >
            <MadhyamLogo size={88} className="scale-[0.8] sm:scale-100" />
          </motion.div>

          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
            <Eyebrow>The engineering control center</Eyebrow>
          </motion.div>

          <motion.h1
            variants={headlineContainer}
            initial="hidden"
            animate="visible"
            className="mt-7 flex flex-wrap justify-center gap-x-[0.25em] text-[42px] font-black leading-[1.02] tracking-tighter sm:text-6xl lg:text-[80px]"
          >
            {HEADLINE.map((w) => (
              <motion.span
                key={w}
                variants={headlineWord}
                className="inline-block bg-gradient-to-br from-slate-900 to-slate-600 bg-clip-text text-transparent dark:from-white dark:to-slate-400"
              >
                {w}
              </motion.span>
            ))}
            {HEADLINE_ACCENT.map((w) => (
              <motion.span key={w} variants={headlineWord} className="inline-block text-indigo-600 dark:text-indigo-400">
                {w}
              </motion.span>
            ))}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1, duration: 0.8 }}
            className="mx-auto mt-7 max-w-2xl text-lg leading-relaxed text-slate-600 dark:text-slate-400 md:text-xl"
          >
            Madhyam AI turns natural-language engineering proposals into validated, assignable and trackable
            development workflows — with GitHub PR orchestration, scheduling, approvals and operational
            intelligence in one web and mobile workspace.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.3 }}
            className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
          >
            <Link href="#how-it-works">
              <motion.span
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-3 rounded-2xl bg-slate-900 px-8 py-4 text-sm font-black uppercase tracking-widest text-white shadow-xl shadow-indigo-500/20 dark:bg-white dark:text-slate-900"
              >
                <span className="font-mono opacity-40">01_</span> Explore the Workflow
              </motion.span>
            </Link>
            <Link href="/register">
              <motion.span
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-3 rounded-2xl border border-blue-500 bg-blue-600 px-8 py-4 text-sm font-black uppercase tracking-widest text-white shadow-xl shadow-blue-500/40 transition-colors hover:bg-blue-700"
              >
                <span className="font-mono text-blue-200 opacity-60">02_</span> Create a Proposal
                <ArrowRight className="h-4 w-4" />
              </motion.span>
            </Link>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.9, delay: 1.4 }}
          className="relative mx-auto mt-16 max-w-6xl"
        >
          <div className="absolute -inset-1 rounded-[28px] bg-gradient-to-b from-indigo-500/30 via-blue-500/10 to-transparent opacity-70 blur-md" />
          <HeroDashboard />
        </motion.div>

        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="mt-12 flex justify-center"
        >
          <MousePointer2 className="text-slate-400 dark:text-slate-600" size={24} />
        </motion.div>
      </div>
    </section>
  );
}
