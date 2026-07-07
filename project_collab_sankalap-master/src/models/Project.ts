import { Schema, model, models } from "mongoose";

const ReleaseSchema = new Schema(
  {
    version:    { type: String, required: true },          // e.g. "v1.0.0"
    notes:      { type: String, default: "" },              // markdown
    githubTag:  { type: String, default: "" },
    releasedAt: { type: Date,   default: Date.now },
    releasedBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { _id: false }
);

const ProjectSchema = new Schema(
  {
    /* ── Existing core fields ─────────────────────────────────── */
    proposalId:   { type: Schema.Types.ObjectId, ref: "Proposal", required: true },
    orgId:        { type: Schema.Types.ObjectId, ref: "Org",      required: true },
    title:        { type: String, required: true },
    description:  { type: String },
    status:       { type: String, enum: ["planning", "active", "completed", "archived"], default: "planning" },
    lead:         { type: Schema.Types.ObjectId, ref: "User", required: true },
    members:      [{ type: Schema.Types.ObjectId, ref: "User" }],
    verifiedBy:   { type: Schema.Types.ObjectId, ref: "User" },
    progress:     { type: Number, default: 0, min: 0, max: 100 },
    githubRepo:   { type: String },
    techStack:    { type: [String], default: [] },
    gitRepo:      { type: Schema.Types.ObjectId, ref: "GitRepo" },
    tags:         { type: [String], default: [] },

    /* ── Release artefacts (set during "mark complete") ───────── */
    completedAt:  { type: Date },
    completedBy:  { type: Schema.Types.ObjectId, ref: "User" },
    version:      { type: String,  default: "" },         // "v1.0.0"
    releaseNotes: { type: String,  default: "" },         // markdown
    coverImage:   { type: String,  default: "" },         // URL (external or future cloud upload)
    liveUrl:      { type: String,  default: "" },         // production deploy
    stagingUrl:   { type: String,  default: "" },
    demoVideoUrl: { type: String,  default: "" },
    apiDocsUrl:   { type: String,  default: "" },

    /* ── Showcase visibility ──────────────────────────────────── */
    showcase: {
      isPublic:       { type: Boolean, default: true },
      caseStudyOptIn: { type: Boolean, default: false },
      featured:       { type: Boolean, default: false },  // admin promote
    },

    /* ── Marketplace ──────────────────────────────────────────── */
    marketplace: {
      forSale:        { type: Boolean, default: false },
      licenseType:    { type: String, enum: ["one-time", "subscription", "open-source", "custom", ""], default: "" },
      priceINR:       { type: Number, default: 0 },
      contactEmail:   { type: String, default: "" },
      inquiriesCount: { type: Number, default: 0 },
    },

    /* ── Release history (additional versions after first ship) ─ */
    releases: { type: [ReleaseSchema], default: [] },

    /* ── Analytics ────────────────────────────────────────────── */
    views:         { type: Number, default: 0 },
    showcaseViews: { type: Number, default: 0 },
  },
  { timestamps: true }
);

ProjectSchema.index({ status: 1, "showcase.isPublic": 1, completedAt: -1 });
ProjectSchema.index({ "marketplace.forSale": 1, completedAt: -1 });

const Project = models.Project || model("Project", ProjectSchema);

export default Project;
