'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';

export const ProjectShowcase = ({ projects }: { projects: any[] }) => {
  return (
    <section className="py-24 bg-white dark:bg-slate-950 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h2 className="text-3xl md:text-5xl font-bold text-slate-900 dark:text-white">Built for <span className="text-indigo-600">Impact</span></h2>
            <p className="text-slate-600 dark:text-slate-400 mt-2">Selected works from our various workgroups.</p>
          </div>
          <button className="hidden md:block text-slate-900 dark:text-white font-bold border-b-2 border-indigo-500 pb-1">View Full Portfolio</button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {projects.map((project, idx) => (
            <motion.div
              key={idx}
              whileHover={{ scale: 0.98 }}
              className="group relative h-[400px] rounded-[2.5rem] bg-slate-100 dark:bg-slate-900 overflow-hidden cursor-pointer"
            >
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/80 z-10" />
              
              <div className="absolute top-8 right-8 z-20 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center">
                  <ArrowUpRight className="text-slate-900" size={24} />
                </div>
              </div>

              <div className="absolute bottom-10 left-10 z-20">
                <p className="text-indigo-400 font-mono text-sm mb-2 uppercase tracking-widest">{project.type || "System"}</p>
                <h3 className="text-3xl font-bold text-white">{project.title}</h3>
              </div>

              {/* Decorative shape */}
              <div className="absolute inset-0 flex items-center justify-center opacity-10 group-hover:opacity-20 transition-opacity">
                 <div className="w-64 h-64 border-[40px] border-indigo-500 rounded-full" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
