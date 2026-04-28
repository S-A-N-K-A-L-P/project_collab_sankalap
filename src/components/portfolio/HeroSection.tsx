'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { MousePointer2, Sparkles } from 'lucide-react';

const ORBS = Array.from({ length: 20 }, (_, i) => ({
  width: 100 + ((i * 37) % 400),
  height: 100 + ((i * 53) % 400),
  left: `${(i * 13) % 100}%`,
  top: `${(i * 29) % 100}%`,
  x: ((i * 19) % 100) - 50,
  y: ((i * 23) % 100) - 50,
  duration: 10 + ((i * 7) % 10),
}));

const SANKALP_LETTERS = "S.A.N.K.A.L.P.".split("");

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.3 }
  }
};

const letterVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 200 } }
};

export const HeroSection = () => {
  return (
    <section className="relative min-h-[90vh] flex flex-col items-center justify-center overflow-hidden bg-white dark:bg-slate-950 px-6">
      {/* Background Micro-animations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {ORBS.map((orb, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-indigo-500/10 dark:bg-indigo-400/5 blur-xl"
            style={{
              width: orb.width,
              height: orb.height,
              left: orb.left,
              top: orb.top,
            }}
            animate={{
              x: [0, orb.x],
              y: [0, orb.y],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: orb.duration,
              repeat: Infinity,
              ease: "linear"
            }}
          />
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 text-center max-w-4xl"
      >
        <motion.div
          initial={{ scale: 0, opacity: 0, rotate: -10 }}
          animate={{ scale: 1, opacity: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
          className="relative w-28 h-28 mx-auto mb-8 rounded-3xl overflow-hidden shadow-2xl shadow-indigo-500/20 border-4 border-white dark:border-slate-800"
        >
          <Image src="/syncro.jpg" alt="S.A.N.K.A.L.P Logo" fill className="object-cover" />
        </motion.div>

        <motion.h1 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="text-6xl md:text-8xl font-black tracking-tighter text-slate-900 dark:text-white mb-2 flex justify-center flex-wrap"
        >
          {SANKALP_LETTERS.map((char, index) => (
            <motion.span 
              key={index} 
              variants={letterVariants}
              className={`inline-block ${char === '.' ? 'text-indigo-500' : 'text-transparent bg-clip-text bg-gradient-to-br from-slate-900 to-slate-600 dark:from-white dark:to-slate-400'}`}
            >
              {char}
            </motion.span>
          ))}
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5, duration: 0.8 }}
          className="text-xl md:text-3xl font-bold tracking-tight text-indigo-600 dark:text-indigo-400 mb-8"
        >
          Solutions for Atmanirbhar Nation
        </motion.div>

        <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed">
          We are a clandestine collective of creators, engineers, and visionaries building the infrastructure of tomorrow. Our work is our signature.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link href="/feed">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black text-sm flex items-center gap-3 shadow-xl shadow-indigo-500/20 uppercase tracking-widest"
            >
              <span className="opacity-40 font-mono">01_</span> Explore Protocols
            </motion.button>
          </Link>
          <Link href="/login">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 bg-blue-600 border border-blue-500 text-white rounded-2xl font-black text-sm flex items-center gap-3 shadow-xl shadow-blue-500/40 uppercase tracking-widest hover:bg-blue-700 transition-all"
            >
              <span className="opacity-40 font-mono text-blue-200">02_</span> Initialize Sync
            </motion.button>
          </Link>
        </div>
      </motion.div>

      <motion.div
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="absolute bottom-10"
      >
        <MousePointer2 className="text-slate-400 dark:text-slate-600" size={24} />
      </motion.div>
    </section>
  );
};
