"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  AlertCircle, CalendarRange, Edit2, ExternalLink, FolderKanban, FolderOpen,
  Home, LayoutDashboard, Loader2, Shield, Users,
} from "lucide-react";
import { useOrg } from "@/context/OrgContext";
import OrgHero from "@/components/org/OrgHero";
import TrustScoreCard from "@/components/org/TrustScoreCard";
import MemberGrid from "@/components/org/MemberGrid";
import JoinButton from "@/components/org/JoinButton";
import AppLayoutClient from "@/components/layout/AppLayoutClient";

export default function OrgPage() {
  const { slug } = useParams() as { slug: string };
  const { org, members, loading, error, myMembership, refresh, isAdmin } = useOrg();
  const [projects, setProjects] = useState<any[]>([]);
  const [seasons, setSeasons] = useState<any[]>([]);

  useEffect(() => {
    if (!org) return;
    fetch(`/api/orgs/${slug}/projects`)
      .then((res) => res.ok ? res.json() : { projects: [] })
      .then((data) => setProjects(data.projects || []))
      .catch(() => setProjects([]));
    fetch(`/api/orgs/${slug}/seasons`)
      .then((res) => res.ok ? res.json() : { seasons: [] })
      .then((data) => setSeasons(data.seasons || []))
      .catch(() => setSeasons([]));
  }, [org, slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={28} />
      </div>
    );
  }

  if (error || !org) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4">
        <div className="max-w-md text-center space-y-4">
          <AlertCircle size={48} className="text-error mx-auto" />
          <h2 className="text-xl font-bold">Organization Not Found</h2>
          <p className="text-sm text-muted-foreground">{error || "This organization could not be loaded or is pending approval."}</p>
          <a href="/orgs" className="inline-block text-primary text-sm hover:underline">Back to Directory</a>
        </div>
      </div>
    );
  }

  return (
    <AppLayoutClient>
      <div className="w-full pb-16 text-foreground">
        <header className="flex flex-col gap-4 pb-4 mb-6 border-b border-border">
          <div className="flex items-center justify-between gap-3">
            <a href="/orgs" className="text-muted-foreground hover:text-primary transition-colors text-sm font-medium">
              ← Organizations
            </a>

            <div className="flex items-center gap-2 flex-wrap justify-end">
              {org.portfolioEnabled && (
                <a href={`/orgs/${slug}/portfolio`} className="org-secondary-action">
                  <ExternalLink size={12} /> View Portfolio
                </a>
              )}
              {isAdmin && (
                <>
                  <a href={`/orgs/${slug}/admin`} className="org-secondary-action">
                    <LayoutDashboard size={12} /> Admin Console
                  </a>
                  <a href={`/orgs/${slug}/admin/portfolio`} className="org-primary-action">
                    <Edit2 size={12} /> {org.portfolioEnabled ? "Edit Portfolio" : "Create Portfolio"}
                  </a>
                </>
              )}
            </div>
          </div>

          <nav className="flex items-center gap-1 overflow-x-auto" aria-label="Organization navigation">
            <a href={`/orgs/${slug}`} aria-current="page" className="org-tab org-tab-active"><Home size={13} /> Overview</a>
            <a href="#projects" className="org-tab"><FolderKanban size={13} /> Projects</a>
            <a href="#seasons" className="org-tab"><CalendarRange size={13} /> Seasons</a>
            <a href="#members" className="org-tab"><Users size={13} /> Members</a>
          </nav>
        </header>

        <div className="max-w-6xl mx-auto space-y-6">
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

          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,2fr)_minmax(280px,1fr)] gap-6 items-start">
            <div className="space-y-6">
              <motion.section
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="org-content-card"
              >
                <div className="org-section-heading">
                  <span className="org-section-icon"><Shield size={14} /></span>
                  <h2>Our Mission</h2>
                </div>
                <p className="text-muted-foreground text-sm leading-relaxed whitespace-pre-wrap">
                  {org.charter || "No mission statement has been defined yet."}
                </p>
              </motion.section>

              <motion.section
                id="projects"
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="org-content-card scroll-mt-24"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="org-section-heading">
                    <span className="org-section-icon"><FolderOpen size={14} /></span>
                    <h2>Projects</h2>
                  </div>
                  <span className="text-xs text-muted-foreground">{projects.length} projects</span>
                </div>

                {projects.length === 0 ? (
                  <div className="text-center py-12 border border-dashed border-border rounded-xl">
                    <FolderOpen className="mx-auto text-muted-foreground mb-2" size={24} />
                    <p className="text-xs text-muted-foreground">No organization projects yet</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {projects.map((project) => (
                      <a key={project._id} href={`/projects/${project._id}`} className="group p-4 rounded-xl border border-border bg-card hover:border-primary/40 hover:shadow-md transition-all flex flex-col gap-2">
                        {project.coverImage && (
                          <div className="h-32 rounded-lg overflow-hidden bg-muted-strong">
                            <img src={project.coverImage} alt={project.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                          </div>
                        )}
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="font-semibold text-sm group-hover:text-primary transition-colors">{project.title}</h3>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted-strong text-muted-foreground capitalize">{project.status}</span>
                        </div>
                        {project.description && <p className="text-xs text-muted-foreground line-clamp-2">{project.description}</p>}
                      </a>
                    ))}
                  </div>
                )}
              </motion.section>

              <motion.section
                id="seasons"
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="org-content-card scroll-mt-24"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="org-section-heading"><span className="org-section-icon"><CalendarRange size={14} /></span><h2>Development Seasons</h2></div>
                  <a href="/seasons" className="text-xs text-primary font-semibold">Explore all</a>
                </div>
                {seasons.length ? (
                  <div className="space-y-3">
                    {seasons.map((entry: any) => {
                      const season = entry.seasonId;
                      return <a key={entry._id} href={`/seasons/${season?.slug}`} className="flex items-center justify-between gap-4 p-4 rounded-xl border border-border bg-card hover:border-primary/40 transition-colors"><div className="min-w-0"><h3 className="font-semibold text-sm truncate">{season?.name}</h3><p className="text-xs text-muted-foreground line-clamp-1 mt-1">{season?.tagline || season?.description}</p></div><span className="px-2.5 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase whitespace-nowrap">{String(season?.status || "").replaceAll("_", " ")}</span></a>;
                    })}
                  </div>
                ) : <div className="py-10 text-center border border-dashed border-border rounded-xl"><CalendarRange className="mx-auto text-muted-foreground mb-2" size={24} /><p className="text-xs text-muted-foreground">This organization is not participating in a development season yet.</p></div>}
              </motion.section>
            </div>

            <aside className="space-y-6">
              <TrustScoreCard org={org} />
              <motion.section
                id="members"
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="org-content-card scroll-mt-24"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="org-section-heading"><Users size={15} className="text-primary" /><h2 className="text-sm">Members</h2></div>
                  <span className="text-xs text-muted-foreground">{members.length}</span>
                </div>
                <MemberGrid members={members} maxVisible={12} />
              </motion.section>
            </aside>
          </div>
        </div>

        <style jsx>{`
          .org-secondary-action, .org-primary-action { display:inline-flex; align-items:center; gap:.375rem; padding:.45rem .75rem; border-radius:.75rem; font-size:.75rem; font-weight:600; transition:all .18s ease; }
          .org-secondary-action { border:1px solid var(--border); background:var(--card); color:var(--foreground); }
          .org-secondary-action:hover { border-color:var(--primary); background:var(--muted-bg); }
          .org-primary-action { background:var(--primary); color:var(--primary-foreground); }
          .org-primary-action:hover { filter:brightness(1.08); transform:translateY(-1px); }
          .org-tab { display:inline-flex; align-items:center; gap:.375rem; padding:.5rem .75rem; border-radius:.5rem; color:var(--muted-foreground); font-size:.75rem; font-weight:500; white-space:nowrap; transition:all .18s ease; }
          .org-tab:hover { color:var(--foreground); background:var(--muted-bg); }
          .org-tab-active { color:var(--primary); background:color-mix(in srgb, var(--primary) 10%, transparent); font-weight:600; }
          .org-content-card { display:flex; flex-direction:column; gap:1rem; padding:1.5rem; border-radius:1rem; border:1px solid var(--border); background:var(--card); }
          .org-section-heading { display:flex; align-items:center; gap:.5rem; font-weight:700; }
          .org-section-heading h2 { font-size:1.05rem; }
          .org-section-icon { display:flex; align-items:center; justify-content:center; width:1.75rem; height:1.75rem; border-radius:.5rem; background:var(--primary); color:var(--primary-foreground); }
        `}</style>
      </div>
    </AppLayoutClient>
  );
}
