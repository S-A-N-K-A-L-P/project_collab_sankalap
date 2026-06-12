"use client";

import { motion } from "framer-motion";
import { User, Shield, Zap, Award, ExternalLink } from "lucide-react";

export function ContributorList({ members }: { members: any[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
       {members.map((member, i) => (
         <ContributorCard key={i} member={member} index={i} />
       ))}
    </div>
  );
}

export function ContributorCard({ member, index }: { member: any, index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.05 }}
      className="p-5 bg-[#121214] border border-[#1f1f23] rounded-3xl hover:border-[#6366f1]/20 transition-all group"
    >
      <div className="flex items-center justify-between mb-4">
         <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl border border-[#1f1f23] bg-[#17171a] overflow-hidden grayscale group-hover:grayscale-0 transition-all">
               <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${member.name}`} alt="Avatar" className="w-full h-full object-cover" />
            </div>
            <div className="flex flex-col">
               <span className="text-[14px] font-bold text-[#e5e7eb] tracking-tight uppercase italic">{member.name}</span>
               <span className="text-[9px] font-mono font-bold text-[#1f1f23] uppercase tracking-widest">{member.role || "Operator"}</span>
            </div>
         </div>
         <div className="w-10 h-10 rounded-xl bg-[#17171a] border border-[#1f1f23] flex items-center justify-center">
            <Shield className="w-4 h-4 text-[#1f1f23] group-hover:text-[#6366f1] transition-colors" />
         </div>
      </div>

      <div className="grid grid-cols-3 gap-2 mt-2">
         {[
           { label: "XP", val: member.reputation || 0, icon: Zap },
           { label: "RANK", val: member.rank || 12, icon: Award },
           { label: "OPS", val: member.contributions || 0, icon: Shield },
         ].map((stat, i) => (
           <div key={i} className="p-3 bg-[#0b0b0c] border border-[#1f1f23] rounded-xl flex flex-col items-center gap-1">
              <span className="text-[10px] font-black text-[#e5e7eb] italic tracking-tighter">{stat.val}</span>
              <span className="text-[8px] font-mono font-bold text-[#1f1f23] uppercase tracking-widest">{stat.label}</span>
           </div>
         ))}
      </div>

      <button className="w-full mt-4 py-3 rounded-2xl bg-[#17171a] border border-[#1f1f23] text-[#9ca3af] hover:text-[#e5e7eb] hover:bg-[#1f1f23] transition-all text-[11px] font-bold uppercase tracking-wider flex items-center justify-center gap-2">
         Node Profile <ExternalLink className="w-3 h-3" />
      </button>
    </motion.div>
  );
}
