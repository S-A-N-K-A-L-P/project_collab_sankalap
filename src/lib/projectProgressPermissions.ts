export type ProjectProgressRole =
    | "admin"
    | "pixel_head"
    | "project_lead"
    | "pixel_member"
    | "normal_user"
    | "user";

export function canManageTasks(role?: string): boolean {
    return role === "admin" || role === "pixel_head" || role === "project_lead";
}

export function canUpdateProgress(role?: string): boolean {
    return role === "pixel_member" || canManageTasks(role);
}