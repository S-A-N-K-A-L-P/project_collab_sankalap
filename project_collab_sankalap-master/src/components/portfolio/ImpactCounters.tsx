'use client';

import React from 'react';
import { motion, useInView } from 'framer-motion';
import { useRef, useEffect, useState } from 'react';



const Counter = ({ value, duration = 2 }: { value: number; duration?: number }) => {
  const [count, setCount] = useState(0);
  const nodeRef = useRef(null);
  const isInView = useInView(nodeRef, { once: true });

  useEffect(() => {
    if (isInView) {
      let start = 0;
      const end = value;
      const totalMiliseconds = duration * 1000;
      const incrementTime = 50;
      const totalSteps = totalMiliseconds / incrementTime;
      const stepValue = (end - start) / totalSteps;

      const timer = setInterval(() => {
        start += stepValue;
        if (start >= end) {
          setCount(end);
          clearInterval(timer);
        } else {
          setCount(start);
        }
      }, incrementTime);

      return () => clearInterval(timer);
    }
  }, [isInView, value, duration]);

  return <span ref={nodeRef}>{count.toLocaleString('en-US', { maximumFractionDigits: 1 })}</span>;
};

export const ImpactCounters = ({ stats }: { stats: { label: string, value: number, suffix: string, color: string, prefix?: string }[] }) => {
  return (
    <section className="py-24 bg-white dark:bg-slate-950 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-12">
          {stats.map((stat, idx) => (
            <div key={idx} className="text-center group">
              <div className={`text-4xl md:text-6xl font-black mb-2 ${stat.color} transition-transform duration-500 group-hover:scale-110`}>
                {stat.prefix}<Counter value={stat.value} />{stat.suffix}
              </div>
              <div className="text-slate-500 dark:text-slate-400 font-medium tracking-wide uppercase text-xs md:text-sm">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
