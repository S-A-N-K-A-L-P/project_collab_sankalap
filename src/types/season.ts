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
export type SeasonPricingMode = "free" | "one_time" | "monthly";
export type SeasonPayerType = "participant" | "organization" | "either";

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
  visibility: "public" | "private" | "invite_only";
  timezone: string;
  durationWeeks: number;
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
    participantCapacity: number;
    allowMultipleProjects: boolean;
    minimumWeeklyHours: number;
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

export interface ISeasonPricing {
  mode: SeasonPricingMode;
  payerType: SeasonPayerType;
  currency: string;
  amount: number;
  joiningFee: number;
  billingCycleCount: number;
  trialDays: number;
  gracePeriodDays: number;
  paymentTiming: "before_application" | "after_acceptance";
  taxMode: "inclusive" | "exclusive";
  refundPolicy: "none" | "before_building" | "manual_review";
  displayPublicly: boolean;
  scholarshipsEnabled: boolean;
  couponsEnabled: boolean;
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
