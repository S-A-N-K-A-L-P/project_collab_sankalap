"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Zap, UserPlus, ThumbsUp, CheckCircle2, MessageSquare, Activity } from "lucide-react";
import { useEffect, useState } from "react";

const getIcon = (type: string) => {
  switch (type) {
    case "vote": return { icon: ThumbsUp, color: "text-blue-500" };
    case "join": return { icon: UserPlus, color: "text-green-500" };
    case "proposal_created": return { icon: Zap, color: "text-amber-500" };
    case "comment": return { icon: MessageSquare, color: "text-purple-500" };
    default: return { icon: Activity, color: "text-slate-400" };
  }
};

export default function LiveActivityStream() {
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchActivities = async () => {
    try {
      const res = await fetch("/api/activity");
      const data = await res.json();
      if (Array.isArray(data)) setActivities(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
    const interval = setInterval(fetchActivities, 10000); // Poll every 10s
    return () => clearInterval(interval);
  }, []);

  if (loading && activities.length === 0) {
      return <div className="animate-pulse space-y-4">
          {[1,2,3].map(i => <div key={i} className="h-12 bg-slate-100 dark:bg-slate-800 rounded-xl" />)}
      </div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-2">
        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">System Logs</h3>
        <span className="flex h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
      </div>
      
      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
            {activities.length === 0 ? (
                <div className="text-[10px] font-mono text-slate-500 text-center py-4 uppercase">Waiting for protocol...</div>
            ) : (
                activities.map((act) => {
                    const { icon: Icon, color } = getIcon(act.type);
                    return (
                        <motion.div
                            key={act._id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="group flex items-start gap-4 p-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/50 border border-transparent hover:border-slate-100 dark:hover:border-slate-700/50 transition-all cursor-crosshair"
                        >
                            <div className={`mt-0.5 p-2 rounded-xl bg-slate-100 dark:bg-slate-800/50 ring-1 ring-slate-200/50 dark:ring-slate-700 group-hover:bg-white dark:group-hover:bg-slate-700 transition-all ${color}`}>
                                <Icon className="w-3.5 h-3.5" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-snug">
                                    <span className="font-black text-slate-900 dark:text-white uppercase tracking-tighter">{act.user?.name || "Anonymous"}</span> 
                                    {" "}
                                    {act.type === "vote" && "endorsed"}
                                    {act.type === "join" && "initialized"}
                                    {act.type === "proposal_created" && "broadcasted"}
                                    {act.type === "comment" && "interacted with"}
                                    {" "}
                                    <span className="font-bold text-blue-600 dark:text-blue-400 group-hover:text-blue-500 transition-colors">
                                        {act.targetName || "Archive"}
                                    </span>
                                </p>
                                <span className="text-[9px] font-mono text-slate-400 uppercase tracking-tighter mt-1 block opacity-60">
                                    {new Date(act.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • TRACE ID: {act._id.slice(-6)}
                                </span>
                            </div>
                        </motion.div>
                    );
                })
            )}
        </AnimatePresence>
      </div>
    </div>
  );
}
