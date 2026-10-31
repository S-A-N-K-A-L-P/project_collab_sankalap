'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Terminal, Github, Heart } from 'lucide-react';

export const OpenSourceManifesto = () => {
  return (
    <section className="py-24 bg-slate-950 px-6 relative overflow-hidden">
      <div className="max-w-4xl mx-auto relative z-10">
        <div className="inline-flex items-center gap-2 text-emerald-400 font-mono text-sm mb-8">
          <Terminal size={16} />
          <span>cat manifesto.md</span>
        </div>
        
        <div className="space-y-12">
          <motion.h2 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            className="text-4xl md:text-6xl font-black text-white leading-tight"
          >
            THE CODE IS <br />
            <motion.span 
              initial={{ width: 0 }}
              whileInView={{ width: "100%" }}
              className="inline-block relative overflow-hidden h-[1.1em] -mb-4"
            >
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-500">PUBLIC PROPERTY.</span>
              <motion.div 
                className="absolute inset-0 bg-indigo-600/20"
                initial={{ left: "-100%" }}
                whileInView={{ left: "100%" }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              />
            </motion.span>
          </motion.h2>

          <p className="text-xl md:text-2xl text-slate-400 font-light leading-relaxed">
            We believe that software should be treated as a global public good. No paywalls, no proprietary shackles. Just pure, unadulterated <span className="text-slate-200 font-medium">engineering for the people.</span>
          </p>

          <div className="flex flex-wrap gap-6 pt-8 border-t border-slate-800">
             <div className="flex items-center gap-2 text-slate-500 group cursor-pointer hover:text-white transition-colors">
                <Github size={24} />
                <span className="font-mono text-sm">Fork the Future</span>
             </div>
             <div className="flex items-center gap-2 text-slate-500 group cursor-pointer hover:text-pink-500 transition-colors">
                <Heart size={24} />
                <span className="font-mono text-sm">Support the Labs</span>
             </div>
          </div>
        </div>
      </div>

      <div className="absolute right-0 top-0 w-1/2 h-full bg-gradient-to-l from-indigo-500/5 to-transparent pointer-events-none" />
    </section>
  );
};
