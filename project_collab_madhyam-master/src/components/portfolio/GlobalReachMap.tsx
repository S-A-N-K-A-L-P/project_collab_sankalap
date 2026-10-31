'use client';

import React from 'react';
import { motion } from 'framer-motion';

export const GlobalReachMap = () => {
  return (
    <section className="py-24 bg-white dark:bg-slate-950 px-6 overflow-hidden">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16">
        <div className="flex-1 order-2 lg:order-1">
          <div className="relative w-full aspect-square max-w-[500px] mx-auto">
            {/* Stylized SVG Map Placeholder */}
            <svg viewBox="0 0 400 200" className="w-full h-auto opacity-20 dark:opacity-10 grayscale">
               <path d="M50,100 Q100,50 150,100 T250,100 T350,100" fill="none" stroke="currentColor" strokeWidth="2" />
               <path d="M60,120 Q110,70 160,120 T260,120 T360,120" fill="none" stroke="currentColor" strokeWidth="2" />
            </svg>
            
            {/* Blinking Connection Points */}
            {[
              { x: '20%', y: '30%' },
              { x: '45%', y: '50%' },
              { x: '70%', y: '40%' },
              { x: '35%', y: '70%' },
              { x: '80%', y: '60%' }
            ].map((pos, i) => (
              <motion.div
                key={i}
                style={{ left: pos.x, top: pos.y }}
                animate={{
                  scale: [1, 2, 1],
                  opacity: [0.5, 0, 0.5]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: i * 0.4
                }}
                className="absolute w-3 h-3 bg-indigo-500 rounded-full"
              />
            ))}
          </div>
        </div>

        <div className="flex-1 order-1 lg:order-2">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">Boundless <span className="text-indigo-600">Collaboration</span></h2>
          <p className="text-lg text-slate-600 dark:text-slate-400 mb-8 leading-relaxed">
            Geography is a legacy constraint. Our collective spans 12 timezones and 45 countries. We are truly borderless.
          </p>
          <div className="flex gap-12">
            <div>
              <span className="text-3xl font-bold block text-slate-900 dark:text-white">45+</span>
              <span className="text-sm text-slate-500 uppercase tracking-widest font-mono">Countries</span>
            </div>
            <div>
              <span className="text-3xl font-bold block text-slate-900 dark:text-white">12</span>
              <span className="text-sm text-slate-500 uppercase tracking-widest font-mono">Regions</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
