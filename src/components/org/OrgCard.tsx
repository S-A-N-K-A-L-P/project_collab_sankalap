"use client";

import { motion } from "framer-motion";
import { ArrowUpRight, Crown, FolderOpen, ShieldCheck, Users } from "lucide-react";
import type { IOrgPublic } from "@/types/org";

const CATEGORY: Record<string, { label: string; pill: string; accent: string }> = {
  community:   { label: "Community",   pill: "pill-info",     accent: "#6257E8" },
  academic:    { label: "Academic",    pill: "pill-success",  accent: "#20B981" },
  company:     { label: "Company",     pill: "pill-warning",  accent: "#F59E0B" },
  open_source: { label: "Open Source", pill: "pill-research", accent: "#9A8AEF" },
};

export default function OrgCard({ org, index = 0 }: { org: IOrgPublic; index?: number }) {
  const cat = CATEGORY[org.category] || CATEGORY.community;
  const logo = org.logo || org.avatar || "";
  const description = org.tagline || org.description || "Explore projects, contributors, and opportunities from this organization.";

  return (
    <motion.a
      href={`/orgs/${org.slug}`}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.03, 0.15), duration: 0.25 }}
      className="group saas-card flex flex-col overflow-hidden rounded-[16px] hover:border-primary/35 hover:shadow-[var(--shadow-md)] transition-all duration-200"
    >
      {/* Top banner area with subtle lavender/surface blend */}
      <div className="relative flex h-36 items-center justify-center overflow-hidden px-6 bg-gradient-to-br from-primary-light/65 via-card to-background border-b border-border">
        <span className={`absolute right-3.5 top-3.5 rounded-full px-2.5 py-0.5 text-[10.5px] font-semibold ${cat.pill}`}>
          {cat.label}
        </span>

        {org.isHost && (
          <span className="absolute left-3.5 top-3.5 inline-flex items-center gap-1 rounded-full bg-amber-500/15 border border-amber-500/25 px-2.5 py-0.5 text-[10.5px] font-semibold text-amber-700 dark:text-amber-300">
            <Crown size={11} /> Official
          </span>
        )}

        <div className="relative flex h-20 w-32 items-center justify-center transition-transform duration-200 group-hover:scale-105">
          {logo ? (
            <img src={logo} alt={`${org.name} logo`} className="max-h-16 max-w-28 object-contain" />
          ) : (
            <div
              className="flex h-16 w-16 items-center justify-center rounded-2xl text-2xl font-bold text-white shadow-sm"
              style={{ background: `linear-gradient(135deg, #6257E8, ${org.themeColor || "#9A8AEF"})` }}
            >
              {org.name[0]?.toUpperCase()}
            </div>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-center gap-1.5">
          <h2 className="truncate text-base font-bold tracking-tight text-foreground group-hover:text-primary transition-colors">
            {org.name}
          </h2>
          {org.trustScore?.founderVerified && (
            <ShieldCheck size={15} className="shrink-0 text-emerald-500" />
          )}
        </div>

        <p className="mt-1.5 line-clamp-2 min-h-[2.5rem] text-xs leading-relaxed text-muted">
          {description}
        </p>

        {/* Footer stats */}
        <div className="mt-4 flex w-full items-center justify-between border-t border-border pt-3.5 text-xs text-muted">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <Users size={13} className="text-primary" />
              <strong className="font-semibold text-foreground">{org.stats?.memberCount ?? 0}</strong> Members
            </span>
            <span className="flex items-center gap-1.5">
              <FolderOpen size={13} className="text-primary" />
              <strong className="font-semibold text-foreground">{org.stats?.projectCount ?? 0}</strong> Projects
            </span>
          </div>

          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary-light text-primary group-hover:bg-primary group-hover:text-white transition-colors">
            <ArrowUpRight size={14} />
          </span>
        </div>
      </div>
    </motion.a>
  );
}
