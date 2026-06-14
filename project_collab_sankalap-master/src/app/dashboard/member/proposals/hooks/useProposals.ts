import { useCallback, useEffect, useState } from 'react';
import { proposalService } from '../services/proposalService';
import { Proposal, ProposalSort, ProposalStatus } from '../types/proposal.types';

export function useProposals(sort: ProposalSort, status: ProposalStatus) {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await proposalService.getAll({ sort, status, limit: 50 });
      setProposals(data.proposals);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load proposals');
    } finally {
      setLoading(false);
    }
  }, [sort, status]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return {
    proposals,
    setProposals,
    loading,
    error,
    refresh,
  };
}
