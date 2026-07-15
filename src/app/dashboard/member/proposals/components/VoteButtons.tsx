import { Proposal } from '../types/proposal.types';

type VoteButtonsProps = {
  proposal: Proposal;
  onVote: (optionIndex: number) => Promise<void>;
  busy: boolean;
};

export function VoteButtons({ proposal, onVote, busy }: VoteButtonsProps) {
  const hasVoted = proposal.myVote !== null;
  const total = Math.max(proposal.totalVotes, 0);

  return (
    <div className="space-y-2">
      {proposal.options.map((option, index) => {
        const percentage = total === 0 ? 0 : Math.round((option.votes / total) * 100);
        const selected = proposal.myVote === index;

        if (hasVoted) {
          return (
            <div key={`${proposal._id}-${index}`} className="relative overflow-hidden rounded-md border border-border bg-muted-bg p-2">
              <div
                className={`absolute inset-y-0 left-0 ${selected ? 'bg-success/20' : 'bg-info/10'}`}
                style={{ width: `${percentage}%` }}
              />
              <div className="relative flex items-center justify-between text-sm">
                <span className={selected ? 'font-semibold text-success' : 'text-foreground'}>{option.text}</span>
                <span className="text-xs text-muted-foreground">{option.votes} votes ({percentage}%)</span>
              </div>
            </div>
          );
        }

        return (
          <button
            key={`${proposal._id}-${index}`}
            onClick={() => onVote(index)}
            disabled={busy || proposal.status !== 'open'}
            className="w-full rounded-md border border-border-strong bg-card px-3 py-2 text-left text-sm hover:border-info hover:bg-info/10 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {busy ? 'Submitting vote...' : option.text}
          </button>
        );
      })}
    </div>
  );
}
