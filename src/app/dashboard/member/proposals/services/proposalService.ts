import { getOrCreateVoterId } from '../utils/voterId';
import { Proposal, ProposalSort, ProposalStatus } from '../types/proposal.types';

type ListResponse = {
  proposals: Proposal[];
  total: number;
  page: number;
  pages: number;
};

async function parseResponse<T>(res: Response): Promise<T> {
  const payload = await res.json();
  if (!res.ok) {
    throw new Error(payload?.error || 'Request failed');
  }
  return payload as T;
}

function requestHeaders() {
  return {
    'Content-Type': 'application/json',
    'x-voter-id': getOrCreateVoterId(),
  };
}

export const proposalService = {
  async getAll(params?: {
    sort?: ProposalSort;
    status?: ProposalStatus;
    page?: number;
    limit?: number;
  }): Promise<ListResponse> {
    const search = new URLSearchParams();
    if (params?.sort) search.set('sort', params.sort);
    if (params?.status) search.set('status', params.status);
    if (params?.page) search.set('page', String(params.page));
    if (params?.limit) search.set('limit', String(params.limit));

    const res = await fetch(`/api/proposals?${search.toString()}`, {
      headers: requestHeaders(),
      cache: 'no-store',
    });

    return parseResponse<ListResponse>(res);
  },

  async getById(id: string): Promise<Proposal> {
    const res = await fetch(`/api/proposals/${id}`, {
      headers: requestHeaders(),
      cache: 'no-store',
    });

    const payload = await parseResponse<{ proposal: Proposal }>(res);
    return payload.proposal;
  },

  async create(input: { question: string; options: string[] }): Promise<Proposal> {
    const res = await fetch('/api/proposals', {
      method: 'POST',
      headers: requestHeaders(),
      body: JSON.stringify(input),
    });

    const data = await parseResponse<{ proposal?: Proposal }>(res);
    console.log('API response:', data);
    console.log('Extracted proposalId:', data.proposal?._id);

    const proposalId = data.proposal?._id;
    if (!proposalId || typeof proposalId !== 'string') {
      throw new Error('Proposal created but proposal ID is missing in API response.');
    }

    return data.proposal as Proposal;
  },

  async update(id: string, input: { question?: string; options?: string[]; status?: string }): Promise<Proposal> {
    const res = await fetch(`/api/proposals/${id}`, {
      method: 'PATCH',
      headers: requestHeaders(),
      body: JSON.stringify(input),
    });

    const payload = await parseResponse<{ proposal: Proposal }>(res);
    return payload.proposal;
  },

  async remove(id: string): Promise<void> {
    const res = await fetch(`/api/proposals/${id}`, {
      method: 'DELETE',
      headers: requestHeaders(),
    });

    await parseResponse<{ success: boolean }>(res);
  },

  async vote(proposalId: string, optionIndex: number): Promise<Proposal> {
    console.log('Vote request payload:', { proposalId, optionIndex });
    const res = await fetch('/api/votes', {
      method: 'POST',
      headers: requestHeaders(),
      body: JSON.stringify({ proposalId, optionIndex }),
    });

    const payload = await parseResponse<{ proposal: Proposal }>(res);
    return payload.proposal;
  },
};
