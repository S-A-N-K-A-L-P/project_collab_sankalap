"use client";

import { motion } from "framer-motion";
import { 
  MessageSquare, Share2, Bookmark, Eye, 
  Send, AtSign, Paperclip, MoreHorizontal,
  ThumbsUp, Flag
} from "lucide-react";

// 1. Project Social Stats
export function SocialStats() {
  return (
    <div className="p-6 bg-[#121214] border border-[#1f1f23] rounded-3xl grid grid-cols-3 gap-6">
       {[
         { icon: Eye, value: "1.2k", label: "Scans" },
         { icon: ThumbsUp, value: "482", label: "Endorse" },
         { icon: Share2, value: "94", label: "Relays" },
       ].map((stat, i) => (
         <div key={i} className="flex flex-col items-center gap-2 group cursor-pointer hover:border-[#6366f1]/50">
            <stat.icon className="w-4 h-4 text-[#1f1f23] group-hover:text-[#6366f1] transition-all" />
            <div className="flex flex-col items-center">
               <span className="text-[14px] font-black text-[#e5e7eb] tracking-tighter italic">{stat.value}</span>
               <span className="text-[8px] font-mono font-bold text-[#1f1f23] uppercase tracking-widest">{stat.label}</span>
            </div>
         </div>
       ))}
    </div>
  );
}

// 2. Tactical Comment Feed
export function TaskComments() {
  const comments = [
    { user: "Sarah C.", text: "Telemetry layer verified. Committing SHA: def2 tonight.", time: "12m ago" },
    { user: "Marcus V.", text: "Governance audit pending on Node Phase 2. Need Lead Architect approval.", time: "1h ago" },
  ];

  return (
    <div className="p-8 bg-[#121214] border border-[#1f1f23] rounded-3xl space-y-8">
       <div className="flex items-center gap-3">
          <MessageSquare className="w-5 h-5 text-[#6366f1]" />
          <h4 className="text-xl font-bold text-[#e5e7eb] uppercase italic tracking-tighter">Mission Comms</h4>
       </div>

       <div className="space-y-6">
          {comments.map((c, i) => (
            <div key={i} className="flex gap-4 group">
               <div className="w-10 h-10 rounded-xl bg-[#17171a] border border-[#1f1f23] shrink-0 overflow-hidden grayscale group-hover:grayscale-0 transition-all">
                  <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${c.user}`} className="w-full h-full object-cover" />
               </div>
               <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                     <span className="text-[13px] font-bold text-[#e5e7eb] tracking-tight uppercase">{c.user}</span>
                     <span className="text-[9px] font-mono font-bold text-[#1f1f23] uppercase tracking-widest">{c.time}</span>
                  </div>
                  <p className="text-[13px] text-[#9ca3af] leading-relaxed italic border-l-2 border-[#1f1f23] pl-4 group-hover:border-[#6366f1]/30 transition-all">
                    "{c.text}"
                  </p>
               </div>
            </div>
          ))}
       </div>

       <div className="relative pt-4">
          <input 
            placeholder="Broadcast tactical signal..."
            className="w-full py-4 pl-5 pr-12 bg-[#17171a] border border-[#1f1f23] rounded-2xl text-[13px] text-[#e5e7eb] focus:border-[#6366f1]/50 outline-none placeholder:text-[#1f1f23]"
          />
          <button className="absolute right-3 top-[calc(50%+2px)] -translate-y-1/2 p-2 text-[#1f1f23] hover:text-[#6366f1] transition-colors">
             <Send className="w-4 h-4" />
          </button>
       </div>
    </div>
  );
}

// 3. User Reputation/Rank Progress in Project context
export function NodeContextCard({ user }: { user: any }) {
  return (
    <div className="p-6 bg-[#121214] border border-[#1f1f23] rounded-3xl space-y-6 overflow-hidden relative">
       <div className="flex items-center justify-between">
          <h5 className="text-[11px] font-black uppercase tracking-[0.2em] text-[#1f1f23] font-mono">Node Context: You</h5>
          <Bookmark className="w-4 h-4 text-[#1f1f23]" />
       </div>
       
       <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full border-2 border-emerald-500/20 bg-[#17171a] p-1">
             <div className="w-full h-full rounded-full bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.3)] animate-pulse" />
          </div>
          <div className="flex flex-col">
             <span className="text-xl font-black text-[#e5e7eb] tracking-tighter uppercase italic">98.2hz Pulse</span>
             <span className="text-[9px] font-mono font-bold text-[#1f1f23] uppercase tracking-[0.2em]">Synchronized State</span>
          </div>
       </div>

       <div className="pt-4 space-y-2">
          <div className="flex justify-between items-center text-[10px] font-mono font-bold">
             <span className="text-[#1f1f23] uppercase">Rank Mastery</span>
             <span className="text-[#6366f1]">124 / 200 XP</span>
          </div>
          <div className="h-2 bg-[#17171a] border border-[#1f1f23] rounded-full p-0.5 overflow-hidden">
             <div className="h-full w-3/5 bg-[#6366f1] rounded-full" />
          </div>
       </div>
    </div>
  );
}
