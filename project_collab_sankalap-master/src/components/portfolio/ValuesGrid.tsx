'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Zap, Globe, Users, Code, Cpu } from 'lucide-react';

const values = [
  {
    icon: <Shield className="text-blue-500" />,
    title: "Radical Transparency",
    description: "Every decision, protocol, and line of code is open for scrutiny by the collective."
  },
  {
    icon: <Zap className="text-yellow-500" />,
    title: "Hyper Speed",
    description: "We move at the edge of possibility, deploying ideas before they become conventional."
  },
  {
    icon: <Globe className="text-emerald-500" />,
    title: "Global Sovereignty",
    description: "Our systems are designed to empower individuals across all borders and jurisdictions."
  },
  {
    icon: <Users className="text-purple-500" />,
    title: "Decentralized Trust",
    description: "Governance is distributed. No single point of failure. No single point of control."
  },
  {
    icon: <Code className="text-indigo-500" />,
    title: "Architectural Elegance",
    description: "We believe code is art. Scalability and performance are built into the DNA of our work."
  },
  {
    icon: <Cpu className="text-rose-500" />,
    title: "Future-Proof Tech",
    description: "Constantly iterating on the bleeding edge of AI, Web3, and distributed systems."
  }
];

export const ValuesGrid = () => {
  return (
    <section className="py-24 bg-slate-50 dark:bg-slate-900/50 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4"
          >
            Our Core <span className="text-indigo-600">Ideology</span>
          </motion.h2>
          <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            These are the principles that guide every project we undertake and every member we welcome.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {values.map((value, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              whileHover={{ y: -5 }}
              className="p-8 bg-white dark:bg-slate-950 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl hover:shadow-indigo-500/5 transition-all group"
            >
              <div className="w-14 h-14 rounded-2xl bg-slate-50 dark:bg-slate-900 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                {React.cloneElement(value.icon as React.ReactElement<{ size?: number }>, { size: 28 })}
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">{value.title}</h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                {value.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
