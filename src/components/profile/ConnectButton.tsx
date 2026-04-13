"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { UserPlus, UserCheck, Loader2 } from "lucide-react";

interface ConnectButtonProps {
  targetId: string;
  initialIsConnected: boolean;
  variant?: "default" | "icon" | "outline";
}

export default function ConnectButton({ targetId, initialIsConnected, variant = "default" }: ConnectButtonProps) {
  const { data: session } = useSession();
  const [isConnected, setIsConnected] = useState(initialIsConnected);
  const [loading, setLoading] = useState(false);

  const handleConnect = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!session) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/user/${targetId}/following`, {
        method: "POST",
      });
      if (res.ok) {
        const data = await res.json();
        setIsConnected(data.status === "following");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (variant === "icon") {
    return (
      <button
        onClick={handleConnect}
        disabled={loading}
        className={`p-2.5 rounded-xl border transition-all duration-150 ${isConnected
            ? "bg-accent/10 border-accent/30 text-accent"
            : "bg-surface-alt border-border-subtle text-muted hover:text-foreground hover:bg-surface hover:border-border-strong"
          }`}
      >
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : isConnected ? <UserCheck className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
      </button>
    );
  }

  return (
    <button
      onClick={handleConnect}
      disabled={loading}
      className={`px-6 py-2.5 rounded-xl text-[11px] font-bold uppercase tracking-tight transition-all duration-150 flex items-center justify-center gap-2 ${isConnected
          ? "bg-surface text-muted border border-border-subtle hover:border-accent/30"
          : "bg-accent text-white shadow-sm hover:bg-[#4f46e5] active:scale-95"
        }`}
    >
      {loading ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
      ) : isConnected ? (
        <>
          <UserCheck className="w-4 h-4" /> Synchronized
        </>
      ) : (
        <>
          <UserPlus className="w-4 h-4" /> Synchronize
        </>
      )}
    </button>
  );
}
