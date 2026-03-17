'use client';

import React from 'react';
import { motion } from 'framer-motion';

const skills = [
  { name: "Solidity", level: 90, color: "bg-indigo-500" },
  { name: "React / Next.js", level: 95, color: "bg-blue-400" },
  { name: "Rust", level: 85, color: "bg-orange-500" },
  { name: "Machine Learning", level: 80, color: "bg-emerald-500" },
  { name: "Cloud Architecture", level: 88, color: "bg-slate-500" },
  { name: "Design Systems", level: 92, color: "bg-rose-500" }
];

export const SkillMosaic = () => {
  return (
    <section className="py-24 bg-white dark:bg-slate-950 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row gap-16 items-center">
          <div className="flex-1">
             <h2 className="text-3xl md:text-5xl font-bold text-slate-900 dark:text-white mb-6">Our <span className="text-indigo-600 italic">Technical</span> Armor.</h2>
             <p className="text-lg text-slate-600 dark:text-slate-400 mb-8 leading-relaxed">
               The collective mastery of our members covers the entire spectrum of modern technology. We doesn't just use tools; we reinvent them.
             </p>
             <button className="px-8 py-3 rounded-full border border-slate-200 dark:border-slate-800 font-bold hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors">View All Capabilities</button>
          </div>
          
          <div className="flex-1 w-full space-y-6">
            {skills.map((skill, idx) => (
              <div key={idx} className="space-y-2">
                <div className="flex justify-between text-sm font-bold uppercase tracking-widest text-slate-500">
                   <span>{skill.name}</span>
                   <span>{skill.level}%</span>
                </div>
                <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                   <motion.div
                     initial={{ width: 0 }}
                     whileInView={{ width: `${skill.level}%` }}
                     viewport={{ once: true }}
                     transition={{ duration: 1, delay: idx * 0.1 }}
                     className={`h-full ${skill.color}`}
                   />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
