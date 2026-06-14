import { Schema, model, models } from "mongoose";

/**
 * MarketplaceInquiry — a potential buyer contacts the project owner.
 * Payments are handled off-platform; this just routes the message.
 */
const MarketplaceInquirySchema = new Schema(
  {
    projectId:  { type: Schema.Types.ObjectId, ref: "Project", required: true, index: true },
    buyerName:  { type: String, required: true },
    buyerEmail: { type: String, required: true, lowercase: true, trim: true },
    buyerOrg:   { type: String, default: "" },
    message:    { type: String, required: true },
    status:     { type: String, enum: ["new", "responded", "closed"], default: "new" },
  },
  { timestamps: true }
);

const MarketplaceInquiry =
  models.MarketplaceInquiry || model("MarketplaceInquiry", MarketplaceInquirySchema);

export default MarketplaceInquiry;
