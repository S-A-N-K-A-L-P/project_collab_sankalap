"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import NextLink from "next/link";
import {
  ExternalLink, Github, Users, Calendar, Star, IndianRupee,
  Loader2, ArrowLeft, FileText, Briefcase, BookOpen,
} from "lucide-react";

interface Doc {
  _id: string;
  kind: "business" | "how-to-use" | "technical" | "api" | "other";
  title: string;
  format: "markdown" | "pdf" | "external-url";
  contentMd?: string;
  fileUrl?: string;
  externalUrl?: string;
}

const DOC_ICON: Record<string, any> = {
  "business":   <Briefcase className="w-4 h-4" />,
  "how-to-use": <BookOpen className="w-4 h-4" />,
  "technical":  <FileText className="w-4 h-4" />,
  "api":        <FileText className="w-4 h-4" />,
  "other":      <FileText className="w-4 h-4" />,
};

const DOC_LABEL: Record<string, string> = {
  "business":   "Business Overview",
  "how-to-use": "How to Use",
  "technical":  "Technical Docs",
  "api":        "API Reference",
  "other":      "Documentation",
};

export default function ShowcaseDetailPage() {
  const { id } = useParams();
  const projectId = id as string;

  const [data, setData]     = useState<{ project: any; docs: Doc[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/showcase/${projectId}`)
      .then(async r => {
        if (!r.ok) {
          setError((await r.json())?.error || "Not found");
          return null;
        }
        return r.json();
      })
      .then(setData)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [projectId]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
        <p className="text-sm text-muted">Loading showcase…</p>
      </div>
    );
  }

  if (error || !data?.project) {
    return (
      <div className="max-w-3xl mx-auto py-20 text-center">
        <p className="text-base text-foreground font-semibold mb-1">Project not found</p>
        <p className="text-sm text-muted mb-4">{error || "This project is not publicly available."}</p>
        <NextLink href="/showcase" className="text-sm text-primary font-medium hover:underline">
          ← Back to Showcase
        </NextLink>
      </div>
    );
  }

  const { project, docs } = data;
  const teamMembers = [project.lead, ...(project.members || [])].filter(Boolean);
  const dedupedTeam = Array.from(new Map(teamMembers.map(m => [m._id, m])).values());

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      {/* Back link */}
      <NextLink href="/showcase" className="inline-flex items-center gap-1 text-sm text-muted hover:text-primary transition-colors">
        <ArrowLeft className="w-4 h-4" /> Showcase
      </NextLink>

      {/* Hero */}
      <div
        className="bg-card border border-border rounded-xl overflow-hidden"
        style={{ boxShadow: "0 4px 12px rgba(0,0,0,0.10), 0 1px 4px rgba(0,0,0,0.06)" }}
      >
        {/* Cover image */}
        <div className="aspect-[21/9] w-full bg-gradient-to-br from-primary/15 via-primary/5 to-background relative overflow-hidden">
          {project.coverImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={project.coverImage} alt={project.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-8xl font-bold text-primary/20 select-none">
                {project.title?.[0]?.toUpperCase() || "?"}
              </span>
            </div>
          )}
          {project.showcase?.featured && (
            <span className="absolute top-3 left-3 flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500 text-white text-xs font-semibold">
              <Star className="w-3 h-3 fill-current" /> Featured
            </span>
          )}
        </div>

        {/* Title row */}
        <div className="p-6">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-2">
                {project.orgId && (
                  <span className="text-xs text-muted font-medium">{project.orgId.name}</span>
                )}
                {project.version && (
                  <span className="text-xs font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded">
                    {project.version}
                  </span>
                )}
                <span className="text-xs font-semibold text-green-800 bg-green-100 px-2 py-0.5 rounded-full">
                  Completed
                </span>
              </div>
              <h1 className="text-3xl font-bold text-foreground leading-tight">{project.title}</h1>
              {project.description && (
                <p className="text-sm text-muted mt-2 leading-relaxed max-w-2xl">
                  {project.description}
                </p>
              )}
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap gap-2">
              {project.liveUrl && (
                <a href={project.liveUrl} target="_blank" rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary hover:bg-primary-hover text-white text-sm font-semibold rounded-lg transition-colors">
                  <ExternalLink className="w-4 h-4" />
                  Live Demo
                </a>
              )}
              {project.githubRepo && (
                <a href={project.githubRepo} target="_blank" rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-4 py-2 border border-border hover:bg-card-hover text-foreground text-sm font-semibold rounded-lg transition-colors">
                  <Github className="w-4 h-4" />
                  GitHub
                </a>
              )}
              {project.marketplace?.forSale && (
                <NextLink href={`/marketplace/${project._id}`}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-lg transition-colors">
                  <IndianRupee className="w-4 h-4" />
                  {project.marketplace.priceINR ? `₹${project.marketplace.priceINR.toLocaleString()}` : "Inquire"}
                </NextLink>
              )}
            </div>
          </div>

          {/* Tech stack */}
          {project.techStack && project.techStack.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-4">
              {project.techStack.map((t: string) => (
                <span key={t} className="text-xs font-medium bg-blue-100 text-blue-800 px-2.5 py-1 rounded-full">
                  {t}
                </span>
              ))}
            </div>
          )}

          {/* Meta strip */}
          <div className="flex items-center gap-5 mt-5 pt-4 border-t border-border text-sm text-muted flex-wrap">
            {project.completedAt && (
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                Shipped {new Date(project.completedAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
              </span>
            )}
            <span className="flex items-center gap-1.5">
              <Users className="w-4 h-4" />
              {dedupedTeam.length} contributor{dedupedTeam.length !== 1 ? "s" : ""}
            </span>
            {project.showcaseViews > 0 && (
              <span>{project.showcaseViews} view{project.showcaseViews !== 1 ? "s" : ""}</span>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Release notes */}
          {project.releaseNotes && (
            <section className="bg-card border border-border rounded-xl p-6" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
              <h2 className="text-base font-bold text-foreground mb-3">Release notes — {project.version}</h2>
              <pre className="text-sm text-foreground leading-relaxed whitespace-pre-wrap font-sans">
                {project.releaseNotes}
              </pre>
            </section>
          )}

          {/* Documentation */}
          {docs.length > 0 && (
            <section className="bg-card border border-border rounded-xl p-6" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
              <h2 className="text-base font-bold text-foreground mb-4">Documentation</h2>
              <div className="space-y-2">
                {docs.map(doc => {
                  const url = doc.format === "markdown" ? null : (doc.externalUrl || doc.fileUrl);
                  const content = (
                    <div className="flex items-start gap-3 p-3 rounded-lg border border-border hover:border-primary/40 hover:bg-background transition-colors group">
                      <div className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/15 flex items-center justify-center text-primary shrink-0">
                        {DOC_ICON[doc.kind]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                          {doc.title || DOC_LABEL[doc.kind]}
                        </p>
                        <p className="text-xs text-muted mt-0.5">
                          {DOC_LABEL[doc.kind]} · {doc.format === "external-url" ? "External link" : doc.format === "markdown" ? "Inline" : "File"}
                        </p>
                      </div>
                      {url && <ExternalLink className="w-4 h-4 text-muted group-hover:text-primary" />}
                    </div>
                  );
                  return url ? (
                    <a key={doc._id} href={url} target="_blank" rel="noreferrer" className="block">{content}</a>
                  ) : (
                    <div key={doc._id}>{content}{doc.contentMd && (
                      <pre className="text-sm text-foreground leading-relaxed whitespace-pre-wrap font-sans mt-2 p-3 bg-background rounded-lg border border-border">
                        {doc.contentMd}
                      </pre>
                    )}</div>
                  );
                })}
              </div>
            </section>
          )}

          {/* Release history */}
          {project.releases && project.releases.length > 0 && (
            <section className="bg-card border border-border rounded-xl p-6" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
              <h2 className="text-base font-bold text-foreground mb-4">Release history</h2>
              <ol className="relative border-l-2 border-border ml-2 space-y-4">
                {project.releases.slice().reverse().map((rel: any, i: number) => (
                  <li key={i} className="pl-4 -ml-px">
                    <div className="absolute w-3 h-3 bg-primary rounded-full -left-[7px] mt-1.5 border-2 border-card" />
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-foreground">{rel.version}</span>
                      <span className="text-xs text-muted">
                        {new Date(rel.releasedAt).toLocaleDateString("en-GB", { day:"numeric",month:"short",year:"numeric" })}
                      </span>
                    </div>
                    {rel.notes && <p className="text-sm text-muted mt-1 whitespace-pre-wrap">{rel.notes}</p>}
                  </li>
                ))}
              </ol>
            </section>
          )}
        </div>

        {/* Side column */}
        <div className="space-y-6">
          {/* Team */}
          <section className="bg-card border border-border rounded-xl p-5" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
            <h3 className="text-sm font-bold text-foreground mb-3">Team</h3>
            <div className="space-y-2">
              {dedupedTeam.map((m: any) => {
                const initials = (m.name || "?").split(" ").map((w: string) => w[0]).slice(0, 2).join("").toUpperCase();
                return (
                  <NextLink key={m._id} href={`/profile/${m._id}`}
                    className="flex items-center gap-2 p-2 rounded-lg hover:bg-background transition-colors">
                    <div className="w-8 h-8 rounded-full bg-primary/10 border border-border flex items-center justify-center text-xs font-bold text-primary overflow-hidden">
                      {m.avatar
                        ? <img src={m.avatar} alt={m.name} className="w-full h-full object-cover" />
                        : initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">{m.name}</p>
                      {m._id === project.lead?._id && (
                        <p className="text-xs text-primary">Lead</p>
                      )}
                    </div>
                  </NextLink>
                );
              })}
            </div>
          </section>

          {/* Links */}
          <section className="bg-card border border-border rounded-xl p-5" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
            <h3 className="text-sm font-bold text-foreground mb-3">Links</h3>
            <div className="space-y-2 text-sm">
              {project.liveUrl && (
                <a href={project.liveUrl} target="_blank" rel="noreferrer"
                  className="flex items-center gap-2 text-primary hover:underline">
                  <ExternalLink className="w-3.5 h-3.5" /> Live demo
                </a>
              )}
              {project.githubRepo && (
                <a href={project.githubRepo} target="_blank" rel="noreferrer"
                  className="flex items-center gap-2 text-primary hover:underline">
                  <Github className="w-3.5 h-3.5" /> Source code
                </a>
              )}
              {project.demoVideoUrl && (
                <a href={project.demoVideoUrl} target="_blank" rel="noreferrer"
                  className="flex items-center gap-2 text-primary hover:underline">
                  <ExternalLink className="w-3.5 h-3.5" /> Demo video
                </a>
              )}
              {project.apiDocsUrl && (
                <a href={project.apiDocsUrl} target="_blank" rel="noreferrer"
                  className="flex items-center gap-2 text-primary hover:underline">
                  <ExternalLink className="w-3.5 h-3.5" /> API docs
                </a>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
