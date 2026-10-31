'use client';

import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

export const VisionParallax = () => {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  const y1 = useTransform(scrollYProgress, [0, 1], [0, -200]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.8, 1, 0.8]);
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);

  return (
    <section ref={containerRef} className="relative min-h-[100vh] flex items-center justify-center overflow-hidden bg-slate-950 px-6 py-20">
      <motion.div style={{ y: y1 }} className="absolute left-[10%] top-[20%] w-64 h-64 bg-indigo-500/20 blur-[100px] rounded-full" />
      <motion.div style={{ y: y2 }} className="absolute right-[10%] bottom-[20%] w-96 h-96 bg-emerald-500/20 blur-[100px] rounded-full" />

      <motion.div
        style={{ scale, opacity }}
        className="relative z-10 max-w-5xl text-center"
      >
        <span className="text-indigo-400 font-mono tracking-widest uppercase text-sm mb-6 block">Vision Statement</span>
        <h2 className="text-4xl md:text-6xl font-black text-white leading-tight mb-8">
          WE ARE NOT BUILDING FOR THE PRESENT.<br />
          <span className="italic text-transparent bg-clip-text bg-gradient-to-r from-slate-200 to-slate-500">
            WE ARE ARCHITECTING THE DISTANT FUTURE.
          </span>
        </h2>
        <p className="text-xl md:text-2xl text-slate-400 font-light leading-relaxed max-w-3xl mx-auto">
          By 2030, the boundaries between human intent and machine execution will blur. We exist to ensure that transition is open, ethical, and boundless.
        </p>
      </motion.div>

      {/* Grid Pattern */}
      <div className="absolute inset-0 z-0 opacity-20" 
           style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #444 1px, transparent 0)', backgroundSize: '40px 40px' }} />
    </section>
  );
};
