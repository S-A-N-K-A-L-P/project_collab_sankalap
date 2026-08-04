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

    // Organizations can keep the existing expressive portfolio or publish a
    // restrained, conventional company website from the same content source.
    mode: { type: String, enum: ["immersive", "enterprise"], default: "immersive" },
    enterpriseTemplate: { type: String, enum: ["corporate", "editorial"], default: "corporate" },
    navigationStyle: { type: String, enum: ["horizontal", "vertical"], default: "horizontal" },
    enterprisePageMode: { type: String, enum: ["single_page", "multi_page"], default: "single_page" },
    enterprisePages: { type: Schema.Types.Mixed, default: () => [
      { id: "home", label: "Home" }, { id: "about", label: "About" },
      { id: "work", label: "Work" }, { id: "contact", label: "Contact" },
    ] },
    enterpriseBrand: {
      surface: { type: String, default: "#f7f5ef" },
      text: { type: String, default: "#172033" },
      accent: { type: String, default: "#244a73" },
    },
    enterpriseFooter: {
      summary: { type: String, default: "" },
      copyright: { type: String, default: "" },
      showSocialLinks: { type: Boolean, default: true },
    },

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
