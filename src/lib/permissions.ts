import type { Enums } from "@/integrations/supabase/types";

export type AppRole = Enums<"app_role">;

export const ROLE_LABELS: Record<AppRole, string> = {
  admin: "Master Admin",
  head: "Pixel Head",
  member: "Pixel Member",
  user: "Normal User",
};

export const ROLE_COLORS: Record<AppRole, string> = {
  admin: "role-admin",
  head: "role-head",
  member: "role-member",
  user: "role-user",
};

export function canApproveProposal(role: AppRole): boolean {
  return role === "admin" || role === "head";
}

export function canConvertToPriority(role: AppRole): boolean {
  return role === "admin" || role === "head";
}


export function canManageTasks(role: AppRole): boolean {
  return role === "admin" || role === "head";
}

export function canViewTasks(role: AppRole): boolean {
  return role !== "user";
}

export function canUpdateProgress(role: AppRole): boolean {
  return role !== "user";
}

export function canDeleteProject(role: AppRole): boolean {
  return role === "admin" || role === "head";
}

export function canGiveRemarks(role: AppRole): boolean {
  return role === "admin" || role === "head";
}

export function canAssignRoles(role: AppRole): boolean {
  return role === "admin" || role === "head";
}
