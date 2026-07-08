"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Users, FolderOpen, Shield, Settings, Palette,
  ArrowRight, Loader2, AlertCircle, LayoutDashboard,
  UserCheck, ShieldAlert
} from "lucide-react";
import { useOrg } from "@/context/OrgContext";
import { useRouter } from "next/navigation";
import AppLayoutClient from "@/components/layout/AppLayoutClient";

export default function OrgAdminDashboard() {
  const { org, members, loading, error, isAdmin, refresh } = useOrg();
  const router = useRouter();
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    if (!loading) {
      if (!org) {
        router.push("/orgs");
        return;
      }
      if (!isAdmin) {
        router.push(`/orgs/${org.slug}`);
        return;
      }
      fetchPendingCount();
    }
  }, [loading, org, isAdmin]);

  const fetchPendingCount = async () => {
    try {
      const res = await fetch(`/api/orgs/${org?.slug}/members?status=pending`);
      if (res.ok) {
        const data = await res.json();
        setPendingCount(data.total || 0);
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background dark:bg-[#0a0a0f] text-foreground dark:text-white flex items-center justify-center">
        <Loader2 className="animate-spin text-primary dark:text-indigo-400" size={28} />
      </div>
    );
  }

  if (error || !org || !isAdmin) return null;

  return (
    <AppLayoutClient>
      <div className="text-foreground dark:text-white space-y-6">
        {/* Top Header */}
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-border dark:border-white/8">
          <div className="flex items-center gap-3">
            <h1 className="font-bold text-foreground dark:text-white flex items-center gap-2 text-base">
              <LayoutDashboard size={16} className="text-primary dark:text-indigo-400" /> Admin Console
            </h1>
            <span className="text-xs text-muted-foreground dark:text-white/30">|</span>
            <a href={`/orgs/${org.slug}`} className="text-xs text-muted-foreground dark:text-white/50 hover:text-foreground dark:hover:text-white/80">
              View Public Page →
            </a>
          </div>
        </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* Org Banner Summary */}
        <div className="relative overflow-hidden p-6 rounded-2xl border border-border dark:border-white/10 bg-card dark:bg-white/5 backdrop-blur-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="pointer-events-none absolute -top-16 -right-16 w-40 h-40 rounded-full bg-gradient-to-br from-primary/10 to-tertiary/10 dark:from-indigo-500/10 dark:to-purple-500/10 blur-2xl" />
          <div className="relative flex items-center gap-4">
            <div
              className="w-14 h-14 rounded-xl flex items-center justify-center font-bold text-lg text-white shadow-md"
              style={{ backgroundColor: org.themeColor }}
            >
              {org.logo ? (
                <img src={org.logo} alt="" className="w-full h-full object-cover rounded-xl" />
              ) : (
                org.name[0]?.toUpperCase()
              )}
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground dark:text-white">{org.name} Dashboard</h2>
              <p className="text-xs text-muted-foreground dark:text-white/40">Status: {org.status} · Type: {org.orgType}</p>
            </div>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-5 rounded-xl border border-border dark:border-white/8 bg-card dark:bg-white/4 flex items-center gap-4">
            <div className="p-3 rounded-lg bg-primary/10 dark:bg-indigo-500/10 text-primary dark:text-indigo-400">
              <Users size={20} />
            </div>
            <div>
              <p className="text-xs text-muted-foreground dark:text-white/40">Active Members</p>
              <h3 className="text-2xl font-bold text-foreground dark:text-white">{org.stats?.memberCount || 0}</h3>
            </div>
          </div>

          <div className="p-5 rounded-xl border border-border dark:border-white/8 bg-card dark:bg-white/4 flex items-center gap-4">
            <div className="p-3 rounded-lg bg-success-muted dark:bg-emerald-500/10 text-success dark:text-emerald-400">
              <FolderOpen size={20} />
            </div>
            <div>
              <p className="text-xs text-muted-foreground dark:text-white/40">Total Projects</p>
              <h3 className="text-2xl font-bold text-foreground dark:text-white">{org.stats?.projectCount || 0}</h3>
            </div>
          </div>

          <div className="p-5 rounded-xl border border-border dark:border-white/8 bg-card dark:bg-white/4 flex items-center gap-4">
            <div className="p-3 rounded-lg bg-warning-muted dark:bg-yellow-500/10 text-warning dark:text-yellow-400">
              <ShieldAlert size={20} />
            </div>
            <div>
              <p className="text-xs text-muted-foreground dark:text-white/40">Pending Joins</p>
              <h3 className="text-2xl font-bold text-foreground dark:text-white">{pendingCount}</h3>
            </div>
          </div>
        </div>

        {/* Admin Menu Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <a
            href={`/orgs/${org.slug}/admin/members`}
            className="group p-5 rounded-xl border border-border dark:border-white/8 bg-card dark:bg-white/4 hover:border-primary/30 dark:hover:border-indigo-500/30 hover:shadow-md dark:hover:bg-white/8 transition-all flex flex-col justify-between h-36"
          >
            <div>
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary to-tertiary dark:from-indigo-400 dark:to-purple-400 flex items-center justify-center mb-2">
                <Users size={18} className="text-white" />
              </div>
              <h4 className="font-semibold text-foreground dark:text-white group-hover:text-primary dark:group-hover:text-indigo-300 transition-colors">Manage Members</h4>
              <p className="text-xs text-muted-foreground dark:text-white/40 mt-1 leading-normal">Change roles, remove members, and approve join requests.</p>
            </div>
            <span className="text-xs text-primary dark:text-indigo-400 font-semibold flex items-center gap-1 mt-2">
              Manage <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
            </span>
          </a>

          <a
            href={`/orgs/${org.slug}/admin/portfolio`}
            className="group p-5 rounded-xl border border-border dark:border-white/8 bg-card dark:bg-white/4 hover:border-primary/30 dark:hover:border-indigo-500/30 hover:shadow-md dark:hover:bg-white/8 transition-all flex flex-col justify-between h-36"
          >
            <div>
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary to-tertiary dark:from-indigo-400 dark:to-purple-400 flex items-center justify-center mb-2">
                <Palette size={18} className="text-white" />
              </div>
              <h4 className="font-semibold text-foreground dark:text-white group-hover:text-primary dark:group-hover:text-indigo-300 transition-colors">Design & Portfolio</h4>
              <p className="text-xs text-muted-foreground dark:text-white/40 mt-1 leading-normal">Build a stunning, custom branded portfolio page for the organization.</p>
            </div>
            <span className="text-xs text-primary dark:text-indigo-400 font-semibold flex items-center gap-1 mt-2">
              Customize <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
            </span>
          </a>

          <a
            href={`/orgs/${org.slug}/admin/settings`}
            className="group p-5 rounded-xl border border-border dark:border-white/8 bg-card dark:bg-white/4 hover:border-primary/30 dark:hover:border-indigo-500/30 hover:shadow-md dark:hover:bg-white/8 transition-all flex flex-col justify-between h-36"
          >
            <div>
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary to-tertiary dark:from-indigo-400 dark:to-purple-400 flex items-center justify-center mb-2">
                <Settings size={18} className="text-white" />
              </div>
              <h4 className="font-semibold text-foreground dark:text-white group-hover:text-primary dark:group-hover:text-indigo-300 transition-colors">Org Settings</h4>
              <p className="text-xs text-muted-foreground dark:text-white/40 mt-1 leading-normal">Edit basic details, charter/mission, logos, and configuration.</p>
            </div>
            <span className="text-xs text-primary dark:text-indigo-400 font-semibold flex items-center gap-1 mt-2">
              Configure <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
            </span>
          </a>
        </div>
      </div>
      </div>
    </AppLayoutClient>
  );
}
