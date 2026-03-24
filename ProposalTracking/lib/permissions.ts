export type UserRole = "admin" | "pixel_head" | "pixel_member" | "normal_user";

export function isAdmin(role: UserRole): boolean {
  return role === "admin";
}

export function isPixelHead(role: UserRole): boolean {
  return role === "pixel_head";
}

export function canManageTasks(role: UserRole): boolean {
  return role === "admin" || role === "pixel_head";
}

export function canUpdateProgress(role: UserRole): boolean {
  return role === "pixel_member" || canManageTasks(role);
}

export function isReadOnly(role: UserRole): boolean {
  return role === "normal_user";
}

export function canViewAll(role: UserRole): boolean {
  return role === "admin" || role === "pixel_head";
}
