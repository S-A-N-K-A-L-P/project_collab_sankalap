export type CommentItem = {
    _id: string;
    proposalId: string;
    parentCommentId: string | null;
    authorId: string;
    authorName: string;
    content: string;
    voteCount: number;
    replyCount: number;
    hasVotedByCurrentUser: boolean;
    createdAt: string;
    updatedAt: string;
};

export type CommentNode = CommentItem & {
    replies: CommentNode[];
};

export type CommentsResponse = {
    comments?: CommentItem[];
    repliesByParent?: Record<string, CommentItem[]>;
};

export type UserLike = {
    id?: string;
    name?: string;
    email?: string;
};
