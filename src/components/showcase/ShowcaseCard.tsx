"use client";

import NextLink from "next/link";
import { ExternalLink, Github, Users, IndianRupee, Star, ArrowUpRight } from "lucide-react";
import { useCardGlow, CardGlow } from "@/components/ui/card-glow";

interface ShowcaseCardProps {
  project: {
    _id: string;
    title: string;
    description?: string;
    version?: string;
    coverImage?: string;
    liveUrl?: string;
    githubRepo?: string;
    techStack?: string[];
    completedAt?: string;
    showcaseViews?: number;
    lead?: { name: string; avatar?: string };
    members?: any[];
    marketplace?: { forSale?: boolean; priceINR?: number };
    showcase?: { featured?: boolean };
  };
}

export default function ShowcaseCard({ project }: ShowcaseCardProps) {
  const completedDate = project.completedAt
    ? new Date(project.completedAt).toLocaleDateString("en-GB", { month: "short", year: "numeric" })
    : null;

  const teamCount = (project.members?.length || 0) + 1;
  const { onMouseMove, background } = useCardGlow();

  return (
    <NextLink
      href={`/showcase/${project._id}`}
      onMouseMove={onMouseMove}
      className="group relative saas-card overflow-hidden flex flex-col transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/35 hover:shadow-[var(--shadow-md)]"
    >
      <CardGlow background={background} />

      {/* Cover */}
      <div className="relative z-10 aspect-video w-full bg-gradient-to-br from-primary-light via-secondary/15 to-background border-b border-border overflow-hidden">
        {project.coverImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={project.coverImage} alt={project.title} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-4xl font-bold text-primary/35 select-none">
              {project.title?.[0]?.toUpperCase() || "?"}
            </span>
          </div>
        )}
        {project.showcase?.featured && (
          <span className="absolute top-3 left-3 flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500 text-white text-[10.5px] font-semibold shadow-xs">
            <Star className="w-3 h-3 fill-current" /> Featured
          </span>
        )}
        {project.marketplace?.forSale && (
          <span className="absolute top-3 right-3 flex items-center gap-0.5 px-2.5 py-1 rounded-full bg-emerald-600 text-white text-xs font-bold shadow-xs">
            <IndianRupee className="w-3 h-3" />
            {project.marketplace.priceINR
              ? project.marketplace.priceINR.toLocaleString()
              : "Inquire"}
          </span>
        )}
      </div>

      {/* Body */}
      <div className="relative z-10 p-5 flex flex-col flex-1 gap-2.5">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-[15px] font-bold text-foreground leading-snug group-hover:text-primary transition-colors line-clamp-2">
            {project.title}
          </h3>
          {project.version && (
            <span className="text-[10.5px] font-semibold text-primary bg-primary-light px-2 py-0.5 rounded-full shrink-0 border border-primary/15">
              {project.version}
            </span>
          )}
        </div>

        {project.description && (
          <p className="text-xs text-muted line-clamp-2 leading-relaxed">
            {project.description}
          </p>
        )}

        {/* Tech stack */}
        {project.techStack && project.techStack.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-0.5">
            {project.techStack.slice(0, 3).map(t => (
              <span key={t} className="pill-info text-[10.5px] font-medium px-2.5 py-0.5 rounded-full">
                {t}
              </span>
            ))}
            {project.techStack.length > 3 && (
              <span className="text-[10.5px] text-muted font-medium self-center">+{project.techStack.length - 3}</span>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="mt-auto pt-3.5 flex items-center justify-between border-t border-border">
          <div className="flex items-center gap-3 text-xs text-muted">
            <span className="flex items-center gap-1 font-medium text-foreground">
              <Users className="w-3.5 h-3.5 text-primary" />
              {teamCount}
            </span>
            {project.liveUrl && (
              <ExternalLink className="w-3.5 h-3.5 text-muted group-hover:text-primary transition-colors" />
            )}
            {project.githubRepo && (
              <Github className="w-3.5 h-3.5 text-muted group-hover:text-primary transition-colors" />
            )}
          </div>
          <div className="flex items-center gap-2">
            {completedDate && (
              <span className="text-[11px] text-muted">{completedDate}</span>
            )}
            <span className="w-6 h-6 rounded-lg bg-primary-light text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
              <ArrowUpRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </div>
      </div>
    </NextLink>
  );
}
