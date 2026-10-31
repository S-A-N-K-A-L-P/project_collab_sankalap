"use client";

import { useState } from "react";
import { LayoutGrid, Palette, ExternalLink } from "lucide-react";
import PortfolioBuilder from "./PortfolioBuilder";

export default function ProfileTabs({
  isOwnProfile,
  handle,
  children,
}: {
  isOwnProfile: boolean;
  handle?: string;
  children: React.ReactNode;
}) {
  const [tab, setTab] = useState<"overview" | "portfolio">("overview");
  const showPortfolioTab = isOwnProfile || !!handle;

  return (
    <div className="space-y-5">
      <div className="inline-flex items-center gap-1 p-1 rounded-xl bg-card border border-border">
        <TabBtn active={tab === "overview"} onClick={() => setTab("overview")} icon={<LayoutGrid className="w-3.5 h-3.5" />}>
          Overview
        </TabBtn>
        {showPortfolioTab && (
          <TabBtn active={tab === "portfolio"} onClick={() => setTab("portfolio")} icon={<Palette className="w-3.5 h-3.5" />}>
            Portfolio
          </TabBtn>
        )}
      </div>

      {tab === "overview" && children}

      {tab === "portfolio" && (
        isOwnProfile
          ? <PortfolioBuilder />
          : handle
            ? (
              <div className="saas-card flex flex-col items-center justify-center py-16 text-center px-4">
                <div className="w-12 h-12 rounded-2xl bg-primary-light flex items-center justify-center mb-3">
                  <Palette className="w-6 h-6 text-primary" />
                </div>
                <p className="text-sm font-semibold text-foreground">Published Developer Portfolio</p>
                <p className="text-xs text-muted mt-1">Explore their full interactive portfolio showcase.</p>
                <a
                  href={`/portfolio/${handle}`}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-xl text-xs font-semibold shadow-[0_2px_8px_-2px_rgba(98,87,232,0.4)] transition-all"
                >
                  <ExternalLink className="w-3.5 h-3.5" /> Open Live Portfolio
                </a>
              </div>
            )
            : null
      )}
    </div>
  );
}

function TabBtn({ active, onClick, icon, children }: { active: boolean; onClick: () => void; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
        active
          ? "bg-primary text-white shadow-xs"
          : "text-muted hover:text-foreground"
      }`}
    >
      {icon}{children}
    </button>
  );
}
