import { Schema, model, models } from "mongoose";

const SeasonPaymentSchema = new Schema({
  seasonId: { type: Schema.Types.ObjectId, ref: "Season", required: true, index: true },
  enrollmentId: { type: Schema.Types.ObjectId, ref: "SeasonEnrollment", required: true, index: true },
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
  orgId: { type: Schema.Types.ObjectId, ref: "Org" },
  purpose: { type: String, enum: ["one_time", "monthly", "joining_fee"], required: true },
  cycleNumber: { type: Number, default: 1, min: 1 },
  amount: { type: Number, required: true, min: 1 },
  currency: { type: String, required: true, uppercase: true, trim: true },
  status: { type: String, enum: ["created", "paid", "failed", "refunded"], default: "created", index: true },
  razorpayOrderId: { type: String, required: true, unique: true, index: true },
  razorpayPaymentId: { type: String, sparse: true, unique: true },
  paidAt: Date,
  failureReason: { type: String, default: "" },
  metadata: { type: Schema.Types.Mixed, default: {} },
}, { timestamps: true });

SeasonPaymentSchema.index({ enrollmentId: 1, purpose: 1, cycleNumber: 1 }, { unique: true });

const SeasonPayment = models.SeasonPayment || model("SeasonPayment", SeasonPaymentSchema);
export default SeasonPayment;
