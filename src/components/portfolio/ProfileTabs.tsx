"use client";

import { useState } from "react";
import { LayoutGrid, Palette, ExternalLink } from "lucide-react";
import PortfolioBuilder from "./PortfolioBuilder";

/**
 * Adds an "Overview | Portfolio" tab bar to the profile page.
 * - Owner → Portfolio tab shows the two-pane <PortfolioBuilder/>.
 * - Visitor → Portfolio tab shows a link to the public portfolio (if they have a handle).
 */
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

  // Visitors with no published handle → don't show the portfolio tab at all.
  const showPortfolioTab = isOwnProfile || !!handle;

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-1 border-b border-border">
        <TabBtn active={tab === "overview"} onClick={() => setTab("overview")} icon={<LayoutGrid className="w-4 h-4" />}>Overview</TabBtn>
        {showPortfolioTab && (
          <TabBtn active={tab === "portfolio"} onClick={() => setTab("portfolio")} icon={<Palette className="w-4 h-4" />}>Portfolio</TabBtn>
        )}
      </div>

      {tab === "overview" && children}

      {tab === "portfolio" && (
        isOwnProfile
          ? <PortfolioBuilder />
          : handle
            ? (
              <div className="flex flex-col items-center justify-center py-16 bg-card border border-border rounded-xl text-center">
                <Palette className="w-10 h-10 text-primary/40 mb-3" />
                <p className="text-sm font-medium text-foreground">This user has a portfolio</p>
                <a href={`/portfolio/${handle}`} target="_blank" rel="noreferrer"
                  className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg text-sm font-semibold transition-colors">
                  <ExternalLink className="w-4 h-4" /> View portfolio
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
      className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
        active ? "border-primary text-primary" : "border-transparent text-muted hover:text-foreground"
      }`}
    >
      {icon}{children}
    </button>
  );
}
