/**
 * Re-exports from the central roles library.
 * Kept for backward-compatibility with any existing import of this path.
 */
export type { AppRole } from "@/lib/roles";
export {
  ROLES,
  ADMIN_ROLES,
  MASTER_ROLES,
  ROLE_LABELS,
  ROLE_COLORS,
  isAdminRole,
  isMasterAdmin,
  canApproveProposal,
  canConvertToProject,
  canManageTasks,
  canUpdateProgress,
  canViewProjectProgress,
  canDeleteProject,
  canAssignRoles,
  canConfigurePlatform,
} from "@/lib/roles";
