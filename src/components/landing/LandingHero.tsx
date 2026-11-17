"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { HeroVideoStage, WatchVideoButton } from "./IntroVideo";
import { BRAND } from "./content";

type Stat = { label: string; value: number };

const EASE = [0.22, 1, 0.36, 1] as const;

/** Hero: staggered animated copy, floating aurora backdrop, live stats, and the dual-reel 3D video stage. */
export function LandingHero({ stats }: { stats: Stat[] }) {
  const reducedMotion = useReducedMotion();

  return (
    <section className="relative overflow-hidden pt-[72px]">
      {/* Animated ambient aurora & radial grid */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden" aria-hidden>
        <div
          className="pf-aurora pf-aurora-1 opacity-40 dark:opacity-25"
          style={{ background: "radial-gradient(circle, rgba(99,102,241,0.38) 0%, transparent 65%)" }}
        />
        <div
          className="pf-aurora pf-aurora-2 opacity-30 dark:opacity-20"
          style={{ background: "radial-gradient(circle, rgba(14,165,233,0.32) 0%, transparent 65%)" }}
        />
        <div className="absolute -top-40 left-1/2 h-[560px] w-[1100px] -translate-x-1/2 rounded-full bg-gradient-to-b from-indigo-100 via-sky-50 to-transparent blur-3xl dark:from-indigo-950/60 dark:via-slate-900/40" />
        <div className="absolute inset-0 opacity-[0.35] dark:opacity-[0.12] [background-image:radial-gradient(rgba(100,116,139,.35)_1px,transparent_1px)] [background-size:22px_22px] [mask-image:linear-gradient(to_bottom,black,transparent_75%)]" />
      </div>

      <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 pb-16 pt-12 sm:px-6 lg:grid-cols-[1.08fr_1.05fr] lg:gap-14 lg:pb-24 lg:pt-20">
        <div>
          <motion.p
            initial={reducedMotion ? false : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: EASE }}
            className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-white/80 px-3.5 py-1 text-[12px] font-semibold text-indigo-700 shadow-sm backdrop-blur dark:border-indigo-900 dark:bg-slate-900/70 dark:text-indigo-300"
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-indigo-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-indigo-500" />
            </span>
            Cloud · AI · IoT for Agriculture, Healthcare and Logistics
          </motion.p>

          <motion.h1
            initial={reducedMotion ? false : { opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.08, ease: EASE }}
            className="mt-6 text-[40px] font-extrabold leading-[1.05] tracking-tight text-slate-900 sm:text-5xl lg:text-[50px] xl:text-[56px] dark:text-white"
          >
            India&apos;s engineering talent,
            <span className="block bg-gradient-to-r from-indigo-600 via-sky-600 to-emerald-600 bg-clip-text text-transparent dark:from-indigo-400 dark:via-sky-400 dark:to-emerald-400">
              applied to real problems.
            </span>
          </motion.h1>

          <motion.p
            initial={reducedMotion ? false : { opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.16, ease: EASE }}
            className="mt-6 max-w-xl text-[17px] leading-relaxed text-slate-600 dark:text-slate-300"
          >
            <strong className="font-semibold text-slate-900 dark:text-white">{BRAND.name}</strong> ({BRAND.expansion}) is a
            self-guided community of engineers who build cloud, AI and IoT solutions alongside {BRAND.company}&apos;s
            R&amp;D and Cloud divisions, connecting India digitally, one project at a time.
          </motion.p>

          <motion.div
            initial={reducedMotion ? false : { opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.24, ease: EASE }}
            className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap"
          >
            <Link
              href="/register"
              className="group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-xl bg-indigo-600 px-6 py-3.5 text-[15px] font-semibold text-white shadow-lg shadow-indigo-600/25 hover:bg-indigo-700 transition-all"
            >
              <span
                aria-hidden
                className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 group-hover:translate-x-full"
              />
              <span>Join the community</span>
              <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
            </Link>
            <WatchVideoButton targetId="intro-video" label="Watch S.A.N.K.A.L.P. intro" />
            <WatchVideoButton
              targetId="syncro-git-video"
              label="Syncro Git demo"
              className="group inline-flex items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50/70 px-5 py-3.5 text-[15px] font-semibold text-emerald-800 hover:border-emerald-300 hover:bg-emerald-100/70 dark:border-emerald-900/70 dark:bg-emerald-950/40 dark:text-emerald-200 dark:hover:border-emerald-700 transition-all"
            />
          </motion.div>

          {/* Live numbers from the platform; hidden rather than shown as zeros when the database can't be read. */}
          {stats.some((s) => s.value > 0) && (
            <motion.dl
              initial={reducedMotion ? false : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.32, ease: EASE }}
              className="mt-12 grid max-w-lg grid-cols-3 gap-6 border-t border-slate-200 pt-6 dark:border-slate-800"
            >
              {stats.map((s) => (
                <div key={s.label}>
                  <dt className="text-[12px] font-medium text-slate-500 dark:text-slate-400">{s.label}</dt>
                  <dd className="mt-1 text-2xl font-bold tabular-nums text-slate-900 dark:text-white">
                    {s.value.toLocaleString("en-IN")}
                  </dd>
                </div>
              ))}
            </motion.dl>
          )}
        </div>

        <HeroVideoStage />
      </div>
    </section>
  );
}
