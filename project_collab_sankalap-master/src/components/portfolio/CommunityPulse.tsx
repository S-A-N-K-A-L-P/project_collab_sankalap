'use client';

import React from 'react';
import { motion } from 'framer-motion';

export const CommunityPulse = () => {
  return (
    <section className="py-24 bg-slate-950 overflow-hidden px-6">
      <div className="max-w-7xl mx-auto flex flex-col items-center">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
            Community <span className="text-indigo-400">Pulse</span>
          </h2>
          <p className="text-slate-400">Real-time sync between vision and execution.</p>
        </div>

        <div className="relative w-full max-w-2xl h-[400px] flex items-center justify-center">
          {/* Central Pulse */}
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.5, 0.8, 0.5],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute w-32 h-32 bg-indigo-500/30 blur-3xl rounded-full"
          />
          <div className="relative z-10 w-4 h-4 bg-indigo-400 rounded-full shadow-[0_0_20px_rgba(129,140,248,0.8)]" />

          {/* Orbiting Elements */}
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute border border-slate-800 rounded-full"
              style={{
                width: (i + 1) * 150,
                height: (i + 1) * 150,
              }}
              animate={{ rotate: 360 }}
              transition={{
                duration: (i + 1) * 10,
                repeat: Infinity,
                ease: "linear"
              }}
            >
              <motion.div
                className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-slate-600 rounded-full"
                animate={{
                  scale: [1, 1.5, 1],
                  backgroundColor: ["#475569", "#818cf8", "#475569"]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: i * 0.5
                }}
              />
            </motion.div>
          ))}

          {/* Wave Lines */}
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 400">
            <motion.path
              d="M 50 200 Q 125 100 200 200 T 350 200"
              fill="none"
              stroke="rgba(129,140,248,0.2)"
              strokeWidth="2"
              animate={{
                d: [
                  "M 50 200 Q 125 150 200 200 T 350 200",
                  "M 50 200 Q 125 250 200 200 T 350 200",
                  "M 50 200 Q 125 150 200 200 T 350 200"
                ]
              }}
              transition={{ duration: 4, repeat: Infinity }}
            />
          </svg>
        </div>
      </div>
    </section>
  );
};
