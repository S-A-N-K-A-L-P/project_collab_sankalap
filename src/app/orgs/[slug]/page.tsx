"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users, FolderOpen, Shield, Clock, Globe, Github,
  Twitter, Linkedin, Mail, ArrowRight, Loader2,
  AlertCircle, Edit2, LayoutDashboard, Settings, UserPlus
} from "lucide-react";
import { useSession } from "next-auth/react";
import { useOrg } from "@/context/OrgContext";
import OrgHero from "@/components/org/OrgHero";
import TrustScoreCard from "@/components/org/TrustScoreCard";
import MemberGrid from "@/components/org/MemberGrid";
import JoinButton from "@/components/org/JoinButton";
import OrgPortfolioRenderer from "@/components/portfolio/OrgPortfolioRenderer";
import { canManageOrg } from "@/lib/org-permissions";
import AppLayoutClient from "@/components/layout/AppLayoutClient";

export default function OrgPage() {
  const { slug } = useParams() as { slug: string };
  const { data: session } = useSession();
  const { org, members, loading, error, myMembership, refresh, isAdmin } = useOrg();
  
  const [portfolioData, setPortfolioData] = useState<any>(null);
  const [loadingPortfolio, setLoadingPortfolio] = useState(false);
  const [projects, setProjects] = useState<any[]>([]);

  const userId = (session?.user as any)?.id;
  const platformRole = (session?.user as any)?.role;

  useEffect(() => {
    if (org) {
      fetchProjects();
      if (org.portfolioEnabled) {
        fetchPortfolio();
      }
    }
  }, [org]);

  const fetchProjects = async () => {
    try {
      const res = await fetch(`/api/orgs/${slug}/projects`);
      if (res.ok) {
        const data = await res.json();
        setProjects(data.projects || []);
      }
    } catch (err) {
      console.error("Failed to fetch org projects", err);
    }
  };

  const fetchPortfolio = async () => {
    setLoadingPortfolio(true);
    try {
      const res = await fetch(`/api/orgs/${slug}/portfolio`);
      if (res.ok) {
        const data = await res.json();
        setPortfolioData(data.portfolio);
      }
    } catch (err) {
      console.error("Failed to fetch org portfolio", err);
    } finally {
      setLoadingPortfolio(false);
    }
  };

  if (loading || (org?.portfolioEnabled && loadingPortfolio)) {
    return (
      <div className="min-h-screen bg-background dark:bg-[#0a0a0f] text-foreground dark:text-white flex items-center justify-center">
        <Loader2 className="animate-spin text-primary dark:text-indigo-400" size={28} />
      </div>
    );
  }

  if (error || !org) {
    return (
      <div className="min-h-screen bg-background dark:bg-[#0a0a0f] text-foreground dark:text-white flex items-center justify-center p-4">
        <div className="max-w-md text-center space-y-4">
          <AlertCircle size={48} className="text-error dark:text-red-400 mx-auto" />
          <h2 className="text-xl font-bold">Organization Not Found</h2>
          <p className="text-sm text-muted-foreground dark:text-white/50">{error || "This organization could not be loaded or is pending approval."}</p>
          <a href="/orgs" className="inline-block text-primary dark:text-indigo-400 text-sm hover:underline">
            Back to Directory
          </a>
        </div>
      </div>
    );
  }

  // ── MODE 1: Portfolio Mode ───────────────────────────────────────
  if (org.portfolioEnabled && portfolioData) {
    return (
      <div className="min-h-screen relative bg-background dark:bg-[#060608]">
        {/* Floating Admin Controls for Org Admins */}
        {isAdmin && (
          <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 p-1.5 rounded-2xl bg-card/60 dark:bg-black/60 backdrop-blur-md border border-border dark:border-white/10 shadow-2xl">
            <a
              href={`/orgs/${slug}/admin`}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary hover:bg-primary-hover dark:bg-indigo-500 dark:hover:bg-indigo-400 text-primary-foreground dark:text-white font-semibold text-xs transition-all"
            >
              <LayoutDashboard size={12} /> Console
            </a>
            <a
              href={`/orgs/${slug}/admin/portfolio`}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-muted-strong dark:bg-white/10 hover:bg-muted dark:hover:bg-white/15 text-foreground dark:text-white/80 text-xs font-medium transition-all"
            >
              <Edit2 size={12} /> Edit Page
            </a>
          </div>
        )}
        <OrgPortfolioRenderer
          org={org}
          portfolio={portfolioData}
          members={members}
          projects={projects}
        />
      </div>
    );
  }

  // ── MODE 2: Default Mode ──────────────────────────────────────────
  return (
    <AppLayoutClient>
      <div className="text-foreground dark:text-white pb-16">
        {/* Top Header Controls */}
        <div className="flex items-center justify-between pb-4 mb-6 border-b border-border dark:border-white/8">
          <a href="/orgs" className="text-muted-foreground dark:text-white/40 hover:text-foreground dark:hover:text-white/80 transition-colors text-sm font-medium">
            ← Organizations
          </a>

          {isAdmin && (
            <div className="flex items-center gap-2">
              <a
                href={`/orgs/${slug}/admin`}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-muted dark:bg-white/5 border border-border dark:border-white/10 hover:bg-muted-strong dark:hover:bg-white/10 text-foreground dark:text-white/80 font-semibold text-xs transition-all"
              >
                <LayoutDashboard size={12} /> Admin Console
              </a>
              <a
                href={`/orgs/${slug}/admin/portfolio`}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary hover:bg-primary-hover dark:bg-indigo-500 dark:hover:bg-indigo-400 text-primary-foreground dark:text-white font-semibold text-xs transition-all"
              >
                <Edit2 size={12} /> Design Page
              </a>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 mt-6 space-y-6">
        {/* Hero Card */}
        <OrgHero
          org={org}
          actions={
            <JoinButton
              slug={slug}
              orgType={org.orgType}
              visibility={org.visibility}
              orgName={org.name}
              initial={myMembership}
              onJoined={refresh}
            />
          }
        />

        {/* Content Body Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Main Content (2 cols) */}
          <div className="md:col-span-2 space-y-6">
            {/* Charter / Mission */}
            <motion.section
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="p-6 rounded-2xl border border-border dark:border-white/10 bg-card dark:bg-white/5 backdrop-blur-sm space-y-4"
            >
              <h2 className="text-lg font-bold text-foreground dark:text-white flex items-center gap-2">
                <Shield size={16} className="text-primary dark:text-indigo-400" /> Our Mission
              </h2>
              <p className="text-muted-foreground dark:text-white/70 text-sm leading-relaxed whitespace-pre-wrap">
                {org.charter || "No mission statement has been defined yet."}
              </p>
            </motion.section>

            {/* Showcase Projects */}
            <motion.section
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="p-6 rounded-2xl border border-border dark:border-white/10 bg-card dark:bg-white/5 backdrop-blur-sm space-y-4"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-foreground dark:text-white flex items-center gap-2">
                  <FolderOpen size={16} className="text-primary dark:text-indigo-400" /> Projects Showcase
                </h2>
                <span className="text-xs text-muted-foreground dark:text-white/40">{projects.length} completed projects</span>
              </div>

              {projects.length === 0 ? (
                <div className="text-center py-12 border border-dashed border-border dark:border-white/10 rounded-xl">
                  <FolderOpen className="mx-auto text-muted-foreground dark:text-white/20 mb-2" size={24} />
                  <p className="text-xs text-muted-foreground dark:text-white/40">No completed projects to showcase yet</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {projects.map((proj) => (
                    <a
                      key={proj._id}
                      href={`/showcase/${proj._id}`}
                      className="group p-4 rounded-xl border border-border dark:border-white/8 bg-muted dark:bg-white/4 hover:border-primary dark:hover:border-white/20 hover:bg-muted-strong dark:hover:bg-white/8 transition-all flex flex-col gap-2"
                    >
                      {proj.coverImage && (
                        <div className="h-32 rounded-lg overflow-hidden relative bg-black/20 dark:bg-black/40">
                          <img
                            src={proj.coverImage}
                            alt={proj.title}
                            className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                          />
                        </div>
                      )}
                      <div>
                        <h4 className="font-semibold text-sm text-foreground dark:text-white group-hover:text-primary dark:group-hover:text-indigo-300 transition-colors">
                          {proj.title}
                        </h4>
                        {proj.description && (
                          <p className="text-xs text-muted-foreground dark:text-white/50 line-clamp-2 mt-1 leading-normal">
                            {proj.description}
                          </p>
                        )}
                      </div>
                    </a>
                  ))}
                </div>
              )}
            </motion.section>
          </div>

          {/* Sidebar (1 col) */}
          <div className="space-y-6">
            {/* Trust Score & Stats */}
            <TrustScoreCard org={org} />

            {/* Member Spotlight */}
            <motion.section
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="p-6 rounded-2xl border border-border dark:border-white/10 bg-card dark:bg-white/5 backdrop-blur-sm space-y-4"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-foreground dark:text-white flex items-center gap-2">
                  <Users size={14} className="text-primary dark:text-indigo-400" /> Member Grid
                </h2>
                <span className="text-xs text-muted-foreground dark:text-white/40">{members.length} members</span>
              </div>

              <MemberGrid members={members} maxVisible={12} />
            </motion.section>
          </div>
        </div>
      </div>
    </AppLayoutClient>
  );
}
