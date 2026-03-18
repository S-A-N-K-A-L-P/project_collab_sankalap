"use client";

import { motion } from "framer-motion";

const builders = [
  { name: "Tushar", initials: "T" },
  { name: "Aman", initials: "A" },
  { name: "Sankalp", initials: "S" },
  { name: "Riya", initials: "R" },
  { name: "Deepak", initials: "D" },
];

export default function BuildersOnline() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-2">
        <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Builders Online</h3>
        <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400">23 Active</span>
      </div>
      
      <div className="flex flex-wrap gap-2 px-1">
        {builders.map((builder, i) => (
          <motion.div
            key={builder.name}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 20, delay: i * 0.05 }}
            className="relative group cursor-pointer"
          >
            <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center font-bold text-slate-900 dark:text-white text-xs group-hover:border-blue-500 transition-all">
              {builder.initials}
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white dark:border-slate-900" />
            
            {/* Tooltip */}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-slate-900 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
              {builder.name}
            </div>
          </motion.div>
        ))}
        <div className="w-9 h-9 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-dashed border-slate-200 dark:border-slate-700 flex items-center justify-center text-[10px] font-bold text-slate-400">
          +18
        </div>
      </div>
    </div>
  );
}
