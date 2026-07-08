import { Schema, model, models } from "mongoose";

/**
 * OrgPortfolio — one per org. Drives the public /orgs/[slug] portfolio page
 * when the org has `portfolioEnabled: true`.
 *
 * Mirrors the Portfolio model structure but scoped to orgs with additional
 * org-specific section types (mission, team, projects_showcase, org_stats,
 * roadmap, sponsors, events, join_cta).
 */
const OrgPortfolioSchema = new Schema(
  {
    orgId:       { type: Schema.Types.ObjectId, ref: "Org", required: true, unique: true },
    isPublished: { type: Boolean, default: false },

    // Theme & visual config (reuses the same theme registry as user portfolios)
    themeId:       { type: String, default: "aurora" },
    accent:        { type: String, default: "" },
    accent2:       { type: String, default: "" },
    bgOverride:    { type: String, default: "" },
    threeOverride: { type: String, default: "" },
    card:          { type: String, default: "" },
    sectionAnim:   { type: String, default: "rise" },
    projectCardStyle: { type: String, default: "glass" },
    projectCardAnim:  { type: String, default: "rise" },

    // Sections (org-specific types supported: mission, team, projects_showcase,
    // org_stats, roadmap, sponsors, events, join_cta, plus all user types)
    sections: { type: Schema.Types.Mixed, default: [] },

    // SEO
    seo: {
      title:       { type: String, default: "" },
      description: { type: String, default: "" },
    },

    // Snapshot of the publishable fields taken on "Publish". The public page
    // renders THIS, not the draft. Null until first publish.
    published: { type: Schema.Types.Mixed, default: null },

    views:           { type: Number, default: 0 },
    lastPublishedAt: { type: Date },
  },
  { timestamps: true }
);

const OrgPortfolio = models.OrgPortfolio || model("OrgPortfolio", OrgPortfolioSchema);

export default OrgPortfolio;
