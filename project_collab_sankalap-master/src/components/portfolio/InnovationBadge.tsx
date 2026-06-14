'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Award, Trophy, Star, ShieldCheck, LucideIcon } from 'lucide-react';

interface Badge {
  icon: LucideIcon;
  label: string;
}

const badges: Badge[] = [
  { icon: Award, label: "Security First" },
  { icon: Trophy, label: "Innovation Win" },
  { icon: Star, label: "Community Star" },
  { icon: ShieldCheck, label: "Verified Flow" }
];

export const InnovationBadge = () => {
  return (
    <section className="py-20 bg-slate-950 px-6">
      <div className="max-w-7xl mx-auto flex flex-wrap justify-center gap-12">
        {badges.map((badge, idx) => {
          const Icon = badge.icon;
          return (
            <motion.div
              key={idx}
              initial={{ rotateY: 90, opacity: 0 }}
              whileInView={{ rotateY: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.2, type: "spring", stiffness: 100 }}
              className="flex flex-col items-center gap-4 text-white group"
            >
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-white/10 flex items-center justify-center relative shadow-2xl group-hover:shadow-indigo-500/20 transition-all">
                <Icon
                  size={40}
                  className="text-indigo-400 group-hover:scale-110 transition-transform"
                />
                <div className="absolute inset-0 rounded-full border border-indigo-400/20 animate-ping opacity-0 group-hover:opacity-100" />
              </div>
              <span className="text-sm font-mono tracking-widest uppercase text-slate-500 group-hover:text-white transition-colors">
                {badge.label}
              </span>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
};
