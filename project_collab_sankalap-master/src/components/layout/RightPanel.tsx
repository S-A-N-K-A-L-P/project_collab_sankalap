"use client";

import { TrendingUp, Users, BookOpen } from "lucide-react";
import Link from "next/link";
import LiveActivityStream    from "../feed/LiveActivityStream";
import TopBuildersLeaderboard from "../feed/TopBuildersLeaderboard";
import { TOP_NAV_HEIGHT }    from "./constants";

export default function RightPanel() {
    return (
        <aside
            style={{ top: TOP_NAV_HEIGHT, height: `calc(100vh - ${TOP_NAV_HEIGHT}px)` }}
            className="w-full sticky overflow-y-auto border-l border-border bg-background hidden xl:block pb-20"
        >
            <div className="p-5 space-y-6">

                {/* Quick links */}
                <div className="space-y-1">
                    <h3 className="text-xs font-semibold text-muted uppercase tracking-wider px-1 mb-2">
                        Explore
                    </h3>
                    {[
                        { href: "/discover", Icon: TrendingUp, label: "Discover Projects",  sub: "Browse active initiatives",      color: "text-primary",     bg: "bg-primary/10"      },
                        { href: "/ideas",    Icon: BookOpen,   label: "My Proposals",        sub: "View your submissions",          color: "text-emerald-600", bg: "bg-emerald-500/10"  },
                        { href: "/profile",  Icon: Users,      label: "Community",           sub: "Connect with contributors",      color: "text-blue-600",    bg: "bg-blue-500/10"     },
                    ].map(({ href, Icon, label, sub, color, bg }) => (
                        <Link
                            key={href}
                            href={href}
                            className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-card transition-colors group"
                        >
                            <div className={`w-8 h-8 rounded-lg ${bg} flex items-center justify-center shrink-0`}>
                                <Icon className={`w-4 h-4 ${color}`} />
                            </div>
                            <div>
                                <p className={`text-sm font-semibold text-foreground group-hover:${color} transition-colors`}>
                                    {label}
                                </p>
                                <p className="text-xs text-muted">{sub}</p>
                            </div>
                        </Link>
                    ))}
                </div>

                <hr className="border-border" />

                {/* Live activity */}
                <LiveActivityStream />

                <hr className="border-border" />

                {/* Leaderboard */}
                <TopBuildersLeaderboard />

                {/* Footer */}
                <div className="pt-4 space-y-2">
                    <div className="flex flex-wrap gap-x-4 gap-y-1">
                        {["Privacy", "Terms", "Help", "About"].map(l => (
                            <Link key={l} href="#" className="text-xs text-muted hover:text-primary transition-colors">
                                {l}
                            </Link>
                        ))}
                    </div>
                    <p className="text-xs text-muted/60">
                        S.A.N.K.A.L.P. Platform © {new Date().getFullYear()}
                    </p>
                </div>
            </div>
        </aside>
    );
}
