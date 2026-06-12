import { Schema, model, models } from "mongoose";

/**
 * ProjectDoc — documentation attached to a completed project's showcase entry.
 * Supports three formats: inline markdown, uploaded file (Cloudinary URL),
 * or an external link (Notion, Google Docs, GitHub README).
 */
const ProjectDocSchema = new Schema(
  {
    projectId: { type: Schema.Types.ObjectId, ref: "Project", required: true, index: true },
    kind: {
      type: String,
      enum: ["business", "how-to-use", "technical", "api", "other"],
      required: true,
    },
    title:       { type: String, required: true },
    format:      { type: String, enum: ["markdown", "pdf", "external-url"], required: true },
    contentMd:   { type: String, default: "" },   // when format=markdown
    fileUrl:     { type: String, default: "" },   // when format=pdf (Cloudinary later)
    externalUrl: { type: String, default: "" },   // when format=external-url
    uploadedBy:  { type: Schema.Types.ObjectId, ref: "User" },
    version:     { type: String, default: "" },   // ties to project release
  },
  { timestamps: true }
);

const ProjectDoc = models.ProjectDoc || model("ProjectDoc", ProjectDocSchema);

export default ProjectDoc;
