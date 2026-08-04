import { Schema, model, models } from "mongoose";

const SeasonEnrollmentSchema = new Schema({
  seasonId: { type: Schema.Types.ObjectId, ref: "Season", required: true },
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  orgId: { type: Schema.Types.ObjectId, ref: "Org" },
  proposalId: { type: Schema.Types.ObjectId, ref: "Proposal" },
  status: {
    type: String,
    enum: ["draft", "applied", "shortlisted", "accepted", "payment_pending", "active", "suspended", "completed", "withdrawn", "rejected"],
    default: "draft",
  },
  paymentStatus: { type: String, enum: ["not_required", "pending", "paid", "past_due", "waived", "refunded"], default: "not_required" },
  accessStatus: { type: String, enum: ["pending", "active", "grace", "suspended", "expired"], default: "pending" },
  pricingSnapshot: { type: Schema.Types.Mixed, default: null },
  paidCycleCount: { type: Number, default: 0, min: 0 },
  nextPaymentDueAt: Date,
  acceptedAt: Date,
  paymentDueAt: Date,
  joinedAt: Date,
  completedAt: Date,
}, { timestamps: true });

SeasonEnrollmentSchema.index({ seasonId: 1, userId: 1 }, { unique: true });
SeasonEnrollmentSchema.index({ seasonId: 1, status: 1, paymentStatus: 1 });

const SeasonEnrollment = models.SeasonEnrollment || model("SeasonEnrollment", SeasonEnrollmentSchema);
export default SeasonEnrollment;
