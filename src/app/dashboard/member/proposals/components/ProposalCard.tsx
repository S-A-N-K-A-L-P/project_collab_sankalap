import { useState } from 'react';
import { Proposal } from '../types/proposal.types';
import { VoteButtons } from './VoteButtons';
import { formatIsoDate } from '@/lib/hydration-safe-date';

type ProposalCardProps = {
  proposal: Proposal;
  canManage: boolean;
  onVote: (proposalId: string, optionIndex: number) => Promise<void>;
  onDelete: (proposalId: string) => Promise<void>;
};

export function ProposalCard({ proposal, canManage, onVote, onDelete }: ProposalCardProps) {
  const [busy, setBusy] = useState(false);

  const createdLabel = formatIsoDate(proposal.createdAt, 'Unknown date');

  return (
    <article className="rounded-lg border border-border bg-card p-4 shadow-sm">
      <div className="mb-3 flex items-start justify-between gap-2">
        <div>
          <h3 className="text-base font-semibold text-foreground">{proposal.question}</h3>
          <p className="text-xs text-muted-foreground">Created {createdLabel}</p>
        </div>
        <span className="rounded-full bg-muted-strong px-2 py-1 text-xs font-medium uppercase text-foreground">
          {proposal.status}
        </span>
      </div>

      <VoteButtons
        proposal={proposal}
        busy={busy}
        onVote={async (optionIndex) => {
          setBusy(true);
          try {
            await onVote(proposal._id, optionIndex);
          } finally {
            setBusy(false);
          }
        }}
      />

      <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
        <span>Total votes: {proposal.totalVotes}</span>
        {canManage ? (
          <button
            onClick={() => onDelete(proposal._id)}
            className="rounded border border-error/30 px-2 py-1 text-error hover:bg-error/10"
          >
            Delete
          </button>
        ) : null}
      </div>
    </article>
  );
}
