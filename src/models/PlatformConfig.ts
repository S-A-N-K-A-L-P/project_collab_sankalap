import mongoose, { Schema, model, models } from "mongoose";

/**
 * Platform runtime configuration — docs/config.md.
 * Single versioned document; every write bumps `version` and archives the
 * previous state to PlatformConfigHistory for audit + one-click restore.
 * Sections are Mixed on purpose: shape is validated at the API layer
 * against CONFIG_DEFAULTS so new knobs don't need a schema migration.
 */

export const CONFIG_SECTIONS = [
  "plans",
  "organizations",
  "capacity",
  "reputation",
  "proposals",
  "payments",
  "moderation",
  "features",
] as const;

export type ConfigSection = (typeof CONFIG_SECTIONS)[number];

/** Seed defaults — the values in docs/config.md §2. Written on first boot. */
export const CONFIG_DEFAULTS: Record<ConfigSection, Record<string, any>> = {
  plans: {
    free: {
      label: "Free Student",
      priceInr: 0,
      maxOrgMemberships: 2,
      maxActiveProjects: 4,
      proposalCooldownDays: 30,
      proposalsPerCycle: 1,
      supportCreditsPerWeek: 7,
      maxProjectsLed: 1,
      analytics: "basic",
    },
    professional: {
      label: "Professional",
      priceInr: 200,
      billingCycle: "monthly",
      maxOrgMemberships: 20,
      maxActiveProjects: 7,
      proposalsPerMonth: 5,
      supportCreditsPerWeek: 14,
      maxProjectsLed: 3,
      analytics: "advanced",
      priorityReview: true,
      premiumProfile: true,
      feedVisibilityBoost: 1.5,
    },
    founder: {
      label: "Founder Pack",
      billingCycle: "monthly",
      inheritsFrom: "professional",
      canCreateOrganizations: true,
      maxOrganizationsOwned: 3,
      sizePricingBands: [
        { maxMembers: 50, priceInr: 500 },
        { maxMembers: 200, priceInr: 1000 },
        { maxMembers: 500, priceInr: 1500 },
        { maxMembers: null, priceInr: 2000 },
      ],
    },
  },
  organizations: {
    allowedTypes: ["free", "standard", "premium", "research", "invite_only"],
    platformCommissionPct: 10,
    maxMembershipFeeInr: 5000,
    maxConcurrentProjectsDefault: 10,
    maxTeamSizeDefault: 8,
    kycRequiredForPaidOrgs: true,
    founderVerificationRequired: true,
    trustScore: {
      recalcIntervalHours: 24,
      minProjectsForScore: 3,
    },
  },
  capacity: {
    enforceActiveProjectCap: true,
    leaveToJoinDialog: true,
    supportCredits: {
      refundWindowHours: 24,
      rolloverAllowed: false,
      weekStartsOn: "monday",
    },
    abandonment: {
      confirmDialog: true,
      graceWindowDays: 3,
    },
  },
  reputation: {
    commitmentScore: {
      startingScore: 75,
      completedWeight: 1.0,
      abandonedWeight: 2.0,
      floor: 20,
      decayAfterInactiveDays: 180,
      showOnProfile: true,
    },
    badges: [
      { id: "beginner",   emoji: "🌱", label: "Beginner",   rule: "completedProjects < 3" },
      { id: "executor",   emoji: "🚀", label: "Executor",   rule: "completionRate >= 0.80" },
      { id: "reliable",   emoji: "🛠", label: "Reliable",   rule: "completedTasks >= 20" },
      { id: "consistent", emoji: "🎯", label: "Consistent", rule: "activityStreakMonths >= 6" },
      { id: "architect",  emoji: "🧠", label: "Architect",  rule: "successfulProposals >= 5" },
      { id: "founder",    emoji: "🏆", label: "Founder",    rule: "ownsSuccessfulOrg == true" },
    ],
    badgeRecalcCron: "0 2 * * *",
  },
  proposals: {
    supportThresholdToReview: 10,
    supportWindowDays: 21,
    requireRejectionReason: true,
    priorityQueueForPaidTiers: true,
    maxOpenProposalsPerUser: 3,
  },
  payments: {
    provider: "razorpay",
    currency: "INR",
    proUpgradeAmountPaise: 100,
    webhookEnabled: true,
    gracePeriodDaysOnFailedRenewal: 5,
    refundPolicy: "manual",
    invoicePrefix: "SNKLP",
  },
  moderation: {
    reportsToAutoHide: 5,
    reviewQueueRoles: ["sankalp_associate", "master_admin"],
    bannedWordsListId: "default",
    appealWindowDays: 14,
    noNegativeLabels: true,
  },
  features: {
    portfolioBuilder: true,
    proUpgrade: true,
    desktopAppLanding: true,
    marketplace: true,
    organizations: false,
    supportCredits: false,
    commitmentScore: false,
    orgTrustScore: false,
    customDomains: false,
  },
};

const PlatformConfigSchema = new Schema(
  {
    // Fixed key so there is exactly one live config document.
    key:           { type: String, default: "platform", unique: true },
    version:       { type: Number, default: 1 },
    plans:         { type: Schema.Types.Mixed, default: () => CONFIG_DEFAULTS.plans },
    organizations: { type: Schema.Types.Mixed, default: () => CONFIG_DEFAULTS.organizations },
    capacity:      { type: Schema.Types.Mixed, default: () => CONFIG_DEFAULTS.capacity },
    reputation:    { type: Schema.Types.Mixed, default: () => CONFIG_DEFAULTS.reputation },
    proposals:     { type: Schema.Types.Mixed, default: () => CONFIG_DEFAULTS.proposals },
    payments:      { type: Schema.Types.Mixed, default: () => CONFIG_DEFAULTS.payments },
    moderation:    { type: Schema.Types.Mixed, default: () => CONFIG_DEFAULTS.moderation },
    features:      { type: Schema.Types.Mixed, default: () => CONFIG_DEFAULTS.features },
    updatedBy:     { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true, collection: "platform_config" }
);

const PlatformConfigHistorySchema = new Schema(
  {
    version:   { type: Number, required: true },
    section:   { type: String, required: true },   // which section changed
    oldValue:  { type: Schema.Types.Mixed },
    newValue:  { type: Schema.Types.Mixed },
    changedBy: { type: Schema.Types.ObjectId, ref: "User" },
    changedByName: { type: String, default: "" },
  },
  { timestamps: true, collection: "platform_config_history" }
);

PlatformConfigHistorySchema.index({ createdAt: -1 });

export const PlatformConfig =
  models.PlatformConfig || model("PlatformConfig", PlatformConfigSchema);

export const PlatformConfigHistory =
  models.PlatformConfigHistory || model("PlatformConfigHistory", PlatformConfigHistorySchema);

/** Load the live config, seeding defaults on first boot (docs/config.md §4). */
export async function getOrSeedConfig() {
  let cfg = await PlatformConfig.findOne({ key: "platform" });
  if (!cfg) {
    cfg = await PlatformConfig.create({ key: "platform" });
  }
  return cfg;
}
