/**
 * Org-level permission resolution helpers.
 *
 * Two-dimensional permission model:
 *  - Platform role  (User.role)  — network-wide
 *  - Org role       (OrgMember.role) — per-org
 *
 * Platform admins always override org-level restrictions.
 */

import type { AppRole, OrgRole } from "./roles";

/** Returns true if the platform admin can override org-level restrictions */
export function isPlatformAdminOverride(platformRole?: string): boolean {
  return platformRole === "master_admin";
}

/** Can the user manage org settings, members, branding? */
export function canManageOrg(platformRole?: string, orgRole?: string): boolean {
  if (isPlatformAdminOverride(platformRole)) return true;
  return orgRole === "admin" || orgRole === "owner";
}

/** Can the user edit the org portfolio (builder access)? */
export function canEditOrgPortfolio(platformRole?: string, orgRole?: string): boolean {
  if (isPlatformAdminOverride(platformRole)) return true;
  return orgRole === "admin" || orgRole === "owner";
}

/** Can the user invite members to the org? */
export function canInviteMembers(platformRole?: string, orgRole?: string): boolean {
  if (isPlatformAdminOverride(platformRole)) return true;
  return orgRole === "admin" || orgRole === "owner";
}

/** Can the user approve pending join requests? */
export function canApproveJoinRequest(platformRole?: string, orgRole?: string): boolean {
  if (isPlatformAdminOverride(platformRole)) return true;
  return orgRole === "admin" || orgRole === "owner";
}

/** Can the user change another member's role? */
export function canChangeOrgRole(platformRole?: string, orgRole?: string): boolean {
  if (isPlatformAdminOverride(platformRole)) return true;
  return orgRole === "admin" || orgRole === "owner";
}

/** Can the user remove a member from the org? */
export function canRemoveMember(platformRole?: string, orgRole?: string): boolean {
  if (isPlatformAdminOverride(platformRole)) return true;
  return orgRole === "admin" || orgRole === "owner";
}

/** Can the user lead projects in this org? */
export function canLeadOrgProject(platformRole?: string, orgRole?: string): boolean {
  if (isPlatformAdminOverride(platformRole)) return true;
  return (
    orgRole === "lead" ||
    orgRole === "admin" ||
    orgRole === "owner"
  );
}

/** Can the user verify contributions in this org? */
export function canVerifyContributions(platformRole?: string, orgRole?: string): boolean {
  if (isPlatformAdminOverride(platformRole)) return true;
  return (
    orgRole === "lead" ||
    orgRole === "admin" ||
    orgRole === "owner"
  );
}

/** Can the user create proposals in this org? */
export function canCreateOrgProposal(orgRole?: string): boolean {
  return (
    orgRole === "member" ||
    orgRole === "contributor" ||
    orgRole === "lead" ||
    orgRole === "admin" ||
    orgRole === "owner"
  );
}

/**
 * Resolves the "effective permission level" combining platform + org roles.
 * Returns a numeric level (higher = more permission).
 */
export function effectivePermissionLevel(platformRole?: string, orgRole?: string): number {
  // Platform overrides
  if (platformRole === "master_admin") return 100;
  if (platformRole === "platform_moderator") return 80;

  // Org-level
  const orgLevels: Record<string, number> = {
    owner: 70,
    admin: 60,
    lead: 50,
    contributor: 40,
    member: 30,
    observer: 10,
  };
  return orgLevels[orgRole ?? ""] ?? 0;
}

/** Org role display metadata */
export const ORG_ROLE_LABELS: Record<OrgRole, string> = {
  observer:    "Observer",
  member:      "Member",
  contributor: "Contributor",
  lead:        "Project Lead",
  admin:       "Admin",
  owner:       "Owner",
};

export const ORG_ROLE_COLORS: Record<OrgRole, string> = {
  observer:    "bg-muted-strong/40 text-muted-foreground",
  member:      "bg-blue-500/20 text-blue-400",
  contributor: "bg-cyan-500/20 text-cyan-400",
  lead:        "bg-purple-500/20 text-purple-400",
  admin:       "bg-orange-500/20 text-orange-400",
  owner:       "bg-yellow-500/20 text-yellow-400",
};
