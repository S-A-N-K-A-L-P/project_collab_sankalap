"use client";

import { PieChart, Zap, UserPlus, FileText } from "lucide-react";

interface ProfileStatsBarProps {
  stats: {
    followers: number;
    following: number;
    proposals: number;
    reputation: number;
  };
}

export default function ProfileStatsBar({ stats }: ProfileStatsBarProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 px-1">
      <div className="bg-[#121214] border border-[#1f1f23] rounded-2xl p-4 shadow-sm flex items-center gap-4 transition-all hover:border-[#2a2a2f]">
        <div className="w-10 h-10 rounded-xl bg-[#17171a] flex items-center justify-center border border-[#1f1f23]">
            <UserPlus className="w-5 h-5 text-[#6366f1]" />
        </div>
        <div>
            <p className="text-[9px] font-mono font-black text-[#1f1f23] uppercase tracking-widest">Nodes</p>
            <p className="text-lg font-bold text-[#e5e7eb] leading-none">{stats.followers}</p>
        </div>
      </div>

      <div className="bg-[#121214] border border-[#1f1f23] rounded-2xl p-4 shadow-sm flex items-center gap-4 transition-all hover:border-[#2a2a2f]">
        <div className="w-10 h-10 rounded-xl bg-[#17171a] flex items-center justify-center border border-[#1f1f23]">
            <Zap className="w-5 h-5 text-emerald-500" />
        </div>
        <div>
            <p className="text-[9px] font-mono font-black text-[#1f1f23] uppercase tracking-widest">Syncs</p>
            <p className="text-lg font-bold text-[#e5e7eb] leading-none">{stats.following}</p>
        </div>
      </div>

      <div className="bg-[#121214] border border-[#1f1f23] rounded-2xl p-4 shadow-sm flex items-center gap-4 transition-all hover:border-[#2a2a2f]">
        <div className="w-10 h-10 rounded-xl bg-[#17171a] flex items-center justify-center border border-[#1f1f23]">
            <FileText className="w-5 h-5 text-orange-500" />
        </div>
        <div>
            <p className="text-[9px] font-mono font-black text-[#1f1f23] uppercase tracking-widest">Signals</p>
            <p className="text-lg font-bold text-[#e5e7eb] leading-none">{stats.proposals}</p>
        </div>
      </div>

      <div className="bg-[#121214] border border-[#1f1f23] rounded-2xl p-4 shadow-sm flex items-center gap-4 transition-all hover:border-[#2a2a2f]">
        <div className="w-10 h-10 rounded-xl bg-[#17171a] flex items-center justify-center border border-[#1f1f23]">
            <PieChart className="w-5 h-5 text-indigo-500" />
        </div>
        <div>
            <p className="text-[9px] font-mono font-black text-[#1f1f23] uppercase tracking-widest">Rep</p>
            <p className="text-lg font-bold text-[#e5e7eb] leading-none">{stats.reputation}</p>
        </div>
      </div>
    </div>
  );
}
