"use client";

import { useEffect, useState } from "react";
import FeedList from "./FeedList";
import { Loader2, Radio } from "lucide-react";

export default function FeedContainer() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchFeed() {
      try {
        const res = await fetch("/api/feed");
        if (res.ok) {
          const data = await res.json();
          // Interleave proposals and activities by date
          const combined = [
            ...data.proposals.map((p: any) => ({ ...p, feedType: "proposal" })),
            ...data.activity.map((a: any) => ({ ...a, feedType: "activity" }))
          ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

          setItems(combined);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchFeed();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <Loader2 className="w-6 h-6 animate-spin text-accent" />
        <p className="text-[10px] font-mono font-bold text-muted uppercase tracking-widest">Hydrating Network Layer...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2.5">
          <Radio className="w-4 h-4 text-accent animate-pulse" />
          <h2 className="text-[11px] font-bold uppercase tracking-[0.15em] text-muted font-mono">Real-time Stream</h2>
        </div>
      </div>
      <FeedList items={items} />
    </div>
  );
}
