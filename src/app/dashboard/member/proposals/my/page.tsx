'use client';

import Link from 'next/link';
import { useMyProposals } from '../hooks/useMyProposals';

export default function MyProposalsPage() {
  const { myProposals, loading, error } = useMyProposals();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">My Proposals</h1>
        <div className="flex items-center gap-3">
          <Link href="/dashboard/member/proposals/create" className="rounded bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary-hover">
            Create proposal
          </Link>
          <Link href="/dashboard/member/proposals" className="text-sm text-primary hover:underline">
            Back to all proposals
          </Link>
        </div>
      </div>

      {loading ? <p className="text-sm text-muted-foreground">Loading your proposals...</p> : null}
      {error ? <p className="rounded border border-error/30 bg-error/10 p-3 text-sm text-error">{error}</p> : null}

      {!loading && myProposals.length === 0 ? (
        <p className="rounded-lg border border-dashed border-border-strong bg-card p-6 text-sm text-muted-foreground">
          You have not created any proposals yet.
        </p>
      ) : null}

      <div className="space-y-3">
        {myProposals.map((proposal) => (
          <Link
            href={`/dashboard/member/proposals/${proposal._id}`}
            key={proposal._id}
            className="block rounded-lg border border-border bg-card p-4 shadow-sm hover:border-primary/40"
          >
            <h2 className="text-base font-semibold text-foreground">{proposal.question}</h2>
            <p className="text-xs text-muted-foreground">Status: {proposal.status} · Total votes: {proposal.totalVotes}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
