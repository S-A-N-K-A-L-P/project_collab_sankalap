"use client";

import { motion } from "framer-motion";
import { Globe, Github, Twitter, Linkedin, ExternalLink, Crown, Building2 } from "lucide-react";
import type { IOrgPublic } from "@/types/org";

const CATEGORY_LABELS: Record<string, string> = {
  community: "Community", academic: "Academic", company: "Company", open_source: "Open Source",
};

interface OrgHeroProps {
  org:     IOrgPublic;
  actions?: React.ReactNode;
}

export default function OrgHero({ org, actions }: OrgHeroProps) {
  const logo = org.logo || org.avatar || "";

  return (
    <div className="relative w-full overflow-hidden rounded-2xl">
      {/* Banner */}
      <div className="relative h-52 md:h-72 w-full overflow-hidden bg-gradient-to-br from-primary/10 dark:from-indigo-900/40 to-primary/5 dark:to-purple-900/40">
        {(org.bannerImage || org.banner) ? (
          <motion.img
            src={org.bannerImage || org.banner}
            alt={org.name}
            initial={{ scale: 1.05 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="w-full h-full object-cover"
          />
        ) : (
          // Animated gradient fallback
          <div
            className="absolute inset-0"
            style={{
              background: `radial-gradient(ellipse at 30% 50%, ${org.themeColor || "#6366f1"}30, transparent 60%),
                           radial-gradient(ellipse at 70% 50%, ${org.themeColor || "#6366f1"}20, transparent 60%)`,
            }}
          />
        )}
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 dark:from-black/80 via-black/10 dark:via-black/20 to-transparent" />
      </div>

      {/* Content overlay */}
      <div className="absolute bottom-0 left-0 right-0 px-6 pb-6 flex flex-col sm:flex-row sm:items-end gap-4">
        {/* Logo */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="w-20 h-20 md:w-24 md:h-24 rounded-2xl border-4 border-background dark:border-white/20 overflow-hidden flex items-center justify-center text-3xl font-bold shadow-2xl flex-shrink-0"
          style={{ background: org.themeColor || "#6366f1" }}
        >
          {logo ? (
            <img src={logo} alt={org.name} className="w-full h-full object-cover" />
          ) : (
            <span className="text-white">{org.name[0]?.toUpperCase()}</span>
          )}
        </motion.div>

        {/* Name + tagline */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          className="flex-1 min-w-0"
        >
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-background/60 dark:bg-white/10 text-foreground dark:text-white/70 border border-border dark:border-white/10">
              {CATEGORY_LABELS[org.category] || org.category}
            </span>
            {org.isHost && (
              <span className="flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-700 dark:text-yellow-300 border border-yellow-200 dark:border-yellow-400/30">
                <Crown size={10} /> Official S.A.N.K.A.L.P.
              </span>
            )}
          </div>
          <h1 className="text-2xl md:text-4xl font-bold text-foreground dark:text-white leading-tight">{org.name}</h1>
          {org.tagline && (
            <p className="text-muted-foreground dark:text-white/60 text-sm md:text-base mt-0.5 line-clamp-2">{org.tagline}</p>
          )}

          {/* Social links */}
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            {org.website && (
              <a href={org.website} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs text-muted-foreground dark:text-white/50 hover:text-foreground dark:hover:text-white/90 transition-colors">
                <Globe size={12} /> {org.website.replace(/^https?:\/\//, "")}
              </a>
            )}
            {org.socialLinks?.github && (
              <a href={`https://github.com/${org.socialLinks.github}`} target="_blank" rel="noopener noreferrer"
                className="text-muted-foreground dark:text-white/40 hover:text-foreground dark:hover:text-white/90 transition-colors">
                <Github size={14} />
              </a>
            )}
            {org.socialLinks?.twitter && (
              <a href={`https://twitter.com/${org.socialLinks.twitter}`} target="_blank" rel="noopener noreferrer"
                className="text-muted-foreground dark:text-white/40 hover:text-foreground dark:hover:text-white/90 transition-colors">
                <Twitter size={14} />
              </a>
            )}
            {org.socialLinks?.linkedin && (
              <a href={org.socialLinks.linkedin} target="_blank" rel="noopener noreferrer"
                className="text-muted-foreground dark:text-white/40 hover:text-foreground dark:hover:text-white/90 transition-colors">
                <Linkedin size={14} />
              </a>
            )}
          </div>
        </motion.div>

        {/* Action slot */}
        {actions && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="flex-shrink-0"
          >
            {actions}
          </motion.div>
        )}
      </div>
    </div>
  );
}
