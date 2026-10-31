"use client";

import { motion } from "framer-motion";
import { Zap } from "lucide-react";
import type { ReactNode } from "react";

export function Reveal({ children, delay = 0, className }: { children: ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6, delay }}
    >
      {children}
    </motion.div>
  );
}

export function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full bg-blue-500/10 px-3 py-1 text-sm font-bold text-blue-600 dark:text-blue-400">
      <Zap className="h-4 w-4" />
      {children}
    </span>
  );
}

/** Highlights the last word group of a heading in indigo, as the original site did ("Our Core <Ideology>"). */
export function SectionHeading({ eyebrow, title, lead, center }: { eyebrow: string; title: ReactNode; lead?: ReactNode; center?: boolean }) {
  return (
    <div className={center ? "mx-auto max-w-3xl text-center" : "max-w-2xl"}>
      <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
        <Eyebrow>{eyebrow}</Eyebrow>
      </motion.div>
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.1 }}
        className="mt-5 text-4xl font-black leading-[1.05] tracking-tight text-slate-900 dark:text-white md:text-5xl [&_.text-slate-500]:text-indigo-600 dark:[&_.text-slate-500]:text-indigo-400"
      >
        {title}
      </motion.h2>
      {lead && (
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="mt-5 text-lg leading-relaxed text-slate-600 dark:text-slate-400"
        >
          {lead}
        </motion.p>
      )}
    </div>
  );
}

export function Panel({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={`relative rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-200/20 transition-all hover:border-indigo-500/30 dark:border-slate-800 dark:bg-slate-950 dark:shadow-none ${className ?? ""}`}
    >
      {children}
    </div>
  );
}

export function WindowChrome({ title, children, className }: { title: string; children: ReactNode; className?: string }) {
  return (
    <Panel className={`overflow-hidden ${className ?? ""}`}>
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 px-4 py-2.5">
        <span className="h-2.5 w-2.5 rounded-full bg-rose-400/70" />
        <span className="h-2.5 w-2.5 rounded-full bg-amber-400/70" />
        <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/70" />
        <span className="ml-3 font-mono text-[11px] text-slate-500 dark:text-slate-400">{title}</span>
      </div>
      {children}
    </Panel>
  );
}

export function Feature({ icon, title, children }: { icon: ReactNode; title: string; children: ReactNode }) {
  return (
    <motion.div whileHover={{ y: -3 }} className="group flex gap-4">
      <div className="mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-slate-50 text-indigo-600 transition-transform duration-300 group-hover:scale-110 dark:bg-slate-900 dark:text-indigo-400">
        {icon}
      </div>
      <div>
        <h3 className="text-base font-bold text-slate-900 dark:text-white">{title}</h3>
        <p className="mt-1 text-[14px] leading-relaxed text-slate-600 dark:text-slate-400">{children}</p>
      </div>
    </motion.div>
  );
}
