"use client";

import Link from "next/link";
import { Zap } from "lucide-react";
import ThemeSelector from "@/components/theme/ThemeSelector";

export default function PublicNavbar() {
    return (
        <header className="w-full border-b border-border-subtle bg-surface">
            <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
                        <Zap className="w-6 h-6 fill-current" />
                    </div>
                    <div className="flex flex-col -space-y-1">
                        <span className="text-lg font-black text-foreground tracking-tighter uppercase italic">S.A.N.K.A.L.P.</span>
                        <span className="text-[10px] font-mono font-black text-blue-600 uppercase tracking-widest">PLATFORM</span>
                    </div>
                </Link>

                <div className="flex items-center gap-4">
                    <ThemeSelector />
                </div>
            </div>
        </header>
    );
}
