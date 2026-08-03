"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  AlertCircle, ArrowLeft, CalendarRange, CheckCircle2, Edit2, ExternalLink,
  FolderKanban, FolderOpen, LayoutDashboard, Loader2, Shield, Users,
} from "lucide-react";
import { useOrg } from "@/context/OrgContext";
import OrgHero from "@/components/org/OrgHero";
import JoinButton from "@/components/org/JoinButton";
import AppLayoutClient from "@/components/layout/AppLayoutClient";
import { ORG_ROLE_LABELS } from "@/lib/org-permissions";

export default function OrgPage() {
  const { slug } = useParams() as { slug: string };
  const { org, members, loading, error, myMembership, refresh, isAdmin } = useOrg();
  const [projects, setProjects] = useState<any[]>([]);
  const [seasons, setSeasons] = useState<any[]>([]);

  useEffect(() => {
    if (!org) return;
    Promise.all([
      fetch(`/api/orgs/${slug}/projects`).then((response) => response.ok ? response.json() : { projects: [] }),
      fetch(`/api/orgs/${slug}/seasons`).then((response) => response.ok ? response.json() : { seasons: [] }),
    ]).then(([projectData, seasonData]) => {
      setProjects(projectData.projects || []);
      setSeasons(seasonData.seasons || []);
    }).catch(() => { setProjects([]); setSeasons([]); });
  }, [org, slug]);

  if (loading) return <div className="min-h-screen bg-background flex items-center justify-center"><Loader2 className="animate-spin text-primary" size={26} /></div>;
  if (error || !org) return <div className="min-h-screen bg-background flex items-center justify-center p-6"><div className="max-w-md text-center"><AlertCircle size={40} className="mx-auto text-error" /><h1 className="mt-4 text-xl font-bold">Organization not found</h1><p className="mt-2 text-sm text-muted-foreground">{error || "This organization is unavailable."}</p><a href="/orgs" className="mt-4 inline-block text-sm font-semibold text-primary">Back to organizations</a></div></div>;

  const completionRate = Math.round(org.trustScore?.completionRate || 0);
  const metrics = [
    { label: "Members", value: org.stats?.memberCount ?? members.length },
    { label: "Active projects", value: org.stats?.projectCount ?? projects.length },
    { label: "Completed", value: org.stats?.completedProjectCount ?? 0 },
    { label: "Completion", value: `${completionRate}%` },
  ];

  return (
    <AppLayoutClient wide hideRightPanel>
      <div className="mx-auto w-full max-w-[1240px] pb-12 text-foreground">
        <header className="mb-4 flex flex-col gap-3 border-b border-border pb-3">
          <div className="flex items-center justify-between gap-4">
            <a href="/orgs" className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground"><ArrowLeft size={14} /> Organizations</a>
            <div className="flex flex-wrap justify-end gap-2">
              {org.portfolioEnabled && <Action href={`/orgs/${slug}/portfolio`} icon={<ExternalLink size={13} />}>Portfolio</Action>}
              {isAdmin && <><Action href={`/orgs/${slug}/admin`} icon={<LayoutDashboard size={13} />}>Admin console</Action><Action href={`/orgs/${slug}/admin/portfolio`} icon={<Edit2 size={13} />} primary>{org.portfolioEnabled ? "Edit portfolio" : "Create portfolio"}</Action></>}
            </div>
          </div>
          <nav className="flex gap-5 overflow-x-auto text-xs font-medium text-muted-foreground"><a href={`/orgs/${slug}`} className="border-b-2 border-primary pb-2 text-foreground">Overview</a><a href="#projects" className="pb-2 hover:text-foreground">Projects</a><a href="#seasons" className="pb-2 hover:text-foreground">Seasons</a><a href="#members" className="pb-2 hover:text-foreground">Members</a></nav>
        </header>

        <OrgHero org={org} actions={<JoinButton slug={slug} orgType={org.orgType} visibility={org.visibility} orgName={org.name} initial={myMembership} onJoined={refresh} />} />

        <section className="mt-4 grid grid-cols-2 overflow-hidden rounded-xl border border-border bg-card shadow-sm md:grid-cols-4">
          {metrics.map((metric, index) => <div key={metric.label} className={`px-5 py-4 ${index ? "border-l border-border" : ""} ${index > 1 ? "border-t md:border-t-0" : ""}`}><div className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{metric.label}</div><div className="mt-1 text-2xl font-semibold tracking-tight">{metric.value}</div></div>)}
        </section>

        <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_340px]">
          <main className="space-y-4">
            <Section icon={<Shield size={16} />} title="Mission">
              <p className="text-sm leading-6 text-muted-foreground whitespace-pre-wrap">{org.charter || "The organization has not published its mission statement yet."}</p>
            </Section>

            <Section id="projects" icon={<FolderKanban size={16} />} title="Projects" meta={`${projects.length} total`}>
              {projects.length ? <div className="divide-y divide-border">{projects.slice(0, 6).map((project) => <a key={project._id} href={`/projects/${project._id}`} className="flex items-center gap-4 py-3 first:pt-0 last:pb-0 group"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted-bg text-muted-foreground"><FolderOpen size={17} /></div><div className="min-w-0 flex-1"><h3 className="truncate text-sm font-semibold group-hover:text-primary">{project.title}</h3><p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">{project.description || "No description provided"}</p></div><span className="rounded-md border border-border px-2 py-1 text-[10px] font-medium capitalize text-muted-foreground">{project.status}</span></a>)}</div> : <CompactEmpty icon={<FolderOpen size={18} />} title="No projects yet" detail="Projects launched by this organization will appear here." />}
            </Section>

            <Section id="seasons" icon={<CalendarRange size={16} />} title="Development seasons" meta={<a href="/seasons" className="font-medium text-primary">View all</a>}>
              {seasons.length ? <div className="divide-y divide-border">{seasons.map((entry: any) => { const season = entry.seasonId; return <a key={entry._id} href={`/seasons/${season?.slug}`} className="flex items-center gap-4 py-3 first:pt-0 last:pb-0"><div className="h-2.5 w-2.5 rounded-full bg-primary" /><div className="min-w-0 flex-1"><h3 className="truncate text-sm font-semibold">{season?.name}</h3><p className="text-xs text-muted-foreground">{season?.tagline || "Development season"}</p></div><span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">{String(season?.status || "").replaceAll("_", " ")}</span></a>; })}</div> : <CompactEmpty icon={<CalendarRange size={18} />} title="No active season" detail="Season participation will appear here when announced." />}
            </Section>
          </main>

          <aside className="space-y-4">
            <Section id="members" icon={<Users size={16} />} title="Members" meta={`${members.length}`}>
              <div className="divide-y divide-border">{members.slice(0, 8).map((member: any, index: number) => { const user = member.userId || {}; const initials = (user.name || "?").split(" ").map((part: string) => part[0]).slice(0, 2).join("").toUpperCase(); return <div key={member._id || index} className="flex items-center gap-3 py-2.5 first:pt-0 last:pb-0"><div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-slate-900 text-xs font-semibold text-white dark:bg-slate-200 dark:text-slate-900">{user.avatar ? <img src={user.avatar} alt="" className="h-full w-full object-cover" /> : initials}</div><div className="min-w-0 flex-1"><div className="truncate text-sm font-medium">{user.name || "Member"}</div><div className="truncate text-[11px] text-muted-foreground">{user.handle ? `@${user.handle}` : "Organization member"}</div></div><span className="rounded-md bg-muted-bg px-2 py-1 text-[10px] font-medium text-muted-foreground">{ORG_ROLE_LABELS[member.role as keyof typeof ORG_ROLE_LABELS] || member.role}</span></div>; })}</div>
              {!members.length && <CompactEmpty icon={<Users size={18} />} title="No members" detail="Members will appear here." />}
            </Section>

            <Section icon={<CheckCircle2 size={16} />} title="Verification">
              <div className="space-y-3 text-sm"><VerificationRow label="Founder verified" active={!!org.trustScore?.founderVerified} /><VerificationRow label="Organization verified" active={!!org.trustScore?.kycVerified} /><VerificationRow label="Public portfolio" active={!!org.portfolioEnabled} /></div>
            </Section>
          </aside>
        </div>
      </div>
    </AppLayoutClient>
  );
}

function Action({ href, icon, children, primary = false }: { href: string; icon: React.ReactNode; children: React.ReactNode; primary?: boolean }) { return <a href={href} className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-semibold transition-colors ${primary ? "border-primary bg-primary text-primary-foreground hover:bg-primary-hover" : "border-border bg-card hover:bg-muted-bg"}`}>{icon}{children}</a>; }
function Section({ id, icon, title, meta, children }: { id?: string; icon: React.ReactNode; title: string; meta?: React.ReactNode; children: React.ReactNode }) { return <section id={id} className="scroll-mt-24 rounded-xl border border-border bg-card shadow-sm"><header className="flex items-center justify-between border-b border-border px-5 py-3.5"><div className="flex items-center gap-2 text-sm font-semibold">{icon}{title}</div>{meta && <div className="text-xs text-muted-foreground">{meta}</div>}</header><div className="p-5">{children}</div></section>; }
function CompactEmpty({ icon, title, detail }: { icon: React.ReactNode; title: string; detail: string }) { return <div className="flex items-center gap-3 rounded-lg border border-dashed border-border bg-muted-bg/40 px-4 py-4 text-left"><span className="text-muted-foreground">{icon}</span><div><div className="text-sm font-medium">{title}</div><div className="mt-0.5 text-xs text-muted-foreground">{detail}</div></div></div>; }
function VerificationRow({ label, active }: { label: string; active: boolean }) { return <div className="flex items-center justify-between"><span className="text-muted-foreground">{label}</span><span className={`text-xs font-medium ${active ? "text-emerald-600" : "text-muted-foreground"}`}>{active ? "Verified" : "Not verified"}</span></div>; }
