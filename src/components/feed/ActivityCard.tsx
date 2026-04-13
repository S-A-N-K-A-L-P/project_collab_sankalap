"use client";

import { UserPlus, ArrowBigUp, Projector, MessageCircle, Zap } from "lucide-react";
import Link from "next/link";

interface ActivityCardProps {
  activity: {
    _id: string;
    type: string;
    actorId: {
      _id: string;
      name: string;
      avatar?: string;
    };
    targetId: string;
    targetType: string;
    metadata?: any;
    createdAt: string;
  };
}

export default function ActivityCard({ activity }: ActivityCardProps) {
  const created = new Date(activity.createdAt);
  const timeLabel = Number.isNaN(created.getTime())
    ? '--:--'
    : created.toISOString().slice(11, 16);

  const getIcon = (type: string) => {
    switch (type) {
      case 'FOLLOW': return <UserPlus className="w-3.5 h-3.5 text-accent" />;
      case 'VOTE': return <ArrowBigUp className="w-3.5 h-3.5 text-orange-500" />;
      case 'JOIN': return <Projector className="w-3.5 h-3.5 text-emerald-500" />;
      case 'COMMENT': return <MessageCircle className="w-3.5 h-3.5 text-blue-500" />;
      default: return <Zap className="w-3.5 h-3.5 text-muted" />;
    }
  };

  const getMessage = () => {
    const actorName = activity.actorId?.name || "System Agent";
    switch (activity.type) {
      case 'FOLLOW': return (
        <><span className="font-bold text-foreground">{actorName}</span> synchronized with your node</>
      );
      case 'VOTE': return (
        <><span className="font-bold text-foreground">{actorName}</span> endorsed protocol <span className="text-accent">{activity.metadata?.title}</span></>
      );
      case 'JOIN': return (
        <><span className="font-bold text-foreground">{actorName}</span> requested authorization for <span className="text-accent">{activity.metadata?.title}</span></>
      );
      case 'CREATE_PROPOSAL': return (
        <><span className="font-bold text-foreground">{actorName}</span> initialized new protocol <span className="text-foreground">{activity.metadata?.title}</span></>
      );
      default: return `${actorName} performed a system action`;
    }
  };

  return (
    <div className="flex items-start gap-4 p-4 bg-surface border border-border-subtle rounded-2xl group transition-all duration-150 hover:border-border-strong">
      <div className="mt-1 w-8 h-8 rounded-lg bg-surface-alt border border-border-subtle flex items-center justify-center shadow-sm">
        {getIcon(activity.type)}
      </div>
      <div className="flex-1">
        <p className="text-[13px] text-muted leading-relaxed tracking-tight">
          {getMessage()}
        </p>
        <div className="flex items-center gap-3 mt-1.5">
          <span className="text-[10px] font-mono font-bold text-muted uppercase tracking-widest">
            {timeLabel}
          </span>
          <div className="w-1 h-1 rounded-full bg-border-subtle" />
          <button className="text-[10px] font-bold text-accent uppercase tracking-tight hover:underline">Details</button>
        </div>
      </div>
    </div>
  );
}
