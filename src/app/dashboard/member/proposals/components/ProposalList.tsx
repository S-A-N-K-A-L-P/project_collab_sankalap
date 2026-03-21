import { Proposal } from '../types/proposal.types';
import { ProposalCard } from './ProposalCard';

type ProposalListProps = {
  proposals: Proposal[];
  myVoterId: string;
  onVote: (proposalId: string, optionIndex: number) => Promise<void>;
  onDelete: (proposalId: string) => Promise<void>;
};

export function ProposalList({ proposals, myVoterId, onVote, onDelete }: ProposalListProps) {
  if (proposals.length === 0) {
    return <p className="rounded-lg border border-dashed border-gray-300 bg-white p-6 text-sm text-gray-600">No proposals found.</p>;
  }

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      {proposals.map((proposal) => (
        <ProposalCard
          key={proposal._id}
          proposal={proposal}
          canManage={proposal.createdBy === myVoterId}
          onVote={onVote}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
