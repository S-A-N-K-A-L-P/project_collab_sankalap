'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ProposalForm } from '../components/ProposalForm';
import { proposalService } from '../services/proposalService';

export default function CreateProposalPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Create Proposal</h1>
        <Link href="/dashboard/member/proposals" className="text-sm text-blue-700 hover:underline">
          Back to proposals
        </Link>
      </div>

      {error ? <p className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}

      <ProposalForm
        submitting={submitting}
        onSubmit={async ({ question, options }) => {
          setSubmitting(true);
          setError(null);
          try {
            const created = await proposalService.create({ question, options });
            router.push(`/dashboard/member/proposals/${created._id}`);
          } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to create proposal');
          } finally {
            setSubmitting(false);
          }
        }}
      />
    </div>
  );
}
