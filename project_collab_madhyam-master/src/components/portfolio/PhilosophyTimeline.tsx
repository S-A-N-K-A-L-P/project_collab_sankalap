'use client';

import React from 'react';
import { motion } from 'framer-motion';

const events = [
  { year: "2024", title: "The Genesis", description: "Formed as a clandestine group of 5 engineers looking for a better way to collaborate." },
  { year: "2025", title: "Protocol Rollout", description: "Released our first decentralized governance protocol to the early community." },
  { year: "2026", title: "The Expansion", description: "Reaching 1000+ members and launching 50+ community-driven projects." },
  { year: "2027", title: "Future Horizon", description: "Envisioning a fully autonomous organization where code is the only law." }
];

export const PhilosophyTimeline = () => {
  return (
    <section className="py-24 bg-slate-50 dark:bg-slate-900/50 px-6 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold mb-16 text-center">Our <span className="text-indigo-600 font-serif italic">Odyssey</span></h2>
        
        <div className="relative">
          {/* Vertical Line */}
          <div className="absolute left-1/2 top-0 bottom-0 w-px bg-slate-200 dark:bg-slate-800 -translate-x-1/2 hidden md:block" />

          <div className="space-y-12">
            {events.map((event, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: idx % 2 === 0 ? -50 : 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className={`relative flex flex-col md:flex-row items-center ${idx % 2 === 0 ? 'md:flex-row-reverse' : ''}`}
              >
                <div className="flex-1 p-8 bg-white dark:bg-slate-950 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm md:mx-12 lg:mx-24 w-full">
                  <span className="text-indigo-500 font-mono text-sm tracking-tighter mb-2 block">{event.year}</span>
                  <h3 className="text-xl font-bold mb-3">{event.title}</h3>
                  <p className="text-slate-600 dark:text-slate-400">{event.description}</p>
                </div>
                
                <div className="absolute left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-indigo-500 border-4 border-white dark:border-slate-950 z-10 hidden md:block" />
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
