import { Schema, model, models } from "mongoose";

const SeasonRoleAssignmentSchema = new Schema({
  seasonId: { type: Schema.Types.ObjectId, ref: "Season", required: true },
  orgId: { type: Schema.Types.ObjectId, ref: "Org" },
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  role: { type: String, enum: ["organizer", "org_admin", "mentor", "judge"], required: true },
  status: { type: String, enum: ["invited", "active", "declined", "removed"], default: "invited" },
  assignedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  acceptedAt: Date,
}, { timestamps: true });

SeasonRoleAssignmentSchema.index({ seasonId: 1, userId: 1, role: 1, orgId: 1 }, { unique: true });
SeasonRoleAssignmentSchema.index({ seasonId: 1, orgId: 1, role: 1 });

const SeasonRoleAssignment = models.SeasonRoleAssignment || model("SeasonRoleAssignment", SeasonRoleAssignmentSchema);
export default SeasonRoleAssignment;
