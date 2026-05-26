"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Zap, UserPlus, ArrowBigUp, MessageCircle, Activity } from "lucide-react";
import { useEffect, useState } from "react";

const getIcon = (type: string) => {
  switch (type) {
    case "VOTE": return <ArrowBigUp className="w-3.5 h-3.5 text-amber-500" />;
    case "JOIN": return <UserPlus className="w-3.5 h-3.5 text-emerald-500" />;
    case "CREATE_PROPOSAL": return <Zap className="w-3.5 h-3.5 text-accent" />;
    case "FOLLOW": return <UserPlus className="w-3.5 h-3.5 text-accent" />;
    case "COMMENT": return <MessageCircle className="w-3.5 h-3.5 text-blue-500" />;
    default: return <Activity className="w-3.5 h-3.5 text-muted" />;
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
        {[1, 2, 3].map(i => (
          <div key={i} className="h-14 bg-surface border border-border-subtle rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between px-1">
        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted font-mono">Platform Signal Stream</h3>
        <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
      </div>

      <div className="space-y-2">
        <AnimatePresence mode="popLayout">
          {activities.length === 0 ? (
            <div className="text-[10px] font-mono text-muted text-center py-6 uppercase tracking-widest font-black">Scanning Network...</div>
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
                  className="group flex items-start gap-3 p-3 rounded-xl bg-surface border border-border-subtle hover:border-border-strong transition-all cursor-default"
                >
                  <div className="mt-0.5 w-8 h-8 rounded-lg bg-surface-alt border border-border-subtle flex items-center justify-center shrink-0">
                    {getIcon(act.type)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[12px] text-foreground/80 leading-tight font-medium">
                      <span className="text-foreground font-bold">{actorName}</span>
                      {" "}
                      {act.type === "VOTE" && "endorsed"}
                      {act.type === "JOIN" && "initialized"}
                      {act.type === "FOLLOW" && "synchronized with"}
                      {act.type === "CREATE_PROPOSAL" && "broadcasted"}
                      {act.type === "COMMENT" && "interacted with"}
                      {" "}
                      <span className="text-accent font-bold">
                        {act.metadata?.title || "PROTOCOL"}
                      </span>
                    </p>
                    <div className="flex items-center gap-1.5 mt-1 opacity-60">
                      <span className="text-[9px] font-mono font-bold text-muted uppercase tracking-tighter">
                        {timeLabel}
                      </span>
                      <div className="w-1 h-1 rounded-full bg-border-subtle" />
                      <span className="text-[9px] font-mono font-bold text-muted uppercase tracking-tighter">
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
