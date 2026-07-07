/**
 * Re-exports from the central roles library for project-progress routes.
 * Import from here so existing route files don't need path changes.
 */
export type { AppRole as ProjectProgressRole } from "@/lib/roles";
export { canManageTasks, canUpdateProgress } from "@/lib/roles";
