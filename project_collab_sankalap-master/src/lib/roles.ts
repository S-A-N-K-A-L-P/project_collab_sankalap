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
 *  master_admin       Full platform administrator.
 *                     Can: everything above + platform configuration,
 *                     org management, role assignment, template publishing.
 * ─────────────────────────────────────────────────────────────
 */

export type AppRole =
  | "user"
  | "sankalp_member"
  | "sankalp_associate"
  | "master_admin";

/** All valid roles in ascending privilege order */
export const ROLES: AppRole[] = [
  "user",
  "sankalp_member",
  "sankalp_associate",
  "master_admin",
];

/** Roles with access to the /admin panel */
export const ADMIN_ROLES: AppRole[] = ["sankalp_associate", "master_admin"];

/** Role that can manage platform-level configuration */
export const MASTER_ROLES: AppRole[] = ["master_admin"];

// ── Guard helpers ─────────────────────────────────────────────

/** Returns true if role has access to the admin panel */
export function isAdminRole(role?: string): boolean {
  return ADMIN_ROLES.includes(role as AppRole);
}

/** Returns true only for master_admin — platform config gates */
export function isMasterAdmin(role?: string): boolean {
  return role === "master_admin";
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

// ── Display metadata ──────────────────────────────────────────

export const ROLE_LABELS: Record<AppRole, string> = {
  user:               "User",
  sankalp_member:     "SANKALP Member",
  sankalp_associate:  "SANKALP Associate",
  master_admin:       "Master Admin",
};

export const ROLE_COLORS: Record<AppRole, string> = {
  user:               "role-user",
  sankalp_member:     "role-member",
  sankalp_associate:  "role-associate",
  master_admin:       "role-admin",
};

/** The two roles a new member can self-select during registration */
export const REGISTERABLE_ROLES: AppRole[] = ["user", "sankalp_member"];
