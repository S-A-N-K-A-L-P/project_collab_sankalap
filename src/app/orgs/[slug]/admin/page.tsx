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
      <div className="min-h-screen bg-[#0a0a0f] text-white flex items-center justify-center">
        <Loader2 className="animate-spin text-indigo-400" size={28} />
      </div>
    );
  }

  if (error || !org || !isAdmin) return null;

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      {/* Top Header */}
      <div className="border-b border-white/8 bg-black/20 backdrop-blur-sm sticky top-0 z-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="font-bold text-white flex items-center gap-2 text-sm md:text-base">
              <LayoutDashboard size={16} className="text-indigo-400" /> Admin Console
            </h1>
            <span className="text-xs text-white/30">|</span>
            <a href={`/orgs/${org.slug}`} className="text-xs text-white/50 hover:text-white/80">
              View Public Page →
            </a>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* Org Banner Summary */}
        <div className="p-6 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div
              className="w-14 h-14 rounded-xl flex items-center justify-center font-bold text-lg"
              style={{ backgroundColor: org.themeColor }}
            >
              {org.logo ? (
                <img src={org.logo} alt="" className="w-full h-full object-cover rounded-xl" />
              ) : (
                org.name[0]?.toUpperCase()
              )}
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">{org.name} Dashboard</h2>
              <p className="text-xs text-white/40">Status: {org.status} · Type: {org.orgType}</p>
            </div>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-5 rounded-xl border border-white/8 bg-white/4 flex items-center gap-4">
            <div className="p-3 rounded-lg bg-indigo-500/10 text-indigo-400">
              <Users size={20} />
            </div>
            <div>
              <p className="text-xs text-white/40">Active Members</p>
              <h3 className="text-2xl font-bold text-white">{org.stats?.memberCount || 0}</h3>
            </div>
          </div>

          <div className="p-5 rounded-xl border border-white/8 bg-white/4 flex items-center gap-4">
            <div className="p-3 rounded-lg bg-emerald-500/10 text-emerald-400">
              <FolderOpen size={20} />
            </div>
            <div>
              <p className="text-xs text-white/40">Total Projects</p>
              <h3 className="text-2xl font-bold text-white">{org.stats?.projectCount || 0}</h3>
            </div>
          </div>

          <div className="p-5 rounded-xl border border-white/8 bg-white/4 flex items-center gap-4">
            <div className="p-3 rounded-lg bg-yellow-500/10 text-yellow-400">
              <ShieldAlert size={20} />
            </div>
            <div>
              <p className="text-xs text-white/40">Pending Joins</p>
              <h3 className="text-2xl font-bold text-white">{pendingCount}</h3>
            </div>
          </div>
        </div>

        {/* Admin Menu Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <a
            href={`/orgs/${org.slug}/admin/members`}
            className="group p-5 rounded-xl border border-white/8 bg-white/4 hover:border-indigo-500/30 hover:bg-white/8 transition-all flex flex-col justify-between h-36"
          >
            <div>
              <Users size={20} className="text-indigo-400 mb-2" />
              <h4 className="font-semibold text-white group-hover:text-indigo-300 transition-colors">Manage Members</h4>
              <p className="text-xs text-white/40 mt-1 leading-normal">Change roles, remove members, and approve join requests.</p>
            </div>
            <span className="text-xs text-indigo-400 font-semibold flex items-center gap-1 mt-2">
              Manage <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
            </span>
          </a>

          <a
            href={`/orgs/${org.slug}/admin/portfolio`}
            className="group p-5 rounded-xl border border-white/8 bg-white/4 hover:border-indigo-500/30 hover:bg-white/8 transition-all flex flex-col justify-between h-36"
          >
            <div>
              <Palette size={20} className="text-indigo-400 mb-2" />
              <h4 className="font-semibold text-white group-hover:text-indigo-300 transition-colors">Design & Portfolio</h4>
              <p className="text-xs text-white/40 mt-1 leading-normal">Build a stunning, custom branded portfolio page for the organization.</p>
            </div>
            <span className="text-xs text-indigo-400 font-semibold flex items-center gap-1 mt-2">
              Customize <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
            </span>
          </a>

          <a
            href={`/orgs/${org.slug}/admin/settings`}
            className="group p-5 rounded-xl border border-white/8 bg-white/4 hover:border-indigo-500/30 hover:bg-white/8 transition-all flex flex-col justify-between h-36"
          >
            <div>
              <Settings size={20} className="text-indigo-400 mb-2" />
              <h4 className="font-semibold text-white group-hover:text-indigo-300 transition-colors">Org Settings</h4>
              <p className="text-xs text-white/40 mt-1 leading-normal">Edit basic details, charter/mission, logos, and configuration.</p>
            </div>
            <span className="text-xs text-indigo-400 font-semibold flex items-center gap-1 mt-2">
              Configure <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
            </span>
          </a>
        </div>
      </div>
    </div>
  );
}
