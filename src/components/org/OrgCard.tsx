"use client";

import { motion } from "framer-motion";
import { ArrowUpRight, Crown, FolderOpen, ShieldCheck, Users } from "lucide-react";
import type { IOrgPublic } from "@/types/org";

const CATEGORY: Record<string, { label: string; accent: string; soft: string; glow: string }> = {
  community: { label: "Community", accent: "#2563eb", soft: "#eff6ff", glow: "rgba(37,99,235,.20)" },
  academic: { label: "Academic", accent: "#059669", soft: "#ecfdf5", glow: "rgba(5,150,105,.20)" },
  company: { label: "Company", accent: "#ea580c", soft: "#fff7ed", glow: "rgba(234,88,12,.20)" },
  open_source: { label: "Open Source", accent: "#7c3aed", soft: "#f5f3ff", glow: "rgba(124,58,237,.22)" },
};

export default function OrgCard({ org, index = 0 }: { org: IOrgPublic; index?: number }) {
  const color = CATEGORY[org.category] || CATEGORY.community;
  const logo = org.logo || org.avatar || "";
  const description = org.tagline || org.description || "Explore projects, people, and opportunities from this organization.";

  return (
    <motion.a
      href={`/orgs/${org.slug}`}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * .035, .18), duration: .32 }}
      whileHover={{ y: -6 }}
      className="group relative flex min-h-[360px] flex-col overflow-hidden rounded-[28px] border border-black/[.07] bg-white shadow-[0_12px_35px_rgba(15,23,42,.08)] transition-all duration-300 hover:shadow-[0_24px_60px_rgba(15,23,42,.16)] dark:border-white/10 dark:bg-slate-900"
      style={{ "--org-accent": color.accent, "--org-glow": color.glow } as React.CSSProperties}
    >
      <div className="absolute inset-x-0 top-0 h-1.5 bg-[var(--org-accent)]" />
      <div className="relative flex h-[190px] items-center justify-center overflow-hidden px-8 pt-4" style={{ background: `linear-gradient(145deg, ${color.soft}, #ffffff 58%)` }}>
        <div className="absolute -right-16 -top-20 h-48 w-48 rounded-full bg-[var(--org-glow)] blur-3xl transition-transform duration-500 group-hover:scale-125" />
        <div className="absolute -bottom-20 -left-16 h-40 w-40 rounded-full bg-[var(--org-glow)] blur-3xl" />
        <span className="absolute right-4 top-4 rounded-full border border-black/5 bg-white/80 px-3 py-1 text-[10px] font-bold uppercase tracking-[.12em] text-slate-600 shadow-sm backdrop-blur">{color.label}</span>
        {org.isHost && <span className="absolute left-4 top-4 inline-flex items-center gap-1 rounded-full bg-amber-300 px-2.5 py-1 text-[10px] font-bold text-amber-950"><Crown size={10} /> Official</span>}
        <div className="relative flex h-28 w-40 items-center justify-center transition-transform duration-300 group-hover:scale-105">
          {logo ? <img src={logo} alt={`${org.name} logo`} className="max-h-24 max-w-36 object-contain drop-shadow-sm" /> : <div className="flex h-24 w-24 items-center justify-center rounded-3xl text-4xl font-black text-white shadow-xl" style={{ background: `linear-gradient(135deg, ${color.accent}, ${org.themeColor || color.accent})` }}>{org.name[0]?.toUpperCase()}</div>}
        </div>
      </div>

      <div className="flex flex-1 flex-col items-center px-6 pb-5 pt-5 text-center">
        <div className="flex max-w-full items-center gap-1.5">
          <h2 className="truncate text-lg font-bold tracking-tight text-slate-950 dark:text-white">{org.name}</h2>
          {org.trustScore?.founderVerified && <ShieldCheck size={15} className="shrink-0 text-emerald-500" />}
        </div>
        <p className="mt-2 line-clamp-2 min-h-10 text-sm leading-relaxed text-slate-500 dark:text-slate-400">{description}</p>

        <div className="mt-auto flex w-full items-center justify-center gap-5 border-t border-slate-100 pt-4 text-xs text-slate-500 dark:border-white/10 dark:text-slate-400">
          <span className="flex items-center gap-1.5"><Users size={13} /><strong className="text-slate-900 dark:text-white">{org.stats?.memberCount ?? 0}</strong> Members</span>
          <span className="flex items-center gap-1.5"><FolderOpen size={13} /><strong className="text-slate-900 dark:text-white">{org.stats?.projectCount ?? 0}</strong> Projects</span>
          <span className="ml-auto flex h-9 w-9 items-center justify-center rounded-full text-white transition-transform group-hover:rotate-12" style={{ background: color.accent, boxShadow: `0 8px 20px ${color.glow}` }}><ArrowUpRight size={16} /></span>
        </div>
      </div>
    </motion.a>
  );
}
