/**
 * Shared team-roster editing for the admin and mobile/desktop team APIs: membership plus each
 * member's project role, owned paths and task limit. Keeps `members` and `teamRoster` in sync and
 * never removes the project lead.
 */

export const PROJECT_ROLES = ["lead", "architect", "backend", "frontend", "mobile", "sre", "qa", "contributor"] as const;
export type ProjectRole = (typeof PROJECT_ROLES)[number];

export interface RosterMemberUpdate {
  userId: string;
  projectRole?: string;
  ownedPaths?: string[];
  maxActiveTasks?: number;
}

export interface RosterChanges {
  add?: string[];
  remove?: string[];
  memberUpdates?: RosterMemberUpdate[];
}

/** Returns an error message for invalid input, or null. */
export function validateRosterChanges(c: RosterChanges): string | null {
  for (const u of c.memberUpdates || []) {
    if (!u?.userId) return "Each member update needs a userId.";
    if (u.projectRole && !PROJECT_ROLES.includes(u.projectRole as ProjectRole))
      return `Unknown project role "${u.projectRole}". Use one of: ${PROJECT_ROLES.join(", ")}.`;
    if (u.maxActiveTasks !== undefined && (typeof u.maxActiveTasks !== "number" || !Number.isFinite(u.maxActiveTasks)))
      return "maxActiveTasks must be a number.";
  }
  return null;
}

/** Applies the changes to a Mongoose Project document (call project.save() afterwards). */
export function applyRosterChanges(project: any, c: RosterChanges): void {
  const leadId = project.lead?.toString();
  const memberIds = new Set<string>((project.members || []).map((m: any) => m.toString()));
  const roster = new Map<string, any>();
  for (const item of project.teamRoster || []) if (item.userId) roster.set(item.userId.toString(), item);

  const ensure = (uid: string) => {
    if (!roster.has(uid)) roster.set(uid, { userId: uid, projectRole: "contributor", ownedPaths: [], maxActiveTasks: 5, addedAt: new Date() });
    memberIds.add(uid);
    return roster.get(uid);
  };

  for (const uid of c.add || []) if (uid) ensure(uid);
  for (const uid of c.remove || []) {
    if (!uid || uid === leadId) continue;
    memberIds.delete(uid);
    roster.delete(uid);
  }
  for (const u of c.memberUpdates || []) {
    if (!u?.userId) continue;
    const e = ensure(u.userId);
    if (u.projectRole) e.projectRole = u.projectRole;
    if (Array.isArray(u.ownedPaths))
      e.ownedPaths = Array.from(new Set(u.ownedPaths.map((p) => String(p).replace(/\\/g, "/").trim()).filter(Boolean)));
    if (typeof u.maxActiveTasks === "number") e.maxActiveTasks = Math.max(1, Math.min(50, Math.round(u.maxActiveTasks)));
  }

  project.members = Array.from(memberIds);
  project.teamRoster = Array.from(roster.values());
}
