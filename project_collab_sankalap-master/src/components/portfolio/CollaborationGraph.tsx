'use client';

import React from 'react';
import { motion } from 'framer-motion';

export const CollaborationGraph = () => {
  return (
    <section className="py-24 bg-white dark:bg-slate-950 px-6 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row items-center gap-16">
          <div className="flex-1">
            <h2 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white mb-6 leading-tight">
              A Living <span className="text-indigo-600">Mesh</span> of Creativity.
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed mb-8">
              We operate as a decentralized graph where every node is a human and every edge is an idea. This organic structure allows us to scale without friction.
            </p>
            <ul className="space-y-4">
              {['Dynamic Teaming', 'Fluid Roles', 'Peer Review'].map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-slate-700 dark:text-slate-300 font-medium">
                  <div className="w-6 h-6 rounded-full bg-indigo-500/10 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-indigo-500" />
                  </div>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="flex-1 relative h-[400px] w-full max-w-[500px]">
             {/* Animated SVG Graph */}
             <svg className="w-full h-full" viewBox="0 0 400 400">
               {[...Array(12)].map((_, i) => (
                 <motion.circle
                   key={i}
                   cx={200 + Math.cos(i) * 120}
                   cy={200 + Math.sin(i) * 120}
                   r="6"
                   className="fill-indigo-500"
                   animate={{
                     scale: [1, 1.5, 1],
                     opacity: [0.3, 1, 0.3]
                   }}
                   transition={{
                     duration: 3,
                     repeat: Infinity,
                     delay: i * 0.2
                   }}
                 />
               ))}
               {[...Array(12)].map((_, i) => (
                 <motion.line
                   key={i}
                   x1="200"
                   y1="200"
                   x2={200 + Math.cos(i) * 120}
                   y2={200 + Math.sin(i) * 120}
                   stroke="rgba(99, 102, 241, 0.1)"
                   strokeWidth="1"
                   animate={{
                    strokeDasharray: [0, 100],
                    strokeDashoffset: [0, -100]
                   }}
                   transition={{
                    duration: 5,
                    repeat: Infinity,
                    ease: "linear"
                   }}
                 />
               ))}
               <circle cx="200" cy="200" r="10" className="fill-indigo-600" />
             </svg>
             <div className="absolute inset-0 bg-gradient-to-t from-white dark:from-slate-950 to-transparent pointer-events-none h-20 bottom-0 top-auto" />
          </div>
        </div>
      </div>
    </section>
  );
};
