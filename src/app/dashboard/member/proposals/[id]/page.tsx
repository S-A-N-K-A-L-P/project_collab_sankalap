'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Proposal } from '../types/proposal.types';
import { proposalService } from '../services/proposalService';
import { VoteButtons } from '../components/VoteButtons';

export default function ProposalDetailPage() {
  const params = useParams();
  const id = params?.id as string;

  const [proposal, setProposal] = useState<Proposal | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [voting, setVoting] = useState(false);

  useEffect(() => {
    if (!id) return;

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await proposalService.getById(id);
        setProposal(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load proposal');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Proposal Details</h1>
        <Link href="/dashboard/member/proposals" className="text-sm text-blue-700 hover:underline">
          Back to proposals
        </Link>
      </div>

      {loading ? <p className="text-sm text-gray-600">Loading proposal...</p> : null}
      {error ? <p className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}

      {proposal ? (
        <div className="space-y-2 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">{proposal.question}</h2>
          <p className="text-xs text-gray-500">Total votes: {proposal.totalVotes}</p>
          <VoteButtons
            proposal={proposal}
            busy={voting}
            onVote={async (optionIndex) => {
              setVoting(true);
              try {
                const updated = await proposalService.vote(proposal._id, optionIndex);
                setProposal(updated);
              } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to submit vote');
              } finally {
                setVoting(false);
              }
            }}
          />
        </div>
      ) : null}
    </div>
  );
}
