export interface ProposalOption {
  text: string;
  votes: number;
}

export interface Proposal {
  _id: string;
  question: string;
  options: ProposalOption[];
  totalVotes: number;
  status: 'open' | 'closed' | 'archived';
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  myVote: number | null;
}

export type ProposalSort = 'trending' | 'newest' | 'oldest' | 'mostVoted';
export type ProposalStatus = 'all' | 'open' | 'closed' | 'archived';
