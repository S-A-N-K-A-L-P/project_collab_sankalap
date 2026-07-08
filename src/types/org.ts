/**
 * TypeScript interfaces for the org system.
 * These are API response shapes, not Mongoose documents.
 */

export type OrgStatus =
  | "requested"
  | "in_review"
  | "approved"
  | "active"
  | "suspended"
  | "archived"
  | "rejected";

export type OrgType = "free" | "standard" | "premium" | "research" | "invite_only";

export type OrgCategory = "community" | "academic" | "company" | "open_source";

export type OrgRole = "observer" | "member" | "contributor" | "lead" | "admin" | "owner";

export type OrgVotingRule = "all_members" | "leads_and_above" | "admins_only";

export interface IOrgSocialLinks {
  github:   string;
  twitter:  string;
  linkedin: string;
  discord:  string;
}

export interface IOrgGalleryItem {
  url:      string;
  caption:  string;
  publicId: string;
}

export interface IOrgTrustScore {
  completionRate:  number;
  avgResponseDays: number;
  founderVerified: boolean;
  kycVerified:     boolean;
  lastCalculated?: string;
}

export interface IOrgStats {
  memberCount:           number;
  projectCount:          number;
  completedProjectCount: number;
  totalXP:               number;
}

export interface IOrgReview {
  reviewedBy?: { _id: string; name: string; avatar: string };
  reviewedAt?: string;
  decision?:   "approved" | "rejected" | "changes_requested";
  reason?:     string;
}

/** Shape returned by the public org profile API */
export interface IOrgPublic {
  _id:        string;
  name:       string;
  slug:       string;
  description: string;
  status:     OrgStatus;
  orgType:    OrgType;
  category:   OrgCategory;
  charter:    string;
  roadmap:    string;
  tagline:    string;
  website:    string;
  email:      string;
  socialLinks: IOrgSocialLinks;
  logo:       string;
  bannerImage: string;
  avatar?:    string; // legacy fallback
  banner?:    string; // legacy fallback
  themeColor: string;
  gallery:    IOrgGalleryItem[];
  visibility: "public" | "private";
  portfolioEnabled: boolean;
  membershipFee:    number;
  stats:      IOrgStats;
  trustScore: IOrgTrustScore;
  isHost:     boolean;
  ownerId?:   { _id: string; name: string; avatar: string };
  createdBy:  { _id: string; name: string; avatar: string };
  createdAt:  string;
  updatedAt:  string;
}

/** Shape used for creating an org (launch wizard) */
export interface IOrgCreate {
  name:        string;
  slug:        string;
  description: string;
  category:    OrgCategory;
  orgType:     OrgType;
  charter:     string;
  roadmap:     string;
  tagline?:    string;
  website?:    string;
  email?:      string;
  socialLinks?: Partial<IOrgSocialLinks>;
  logo?:       string;
  bannerImage?: string;
  themeColor?: string;
  visibility?: "public" | "private";
}

/** Shape for org admin views (includes review info) */
export interface IOrgAdmin extends IOrgPublic {
  review?:  IOrgReview;
  members?: IOrgMemberPopulated[];
  maxConcurrentProjects: number;
  maxTeamSize:           number;
  votingRightsRule:      OrgVotingRule;
}

/** A populated org member (with user info) */
export interface IOrgMemberPopulated {
  _id:      string;
  userId:   { _id: string; name: string; avatar: string; handle: string; skills: string[] };
  orgId:    string;
  role:     OrgRole;
  status:   "active" | "pending" | "suspended";
  xpInOrg:  number;
  joinedAt: string;
}

/** PortfolioData extension for org context */
export interface IOrgPortfolioData {
  orgMode: true;
  org: {
    _id:         string;
    name:        string;
    slug:        string;
    logo?:       string;
    bannerImage?: string;
    tagline?:    string;
    charter?:    string;
    category?:   OrgCategory;
    socialLinks?: Partial<IOrgSocialLinks>;
    website?:    string;
    email?:      string;
    themeColor?: string;
    stats?:      IOrgStats;
    trustScore?: IOrgTrustScore;
    createdAt?:  string;
  };
  orgMembers?: Array<{
    _id:    string;
    name:   string;
    avatar: string;
    role:   OrgRole;
    handle?: string;
  }>;
  orgProjects?: Array<{
    _id:        string;
    title:      string;
    description?: string;
    coverImage?:  string;
    status:     string;
    techStack:  string[];
    liveUrl?:   string;
    githubRepo?: string;
  }>;
}
