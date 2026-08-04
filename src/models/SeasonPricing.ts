import { Schema, model, models } from "mongoose";

const SeasonPricingSchema = new Schema({
  seasonId: { type: Schema.Types.ObjectId, ref: "Season", required: true, unique: true },
  mode: { type: String, enum: ["free", "one_time", "monthly"], default: "free" },
  payerType: { type: String, enum: ["participant", "organization", "either"], default: "participant" },
  currency: { type: String, default: "INR", uppercase: true, trim: true },
  amount: { type: Number, default: 0, min: 0 },
  joiningFee: { type: Number, default: 0, min: 0 },
  billingCycleCount: { type: Number, default: 1, min: 1, max: 24 },
  trialDays: { type: Number, default: 0, min: 0, max: 90 },
  gracePeriodDays: { type: Number, default: 5, min: 0, max: 30 },
  paymentTiming: { type: String, enum: ["before_application", "after_acceptance"], default: "after_acceptance" },
  taxMode: { type: String, enum: ["inclusive", "exclusive"], default: "inclusive" },
  refundPolicy: { type: String, enum: ["none", "before_building", "manual_review"], default: "manual_review" },
  displayPublicly: { type: Boolean, default: true },
  scholarshipsEnabled: { type: Boolean, default: false },
  couponsEnabled: { type: Boolean, default: false },
  razorpayPlanId: { type: String, default: "" },
  paymentsEnabled: { type: Boolean, default: false },
  configuredBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
}, { timestamps: true });

const SeasonPricing = models.SeasonPricing || model("SeasonPricing", SeasonPricingSchema);
export default SeasonPricing;
