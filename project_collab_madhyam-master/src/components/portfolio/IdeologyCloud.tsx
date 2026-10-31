'use client';

import React from 'react';
import { motion } from 'framer-motion';

const tags = [
  "Decentralization", "Privacy", "Innovation", "Ethics", "Speed", "Art", 
  "Code", "Security", "Open Source", "Global", "Next-Gen", "Scalability",
  "Trust", "Elegance", "Radical", "Collective", "Sovereignty", "AI", "Web3"
];

export const IdeologyCloud = () => {
  return (
    <section className="py-24 bg-white dark:bg-slate-950 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-2xl font-mono text-slate-400 uppercase tracking-widest">The Vocabulary of Progress</h2>
        </div>
        <div className="flex flex-wrap justify-center gap-4">
          {tags.map((tag, idx) => (
            <motion.span
              key={idx}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              whileHover={{ 
                scale: 1.1, 
                color: "#6366f1",
                backgroundColor: "rgba(99, 102, 241, 0.05)"
              }}
              className="px-6 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 text-lg font-medium text-slate-600 dark:text-slate-400 cursor-default transition-colors"
            >
              {tag}
            </motion.span>
          ))}
        </div>
      </div>
    </section>
  );
};
