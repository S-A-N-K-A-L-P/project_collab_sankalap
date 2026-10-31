import { Schema, model, models } from "mongoose";

const CommentSchema = new Schema(
    {
        proposalId: {
            type: Schema.Types.ObjectId,
            ref: "Proposal",
            required: true,
            index: true,
        },
        parentCommentId: {
            type: Schema.Types.ObjectId,
            ref: "Comment",
            default: null,
            index: true,
        },
        authorId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        authorName: {
            type: String,
            required: true,
            trim: true,
        },
        content: {
            type: String,
            required: true,
            trim: true,
        },
        voteCount: {
            type: Number,
            default: 0,
        },
        adminFeedback: {
            type: String,
            default: "",
            trim: true,
        },
        adminId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: false,
        },
    },
    {
        timestamps: true,
    }
);

CommentSchema.index({ proposalId: 1, createdAt: -1 });
CommentSchema.index({ parentCommentId: 1 });

const Comment = models.Comment || model("Comment", CommentSchema);

export default Comment;
