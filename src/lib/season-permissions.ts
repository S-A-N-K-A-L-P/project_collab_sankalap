import type { SeasonRole, SeasonStatus } from "@/types/season";
import { isPlatformAdminOverride } from "./org-permissions";

export function canManageSeason(platformRole?: string, seasonRole?: string): boolean {
  return isPlatformAdminOverride(platformRole) || platformRole === "platform_moderator" || seasonRole === "organizer";
}

export function canManageSeasonOrganization(platformRole?: string, seasonRole?: string, orgRole?: string): boolean {
  return canManageSeason(platformRole, seasonRole) || seasonRole === "org_admin" || orgRole === "owner" || orgRole === "admin";
}

export function canCreateSeasonProposal(seasonStatus: SeasonStatus, seasonRole?: string): boolean {
  return seasonStatus === "proposal_submission" && seasonRole === "mentor";
}

export function canReviewSeasonApplications(seasonRole?: string, orgRole?: string): boolean {
  return seasonRole === "mentor" || seasonRole === "org_admin" || orgRole === "owner" || orgRole === "admin";
}

export function canJudgeSeason(seasonStatus: SeasonStatus, seasonRole?: string): boolean {
  return seasonStatus === "judging" && seasonRole === "judge";
}

export function canApplyToSeasonProposal(seasonStatus: SeasonStatus): boolean {
  return seasonStatus === "applications";
}

export const SEASON_ROLE_LABELS: Record<SeasonRole, string> = {
  organizer: "Season Organizer",
  org_admin: "Organization Coordinator",
  mentor: "Mentor",
  judge: "Judge",
};
