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
          <Link href="/dashboard/member/proposals/create" className="rounded bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700">
            Create proposal
          </Link>
          <Link href="/dashboard/member/proposals" className="text-sm text-blue-700 hover:underline">
            Back to all proposals
          </Link>
        </div>
      </div>

      {loading ? <p className="text-sm text-gray-600">Loading your proposals...</p> : null}
      {error ? <p className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}

      {!loading && myProposals.length === 0 ? (
        <p className="rounded-lg border border-dashed border-gray-300 bg-white p-6 text-sm text-gray-600">
          You have not created any proposals yet.
        </p>
      ) : null}

      <div className="space-y-3">
        {myProposals.map((proposal) => (
          <Link
            href={`/dashboard/member/proposals/${proposal._id}`}
            key={proposal._id}
            className="block rounded-lg border border-gray-200 bg-white p-4 shadow-sm hover:border-blue-300"
          >
            <h2 className="text-base font-semibold text-gray-900">{proposal.question}</h2>
            <p className="text-xs text-gray-600">Status: {proposal.status} · Total votes: {proposal.totalVotes}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
