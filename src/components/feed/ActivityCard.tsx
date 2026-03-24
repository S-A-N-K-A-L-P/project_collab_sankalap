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
    switch(type) {
      case 'FOLLOW': return <UserPlus className="w-3.5 h-3.5 text-[#6366f1]" />;
      case 'VOTE': return <ArrowBigUp className="w-3.5 h-3.5 text-orange-500" />;
      case 'JOIN': return <Projector className="w-3.5 h-3.5 text-emerald-500" />;
      case 'COMMENT': return <MessageCircle className="w-3.5 h-3.5 text-blue-500" />;
      default: return <Zap className="w-3.5 h-3.5 text-[#9ca3af]" />;
    }
  };

  const getMessage = () => {
    const actorName = activity.actorId?.name || "System Agent";
    switch(activity.type) {
      case 'FOLLOW': return (
        <><span className="font-bold text-[#e5e7eb]">{actorName}</span> synchronized with your node</>
      );
      case 'VOTE': return (
        <><span className="font-bold text-[#e5e7eb]">{actorName}</span> endorsed protocol <span className="text-[#6366f1]">{activity.metadata?.title}</span></>
      );
      case 'JOIN': return (
        <><span className="font-bold text-[#e5e7eb]">{actorName}</span> requested authorization for <span className="text-[#6366f1]">{activity.metadata?.title}</span></>
      );
      case 'CREATE_PROPOSAL': return (
        <><span className="font-bold text-[#e5e7eb]">{actorName}</span> initialized new protocol <span className="text-white">{activity.metadata?.title}</span></>
      );
      default: return `${actorName} performed a system action`;
    }
  };

  return (
    <div className="flex items-start gap-4 p-4 bg-[#121214] border border-[#1f1f23] rounded-2xl group transition-all duration-150 hover:border-[#2a2a2f]">
        <div className="mt-1 w-8 h-8 rounded-lg bg-[#17171a] border border-[#1f1f23] flex items-center justify-center shadow-sm">
            {getIcon(activity.type)}
        </div>
        <div className="flex-1">
            <p className="text-[13px] text-[#9ca3af] leading-relaxed tracking-tight">
                {getMessage()}
            </p>
            <div className="flex items-center gap-3 mt-1.5">
                <span className="text-[10px] font-mono font-bold text-[#1f1f23] uppercase tracking-widest">
                  {timeLabel}
                </span>
                <div className="w-1 h-1 rounded-full bg-[#1f1f23]" />
                <button className="text-[10px] font-bold text-[#6366f1] uppercase tracking-tight hover:underline">Details</button>
            </div>
        </div>
    </div>
  );
}
