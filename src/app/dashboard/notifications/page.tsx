"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Bell, 
  Info, 
  MessageSquare, 
  Zap, 
  Star, 
  UserPlus, 
  Layers, 
  Heart, 
  Rocket, 
  Loader2 
} from "lucide-react";

export default function NotificationsPage() {
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchActivities = async () => {
    try {
      const res = await fetch("/api/activity");
      const data = await res.json();
      setActivities(data);
    } catch (err) {
      console.error("Failed to fetch signals:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
    const interval = setInterval(fetchActivities, 10000); // Poll every 10s
    return () => clearInterval(interval);
  }, []);

  const getSignalConfig = (type: string) => {
    switch (type) {
      case "vote": return { icon: Heart, color: "text-rose-500", label: "Endorsement" };
      case "join": return { icon: UserPlus, color: "text-blue-500", label: "Recruitment" };
      case "proposal_created": return { icon: Rocket, color: "text-emerald-500", label: "Vision Broadcast" };
      case "status_change": return { icon: Zap, color: "text-amber-500", label: "Protocol Change" };
      default: return { icon: Info, color: "text-slate-500", label: "Signal" };
    }
  };

  if (loading && activities.length === 0) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600 opacity-20" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tighter text-slate-900 dark:text-white uppercase italic">Signals</h1>
          <p className="text-slate-500 font-medium text-sm mt-1">Real-time pulse of the network.</p>
        </div>
        <div className="px-3 py-1 bg-blue-50 dark:bg-blue-900/20 rounded-full border border-blue-100 dark:border-blue-800 flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
            <span className="text-[10px] font-mono font-black text-blue-600 uppercase tracking-widest">Live Monitoring</span>
        </div>
      </div>

      <div className="space-y-4">
        {activities.map((n, i) => {
          const config = getSignalConfig(n.type);
          return (
            <motion.div
              key={n._id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex items-start gap-5 p-5 bg-white dark:bg-slate-900/50 rounded-3xl border border-slate-200 dark:border-slate-800 hover:border-blue-500/30 transition-all group cursor-default shadow-sm"
            >
              <div className={`p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 group-hover:bg-white dark:group-hover:bg-slate-700 transition-colors ${config.color} border border-transparent group-hover:border-slate-100 dark:group-hover:border-slate-600`}>
                <config.icon className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm uppercase tracking-tight">
                    {config.label} <span className="text-slate-400 font-light mx-1">/</span> <span className="text-blue-500">{n.user?.name || "System"}</span>
                  </h3>
                  <span className="text-[10px] font-mono text-slate-400 font-bold uppercase tracking-tight">
                    {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed font-medium">
                  {n.message || `Activity detected ${n.proposal ? `on "${n.proposal.title}"` : ""}`}
                </p>
                <div className="mt-3 flex items-center gap-2 opacity-30 group-hover:opacity-100 transition-opacity">
                    <span className="text-[8px] font-mono text-slate-400 uppercase tracking-[0.2em]">Trace: {n._id.slice(-8)}</span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
      
      {activities.length === 0 && (
        <div className="text-center py-20 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-[3rem] opacity-50">
            <Bell className="w-8 h-8 mx-auto mb-4 text-slate-300" />
            <p className="text-slate-400 font-mono text-xs uppercase tracking-widest">No active signals detected.</p>
        </div>
      )}
    </div>
  );
}
