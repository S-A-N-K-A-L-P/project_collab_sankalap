"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, GitBranch, History, KeyRound, Search, Sparkles } from "lucide-react";
import { IntroVideo, WatchVideoButton } from "./IntroVideo";
import { SYNCRO_GIT_VIDEO, SYNCRO_HIGHLIGHTS, type SyncroHighlight } from "./content";

const SYNCRO_ICON: Record<SyncroHighlight["icon"], typeof GitBranch> = {
  git: GitBranch,
  search: Search,
  key: KeyRound,
  history: History,
};

const PIPELINE_STEPS = ["syncro push", "Auto AST + Vector Index", "RAG + Hindsight Ready"];

/** Animated Syncro Git & Syncro Desktop showcase section with 3D video stage and staggered feature cards. */
export function SyncroShowcase() {
  const reducedMotion = useReducedMotion();

  return (
    <section
      id="syncro-git"
      className="relative scroll-mt-20 overflow-hidden border-t border-slate-200 bg-slate-50 py-20 sm:py-28 dark:border-slate-800 dark:bg-slate-900/50"
    >
      {/* Ambient animated aurora & subtle dot matrix */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden" aria-hidden>
        <div
          className="pf-aurora pf-aurora-2 opacity-25 dark:opacity-20"
          style={{ background: "radial-gradient(circle, rgba(16,185,129,0.45) 0%, transparent 65%)" }}
        />
        <div
          className="pf-aurora pf-aurora-1 opacity-20 dark:opacity-20"
          style={{ background: "radial-gradient(circle, rgba(99,102,241,0.45) 0%, transparent 65%)" }}
        />
        <div className="absolute inset-0 opacity-[0.28] dark:opacity-[0.1] [background-image:radial-gradient(rgba(100,116,139,.35)_1px,transparent_1px)] [background-size:24px_24px]" />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid items-center gap-12 lg:grid-cols-[0.95fr_1.2fr] lg:gap-14">
          <motion.div
            initial={reducedMotion ? false : { opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50/80 px-3 py-1 text-[12px] font-semibold uppercase tracking-[0.12em] text-emerald-700 dark:border-emerald-900/70 dark:bg-emerald-950/50 dark:text-emerald-300">
              <Sparkles className="h-3.5 w-3.5" /> Built-in Developer Platform
            </span>

            <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl lg:text-[42px] lg:leading-[1.12] dark:text-white">
              Syncro Git: private Git with{" "}
              <span className="bg-gradient-to-r from-emerald-600 via-teal-500 to-indigo-600 bg-clip-text text-transparent dark:from-emerald-400 dark:via-sky-400 dark:to-indigo-400">
                built-in code understanding.
              </span>
            </h2>

            <p className="mt-4 text-[16px] leading-relaxed text-slate-600 dark:text-slate-300">
              Every S.A.N.K.A.L.P. task runs inside Syncro. Instead of pasting thousands of lines of private code into
              someone else&apos;s cloud, Syncro indexes every push automatically — so contributors and AI agents get the
              exact lines they need for a fraction of the tokens.
            </p>

            {/* Animated push-to-intelligence pipeline strip */}
            <div className="mt-6 flex flex-wrap items-center gap-2 rounded-2xl border border-slate-200/90 bg-white/85 p-3 backdrop-blur dark:border-slate-800 dark:bg-slate-950/75">
              {PIPELINE_STEPS.map((step, i) => (
                <div key={step} className="flex items-center gap-2">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[12px] font-semibold ${
                      i === 0
                        ? "bg-slate-900 font-mono text-emerald-300 dark:bg-slate-800"
                        : "bg-slate-100 text-slate-700 dark:bg-slate-900 dark:text-slate-200"
                    }`}
                  >
                    {i === 0 && <span className="text-slate-400">$</span>}
                    {step}
                  </span>
                  {i < PIPELINE_STEPS.length - 1 && (
                    <motion.span
                      aria-hidden
                      animate={reducedMotion ? undefined : { x: [0, 3, 0], opacity: [0.45, 1, 0.45] }}
                      transition={{ duration: 1.8, repeat: Infinity, delay: i * 0.35 }}
                      className="text-xs font-bold text-emerald-500"
                    >
                      →
                    </motion.span>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-7 flex flex-wrap items-center gap-3">
              <WatchVideoButton
                targetId="syncro-git-video"
                label="Watch Syncro Git showcase"
                className="group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-5 py-3.5 text-[14.5px] font-semibold text-white shadow-lg shadow-emerald-600/20 hover:from-emerald-500 hover:to-teal-500 transition-all"
              />
              <Link
                href="/desktop"
                className="group inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-5 py-3.5 text-[14.5px] font-semibold text-slate-800 hover:border-slate-400 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:hover:bg-slate-900 transition-all"
              >
                Explore Syncro Desktop
                <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
              </Link>
            </div>
          </motion.div>

          <IntroVideo id="syncro-git-video" video={SYNCRO_GIT_VIDEO} />
        </div>

        {/* Staggered Spotlight Feature Cards */}
        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {SYNCRO_HIGHLIGHTS.map((item, idx) => {
            const Icon = SYNCRO_ICON[item.icon];
            return (
              <motion.div
                key={item.title}
                initial={reducedMotion ? false : { opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.5, delay: idx * 0.08, ease: [0.22, 1, 0.36, 1] }}
                whileHover={reducedMotion ? undefined : { y: -5 }}
                className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-xl hover:shadow-indigo-500/10 dark:border-slate-800 dark:bg-slate-950"
              >
                {/* Animated gradient top accent bar */}
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-x-0 top-0 h-[2.5px] origin-left scale-x-0 bg-gradient-to-r from-emerald-500 via-sky-500 to-indigo-500 transition-transform duration-300 group-hover:scale-x-100"
                />
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-50 to-indigo-50 text-emerald-600 ring-1 ring-emerald-200/60 transition-transform duration-300 group-hover:scale-110 dark:from-emerald-500/10 dark:to-indigo-500/10 dark:text-emerald-300 dark:ring-emerald-500/20">
                  <Icon className="h-5 w-5" />
                </span>
                <h3 className="mt-4 text-[15.5px] font-semibold text-slate-900 dark:text-white">{item.title}</h3>
                <p className="mt-2 text-[13.5px] leading-relaxed text-slate-600 dark:text-slate-400">{item.text}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
