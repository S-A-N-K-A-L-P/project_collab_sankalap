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
        title={isConnected ? "Connected" : "Connect"}
        className={`p-2 rounded-xl border transition-all duration-150 cursor-pointer ${
          isConnected
            ? "bg-primary-light border-primary/25 text-primary"
            : "bg-card border-border text-muted hover:text-primary hover:bg-primary-light/50 hover:border-primary/25"
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
      className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-150 flex items-center justify-center gap-1.5 cursor-pointer ${
        isConnected
          ? "bg-card text-foreground border border-border hover:border-primary/35"
          : "bg-primary text-white shadow-[0_2px_10px_-2px_rgba(98,87,232,0.4)] hover:bg-primary-hover"
      }`}
    >
      {loading ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
      ) : isConnected ? (
        <>
          <UserCheck className="w-3.5 h-3.5 text-primary" /> Following
        </>
      ) : (
        <>
          <UserPlus className="w-3.5 h-3.5" /> Follow
        </>
      )}
    </button>
  );
}
