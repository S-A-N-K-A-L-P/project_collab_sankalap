import { Schema, model, models } from "mongoose";

const AnswerSchema = new Schema({ question: String, answer: String }, { _id: false });

const ProposalApplicationSchema = new Schema({
  seasonId: { type: Schema.Types.ObjectId, ref: "Season", required: true },
  proposalId: { type: Schema.Types.ObjectId, ref: "Proposal", required: true },
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  motivation: { type: String, required: true },
  skills: { type: [String], default: [] },
  availability: { type: String, default: "" },
  answers: { type: [AnswerSchema], default: [] },
  status: { type: String, enum: ["submitted", "shortlisted", "accepted", "rejected", "withdrawn"], default: "submitted" },
  reviewedBy: { type: Schema.Types.ObjectId, ref: "User" },
  reviewedAt: Date,
  reviewNote: { type: String, default: "" },
}, { timestamps: true });

ProposalApplicationSchema.index({ proposalId: 1, userId: 1 }, { unique: true });
ProposalApplicationSchema.index({ seasonId: 1, status: 1 });

const ProposalApplication = models.ProposalApplication || model("ProposalApplication", ProposalApplicationSchema);
export default ProposalApplication;
