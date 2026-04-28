'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Quote, ChevronLeft, ChevronRight } from 'lucide-react';

const testimonials = [
  { name: "John Doe", role: "Contributor", text: "S.A.N.K.A.L.P. Platform has changed the way I think about collaboration. It's not just a tool, it's a movement." },
  { name: "Sarah Lee", role: "Project Lead", text: "The synergy here is unmatched. We built Protocol Alpha from scratch in just 3 months." },
  { name: "Dev P.", role: "Security Researcher", text: "Transparency is hard-coded into the DNA here. I feel completely safe contributing." }
];

export const TestimonialCarousel = () => {
  const [current, setCurrent] = useState(0);

  const next = () => setCurrent((c) => (c + 1) % testimonials.length);
  const prev = () => setCurrent((c) => (c - 1 + testimonials.length) % testimonials.length);

  return (
    <section className="py-24 bg-indigo-600 px-6">
      <div className="max-w-4xl mx-auto text-center relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-12 text-indigo-400 opacity-20 hidden md:block">
          <Quote size={120} />
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="relative z-10 py-12"
          >
            <p className="text-2xl md:text-4xl font-medium text-white mb-8 leading-relaxed italic">
              "{testimonials[current].text}"
            </p>
            <div className="text-indigo-100">
              <span className="font-bold block text-lg">{testimonials[current].name}</span>
              <span className="text-sm opacity-60">{testimonials[current].role}</span>
            </div>
          </motion.div>
        </AnimatePresence>

        <div className="flex justify-center gap-4 mt-8">
          <button onClick={prev} className="w-12 h-12 rounded-full border border-white/20 text-white flex items-center justify-center hover:bg-white/10 transition-colors">
            <ChevronLeft size={24} />
          </button>
          <button onClick={next} className="w-12 h-12 rounded-full border border-white/20 text-white flex items-center justify-center hover:bg-white/10 transition-colors">
            <ChevronRight size={24} />
          </button>
        </div>
      </div>
    </section>
  );
};
