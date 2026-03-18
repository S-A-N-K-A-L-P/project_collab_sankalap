"use client";

import { TrendingUp, Users, Trophy, Activity, Zap } from "lucide-react";
import Link from "next/link";

const sections = [
  { 
    title: "Trending Protocols", 
    icon: TrendingUp, 
    items: [
      { id: 1, label: "#Artsy_v2", trend: "+24.5%", color: "text-emerald-500" },
      { id: 2, label: "#Syncro_OS", trend: "+12.2%", color: "text-blue-500" },
      { id: 3, label: "#Pixel_Base", trend: "+8.9%", color: "text-slate-500" },
    ]
  },
  { 
    title: "Nodes Online", 
    icon: Users, 
    items: [
      { id: 1, label: "Tushar G.", status: "Architect", color: "text-blue-500" },
      { id: 2, label: "Sarah C.", status: "Developer", color: "text-emerald-500" },
      { id: 3, label: "Marcus V.", status: "Lead", color: "text-indigo-500" },
    ]
  }
];

export default function RightPanel() {
  return (
    <aside className="w-[320px] h-screen sticky top-0 bg-[#0b0b0c] border-l border-[#1f1f23] overflow-y-auto p-6 hidden xl:block">
      <div className="space-y-8">
        {/* Network Status Widget */}
        <div className="bg-[#121214] border border-[#1f1f23] rounded-2xl p-5 relative overflow-hidden group hover:border-[#2a2a2f] transition-all duration-150">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-[#6366f1]" />
                    <span className="text-[10px] font-mono font-bold text-[#9ca3af] uppercase tracking-[0.1em]">Signal Strength</span>
                </div>
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.3)]" />
            </div>
            <div className="space-y-1">
                <h3 className="text-xl font-black text-[#e5e7eb] tracking-tighter uppercase italic">98.2%</h3>
                <p className="text-[10px] text-[#9ca3af] font-mono uppercase tracking-widest leading-tight">Uptime verified across 124 global nodes.</p>
            </div>
        </div>

        {/* Dynamic Sections */}
        {sections.map((section) => (
          <div key={section.title} className="space-y-4">
            <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                    <section.icon className="w-3.5 h-3.5 text-[#9ca3af]" />
                    <h3 className="text-[11px] font-bold text-[#e5e7eb] uppercase tracking-widest">{section.title}</h3>
                </div>
                <button className="text-[10px] font-bold text-[#6366f1] hover:underline uppercase tracking-tight transition-all">View All</button>
            </div>
            
            <div className="bg-[#121214] border border-[#1f1f23] rounded-2xl overflow-hidden">
                {section.items.map((item, i) => (
                    <div 
                        key={item.id} 
                        className={`p-3 flex items-center justify-between hover:bg-white/[0.02] transition-colors cursor-default ${
                            i !== section.items.length - 1 ? 'border-b border-[#1f1f23]' : ''
                        }`}
                    >
                        <div className="flex items-center gap-2.5">
                            <div className="w-1.5 h-1.5 rounded-full bg-[#1f1f23]" />
                            <span className="text-[13px] font-medium text-[#e5e7eb] tracking-tight">{item.label}</span>
                        </div>
                        <span className={`text-[10px] font-mono font-bold uppercase ${item.color}`}>
                            {item.trend || item.status}
                        </span>
                    </div>
                ))}
            </div>
          </div>
        ))}

        {/* Footer Links */}
        <div className="pt-4 px-2 space-y-4">
            <div className="flex flex-wrap gap-x-4 gap-y-2 text-[10px] font-bold text-[#9ca3af] uppercase tracking-wider font-mono">
                <Link href="#" className="hover:text-[#e5e7eb]">Privacy</Link>
                <Link href="#" className="hover:text-[#e5e7eb]">Protocols</Link>
                <Link href="#" className="hover:text-[#e5e7eb]">Network</Link>
            </div>
            <div className="flex items-center gap-2 text-[9px] font-mono font-medium text-slate-800 uppercase tracking-[0.2em]">
                <Zap className="w-3 h-3 fill-current" />
                Pixel_OS Framework © 2026
            </div>
        </div>
      </div>
    </aside>
  );
}
