import { Schema, model, models } from "mongoose";

/**
 * Portfolio — one per user. Drives the public /portfolio/[handle] page.
 * Stored separately from User so the builder can autosave without touching
 * the core account document.
 */
const SectionSchema = new Schema(
  {
    id:      { type: String, required: true },
    type:    { type: String, required: true }, // hero|about|skills|projects|experience|education|custom|gallery|stats|quote|contact
    title:   { type: String, default: "" },
    enabled: { type: Boolean, default: true },
    order:   { type: Number, default: 0 },
    content: { type: Schema.Types.Mixed, default: {} }, // type-specific editable content
  },
  { _id: false }
);

const ExperienceSchema = new Schema(
  {
    role:    { type: String, default: "" },
    org:     { type: String, default: "" },
    start:   { type: String, default: "" },
    end:     { type: String, default: "" },
    summary: { type: String, default: "" },
  },
  { _id: false }
);

const LinkSchema = new Schema(
  {
    label: { type: String, default: "" },
    url:   { type: String, default: "" },
    icon:  { type: String, default: "link" }, // github|linkedin|twitter|mail|globe|link
  },
  { _id: false }
);

const PortfolioSchema = new Schema(
  {
    userId:      { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    isPublished: { type: Boolean, default: true },   // instant-live; user can flip private
    heavy3d:     { type: Boolean, default: false },  // user's "3D heavy render (three.js)" toggle
    themeId:     { type: String,  default: "aurora" },
    accent:      { type: String,  default: "" },
    accent2:     { type: String,  default: "" },   // customization override
    bgOverride:  { type: String,  default: "" },   // override 2D effect
    threeOverride: { type: String, default: "" },  // override 3D scene
    card:        { type: String,  default: "" },   // override card style
    sectionAnim: { type: String,  default: "rise" },        // per-section entrance animation
    projectCardStyle: { type: String, default: "glass" },    // project card design
    projectCardAnim:  { type: String, default: "rise" },     // project card entrance animation

    headline:    { type: String, default: "" },
    tagline:     { type: String, default: "" },
    aboutLong:   { type: String, default: "" },

    sections:    { type: [SectionSchema], default: [] },
    featuredProjectIds: [{ type: Schema.Types.ObjectId, ref: "Project" }],
    experience:  { type: [ExperienceSchema], default: [] },
    links:       { type: [LinkSchema], default: [] },

    seo: {
      title:       { type: String, default: "" },
      description: { type: String, default: "" },
    },

    // Snapshot of the publishable fields taken on "Republish". The public page
    // renders THIS, not the top-level draft. Null until first publish/migration.
    published:   { type: Schema.Types.Mixed, default: null },

    views:           { type: Number, default: 0 },
    lastPublishedAt: { type: Date },
  },
  { timestamps: true }
);

const Portfolio = models.Portfolio || model("Portfolio", PortfolioSchema);

export default Portfolio;
