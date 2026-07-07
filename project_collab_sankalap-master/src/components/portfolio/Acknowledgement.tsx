'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Award, Heart, Star, Sparkles } from 'lucide-react';

const ACKNOWLEDGEMENTS = [
  {
    title: "Community Core",
    description: "To the dedicated project masters and R&D associates who mentor, guide, and architect our future.",
    icon: <Heart className="w-8 h-8 text-rose-500" />
  },
  {
    title: "Open Source Contributors",
    description: "To every developer who has submitted an MVP, fixed a bug, or improved our documentation.",
    icon: <Star className="w-8 h-8 text-amber-500" />
  },
  {
    title: "Visionaries & Sponsors",
    description: "To the institutions and individuals who support the Atmanirbhar mission with resources and trust.",
    icon: <Sparkles className="w-8 h-8 text-blue-500" />
  }
];

export const Acknowledgement = () => {
  return (
    <section className="py-32 bg-slate-900 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-500/10 rounded-full blur-[100px]" />
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10 text-center text-white">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/10 backdrop-blur-md mb-8 border border-white/20"
        >
          <Award className="w-10 h-10 text-indigo-400" />
        </motion.div>
        
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="text-4xl md:text-6xl font-black tracking-tight mb-8"
        >
          Acknowledgement & <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-indigo-400">Gratitude</span>
        </motion.h2>

        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed mb-20"
        >
          S.A.N.K.A.L.P. thrives on the dedication of its members. We deeply acknowledge the relentless effort, passion, and code contributed by our global community towards building an Atmanirbhar Nation.
        </motion.p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
          {ACKNOWLEDGEMENTS.map((ack, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 + idx * 0.1 }}
              className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-8 hover:bg-white/10 transition-colors"
            >
              <div className="w-16 h-16 rounded-2xl bg-slate-800/50 flex items-center justify-center mb-6">
                {ack.icon}
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">{ack.title}</h3>
              <p className="text-slate-400 leading-relaxed">
                {ack.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
