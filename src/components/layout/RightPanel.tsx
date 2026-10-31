"use client";

import { TrendingUp, Users, BookOpen, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import LiveActivityStream     from "../feed/LiveActivityStream";
import TopBuildersLeaderboard from "../feed/TopBuildersLeaderboard";
import { TOP_NAV_HEIGHT }     from "./constants";

export default function RightPanel() {
    return (
        <aside
            style={{ top: TOP_NAV_HEIGHT, height: `calc(100vh - ${TOP_NAV_HEIGHT}px)` }}
            className="w-full sticky overflow-y-auto border-l border-border bg-background hidden xl:block pb-16 scrollbar-thin"
        >
            <div className="p-4 space-y-4">

                {/* Quick links card */}
                <div className="saas-card p-4 space-y-2.5">
                    <div className="flex items-center justify-between px-1">
                        <h3 className="text-[11px] font-semibold text-muted uppercase tracking-wider">
                            Quick Explore
                        </h3>
                    </div>
                    <div className="space-y-1">
                        {[
                            { href: "/discover", Icon: TrendingUp, label: "Discover Projects", sub: "Browse active initiatives", color: "text-primary",     bg: "bg-primary-light"     },
                            { href: "/ideas",    Icon: BookOpen,   label: "My Proposals",      sub: "Manage your submissions",   color: "text-emerald-600", bg: "bg-emerald-500/12" },
                            { href: "/orgs",     Icon: Users,      label: "Organizations",     sub: "Explore builder hubs",      color: "text-primary",     bg: "bg-primary-light"     },
                        ].map(({ href, Icon, label, sub, color, bg }) => (
                            <Link
                                key={href}
                                href={href}
                                className="flex items-center justify-between gap-3 px-2.5 py-2 rounded-xl hover:bg-muted/80 transition-all group"
                            >
                                <div className="flex items-center gap-3 min-w-0">
                                    <div className={`w-8 h-8 rounded-xl ${bg} flex items-center justify-center shrink-0`}>
                                        <Icon className={`w-4 h-4 ${color}`} />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                                            {label}
                                        </p>
                                        <p className="text-[11px] text-muted truncate">{sub}</p>
                                    </div>
                                </div>
                                <ArrowUpRight className="w-3.5 h-3.5 text-muted opacity-0 group-hover:opacity-100 group-hover:text-primary transition-all shrink-0" />
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Live activity card */}
                <div className="saas-card p-4">
                    <LiveActivityStream />
                </div>

                {/* Leaderboard card */}
                <div className="saas-card p-4">
                    <TopBuildersLeaderboard />
                </div>

                {/* Footer */}
                <div className="px-2 pt-2 space-y-1.5">
                    <div className="flex flex-wrap gap-x-3.5 gap-y-1">
                        {["Privacy", "Terms", "Help", "About"].map(l => (
                            <Link key={l} href="#" className="text-[11px] text-muted hover:text-primary transition-colors">
                                {l}
                            </Link>
                        ))}
                    </div>
                    <p className="text-[11px] text-muted/70">
                        Madhyam AI Platform © {new Date().getFullYear()}
                    </p>
                </div>
            </div>
        </aside>
    );
}
