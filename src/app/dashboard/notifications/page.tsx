"use client";

import { motion } from "framer-motion";
import { Bell, Info, MessageSquare, Zap, Star } from "lucide-react";

const notifications = [
  { id: 1, type: "system", title: "Protocol Update", message: "Kernel v2.4.9 has been deployed successfully.", time: "2m ago", icon: Info, color: "text-blue-500" },
  { id: 2, type: "social", title: "New Endorsement", message: "Sankalp upvoted your 'AI Dev Optimizer' proposal.", time: "15m ago", icon: Zap, color: "text-amber-500" },
  { id: 3, type: "social", title: "New Contributor", message: "Aman joined the 'Pixel Platform' project.", time: "1h ago", icon: Star, color: "text-purple-500" },
  { id: 4, type: "system", title: "Server Status", message: "Cloud sync initialized. All nodes active.", time: "3h ago", icon: Bell, color: "text-green-500" },
];

export default function NotificationsPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-black tracking-tighter text-slate-900 dark:text-white uppercase italic">Signals</h1>
        <p className="text-slate-500 font-medium text-sm mt-1">Real-time pulse of the network.</p>
      </div>

      <div className="space-y-4">
        {notifications.map((n, i) => (
          <motion.div
            key={n.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="flex items-start gap-5 p-5 bg-white dark:bg-slate-900/50 rounded-3xl border border-slate-200 dark:border-slate-800 hover:border-blue-500/30 transition-all group cursor-default"
          >
            <div className={`p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 group-hover:bg-white dark:group-hover:bg-slate-700 transition-colors ${n.color}`}>
              <n.icon className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2 mb-1">
                <h3 className="font-bold text-slate-900 dark:text-white text-sm uppercase tracking-tight">{n.title}</h3>
                <span className="text-[10px] font-mono text-slate-400 font-bold uppercase">{n.time}</span>
              </div>
              <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">{n.message}</p>
            </div>
          </motion.div>
        ))}
      </div>
      
      {notifications.length === 0 && (
        <div className="text-center py-20 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-[3rem]">
            <p className="text-slate-400 font-mono text-xs uppercase tracking-widest">No active signals detected.</p>
        </div>
      )}
    </div>
  );
}
