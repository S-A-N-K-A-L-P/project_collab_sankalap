import { useEffect, useMemo, useState } from 'react';
import { proposalService } from '../services/proposalService';
import { Proposal } from '../types/proposal.types';
import { getOrCreateVoterId } from '../utils/voterId';

export function useMyProposals() {
  const [allProposals, setAllProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const myVoterId = useMemo(() => getOrCreateVoterId(), []);

  useEffect(() => {
    const load = async () => {
      console.log("START");

      try {
        const data = await proposalService.getAll({
          status: 'all',
          sort: 'newest',
          limit: 100,
        });

        console.log("DATA:", data);

      } catch (err) {
        console.error("ERROR:", err);

      } finally {
        console.log("FINALLY");
        setLoading(false);
      }
    };

    load();
  }, []);
  const myProposals = useMemo(
    () => allProposals.filter((proposal) => proposal.createdBy === myVoterId),
    [allProposals, myVoterId]
  );

  return { myProposals, loading, error, myVoterId };
}