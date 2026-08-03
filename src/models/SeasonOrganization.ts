import { Schema, model, models } from "mongoose";

const SeasonOrganizationSchema = new Schema({
  seasonId: { type: Schema.Types.ObjectId, ref: "Season", required: true },
  orgId: { type: Schema.Types.ObjectId, ref: "Org", required: true },
  status: { type: String, enum: ["invited", "applied", "active", "declined", "withdrawn"], default: "invited" },
  focusAreas: { type: [String], default: [] },
  mentorCapacity: { type: Number, default: 0, min: 0 },
  participantCapacity: { type: Number, default: 0, min: 0 },
  joinedAt: Date,
  approvedBy: { type: Schema.Types.ObjectId, ref: "User" },
}, { timestamps: true });

SeasonOrganizationSchema.index({ seasonId: 1, orgId: 1 }, { unique: true });
SeasonOrganizationSchema.index({ orgId: 1, status: 1 });

const SeasonOrganization = models.SeasonOrganization || model("SeasonOrganization", SeasonOrganizationSchema);
export default SeasonOrganization;
