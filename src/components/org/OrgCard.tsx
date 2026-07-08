"use client";

import { motion } from "framer-motion";
import { Users, FolderOpen, ExternalLink, Crown, Building2 } from "lucide-react";
import type { IOrgPublic } from "@/types/org";

const CATEGORY_COLORS: Record<string, string> = {
  community:   "from-blue-500/20 to-indigo-500/20 border-blue-500/20",
  academic:    "from-emerald-500/20 to-teal-500/20 border-emerald-500/20",
  company:     "from-orange-500/20 to-amber-500/20 border-orange-500/20",
  open_source: "from-purple-500/20 to-fuchsia-500/20 border-purple-500/20",
};

const CATEGORY_LABELS: Record<string, string> = {
  community: "Community", academic: "Academic", company: "Company", open_source: "Open Source",
};

interface OrgCardProps {
  org:   IOrgPublic;
  index?: number;
}

export default function OrgCard({ org, index = 0 }: OrgCardProps) {
  const colorClass = CATEGORY_COLORS[org.category] || CATEGORY_COLORS.community;
  const logo = org.logo || org.avatar || "";

  return (
    <motion.a
      href={`/orgs/${org.slug}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.4 }}
      whileHover={{ y: -4, scale: 1.01 }}
      className={`group relative flex flex-col rounded-2xl border bg-gradient-to-br ${colorClass} 
        backdrop-blur-sm overflow-hidden cursor-pointer transition-all duration-300
        hover:shadow-[0_8px_40px_rgba(99,102,241,0.15)]`}
    >
      {/* Banner */}
      <div className="relative h-24 overflow-hidden bg-gradient-to-br from-white/5 to-white/0">
        {(org.bannerImage || org.banner) && (
          <img
            src={org.bannerImage || org.banner}
            alt=""
            className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity"
          />
        )}
        {/* Shimmer overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/40" />

        {/* Category badge */}
        <span className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-black/40 backdrop-blur-sm text-white/80 border border-white/10">
          {CATEGORY_LABELS[org.category]}
        </span>

        {/* Host org badge */}
        {org.isHost && (
          <span className="absolute top-2.5 left-2.5 flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-yellow-500/20 text-yellow-300 border border-yellow-400/30">
            <Crown size={9} /> Official
          </span>
        )}
      </div>

      {/* Logo + Name */}
      <div className="px-4 -mt-6 flex items-end gap-3 relative z-10">
        <div
          className="w-12 h-12 rounded-xl border-2 border-white/20 overflow-hidden flex items-center justify-center text-lg font-bold flex-shrink-0 shadow-lg"
          style={{ background: org.themeColor || "#6366f1" }}
        >
          {logo ? (
            <img src={logo} alt={org.name} className="w-full h-full object-cover" />
          ) : (
            <span className="text-white">{org.name[0]?.toUpperCase()}</span>
          )}
        </div>
        <div className="pb-1 flex-1 min-w-0">
          <h3 className="font-bold text-white text-sm truncate leading-tight group-hover:text-indigo-300 transition-colors">
            {org.name}
          </h3>
        </div>
      </div>

      {/* Body */}
      <div className="px-4 pt-2 pb-4 flex flex-col gap-3 flex-1">
        {org.tagline && (
          <p className="text-xs text-white/60 line-clamp-2 leading-relaxed">{org.tagline}</p>
        )}

        {/* Stats */}
        <div className="flex items-center gap-3 mt-auto pt-2 border-t border-white/8">
          <span className="flex items-center gap-1.5 text-xs text-white/50">
            <Users size={11} />
            <span>{org.stats?.memberCount ?? 0}</span>
          </span>
          <span className="flex items-center gap-1.5 text-xs text-white/50">
            <FolderOpen size={11} />
            <span>{org.stats?.projectCount ?? 0} projects</span>
          </span>
          {org.trustScore?.completionRate > 0 && (
            <span className="ml-auto text-[10px] font-semibold text-emerald-400">
              {Math.round(org.trustScore.completionRate)}% done
            </span>
          )}
        </div>
      </div>
    </motion.a>
  );
}
