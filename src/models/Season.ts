import { Schema, model, models } from "mongoose";

const TimelineSchema = new Schema({
  registrationOpens: Date,
  registrationCloses: Date,
  proposalsOpen: Date,
  proposalsClose: Date,
  applicationsOpen: Date,
  applicationsClose: Date,
  buildingStarts: Date,
  submissionDeadline: Date,
  judgingStarts: Date,
  resultsAt: Date,
}, { _id: false });

const RubricCriterionSchema = new Schema({
  key: { type: String, required: true, trim: true },
  label: { type: String, required: true, trim: true },
  description: { type: String, default: "" },
  weight: { type: Number, required: true, min: 0, max: 100 },
}, { _id: false });

const SeasonSchema = new Schema({
  name: { type: String, required: true, trim: true, maxlength: 120 },
  slug: { type: String, required: true, unique: true, lowercase: true, trim: true, match: /^[a-z0-9-]{3,60}$/ },
  tagline: { type: String, default: "", maxlength: 180 },
  description: { type: String, required: true },
  status: {
    type: String,
    enum: ["draft", "registration", "proposal_submission", "applications", "building", "submission", "judging", "completed", "archived"],
    default: "draft",
  },
  bannerImage: { type: String, default: "" },
  themeColor: { type: String, default: "#4f46e5" },
  timeline: { type: TimelineSchema, default: () => ({}) },
  rules: {
    minTeamSize: { type: Number, default: 1, min: 1 },
    maxTeamSize: { type: Number, default: 6, min: 1 },
    maxApplicationsPerParticipant: { type: Number, default: 3, min: 1 },
    requireOrgApproval: { type: Boolean, default: true },
    requireSeasonApproval: { type: Boolean, default: false },
  },
  rubric: { type: [RubricCriterionSchema], default: [] },
  stats: {
    organizationCount: { type: Number, default: 0 },
    mentorCount: { type: Number, default: 0 },
    proposalCount: { type: Number, default: 0 },
    participantCount: { type: Number, default: 0 },
    projectCount: { type: Number, default: 0 },
  },
  createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
}, { timestamps: true });

SeasonSchema.index({ status: 1, "timeline.registrationOpens": -1 });

const Season = models.Season || model("Season", SeasonSchema);
export default Season;
