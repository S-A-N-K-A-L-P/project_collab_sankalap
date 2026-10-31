'use client';

import React from 'react';
import { motion } from 'framer-motion';

export const DiversitySection = () => {
  return (
    <section className="py-24 bg-white dark:bg-slate-950 px-6">
      <div className="max-w-5xl mx-auto text-center">
        <h2 className="text-3xl md:text-5xl font-bold mb-8">Unity in <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500">Diversity.</span></h2>
        <p className="text-xl text-slate-600 dark:text-slate-400 leading-relaxed mb-12">
          We are a mosaic of cultures, backgrounds, and perspectives. This diversity is our greatest strength, enabling us to solve problems from every possible angle.
        </p>
        <div className="flex justify-center flex-wrap gap-4 opacity-40">
           {[...Array(6)].map((_, i) => (
             <div key={i} className="w-12 h-12 rounded-full bg-slate-200 dark:bg-slate-800" />
           ))}
        </div>
      </div>
    </section>
  );
};
