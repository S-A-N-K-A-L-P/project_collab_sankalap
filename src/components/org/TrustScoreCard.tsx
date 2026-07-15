"use client";

import { motion } from "framer-motion";
import { Users, FolderOpen, CheckCircle, Clock, Shield, VerifiedIcon } from "lucide-react";
import type { IOrgPublic } from "@/types/org";

interface TrustScoreCardProps {
  org: IOrgPublic;
  className?: string;
}

function StatItem({ icon: Icon, label, value, color = "text-foreground dark:text-white" }: {
  icon: any; label: string; value: string | number; color?: string;
}) {
  return (
    <div className="flex flex-col items-center gap-1.5 p-4 rounded-xl bg-muted-bg dark:bg-white/5 border border-border">
      <Icon size={20} className={color} />
      <span className={`text-2xl font-bold ${color}`}>{value}</span>
      <span className="text-xs text-muted-foreground dark:text-white/40 text-center leading-tight">{label}</span>
    </div>
  );
}

export default function TrustScoreCard({ org, className = "" }: TrustScoreCardProps) {
  const { stats, trustScore } = org;
  const completionRate = trustScore?.completionRate ?? 0;

  const completionColor =
    completionRate >= 80 ? "text-emerald-400" :
    completionRate >= 50 ? "text-yellow-400" :
    "text-white/60";

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className={`rounded-2xl border border-border bg-card dark:bg-white/5 backdrop-blur-sm overflow-hidden ${className}`}
    >
      {/* Header */}
      <div className="px-6 py-4 border-b border-border dark:border-white/8 flex items-center justify-between">
        <h3 className="font-semibold text-foreground dark:text-white flex items-center gap-2">
          <Shield size={16} className="text-primary dark:text-indigo-400" />
          Organization Trust
        </h3>
        <div className="flex items-center gap-2">
          {trustScore?.founderVerified && (
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] bg-info-muted dark:bg-blue-500/20 text-info-text dark:text-blue-300 border border-info dark:border-blue-400/20">
              <Shield size={9} /> Verified Founder
            </span>
          )}
          {trustScore?.kycVerified && (
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] bg-success-muted dark:bg-emerald-500/20 text-success-text dark:text-emerald-300 border border-success dark:border-emerald-400/20">
              <CheckCircle size={9} /> KYC
            </span>
          )}
        </div>
      </div>

      {/* Stats grid */}
      <div className="p-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatItem icon={Users}        label="Members"     value={stats?.memberCount ?? 0} />
        <StatItem icon={FolderOpen}   label="Projects"    value={stats?.projectCount ?? 0} />
        <StatItem icon={CheckCircle}  label="Completed"   value={stats?.completedProjectCount ?? 0} color="text-success dark:text-emerald-400" />
        <StatItem
          icon={CheckCircle}
          label="Completion Rate"
          value={`${Math.round(completionRate)}%`}
          color={completionColor.replace("text-white/60", "text-muted-foreground").replace("text-emerald-400", "text-success dark:text-emerald-400").replace("text-yellow-400", "text-warning dark:text-yellow-400")}
        />
      </div>

      {/* Completion bar */}
      {(stats?.projectCount ?? 0) > 0 && (
        <div className="px-6 pb-4">
          <div className="flex justify-between text-xs text-muted-foreground dark:text-white/40 mb-1.5">
            <span>Completion Rate</span>
            <span className={completionColor.replace("text-white/60", "text-muted-foreground").replace("text-emerald-400", "text-success dark:text-emerald-400").replace("text-yellow-400", "text-warning dark:text-yellow-400")}>{Math.round(completionRate)}%</span>
          </div>
          <div className="h-2 rounded-full bg-muted-strong dark:bg-white/10 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              whileInView={{ width: `${Math.min(100, completionRate)}%` }}
              viewport={{ once: true }}
              transition={{ duration: 1, ease: "easeOut" }}
              className={`h-full rounded-full ${
                completionRate >= 80 ? "bg-success dark:bg-emerald-400" :
                completionRate >= 50 ? "bg-warning dark:bg-yellow-400" :
                "bg-muted-strong dark:bg-white/30"
              }`}
            />
          </div>
          {(trustScore?.avgResponseDays ?? 0) > 0 && (
            <p className="text-xs text-muted-foreground dark:text-white/40 mt-2 flex items-center gap-1">
              <Clock size={10} /> Avg. response: {trustScore!.avgResponseDays} days
            </p>
          )}
        </div>
      )}
    </motion.div>
  );
}
