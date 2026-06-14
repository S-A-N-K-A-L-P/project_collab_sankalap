'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Target, Rocket, RefreshCcw, Shield, ShieldCheck, UserPlus, FileCheck, Layers, GitMerge, Award, Zap, GitBranch, Terminal } from 'lucide-react';

const ROLES = [
  {
    title: "Project Master (PM)",
    icon: <ShieldCheck className="w-6 h-6 text-indigo-500" />,
    responsibilities: ["Initiates and proposes projects", "Defines objectives & scope", "Breaks project into modules", "Assigns tasks", "QA & Integration"],
    note: "Core leadership role"
  },
  {
    title: "R&D Associate",
    icon: <Rocket className="w-6 h-6 text-emerald-500" />,
    responsibilities: ["Technical guidance", "Feasibility validation", "Evaluates MVPs", "Supports PM in evaluation"],
    note: "Acts as co-lead and mentor"
  },
  {
    title: "Contributors / Developers",
    icon: <Terminal className="w-6 h-6 text-blue-500" />,
    responsibilities: ["Execute assigned modules", "Submit MVPs for review", "Collaborate with peers", "Provide feedback"],
    note: "Active project participants"
  },
  {
    title: "Observers / Assistants",
    icon: <Users className="w-6 h-6 text-slate-500" />,
    responsibilities: ["Shadow ongoing projects", "Support top contributors", "Learn through observation", "Assist non-critical tasks"],
    note: "Optional / Growth role"
  }
];

const PHASES = [
  {
    id: "initiation",
    title: "Project Initiation",
    icon: <Target className="w-5 h-5" />,
    steps: [
      { name: "Proposal", desc: "PM identifies project, outlines scope, timeline, and MVP." },
      { name: "R&D Review", desc: "Technical feasibility validated. Submodules created." },
      { name: "Public Announcement", desc: "Published in community hub with criteria and timeline." }
    ]
  },
  {
    id: "onboarding",
    title: "Contributor Onboarding",
    icon: <UserPlus className="w-5 h-5" />,
    steps: [
      { name: "Expression of Interest", desc: "Contributors apply with skills and preferences." },
      { name: "Selection", desc: "Voting, interviews, and module assignments based on skill." },
      { name: "Timeline Assignment", desc: "2–7 days completion window assigned per module." }
    ]
  },
  {
    id: "execution",
    title: "Project Execution",
    icon: <Layers className="w-5 h-5" />,
    steps: [
      { name: "Work Breakdown", desc: "PM decomposes project and assigns dependencies." },
      { name: "MVP Submission", desc: "Contributors submit MVPs for evaluation." },
      { name: "Evaluation", desc: "PM & R&D review code quality, functionality, compliance." }
    ]
  },
  {
    id: "integration",
    title: "Integration & Review",
    icon: <GitMerge className="w-5 h-5" />,
    steps: [
      { name: "Merge Modules", desc: "PM integrates module MVPs into main build." },
      { name: "Overall Review", desc: "R&D performs final quality and architecture check." },
      { name: "Feedback Loop", desc: "Constructive feedback given to all contributors." }
    ]
  }
];

const PRINCIPLES = [
  "Clear Roles & Responsibilities",
  "Predictable & Reusable Workflow",
  "Learning & Mentorship Loop",
  "Leadership Rotation",
  "Transparency",
  "Scalability"
];

