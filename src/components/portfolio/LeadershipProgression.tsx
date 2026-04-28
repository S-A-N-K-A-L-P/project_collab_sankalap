'use client';

import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Eye, Terminal, Rocket, ShieldCheck } from 'lucide-react';

const PROGRESSION_STEPS = [
  {
    id: 1,
    role: "Observer / Assistant",
    description: "Start by shadowing ongoing projects, assisting top contributors, and learning the ecosystem.",
    icon: <Eye className="w-8 h-8 text-slate-400" />,
    color: "from-slate-400 to-slate-600"
  },
  {
    id: 2,
    role: "Active Contributor",
    description: "Take on specific modules, submit MVPs, and collaborate with peers to build core features.",
    icon: <Terminal className="w-8 h-8 text-blue-500" />,
    color: "from-blue-500 to-indigo-600"
  },
  {
    id: 3,
    role: "R&D Associate",
    description: "Validate project feasibility, provide technical guidance, and evaluate contributor submissions.",
    icon: <Rocket className="w-8 h-8 text-emerald-500" />,
    color: "from-emerald-400 to-teal-600"
  },
  {
    id: 4,
    role: "Project Master (PM)",
    description: "Initiate new projects, define scope, assign modules, and oversee final integration.",
    icon: <ShieldCheck className="w-8 h-8 text-purple-500" />,
    color: "from-purple-500 to-rose-600"
  }
];

export const LeadershipProgression = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  const pathLength = useTransform(scrollYProgress, [0.2, 0.8], [0, 1]);

  return (
    <section className="py-32 bg-white dark:bg-slate-950 relative overflow-hidden" ref={containerRef}>
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center mb-24">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white tracking-tight mb-6"
          >
            Leadership <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">Progression</span>
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto"
          >
            A transparent and meritocratic pathway to grow from a learner to a visionary leader within the S.A.N.K.A.L.P. ecosystem.
          </motion.p>
        </div>

        <div className="relative max-w-4xl mx-auto">
          {/* Animated Line */}
          <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-1 bg-slate-100 dark:bg-slate-800 -translate-x-1/2 hidden md:block" />
          <motion.div 
            className="absolute left-8 md:left-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-500 via-purple-500 to-rose-500 -translate-x-1/2 origin-top hidden md:block"
            style={{ scaleY: pathLength }}
          />

          <div className="space-y-24">
            {PROGRESSION_STEPS.map((step, idx) => {
              const isEven = idx % 2 === 0;
              return (
                <motion.div 
                  key={step.id}
                  initial={{ opacity: 0, x: isEven ? -50 : 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.6, type: "spring", stiffness: 100 }}
                  className={`flex flex-col md:flex-row items-center gap-8 ${isEven ? 'md:flex-row-reverse' : ''}`}
                >
                  <div className="w-full md:w-1/2 p-8 bg-slate-50 dark:bg-slate-900/50 rounded-3xl border border-slate-100 dark:border-slate-800 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-16 h-16 rounded-2xl bg-white dark:bg-slate-950 flex items-center justify-center shadow-lg shadow-slate-200/50 dark:shadow-none">
                        {step.icon}
                      </div>
                      <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{step.role}</h3>
                    </div>
                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-lg">
                      {step.description}
                    </p>
                  </div>
                  
                  <div className="relative w-full md:w-auto flex justify-center hidden md:flex">
                    <motion.div 
                      initial={{ scale: 0 }}
                      whileInView={{ scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.3 }}
                      className={`w-16 h-16 rounded-full bg-gradient-to-br ${step.color} border-4 border-white dark:border-slate-950 z-10 flex items-center justify-center text-white font-black text-xl shadow-xl`}
                    >
                      {step.id}
                    </motion.div>
                  </div>

                  <div className="w-full md:w-1/2 hidden md:block" />
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
