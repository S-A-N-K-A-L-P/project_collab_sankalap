"use client";

import { useState, useEffect } from "react";
import { ArrowBigUp, Loader2 } from "lucide-react";
import { useSession } from "next-auth/react";

interface VoteButtonProps {
  proposalId: string;
  onVoteChange?: (newTotal: number, userVotes: number) => void;
}

export default function VoteButton({ proposalId, onVoteChange }: VoteButtonProps) {
  const { data: session } = useSession();
  const [userVotes, setUserVotes] = useState(0);
  const [loading, setLoading] = useState(false);
  const [maxVotes, setMaxVotes] = useState(1);
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    async function fetchVoteStatus() {
      try {
        const res = await fetch(`/api/votes?proposalId=${proposalId}`);
        if (res.ok) {
          const data = await res.json();
          setUserVotes(data.userVotes);
          setMaxVotes(data.maxVotes);
          setIsActive(data.isActive);
        }
      } catch (err) {
        console.error(err);
      }
    }
    fetchVoteStatus();
  }, [proposalId]);

  const handleVote = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!session || !isActive) return;

    setLoading(true);
    try {
      // Toggle logic or increment
      const newValue = userVotes >= maxVotes ? 0 : userVotes + 1;

      const res = await fetch("/api/votes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ proposalId, value: newValue }),
      });

      if (res.ok) {
        const data = await res.json();
        setUserVotes(data.userVotes);
        if (onVoteChange) onVoteChange(data.totalVotes, data.userVotes);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const voted = userVotes > 0;

  return (
    <button
      onClick={handleVote}
      disabled={loading || !isActive}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
        voted
          ? "bg-primary/10 text-primary border-primary/25 hover:bg-primary/15"
          : "bg-transparent text-muted border-border hover:text-foreground hover:border-border-strong"
      } ${!isActive ? "opacity-50 cursor-not-allowed" : ""}`}
    >
      {loading ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
      ) : (
        <>
          <ArrowBigUp className={`w-3.5 h-3.5 ${voted ? "fill-primary" : ""}`} />
          {voted ? `Upvoted (${userVotes})` : "Upvote"}
        </>
      )}
    </button>
  );
}
