"use client";

import { useEffect, useState } from "react";
import FeedList from "./FeedList";
import FeedActions from "@/app/(app)/feed/FeedActions";
import ProposalDetailPanel from "./ProposalDetailPanel";
import { Loader2, Radio } from "lucide-react";
import { useLayout } from "@/context/LayoutContext";

export default function FeedContainer() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProposal, setSelectedProposal] = useState<any | null>(null);
  const { setIsRightPanelCollapsed } = useLayout();

  useEffect(() => {
    async function fetchFeed() {
      try {
        const res = await fetch("/api/feed");
        if (!res.ok) {
          console.error("Failed to fetch feed:", res.status);
          setItems([]);
          return;
        }

        const data = await res.json();
        const proposals = Array.isArray(data?.proposals) ? data.proposals : [];
        const activity = Array.isArray(data?.activity) ? data.activity : [];

        // Interleave proposals and activities by date
        const combined = [
          ...proposals.map((p: any) => ({ ...p, feedType: "proposal" })),
          ...activity.map((a: any) => ({ ...a, feedType: "activity" }))
        ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        setItems(combined);
      } catch (err) {
        console.error(err);
        setItems([]);
      } finally {
        setLoading(false);
      }
    }
    fetchFeed();
  }, []);

  // Control dynamic right panel collapsing based on expanded proposal focus
  useEffect(() => {
    setIsRightPanelCollapsed(selectedProposal !== null);
    return () => setIsRightPanelCollapsed(false);
  }, [selectedProposal, setIsRightPanelCollapsed]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <Loader2 className="w-6 h-6 animate-spin text-accent" />
        <p className="text-[10px] font-mono font-bold text-muted uppercase tracking-widest">Hydrating Network Layer...</p>
      </div>
    );
  }

  const isExpanded = selectedProposal !== null;

  return (
    <div className={`transition-all duration-300 w-full`}>
      <div className={`grid grid-cols-1 ${isExpanded ? "lg:grid-cols-12 gap-6" : "gap-6 max-w-3xl mx-auto w-full"}`}>
        
        {/* Left Side: Composer and Feed Previews */}
        <div className={`space-y-6 ${isExpanded ? "lg:col-span-5 xl:col-span-5" : "w-full"}`}>
          {/* Create Box */}
          <FeedActions />

          {/* Dynamic Feed Header */}
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <Radio className="w-3.5 h-3.5 text-accent animate-pulse" />
              <h2 className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted font-mono">Platform Stream</h2>
            </div>
          </div>

          {/* Feed List */}
          <FeedList 
            items={items} 
            selectedProposalId={selectedProposal?._id}
            onExpandProposal={(proposal) => {
              if (selectedProposal?._id === proposal._id) {
                setSelectedProposal(null);
              } else {
                setSelectedProposal(proposal);
              }
            }}
          />
        </div>

        {/* Center/Right Side: Primary Focused Expanded Canvas */}
        {isExpanded && (
          <div className="lg:col-span-7 xl:col-span-7 relative">
            <ProposalDetailPanel 
              proposal={selectedProposal} 
              onClose={() => setSelectedProposal(null)} 
            />
          </div>
        )}

      </div>
    </div>
  );
}
