"use client";

import { useState } from "react";
import { UserPlus, UserMinus, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

interface ConnectButtonProps {
  targetId: string;
  initialIsConnected: boolean;
  onUpdate?: (count: number) => void;
  variant?: "icon" | "full";
}

export default function ConnectButton({ targetId, initialIsConnected, onUpdate, variant = "full" }: ConnectButtonProps) {
  const [isConnected, setIsConnected] = useState(initialIsConnected);
  const [loading, setLoading] = useState(false);

  const handleConnect = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    setLoading(true);
    try {
      const res = await fetch("/api/user/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetId }),
      });
      const data = await res.json();
      
      if (data.connected !== undefined) {
        setIsConnected(data.connected);
        if (onUpdate) onUpdate(data.followersCount);
      }
    } catch (err) {
      console.error("Connection failed:", err);
    } finally {
      setLoading(false);
    }
  };

  if (variant === "icon") {
    return (
      <button 
        onClick={handleConnect}
        disabled={loading}
        className={`p-2.5 rounded-xl transition-all border ${
          isConnected 
            ? "bg-blue-600 text-white border-blue-500 shadow-lg shadow-blue-500/20" 
            : "bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-blue-500 hover:bg-white dark:hover:bg-slate-700 border-transparent hover:border-slate-100 dark:hover:border-slate-600"
        }`}
      >
        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : isConnected ? <UserMinus className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />}
      </button>
    );
  }

  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      onClick={handleConnect}
      disabled={loading}
      className={`w-full py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${
        isConnected
          ? "bg-slate-100 dark:bg-slate-800 text-slate-400 border border-slate-200 dark:border-slate-700"
          : "bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20"
      } flex items-center justify-center gap-2`}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : isConnected ? (
        <>Connected</>
      ) : (
        <>Connect +</>
      )}
    </motion.button>
  );
}
