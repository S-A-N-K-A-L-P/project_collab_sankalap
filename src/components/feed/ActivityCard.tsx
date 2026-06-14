"use client";

import { UserPlus, ThumbsUp, LogIn, MessageCircle, Bell } from "lucide-react";
import { formatDistanceToNowStrict } from "date-fns";

interface ActivityCardProps {
  activity: {
    _id: string;
    type: string;
    actorId: { _id: string; name: string; avatar?: string };
    targetId: string;
    targetType: string;
    metadata?: any;
    createdAt: string;
  };
}

function timeAgo(d: string) {
  try { return formatDistanceToNowStrict(new Date(d), { addSuffix: true }); }
  catch { return "recently"; }
}

const ICON_MAP: Record<string, { icon: React.ReactNode; color: string }> = {
  FOLLOW:          { icon: <UserPlus   className="w-3.5 h-3.5" />, color: "text-primary"     },
  VOTE:            { icon: <ThumbsUp   className="w-3.5 h-3.5" />, color: "text-amber-500"   },
  JOIN:            { icon: <LogIn      className="w-3.5 h-3.5" />, color: "text-emerald-600" },
  COMMENT:         { icon: <MessageCircle className="w-3.5 h-3.5" />, color: "text-blue-500" },
  CREATE_PROPOSAL: { icon: <Bell       className="w-3.5 h-3.5" />, color: "text-primary"     },
};

export default function ActivityCard({ activity }: ActivityCardProps) {
  const actor  = activity.actorId?.name || "Someone";
  const target = activity.metadata?.title;
  const { icon, color } = ICON_MAP[activity.type] ?? ICON_MAP.CREATE_PROPOSAL;

  const message = () => {
    switch (activity.type) {
      case "FOLLOW":
        return <><strong>{actor}</strong> started following you</>;
      case "VOTE":
        return <><strong>{actor}</strong> upvoted <span className="text-primary font-medium">{target}</span></>;
      case "JOIN":
        return <><strong>{actor}</strong> requested to join <span className="text-primary font-medium">{target}</span></>;
      case "CREATE_PROPOSAL":
        return <><strong>{actor}</strong> submitted a proposal: <span className="font-medium">{target}</span></>;
      case "COMMENT":
        return <><strong>{actor}</strong> commented on <span className="text-primary font-medium">{target}</span></>;
      default:
        return <><strong>{actor}</strong> performed an action</>;
    }
  };

  return (
    <div
      className="flex items-start gap-3 p-4 bg-card border border-border rounded-xl transition-all duration-150 hover:border-border-strong hover:shadow-sm"
      style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.07), 0 1px 2px rgba(0,0,0,0.04)" }}
    >
      <div className={`mt-0.5 w-8 h-8 rounded-lg bg-background border border-border flex items-center justify-center shrink-0 ${color}`}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-foreground leading-snug">{message()}</p>
        <p className="text-xs text-muted mt-1">{timeAgo(activity.createdAt)}</p>
      </div>
    </div>
  );
}
