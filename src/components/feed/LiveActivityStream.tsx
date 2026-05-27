"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ThumbsUp, UserPlus, FileText, MessageCircle, Activity } from "lucide-react";
import { useEffect, useState } from "react";
import { formatDistanceToNowStrict } from "date-fns";

const getIcon = (type: string) => {
  switch (type) {
    case "VOTE":            return <ThumbsUp className="w-3.5 h-3.5 text-amber-500" />;
    case "JOIN":            return <UserPlus className="w-3.5 h-3.5 text-emerald-500" />;
    case "CREATE_PROPOSAL": return <FileText className="w-3.5 h-3.5 text-primary" />;
    case "FOLLOW":          return <UserPlus className="w-3.5 h-3.5 text-primary" />;
    case "COMMENT":         return <MessageCircle className="w-3.5 h-3.5 text-blue-500" />;
    default:                return <Activity className="w-3.5 h-3.5 text-muted" />;
  }
};

const getVerb = (type: string) => {
  switch (type) {
    case "VOTE":            return "upvoted";
    case "JOIN":            return "joined the platform";
    case "CREATE_PROPOSAL": return "submitted a proposal";
    case "FOLLOW":          return "started following";
    case "COMMENT":         return "commented on";
    default:                return "interacted with";
  }
};

function timeAgo(dateStr: string) {
  try {
    return formatDistanceToNowStrict(new Date(dateStr), { addSuffix: true });
  } catch {
    return "recently";
  }
}

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
      <div className="space-y-2">
        <h3 className="text-xs font-semibold text-muted uppercase tracking-wider px-1 mb-3">Recent Activity</h3>
        {[1, 2, 3].map(i => (
          <div key={i} className="h-14 bg-card rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between px-1 mb-3">
        <h3 className="text-xs font-semibold text-muted uppercase tracking-wider">Recent Activity</h3>
        <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
      </div>

      <AnimatePresence mode="popLayout">
        {activities.length === 0 ? (
          <p className="text-xs text-muted text-center py-6">No activity yet.</p>
        ) : (
          activities.map((act, i) => {
            const actorName = act.actorId?.name || "A user";
            const verb = getVerb(act.type);
            const target = act.metadata?.title;
            const showTarget = target && act.type !== "JOIN";

            return (
              <motion.div
                key={act._id}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ delay: i * 0.04 }}
                className="flex items-start gap-3 p-3 rounded-lg bg-card hover:bg-card-hover transition-colors"
              >
                <div className="mt-0.5 w-7 h-7 rounded-md bg-background border border-border flex items-center justify-center shrink-0">
                  {getIcon(act.type)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-foreground leading-snug">
                    <span className="font-semibold">{actorName}</span>
                    {" "}{verb}
                    {showTarget && (
                      <> <span className="text-primary font-medium">{target}</span></>
                    )}
                  </p>
                  <p className="text-[10px] text-muted mt-0.5">{timeAgo(act.createdAt)}</p>
                </div>
              </motion.div>
            );
          })
        )}
      </AnimatePresence>
    </div>
  );
}
