"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import ProposalCard from "./ProposalCard";

interface ProposalFeedProps {
  proposals: any[];
  title?: string;
}

export default function ProposalFeed({ proposals, title }: ProposalFeedProps) {
  if (proposals.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-center space-y-4">
        <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center">
          <span className="text-2xl italic text-slate-400">?</span>
        </div>
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">No proposals yet</h3>
          <p className="text-slate-500 text-sm">Be the first to share a project idea!</p>
        </div>
        <Link
          href="/ideas/create"
          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-bold transition-all"
        >
          Create Proposal
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {title && <h2 className="text-xl font-bold text-slate-900 dark:text-white">{title}</h2>}
      <div className="grid grid-cols-1 gap-6">
        {proposals.map((proposal, i) => (
          <ProposalCard key={proposal._id} proposal={proposal} />
        ))}
      </div>

      {/* Simulation of Loading More */}
      <div className="flex justify-center py-8">
        <div className="h-1.5 w-32 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden relative">
          <motion.div
            animate={{ x: [-128, 128] }}
            transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
            className="absolute inset-y-0 w-16 bg-blue-500 rounded-full"
          />
        </div>
      </div>
    </div>
  );
}
