"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

export default function BuildersOnline() {
  const [builders, setBuilders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBuilders = async () => {
    try {
      const res = await fetch("/api/builders/online");
      const data = await res.json();
      if (Array.isArray(data)) setBuilders(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBuilders();
    const interval = setInterval(fetchBuilders, 30000); // Online status polls every 30s
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-2">
        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Operators</h3>
        <span className="text-[9px] font-mono font-bold text-blue-500 bg-blue-500/10 px-1.5 py-0.5 rounded uppercase">
            {builders.length || 0} active
        </span>
      </div>
      
      <div className="flex flex-wrap gap-2.5 px-1">
        <AnimatePresence>
            {builders.map((builder, i) => (
            <motion.div
                key={builder._id}
                layout
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                className="relative group cursor-crosshair"
            >
                <div className="w-10 h-10 rounded-2xl bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 flex items-center justify-center font-black text-slate-900 dark:text-white text-xs group-hover:border-blue-500 group-hover:shadow-lg group-hover:shadow-blue-500/20 transition-all overflow-hidden">
                    {builder.avatar ? (
                        <img src={builder.avatar} alt={builder.name} className="w-full h-full object-cover" />
                    ) : (
                        builder.name[0].toUpperCase()
                    )}
                </div>
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-[2.5px] border-white dark:border-slate-900 shadow-sm" />
                
                {/* Protocol Tooltip */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-slate-900 text-white text-[9px] rounded-lg opacity-0 group-hover:opacity-100 transition-all pointer-events-none whitespace-nowrap z-50 font-mono border border-slate-800 shadow-2xl scale-95 group-hover:scale-100">
                  <span className="text-blue-400 uppercase">IDENT:</span> {builder.name}<br/>
                  <span className="text-slate-500 uppercase">STATUS:</span> ACTIVE_SESSION
                </div>
            </motion.div>
            ))}
            
            {!loading && builders.length === 0 && (
                <div className="w-full text-center py-2">
                    <span className="text-[9px] font-mono text-slate-500 uppercase italic opacity-60 leading-none">Scanning for active pulses...</span>
                </div>
            )}
        </AnimatePresence>
      </div>
    </div>
  );
}
