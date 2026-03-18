"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Layers, ChevronRight, CheckCircle2 } from "lucide-react";
import { useState } from "react";

const stages = ["Proposal", "Planning", "Ideation", "Architecture", "Setup", "Development", "Completed"];

export default function StageTracker({ proposalId, currentStage, canUpdate }: { proposalId: string; currentStage: string; canUpdate: boolean }) {
  const [stage, setStage] = useState(currentStage);
  const [loading, setLoading] = useState(false);

  const currentIndex = stages.findIndex(s => s.toLowerCase() === stage.toLowerCase());

  const handleUpdate = async (newStage: string) => {
    if (!canUpdate) return;
    setLoading(true);
    try {
      const res = await fetch("/api/proposals/update", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ proposalId, stage: newStage }),
      });

      if (res.ok) {
        setStage(newStage);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <Link href="/dashboard/feed" className="flex items-center gap-2 text-slate-500 hover:text-blue-600 transition-colors mb-6">
        <Layers className="w-4 h-4" />
        <span className="text-xs font-bold uppercase tracking-widest italic">Back to Archive</span>
      </Link>
      
      <div className="flex flex-wrap items-center gap-2">
        {stages.map((s, i) => {
          const isCompleted = i < currentIndex;
          const isActive = i === currentIndex;
          
          return (
            <div key={s} className="flex items-center">
              <button
                disabled={!canUpdate || loading || isCompleted}
                onClick={() => handleUpdate(s)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-bold transition-all border ${
                  isActive 
                    ? "bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-500/20" 
                    : isCompleted 
                      ? "bg-green-500/10 border-green-500/30 text-green-600" 
                      : "bg-slate-50 border-slate-100 text-slate-400 dark:bg-slate-800/50 dark:border-slate-800"
                } ${canUpdate && !isCompleted && !isActive ? "hover:border-blue-400 hover:text-blue-500" : ""}`}
              >
                {isCompleted && <CheckCircle2 className="w-3 h-3" />}
                {s}
              </button>
              {i < stages.length - 1 && (
                <ChevronRight className="w-3 h-3 text-slate-300 mx-1" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