export const SankalpWorkflow = () => {
  const [activePhase, setActivePhase] = useState(PHASES[0].id);

  return (
    <section className="py-32 bg-slate-50 dark:bg-slate-900/50 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] opacity-20 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/20 to-transparent blur-3xl rounded-full" />
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-sm font-bold mb-4"
          >
            <Zap className="w-4 h-4" /> S.A.N.K.A.L.P. Blueprint
          </motion.div>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white tracking-tight mb-6"
          >
            Community Workflow
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto"
          >
            A standardized, scalable structure designed to foster learning, execution, and continuous integration.
          </motion.p>
        </div>

        {/* Roles Grid */}
        <div className="mb-32">
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-8 flex items-center gap-3">
            <Shield className="w-6 h-6 text-indigo-500" /> Community Structure
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {ROLES.map((role, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white dark:bg-slate-950 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/20 dark:shadow-none hover:border-indigo-500/30 transition-all group"
              >
                <div className="w-14 h-14 rounded-2xl bg-slate-50 dark:bg-slate-900 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  {role.icon}
                </div>
                <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{role.title}</h4>
                <p className="text-xs font-mono text-indigo-500 mb-4">{role.note}</p>
                <ul className="space-y-2">
                  {role.responsibilities.map((resp, i) => (
                    <li key={i} className="text-sm text-slate-600 dark:text-slate-400 flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700 mt-1.5 flex-shrink-0" />
                      {resp}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Project Cycle Interactive Timeline */}
        <div className="mb-32">
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-8 flex items-center gap-3">
            <RefreshCcw className="w-6 h-6 text-emerald-500" /> Reusable Project Cycle
          </h3>
          
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Nav */}
            <div className="w-full lg:w-1/3 flex lg:flex-col gap-2 overflow-x-auto pb-4 lg:pb-0 hide-scrollbar">
              {PHASES.map((phase) => (
                <button
                  key={phase.id}
                  onClick={() => setActivePhase(phase.id)}
                  className={`flex items-center gap-3 p-4 rounded-2xl text-left transition-all whitespace-nowrap lg:whitespace-normal flex-shrink-0 ${
                    activePhase === phase.id 
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25' 
                      : 'bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900'
                  }`}
                >
                  {phase.icon}
                  <span className="font-bold">{phase.title}</span>
                </button>
              ))}
            </div>

            {/* Content */}
            <div className="w-full lg:w-2/3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 min-h-[300px]">
              <AnimatePresence mode="wait">
                {PHASES.map((phase) => phase.id === activePhase && (
                  <motion.div
                    key={phase.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className="h-full flex flex-col justify-center"
                  >
                    <div className="space-y-6">
                      {phase.steps.map((step, idx) => (
                        <div key={idx} className="flex gap-4">
                          <div className="flex flex-col items-center">
                            <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 flex items-center justify-center font-bold text-sm">
                              {idx + 1}
                            </div>
                            {idx !== phase.steps.length - 1 && (
                              <div className="w-0.5 h-full bg-slate-100 dark:bg-slate-800 my-2" />
                            )}
                          </div>
                          <div className="pb-6">
                            <h5 className="text-lg font-bold text-slate-900 dark:text-white mb-1">{step.name}</h5>
                            <p className="text-slate-600 dark:text-slate-400">{step.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Enhancements & Principles */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Enhancements */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-gradient-to-br from-indigo-500 to-purple-600 p-8 rounded-3xl text-white relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <GitBranch className="w-32 h-32" />
            </div>
            <h3 className="text-2xl font-bold mb-6 relative z-10 flex items-center gap-3">
              <Award className="w-6 h-6" /> Enhancements for Scalability
            </h3>
            <ul className="space-y-4 relative z-10">
              <li className="flex items-start gap-3">
                <div className="p-1 bg-white/20 rounded mt-0.5"><Users className="w-4 h-4" /></div>
                <div>
                  <strong className="block">Mentorship Layer</strong>
                  <span className="text-white/80 text-sm">1 mentor per 3-5 contributors.</span>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="p-1 bg-white/20 rounded mt-0.5"><Zap className="w-4 h-4" /></div>
                <div>
                  <strong className="block">AI Task Assignment (Optional)</strong>
                  <span className="text-white/80 text-sm">Optimizes project throughput via skill tracking.</span>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="p-1 bg-white/20 rounded mt-0.5"><FileCheck className="w-4 h-4" /></div>
                <div>
                  <strong className="block">Project Templates & Backup Pools</strong>
                  <span className="text-white/80 text-sm">Standardized templates and a reserve developer pool to prevent bottlenecks.</span>
                </div>
              </li>
            </ul>
          </motion.div>

          {/* Principles */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-8 rounded-3xl"
          >
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Key Principles</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {PRINCIPLES.map((principle, idx) => (
                <div key={idx} className="flex items-center gap-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800/50">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0" />
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{principle}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

      </div>
    </section>
  );
};
