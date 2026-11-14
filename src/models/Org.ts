import mongoose, { Schema, model, models } from "mongoose";

const GalleryItemSchema = new Schema(
  {
    url:       { type: String, default: "" },
    caption:   { type: String, default: "" },
    publicId:  { type: String, default: "" },
  },
  { _id: false }
);

const SocialLinksSchema = new Schema(
  {
    github:   { type: String, default: "" },
    twitter:  { type: String, default: "" },
    linkedin: { type: String, default: "" },
    discord:  { type: String, default: "" },
  },
  { _id: false }
);

const ReviewSchema = new Schema(
  {
    reviewedBy: { type: Schema.Types.ObjectId, ref: "User" },
    reviewedAt: { type: Date },
    decision:   { type: String, enum: ["approved", "rejected", "changes_requested"] },
    reason:     { type: String, default: "" },
  },
  { _id: false }
);

const TrustScoreSchema = new Schema(
  {
    completionRate:    { type: Number, default: 0 },   // 0–100 %
    avgResponseDays:   { type: Number, default: 0 },
    founderVerified:   { type: Boolean, default: false },
    kycVerified:       { type: Boolean, default: false },
    lastCalculated:    { type: Date },
  },
  { _id: false }
);

const OrgStatsSchema = new Schema(
  {
    memberCount:             { type: Number, default: 0 },
    projectCount:            { type: Number, default: 0 },
    completedProjectCount:   { type: Number, default: 0 },
    totalXP:                 { type: Number, default: 0 },
  },
  { _id: false }
);

/**
 * Org Node — the org admin's PC that serves this org's console through a Cloudflare tunnel
 * (Syncro.Desktop docs/org-server/gitupgrades.md §17.1). The whole subdocument is select:false: existing routes
 * return org documents to anyone, and the host's PC name, OS and app version must not leak through them.
 * Inside it, secretEnc and pairing.codeHash are select:false too. Load with .select("+node") (secrets stay out),
 * "+node +node.secretEnc", or explicit "node.<field>" paths. Never .select("node"): it projects {node: 1} and
 * reads both secrets.
 */
const OrgNodeSchema = new Schema(
  {
    nodeId:        { type: String },
    nodeName:      { type: String, default: "" },
    secretEnc:     { type: String, select: false },          // AES-256-GCM(nodeSecret) with NODE_SECRET_KEY
    pairedBy:      { type: Schema.Types.ObjectId, ref: "User" },
    pairedAt:      { type: Date },
    url:           { type: String, default: null },           // last attested URL; a hint, not proof of being online
    tunnelKind:    { type: String, enum: ["quick", "named"] },
    features:      { type: [String], default: [] },
    appVersion:    { type: String, default: "" },
    os:            { type: String, default: "" },
    lastOnlineAt:  { type: Date, default: null },
    lastOfflineAt: { type: Date, default: null },
    pairing: {
      type: new Schema(
        {
          codeHash:  { type: String, select: false },
          createdBy: { type: Schema.Types.ObjectId, ref: "User" },
          expiresAt: { type: Date },
        },
        { _id: false }
      ),
      default: null,
    },
  },
  { _id: false }
);

// Embedded portfolio config (mirrors Portfolio model shape)
const OrgPortfolioConfigSchema = new Schema(
  {
    themeId:      { type: String, default: "aurora" },
    accent:       { type: String, default: "" },
    accent2:      { type: String, default: "" },
    bgOverride:   { type: String, default: "" },
    threeOverride:{ type: String, default: "" },
    card:         { type: String, default: "" },
    sectionAnim:  { type: String, default: "rise" },
    sections:     { type: Schema.Types.Mixed, default: [] },
  },
  { _id: false }
);

const OrgSchema = new Schema(
  {
    /* ── Existing core fields ─────────────────────────────────── */
    name: {
      type: String,
      required: [true, "Organization name is required"],
      trim: true,
    },
    slug: {
      type: String,
      required: [true, "Slug is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Description is required"],
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    admins: [{ type: Schema.Types.ObjectId, ref: "User" }],
    members: [{ type: Schema.Types.ObjectId, ref: "User" }],
    rules: {
      maxVotesPerUser:     { type: Number, default: 1 },
      voteDuration:        { type: Number, default: 7 }, // days
      requireVerification: { type: Boolean, default: true },
      allowVoteEdit:       { type: Boolean, default: false },
    },
    visibility: {
      type: String,
      enum: ["public", "private"],
      default: "public",
    },
    // Legacy avatar/banner (kept for backward compat; logo/bannerImage preferred)
    avatar: { type: String, default: "" },
    banner: { type: String, default: "" },

    /* ── Lifecycle ────────────────────────────────────────────── */
    status: {
      type: String,
      enum: ["requested", "in_review", "approved", "active", "suspended", "archived", "rejected"],
      default: "requested",
    },
    isHost: { type: Boolean, default: false },  // S.A.N.K.A.L.P. host org

    /* ── Classification ──────────────────────────────────────── */
    orgType: {
      type: String,
      enum: ["free", "standard", "premium", "research", "invite_only"],
      default: "free",
    },
    category: {
      type: String,
      enum: ["community", "academic", "company", "open_source"],
      default: "community",
    },

    /* ── Content (for launch request + public page) ───────────── */
    charter:  { type: String, default: "" },   // mission statement / why this org exists
    missionVideoId: { type: String, trim: true },
    roadmap:  { type: String, default: "" },   // initial roadmap (markdown)
    tagline:  { type: String, default: "" },
    website:  { type: String, default: "" },
    email:    { type: String, default: "" },
    socialLinks: { type: SocialLinksSchema, default: () => ({}) },

    /* ── Branding (Cloudinary-powered) ───────────────────────── */
    logo:        { type: String, default: "" },   // Cloudinary URL
    bannerImage: { type: String, default: "" },   // Cloudinary hero banner URL
    themeColor:  { type: String, default: "#6366f1" },
    gallery:     { type: [GalleryItemSchema], default: [] },

    /* ── Portfolio (reuses portfolio system) ─────────────────── */
    portfolioEnabled: { type: Boolean, default: false },
    portfolio:        { type: OrgPortfolioConfigSchema, default: () => ({}) },

    /* ── Configuration (from hierarchy.md) ───────────────────── */
    membershipFee:         { type: Number, default: 0 },      // ₹0 = free
    maxConcurrentProjects: { type: Number, default: 10 },     // config §2.2
    maxTeamSize:           { type: Number, default: 8 },      // config §2.2
    votingRightsRule: {
      type: String,
      enum: ["all_members", "leads_and_above", "admins_only"],
      default: "all_members",
    },

    /* ── Ownership & review tracking ─────────────────────────── */
    ownerId: { type: Schema.Types.ObjectId, ref: "User" },
    review:  { type: ReviewSchema, default: () => ({}) },

    /* ── Cached aggregates ───────────────────────────────────── */
    stats:      { type: OrgStatsSchema,    default: () => ({}) },
    trustScore: { type: TrustScoreSchema,  default: () => ({}) },

    /* ── Org Node (live work on the admin's PC) ───────────────── */
    node: { type: OrgNodeSchema, default: null, select: false },
  },
  {
    timestamps: true,
  }
);

// Indexes
OrgSchema.index({ status: 1 });
OrgSchema.index({ ownerId: 1 });
OrgSchema.index({ category: 1, status: 1 });
OrgSchema.index({ "stats.memberCount": -1 });
OrgSchema.index({ "node.pairing.codeHash": 1 }, { sparse: true });

const Org = models.Org || model("Org", OrgSchema);

export default Org;
