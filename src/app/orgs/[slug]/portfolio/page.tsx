"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { AlertCircle, ArrowLeft, Edit2, LayoutDashboard, Loader2 } from "lucide-react";
import { useOrg } from "@/context/OrgContext";
import OrgPortfolioRenderer from "@/components/portfolio/OrgPortfolioRenderer";

export default function PublicOrgPortfolioPage() {
  const { slug } = useParams() as { slug: string };
  const { org, members, loading: loadingOrg, error: orgError, isAdmin } = useOrg();
  const [portfolio, setPortfolio] = useState<any>(null);
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    async function load() {
      setLoading(true);
      try {
        const [portfolioRes, projectsRes] = await Promise.all([
          fetch(`/api/orgs/${slug}/portfolio`),
          fetch(`/api/orgs/${slug}/projects`),
        ]);
        if (!portfolioRes.ok) throw new Error("Portfolio could not be loaded");
        const portfolioData = await portfolioRes.json();
        const projectsData = projectsRes.ok ? await projectsRes.json() : { projects: [] };
        const published = portfolioData.portfolio?.published;
        if (!published) throw new Error("This organization has not published its portfolio yet.");
        if (active) {
          setPortfolio(published);
          setProjects(projectsData.projects || []);
        }
      } catch (err: any) {
        if (active) setError(err.message || "Portfolio could not be loaded");
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => { active = false; };
  }, [slug]);

  if (loadingOrg || loading) return <div className="min-h-screen bg-[#060608] text-white flex items-center justify-center"><Loader2 className="animate-spin text-indigo-400" size={28} /></div>;

  if (orgError || error || !org || !portfolio) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-6">
        <div className="max-w-md text-center space-y-4">
          <AlertCircle size={44} className="mx-auto text-muted-foreground" />
          <h1 className="text-xl font-bold">Portfolio unavailable</h1>
          <p className="text-sm text-muted-foreground">{orgError || error || "This portfolio is not available."}</p>
          <a href={`/orgs/${slug}`} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-semibold"><ArrowLeft size={14} /> Back to organization</a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative bg-[#060608]">
      <div className="fixed top-5 left-5 z-50">
        <a href={`/orgs/${slug}`} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-black/60 backdrop-blur-md border border-white/15 text-white/80 hover:text-white hover:bg-black/75 text-xs font-semibold transition-all shadow-xl"><ArrowLeft size={13} /> Organization</a>
      </div>
      {isAdmin && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 p-1.5 rounded-2xl bg-black/60 backdrop-blur-md border border-white/15 shadow-2xl">
          <a href={`/orgs/${slug}/admin`} className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white font-semibold text-xs transition-all"><LayoutDashboard size={12} /> Console</a>
          <a href={`/orgs/${slug}/admin/portfolio`} className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white/80 text-xs font-medium transition-all"><Edit2 size={12} /> Edit Portfolio</a>
        </div>
      )}
      <OrgPortfolioRenderer org={org} portfolio={portfolio} members={members} projects={projects} />
    </div>
  );
}
