"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { UserPlus, Loader2, Check, Clock, AlertCircle } from "lucide-react";
import { useSession } from "next-auth/react";
import { useOrgMembership } from "@/hooks/useOrgMembership";
import type { OrgRole } from "@/types/org";

interface JoinButtonProps {
  slug:       string;
  orgType?:   string;
  visibility?: string;
  orgName?:   string;
  /** Pass initial membership from context if already known */
  initial?:   { role: OrgRole; status: string } | null;
  onJoined?:  () => void;
}

export default function JoinButton({
  slug, orgType, visibility, orgName, initial, onJoined,
}: JoinButtonProps) {
  const { data: session } = useSession();
  const { isMember, isPending, role, joining, error, join, leave } = useOrgMembership(slug, initial);
  const [showLeave, setShowLeave] = useState(false);

  if (!session) {
    return (
      <a
        href={`/login?callbackUrl=/orgs/${slug}`}
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white font-semibold text-sm transition-all"
      >
        <UserPlus size={15} /> Sign in to Join
      </a>
    );
  }

  if (isPending) {
    return (
      <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-yellow-500/20 border border-yellow-400/30 text-yellow-300 text-sm font-medium">
        <Clock size={15} /> Request Pending
      </div>
    );
  }

  if (isMember) {
    if (role === "owner") {
      return (
        <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-yellow-500/20 border border-yellow-400/30 text-yellow-300 text-sm font-medium">
          <Check size={15} /> Owner
        </div>
      );
    }

    return (
      <div className="relative">
        <button
          onClick={() => setShowLeave(!showLeave)}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/20 text-white text-sm font-medium transition-all"
        >
          <Check size={15} className="text-emerald-400" /> Member ✓
        </button>
        {showLeave && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="absolute top-full mt-1 right-0 z-50 p-3 rounded-xl bg-gray-900 border border-white/10 shadow-2xl min-w-40"
          >
            <p className="text-xs text-white/60 mb-2">Leave {orgName || "this org"}?</p>
            <button
              onClick={() => { leave(slug); setShowLeave(false); }}
              className="w-full px-3 py-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-300 text-xs font-medium transition-colors"
            >
              Leave Organization
            </button>
          </motion.div>
        )}
      </div>
    );
  }

  const requiresRequest =
    orgType === "premium" ||
    orgType === "research" ||
    orgType === "invite_only" ||
    visibility === "private";

  return (
    <div className="flex flex-col items-start gap-1">
      <motion.button
        onClick={() => join(slug).then(() => onJoined?.())}
        disabled={joining}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-400 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-sm transition-all shadow-[0_4px_20px_rgba(99,102,241,0.3)]"
      >
        {joining ? <Loader2 size={15} className="animate-spin" /> : <UserPlus size={15} />}
        {joining ? "Joining…" : requiresRequest ? "Request to Join" : "Join Organization"}
      </motion.button>
      {error && (
        <p className="text-xs text-red-400 flex items-center gap-1">
          <AlertCircle size={11} /> {error}
        </p>
      )}
    </div>
  );
}
