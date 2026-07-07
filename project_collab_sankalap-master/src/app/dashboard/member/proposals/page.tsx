'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { ProposalList } from './components/ProposalList';
import { useProposals } from './hooks/useProposals';
import { proposalService } from './services/proposalService';
import { ProposalSort, ProposalStatus } from './types/proposal.types';
import { getOrCreateVoterId } from './utils/voterId';

export default function ProposalsPage() {
  const [sort, setSort] = useState<ProposalSort>('trending');
  const [status, setStatus] = useState<ProposalStatus>('open');
  const { proposals, setProposals, loading, error, refresh } = useProposals(sort, status);

  const myVoterId = useMemo(() => getOrCreateVoterId(), []);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-xl font-bold">Community Voting</h1>
          <p className="text-sm text-gray-600">Browse proposals and vote once per proposal.</p>
        </div>

        <div className="flex gap-2">
          <Link href="/dashboard/member/proposals/my" className="rounded border border-gray-300 px-3 py-2 text-sm hover:bg-gray-50">
            My proposals
          </Link>
          <Link href="/dashboard/member/proposals/create" className="rounded bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700">
            Create proposal
          </Link>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <select
          value={status}
          onChange={(event) => setStatus(event.target.value as ProposalStatus)}
          className="rounded border border-gray-300 px-3 py-2 text-sm"
        >
          <option value="all">All</option>
          <option value="open">Open</option>
          <option value="closed">Closed</option>
          <option value="archived">Archived</option>
        </select>

        <select
          value={sort}
          onChange={(event) => setSort(event.target.value as ProposalSort)}
          className="rounded border border-gray-300 px-3 py-2 text-sm"
        >
          <option value="trending">Trending</option>
          <option value="newest">Newest</option>
          <option value="oldest">Oldest</option>
          <option value="mostVoted">Most voted</option>
        </select>
      </div>

      {error ? <p className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}
      {loading ? <p className="text-sm text-gray-600">Loading proposals...</p> : null}

      {!loading ? (
        <ProposalList
          proposals={proposals}
          myVoterId={myVoterId}
          onVote={async (proposalId, optionIndex) => {
            const updated = await proposalService.vote(proposalId, optionIndex);
            setProposals((prev) => prev.map((item) => (item._id === updated._id ? updated : item)));
          }}
          onDelete={async (proposalId) => {
            await proposalService.remove(proposalId);
            await refresh();
          }}
        />
      ) : null}
    </div>
  );
}
