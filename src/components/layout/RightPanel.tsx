"use client";

import { TrendingUp, Users, Trophy, Activity, Zap } from "lucide-react";
import Link from "next/link";
import LiveActivityStream from "../feed/LiveActivityStream";
import TopBuildersLeaderboard from "../feed/TopBuildersLeaderboard";

export default function RightPanel() {
    return (
        <aside className="w-85 h-screen sticky top-0 bg-background border-l border-border-subtle overflow-y-auto no-scrollbar pb-20 hidden xl:block">
            <div className="p-6 space-y-10">

                {/* Network Status Widget */}
                <div className="bg-surface border border-border-subtle rounded-2xl p-6 relative overflow-hidden group hover:border-border-strong transition-all duration-150">
                    <div className="flex items-center justify-between mb-5">
                        <div className="flex items-center gap-2.5">
                            <Activity className="w-3.5 h-3.5 text-accent" />
                            <span className="text-[10px] font-mono font-bold text-muted uppercase tracking-[0.15em]">Signal Strength</span>
                        </div>
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                    </div>
                    <div className="space-y-1.5">
                        <h3 className="text-2xl font-black text-foreground tracking-tighter uppercase italic leading-none">98.2%</h3>
                        <p className="text-[10px] text-muted font-mono uppercase tracking-widest leading-relaxed">
                            Packet integrity verified across 124 global nodes.
                        </p>
                    </div>
                </div>

                {/* Dynamic Activity Stream */}
                <LiveActivityStream />

                {/* Dynamic Leaderboard */}
                <div className="pt-4 border-t border-border-subtle">
                    <TopBuildersLeaderboard />
                </div>

                {/* System Credits / Footer */}
                <div className="pt-8 px-1 space-y-6">
                    <div className="flex flex-wrap gap-x-5 gap-y-3 text-[10px] font-bold text-muted uppercase tracking-widest font-mono">
                        <Link href="#" className="hover:text-accent transition-colors">Privacy</Link>
                        <Link href="#" className="hover:text-accent transition-colors">Protocols</Link>
                        <Link href="#" className="hover:text-accent transition-colors">Nodes</Link>
                        <Link href="#" className="hover:text-accent transition-colors">Legal</Link>
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-center gap-2.5 text-[9px] font-mono font-bold text-muted uppercase tracking-[0.25em]">
                            <Zap className="w-3.5 h-3.5 fill-current" />
                            Pixel_OS Kernel v4.2.0
                        </div>
                        <p className="text-[9px] font-mono font-medium text-muted uppercase tracking-widest opacity-60">
                            Proprietary collective technology since 2026.
                        </p>
                    </div>
                </div>
            </div>
        </aside>
    );
}
