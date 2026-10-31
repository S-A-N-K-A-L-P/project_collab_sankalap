'use client';

import React from 'react';
import { motion } from 'framer-motion';

const phases = [
  { phase: "Phase 1", title: "Infrastructure", date: "Q2 2026", status: "In Progress" },
  { phase: "Phase 2", title: "Ecosystem Expansion", date: "Q4 2026", status: "Planned" },
  { phase: "Phase 3", title: "Autonomous Governance", date: "Q2 2027", status: "Vision" }
];

export const FutureRoadmap = () => {
  return (
    <section className="py-24 bg-slate-50 dark:bg-slate-900/50 px-6">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold mb-12 text-center text-slate-900 dark:text-white">The <span className="text-indigo-600">Roadmap</span></h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {phases.map((p, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.2 }}
              className="p-8 bg-white dark:bg-slate-950 rounded-[2rem] border border-slate-200 dark:border-slate-800 flex flex-col items-center"
            >
              <span className="text-indigo-500 font-bold mb-2">{p.phase}</span>
              <h3 className="text-2xl font-bold dark:text-white mb-4 text-center">{p.title}</h3>
              <div className="py-1 px-3 bg-slate-100 dark:bg-slate-900 rounded-full text-xs font-mono text-slate-500 mb-6">{p.date}</div>
              <div className={`text-sm font-bold uppercase tracking-widest ${p.status === 'In Progress' ? 'text-emerald-500' : 'text-slate-400'}`}>
                {p.status}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
