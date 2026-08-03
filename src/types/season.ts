export type SeasonStatus =
  | "draft"
  | "registration"
  | "proposal_submission"
  | "applications"
  | "building"
  | "submission"
  | "judging"
  | "completed"
  | "archived";

export type SeasonRole = "organizer" | "org_admin" | "mentor" | "judge";

export type SeasonOrganizationStatus = "invited" | "applied" | "active" | "declined" | "withdrawn";

export interface ISeasonTimeline {
  registrationOpens?: string;
  registrationCloses?: string;
  proposalsOpen?: string;
  proposalsClose?: string;
  applicationsOpen?: string;
  applicationsClose?: string;
  buildingStarts?: string;
  submissionDeadline?: string;
  judgingStarts?: string;
  resultsAt?: string;
}

export interface ISeasonRubricCriterion {
  key: string;
  label: string;
  description?: string;
  weight: number;
}

export interface ISeasonPublic {
  _id: string;
  name: string;
  slug: string;
  tagline: string;
  description: string;
  status: SeasonStatus;
  bannerImage: string;
  themeColor: string;
  timeline: ISeasonTimeline;
  rules: {
    minTeamSize: number;
    maxTeamSize: number;
    maxApplicationsPerParticipant: number;
    requireOrgApproval: boolean;
    requireSeasonApproval: boolean;
  };
  rubric: ISeasonRubricCriterion[];
  stats: {
    organizationCount: number;
    mentorCount: number;
    proposalCount: number;
    participantCount: number;
    projectCount: number;
  };
  createdAt: string;
  updatedAt: string;
}

export const SEASON_STATUS_LABELS: Record<SeasonStatus, string> = {
  draft: "Draft",
  registration: "Organization Registration",
  proposal_submission: "Mentor Proposals",
  applications: "Participant Applications",
  building: "Building",
  submission: "Final Submission",
  judging: "Judging",
  completed: "Completed",
  archived: "Archived",
};

export const SEASON_STATUS_ORDER: SeasonStatus[] = [
  "draft", "registration", "proposal_submission", "applications", "building",
  "submission", "judging", "completed", "archived",
];
