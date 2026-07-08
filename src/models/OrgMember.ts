import mongoose, { Schema, model, models } from "mongoose";

const OrgMemberSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    orgId: {
      type: Schema.Types.ObjectId,
      ref: "Org",
      required: true,
    },
    /**
     * Org-level role ladder (hierarchy.md §3):
     *   observer    — read-only (Research orgs)
     *   member      — participate: vote, comment, join projects, contribute
     *   contributor — verified contributor; can self-assign good-first-issues
     *   lead        — lead projects, assign tasks, verify contributions
     *   admin       — manage org settings, members, approve proposals
     *   owner       — founding org admin; can transfer ownership
     */
    role: {
      type: String,
      enum: ["observer", "member", "contributor", "lead", "admin", "owner"],
      default: "member",
    },
    /**
     * Membership status:
     *   active   — confirmed member
     *   pending  — join request awaiting approval (private/premium orgs)
     *   suspended — suspended by org admin
     */
    status: {
      type: String,
      enum: ["active", "pending", "suspended"],
      default: "active",
    },
    xpInOrg: {
      type: Number,
      default: 0,
    },
    joinedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

OrgMemberSchema.index({ userId: 1, orgId: 1 }, { unique: true });
OrgMemberSchema.index({ orgId: 1, role: 1 });
OrgMemberSchema.index({ orgId: 1, status: 1 });

const OrgMember = models.OrgMember || model("OrgMember", OrgMemberSchema);

export default OrgMember;
