"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Zap, UserPlus, ArrowBigUp, Projector, MessageCircle, Activity } from "lucide-react";
import { useEffect, useState } from "react";

const getIcon = (type: string) => {
  switch (type) {
    case "VOTE": return <ArrowBigUp className="w-3.5 h-3.5 text-orange-500" />;
    case "JOIN": return <UserPlus className="w-3.5 h-3.5 text-emerald-500" />;
    case "CREATE_PROPOSAL": return <Zap className="w-3.5 h-3.5 text-[#6366f1]" />;
    case "FOLLOW": return <UserPlus className="w-3.5 h-3.5 text-[#6366f1]" />;
    case "COMMENT": return <MessageCircle className="w-3.5 h-3.5 text-blue-500" />;
    default: return <Activity className="w-3.5 h-3.5 text-[#9ca3af]" />;
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
    const interval = setInterval(fetchActivities, 15000); 
    return () => clearInterval(interval);
  }, []);

  if (loading && activities.length === 0) {
      return (
        <div className="space-y-3">
          {[1,2,3].map(i => (
            <div key={i} className="h-14 bg-[#121214] border border-[#1f1f23] rounded-2xl animate-pulse" />
          ))}
        </div>
      );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-1">
        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#1f1f23] font-mono">System Signal Stream</h3>
        <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
      </div>
      
      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
            {activities.length === 0 ? (
                <div className="text-[10px] font-mono text-[#1f1f23] text-center py-6 uppercase tracking-widest font-black">Scanning Network...</div>
            ) : (
                activities.map((act) => {
                    const actorName = act.actorId?.name || "System Agent";
                  const created = new Date(act.createdAt);
                  const timeLabel = Number.isNaN(created.getTime()) ? '--:--' : created.toISOString().slice(11, 16);
                    return (
                        <motion.div
                            key={act._id}
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.98 }}
                            className="group flex items-start gap-3.5 p-3.5 rounded-2xl bg-[#121214] border border-[#1f1f23] hover:border-[#2a2a2f] transition-all cursor-default"
                        >
                            <div className="mt-0.5 w-8 h-8 rounded-xl bg-[#17171a] border border-[#1f1f23] flex items-center justify-center shrink-0">
                                {getIcon(act.type)}
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="text-[12px] text-[#9ca3af] leading-tight font-medium">
                                    <span className="text-[#e5e7eb] font-bold">{actorName}</span> 
                                    {" "}
                                    {act.type === "VOTE" && "endorsed"}
                                    {act.type === "JOIN" && "initialized"}
                                    {act.type === "FOLLOW" && "synchronized with"}
                                    {act.type === "CREATE_PROPOSAL" && "broadcasted"}
                                    {act.type === "COMMENT" && "interacted with"}
                                    {" "}
                                    <span className="text-[#6366f1] font-bold">
                                        {act.metadata?.title || "PROTOCOL"}
                                    </span>
                                </p>
                                <div className="flex items-center gap-2 mt-1 opacity-60">
                                    <span className="text-[9px] font-mono font-bold text-[#1f1f23] uppercase tracking-tighter">
                                      {timeLabel}
                                    </span>
                                    <div className="w-1 h-1 rounded-full bg-[#1f1f23]" />
                                    <span className="text-[9px] font-mono font-bold text-[#1f1f23] uppercase tracking-tighter">
                                        ID: {act._id.slice(-6)}
                                    </span>
                                </div>
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
