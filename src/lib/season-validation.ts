import type { ISeasonPricing, SeasonStatus } from "@/types/season";

export function validateSeasonSchedule(timeline: Record<string, any>): string[] {
  const errors: string[] = [];
  const ordered = [
    ["registrationOpens", "Registration opens"], ["registrationCloses", "Registration closes"],
    ["proposalsOpen", "Proposal submission opens"], ["proposalsClose", "Proposal submission closes"],
    ["applicationsOpen", "Applications open"], ["applicationsClose", "Applications close"],
    ["buildingStarts", "Building starts"], ["submissionDeadline", "Submission deadline"],
    ["judgingStarts", "Judging starts"], ["resultsAt", "Results announcement"],
  ] as const;
  let previous: number | null = null;
  for (const [key, label] of ordered) {
    if (!timeline[key]) { errors.push(`${label} is required`); continue; }
    const value = new Date(timeline[key]).getTime();
    if (Number.isNaN(value)) { errors.push(`${label} is invalid`); continue; }
    if (previous !== null && value < previous) errors.push(`${label} must not be before the previous phase`);
    previous = value;
  }
  return errors;
}

export function normalizeSeasonPricing(input: Partial<ISeasonPricing>, durationWeeks: number): ISeasonPricing {
  const mode = input.mode || "free";
  const recommendedCycles = Math.max(1, Math.ceil(durationWeeks / 4));
  return {
    mode,
    payerType: input.payerType || "participant",
    currency: input.currency || "INR",
    amount: mode === "free" ? 0 : Math.max(0, Number(input.amount || 0)),
    joiningFee: mode === "monthly" ? Math.max(0, Number(input.joiningFee || 0)) : 0,
    billingCycleCount: mode === "monthly" ? Math.max(1, Number(input.billingCycleCount || recommendedCycles)) : 1,
    trialDays: mode === "monthly" ? Math.max(0, Number(input.trialDays || 0)) : 0,
    gracePeriodDays: Math.max(0, Number(input.gracePeriodDays ?? 5)),
    paymentTiming: input.paymentTiming || "after_acceptance",
    taxMode: input.taxMode || "inclusive",
    refundPolicy: input.refundPolicy || "manual_review",
    displayPublicly: input.displayPublicly !== false,
    scholarshipsEnabled: !!input.scholarshipsEnabled,
    couponsEnabled: !!input.couponsEnabled,
  };
}

export function validateSeasonPricing(pricing: ISeasonPricing): string[] {
  const errors: string[] = [];
  if (pricing.mode !== "free" && pricing.amount <= 0) errors.push("A paid season must have a fee greater than zero");
  if (pricing.mode === "monthly" && pricing.billingCycleCount < 1) errors.push("Monthly billing requires at least one cycle");
  return errors;
}

export function canTransitionSeason(from: SeasonStatus, to: SeasonStatus): boolean {
  const transitions: Partial<Record<SeasonStatus, SeasonStatus[]>> = {
    draft: ["registration"], registration: ["proposal_submission", "draft"],
    proposal_submission: ["applications"], applications: ["building"],
    building: ["submission"], submission: ["judging"], judging: ["completed"],
    completed: ["archived"],
  };
  return (transitions[from] || []).includes(to);
}
