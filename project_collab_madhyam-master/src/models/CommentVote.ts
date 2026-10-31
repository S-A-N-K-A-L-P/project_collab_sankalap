import { Schema, model, models } from "mongoose";

const CommentVoteSchema = new Schema(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        commentId: {
            type: Schema.Types.ObjectId,
            ref: "Comment",
            required: true,
            index: true,
        },
    },
    {
        timestamps: true,
    }
);

CommentVoteSchema.index({ userId: 1, commentId: 1 }, { unique: true });
CommentVoteSchema.index({ commentId: 1 });

const CommentVote = models.CommentVote || model("CommentVote", CommentVoteSchema);

export default CommentVote;