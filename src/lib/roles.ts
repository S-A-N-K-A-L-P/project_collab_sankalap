/**
 * S.A.N.K.A.L.P. Role System
 * ─────────────────────────────────────────────────────────────
 *  user               Regular registered member.
 *                     Can: browse, vote, comment, read proposals.
 *
 *  sankalp_member     Active community contributor.
 *                     Can: create proposals, update progress on
 *                     tasks assigned to them, join projects.
 *
 *  sankalp_associate  Associate-level admin / project manager.
 *                     Can: manage proposals, projects, and tasks.
 *                     Has access to the admin panel.
 *
 *  platform_moderator Review org launch requests, moderate content
 *                     across all orgs. Cannot change platform config.
 *
 *  master_admin       Full platform administrator.
 *                     Can: everything above + platform configuration,
 *                     org management, role assignment, template publishing.
 * ─────────────────────────────────────────────────────────────
 */

export type AppRole =
  | "user"
  | "sankalp_member"
  | "sankalp_associate"
  | "platform_moderator"
  | "master_admin";

/** All valid org-level roles in ascending privilege order */
export type OrgRole =
  | "observer"
  | "member"
  | "contributor"
  | "lead"
  | "admin"
  | "owner";

/** All valid roles in ascending privilege order */
export const ROLES: AppRole[] = [
  "user",
  "sankalp_member",
  "sankalp_associate",
  "platform_moderator",
  "master_admin",
];

/** Roles with access to the /admin panel */
export const ADMIN_ROLES: AppRole[] = [
  "sankalp_associate",
  "platform_moderator",
  "master_admin",
];

/** Role that can manage platform-level configuration */
export const MASTER_ROLES: AppRole[] = ["master_admin"];

/** Roles that can review org launch requests */
export const REVIEWER_ROLES: AppRole[] = ["platform_moderator", "master_admin"];

// ── Guard helpers ─────────────────────────────────────────────

/** Legacy admin role names from older schema versions (pre-rename). */
const LEGACY_ADMIN_ROLES = ["admin", "pixel_admin"];

/** Returns true if role has access to the admin panel */
export function isAdminRole(role?: string): boolean {
  if (!role) return false;
  return ADMIN_ROLES.includes(role as AppRole) || LEGACY_ADMIN_ROLES.includes(role);
}

/** Returns true only for master_admin — platform config gates */
export function isMasterAdmin(role?: string): boolean {
  return role === "master_admin";
}

/** Returns true for platform_moderator or master_admin */
export function isPlatformReviewer(role?: string): boolean {
  return role === "platform_moderator" || role === "master_admin";
}

/** Returns true for platform_moderator (review org requests, moderate content) */
export function isPlatformModerator(role?: string): boolean {
  return role === "platform_moderator" || role === "master_admin";
}

// ── Feature-level permissions ─────────────────────────────────

/** Can approve/reject proposals */
export function canApproveProposal(role?: string): boolean {
  return isAdminRole(role);
}

/** Can convert a proposal into a project */
export function canConvertToProject(role?: string): boolean {
  return isAdminRole(role);
}

/** Can assign / delete tasks across any project */
export function canManageTasks(role?: string): boolean {
  return isAdminRole(role);
}

/** Can update progress on tasks.
 *  sankalp_members may only update tasks assigned to themselves
 *  (enforced at the route level by checking task.assignedTo === userId). */
export function canUpdateProgress(role?: string): boolean {
  return (
    role === "sankalp_member" ||
    role === "sankalp_associate" ||
    role === "platform_moderator" ||
    role === "master_admin"
  );
}

/** Can view the project progress section at all */
export function canViewProjectProgress(role?: string): boolean {
  return role !== "user";
}

/** Can delete a project */
export function canDeleteProject(role?: string): boolean {
  return isAdminRole(role);
}

/** Can assign / change user roles */
export function canAssignRoles(role?: string): boolean {
  return isAdminRole(role);
}

/** Can manage platform-level configuration (templates, org setup, etc.) */
export function canConfigurePlatform(role?: string): boolean {
  return isMasterAdmin(role);
}

/** Can review org launch requests (approve/reject) */
export function canReviewOrgRequests(role?: string): boolean {
  return isPlatformReviewer(role);
}

// ── Display metadata ──────────────────────────────────────────

export const ROLE_LABELS: Record<AppRole, string> = {
  user:                "User",
  sankalp_member:      "SANKALP Member",
  sankalp_associate:   "SANKALP Associate",
  platform_moderator:  "Platform Moderator",
  master_admin:        "Master Admin",
};

export const ROLE_COLORS: Record<AppRole, string> = {
  user:                "role-user",
  sankalp_member:      "role-member",
  sankalp_associate:   "role-associate",
  platform_moderator:  "role-moderator",
  master_admin:        "role-admin",
};

/** The two roles a new member can self-select during registration */
export const REGISTERABLE_ROLES: AppRole[] = ["user", "sankalp_member"];
