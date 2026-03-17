'use client';

import React from 'react';
import { motion } from 'framer-motion';

const items = [
  { color: "bg-indigo-500", size: "col-span-2 row-span-2", title: "Hackathons" },
  { color: "bg-purple-500", size: "col-span-1 row-span-1", title: "Ideation" },
  { color: "bg-emerald-500", size: "col-span-1 row-span-2", title: "Deployment" },
  { color: "bg-amber-500", size: "col-span-1 row-span-1", title: "Culture" },
  { color: "bg-rose-500", size: "col-span-2 row-span-1", title: "Community" }
];

export const CultureGallery = () => {
  return (
    <section className="py-24 bg-slate-50 dark:bg-slate-900/50 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold">The <span className="text-indigo-600 font-mono tracking-tighter">Pixel</span> Experience</h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 grid-rows-3 gap-4 h-[600px]">
          {items.map((item, idx) => (
            <motion.div
              key={idx}
              whileHover={{ scale: 0.99 }}
              className={`${item.color} ${item.size} rounded-[2rem] relative overflow-hidden group p-8 flex items-end`}
            >
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
              <h3 className="relative z-10 text-white font-bold text-2xl opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-2 group-hover:translate-y-0">
                {item.title}
              </h3>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
