"use client";

import { TrendingUp, Users, Trophy, Activity, Zap } from "lucide-react";
import Link from "next/link";
import LiveActivityStream from "../feed/LiveActivityStream";
import TopBuildersLeaderboard from "../feed/TopBuildersLeaderboard";

export default function RightPanel() {
    return (
        <aside className="w-80 h-screen sticky top-0 bg-background border-l border-border-subtle overflow-y-auto no-scrollbar pb-20 hidden xl:block">
            <div className="p-5 space-y-8">

                {/* Core Platform Telemetry */}
                <div className="bg-surface border border-border-subtle rounded-xl p-5 relative overflow-hidden group hover:border-border-strong transition-all duration-150">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <Activity className="w-3.5 h-3.5 text-accent" />
                            <span className="text-[10px] font-mono font-bold text-muted uppercase tracking-[0.15em]">Node Sync Status</span>
                        </div>
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    </div>
                    <div className="space-y-1">
                        <h3 className="text-xl font-bold text-foreground tracking-tight leading-none">98.2% Nominal</h3>
                        <p className="text-[11px] text-muted leading-relaxed">
                            Packet integration verified across 124 active research nodes.
                        </p>
                    </div>
                </div>

                {/* Dynamic Activity Stream */}
                <LiveActivityStream />

                {/* Dynamic Leaderboard */}
                <div className="pt-2 border-t border-border-subtle">
                    <TopBuildersLeaderboard />
                </div>

                {/* System Credits / Footer */}
                <div className="pt-6 px-1 space-y-4">
                    <div className="flex flex-wrap gap-x-4 gap-y-2 text-[10px] font-bold text-muted uppercase tracking-widest font-mono">
                        <Link href="#" className="hover:text-accent transition-colors">Privacy</Link>
                        <Link href="#" className="hover:text-accent transition-colors">Protocols</Link>
                        <Link href="#" className="hover:text-accent transition-colors">Nodes</Link>
                        <Link href="#" className="hover:text-accent transition-colors">Legal</Link>
                    </div>

                    <div className="space-y-1 pt-2">
                        <div className="flex items-center gap-2 text-[9px] font-mono font-bold text-muted uppercase tracking-[0.2em]">
                            <Zap className="w-3 h-3 fill-current" />
                            SANKALP Engine v4.2
                        </div>
                        <p className="text-[9px] font-mono font-medium text-muted uppercase tracking-widest opacity-60">
                            Solutions for Atmanirbhar Nation © 2026.
                        </p>
                    </div>
                </div>
            </div>
        </aside>
    );
}
