"use client";

import PortfolioRenderer, { type PortfolioData } from "./PortfolioRenderer";
import type { IOrgPublic, IOrgMemberPopulated } from "@/types/org";

interface OrgPortfolioRendererProps {
  org:         IOrgPublic;
  portfolio:   any;
  members:     IOrgMemberPopulated[];
  projects:    any[];
  contained?:  boolean;
}

export default function OrgPortfolioRenderer({
  org,
  portfolio,
  members,
  projects,
  contained = false,
}: OrgPortfolioRendererProps) {
  // Map org context to PortfolioData interface
  const data: PortfolioData = {
    orgMode:          true,
    themeId:          portfolio?.themeId || "aurora",
    accent:           portfolio?.accent,
    accent2:          portfolio?.accent2,
    bgOverride:       portfolio?.bgOverride,
    threeOverride:    portfolio?.threeOverride,
    card:             portfolio?.card,
    sectionAnim:      portfolio?.sectionAnim || "rise",
    projectCardStyle: portfolio?.projectCardStyle || "glass",
    projectCardAnim:  portfolio?.projectCardAnim || "rise",
    sections:         portfolio?.sections || [],
    seo:              portfolio?.seo || { title: org.name, description: org.tagline || org.description },
    
    // Inject Org specific payloads
    org: {
      _id:          org._id,
      name:         org.name,
      slug:         org.slug,
      logo:         org.logo || org.avatar,
      bannerImage:  org.bannerImage || org.banner,
      tagline:      org.tagline,
      charter:      org.charter,
      category:     org.category,
      themeColor:   org.themeColor,
      socialLinks:  org.socialLinks,
      website:      org.website,
      email:        org.email,
      stats: {
        memberCount:           org.stats?.memberCount || 0,
        projectCount:          org.stats?.projectCount || 0,
        completedProjectCount: org.stats?.completedProjectCount || 0,
      },
      trustScore:   org.trustScore,
      visibility:   org.visibility,
      orgType:      org.orgType,
    },
    orgMembers: members.map((m) => ({
      _id: m._id,
      userId: {
        _id:    m.userId?._id || "",
        name:   m.userId?.name || "Member",
        avatar: m.userId?.avatar || "",
        handle: m.userId?.handle || "",
      },
      role:    m.role,
      xpInOrg: m.xpInOrg || 0,
    })),
    orgProjects: projects.map((p) => ({
      _id:         p._id,
      title:       p.title,
      description: p.description,
      coverImage:  p.coverImage,
      liveUrl:     p.liveUrl,
      githubRepo:  p.githubRepo,
      techStack:   p.techStack || [],
      status:      p.status,
    })),
  };

  return <PortfolioRenderer data={data} contained={contained} />;
}
