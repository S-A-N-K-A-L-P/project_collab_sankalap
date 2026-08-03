"use client";

import { motion } from "framer-motion";
import { ArrowUpRight, Crown, FolderOpen, ShieldCheck, Users } from "lucide-react";
import type { IOrgPublic } from "@/types/org";

const CATEGORY_STYLES: Record<string, { label: string; gradient: string }> = {
  community: { label: "Community", gradient: "from-blue-600 via-indigo-500 to-violet-500" },
  academic: { label: "Academic", gradient: "from-emerald-600 via-teal-500 to-cyan-500" },
  company: { label: "Company", gradient: "from-orange-600 via-amber-500 to-yellow-500" },
  open_source: { label: "Open Source", gradient: "from-violet-600 via-purple-500 to-fuchsia-500" },
};

export default function OrgCard({ org, index = 0 }: { org: IOrgPublic; index?: number }) {
  const style = CATEGORY_STYLES[org.category] || CATEGORY_STYLES.community;
  const logo = org.logo || org.avatar || "";
  const description = org.tagline || org.description || "Discover this organization and its projects.";

  return (
    <motion.a
      href={`/orgs/${org.slug}`}
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.04, 0.2), duration: 0.3 }}
      whileHover={{ y: -3 }}
      className="group relative flex min-h-[290px] flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all hover:border-primary/35 hover:shadow-xl"
    >
      <div className={`relative h-28 overflow-hidden bg-gradient-to-br ${style.gradient}`}>
        {(org.bannerImage || org.banner) ? <img src={org.bannerImage || org.banner} alt="" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" /> : <div className="absolute inset-0 opacity-60" style={{ backgroundImage: "radial-gradient(circle at 20% 20%, rgba(255,255,255,.38), transparent 32%), radial-gradient(circle at 80% 70%, rgba(255,255,255,.2), transparent 35%)" }} />}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        <div className="absolute left-3 top-3 flex gap-2">
          {org.isHost && <span className="inline-flex items-center gap-1 rounded-full bg-amber-300 px-2 py-1 text-[10px] font-bold text-amber-950 shadow-sm"><Crown size={10} /> Official</span>}
        </div>
        <span className="absolute right-3 top-3 rounded-full border border-white/20 bg-black/35 px-2.5 py-1 text-[10px] font-semibold text-white backdrop-blur-sm">{style.label}</span>
      </div>

      <div className="relative -mt-7 flex items-end gap-3 px-4">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl border-4 border-card text-xl font-black text-white shadow-lg" style={{ background: org.themeColor || "#4f46e5" }}>
          {logo ? <img src={logo} alt={org.name} className="h-full w-full object-cover" /> : org.name[0]?.toUpperCase()}
        </div>
        <div className="min-w-0 flex-1 pb-1">
          <div className="flex items-center gap-1.5">
            <h2 className="truncate text-base font-bold leading-tight text-foreground transition-colors group-hover:text-primary">{org.name}</h2>
            {org.trustScore?.founderVerified && <ShieldCheck size={14} className="shrink-0 text-emerald-500" />}
          </div>
          <p className="mt-1 text-[11px] capitalize text-muted-foreground">{org.orgType?.replaceAll("_", " ")} organization</p>
        </div>
      </div>

      <div className="flex flex-1 flex-col px-4 pb-4 pt-3">
        <p className="line-clamp-2 min-h-10 text-sm leading-relaxed text-muted-foreground">{description}</p>
        <div className="mt-auto flex items-center gap-4 border-t border-border pt-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5"><Users size={13} /><strong className="font-semibold text-foreground">{org.stats?.memberCount ?? 0}</strong> members</span>
          <span className="flex items-center gap-1.5"><FolderOpen size={13} /><strong className="font-semibold text-foreground">{org.stats?.projectCount ?? 0}</strong> projects</span>
          <span className="ml-auto flex h-8 w-8 items-center justify-center rounded-full bg-muted-bg text-muted-foreground transition-all group-hover:bg-primary group-hover:text-primary-foreground"><ArrowUpRight size={15} /></span>
        </div>
      </div>
    </motion.a>
  );
}
