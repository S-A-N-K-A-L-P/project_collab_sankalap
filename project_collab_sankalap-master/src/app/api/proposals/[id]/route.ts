import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { connectDB } from '@/lib/mongodb/connect';
import { getVoterId } from '@/lib/voting/identity';
import Proposal from '@/models/Proposal';
import Vote from '@/models/Vote';

interface RouteParams {
    params: Promise<{ id: string }>;
}

type SerializableProposal = {
    _id: unknown;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    [key: string]: unknown;
};

function serializeProposal(proposal: SerializableProposal, myVote: number | null = null) {
    const id =
        typeof proposal._id === 'string'
            ? proposal._id
            : proposal._id && typeof (proposal._id as { toString?: () => string }).toString === 'function'
                ? (proposal._id as { toString: () => string }).toString()
                : '';

    return {
        ...proposal,
        _id: id,
        createdAt: proposal.createdAt instanceof Date ? proposal.createdAt.toISOString() : proposal.createdAt,
        updatedAt: proposal.updatedAt instanceof Date ? proposal.updatedAt.toISOString() : proposal.updatedAt,
        myVote,
    };
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json({ error: 'Invalid proposal ID' }, { status: 400 });
        }

        await connectDB();

        const [proposal, voterId] = await Promise.all([Proposal.findById(id).lean(), getVoterId()]);

        if (!proposal) {
            return NextResponse.json({ error: 'Proposal not found' }, { status: 404 });
        }

        const vote = await Vote.findOne({ userId: voterId, proposalId: id }).lean();
        const myVote =
            vote && !Array.isArray(vote) && typeof (vote as any).optionIndex === 'number'
                ? (vote as any).optionIndex
                : null;

        return NextResponse.json({
            proposal: serializeProposal(proposal as unknown as SerializableProposal, myVote),
        });
    } catch (error) {
        console.error('[GET /api/proposals/[id]]', error);
        return NextResponse.json({ error: 'Failed to fetch proposal' }, { status: 500 });
    }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;
        const voterId = await getVoterId();

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json({ error: 'Invalid proposal ID' }, { status: 400 });
        }

        await connectDB();

        const proposal = await Proposal.findById(id);
        if (!proposal) {
            return NextResponse.json({ error: 'Proposal not found' }, { status: 404 });
        }

        if (proposal.createdBy !== voterId) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const body = await request.json();
        const { question, options, status } = body;

        if (question !== undefined) {
            const cleanQuestion = String(question).trim();
            if (!cleanQuestion) {
                return NextResponse.json({ error: 'Question cannot be empty' }, { status: 400 });
            }
            proposal.question = cleanQuestion;
        }

        if (options !== undefined) {
            if (!Array.isArray(options) || options.length < 2 || options.length > 10) {
                return NextResponse.json({ error: 'Options must contain between 2 and 10 items' }, { status: 400 });
            }

            const cleanOptions = options
                .map((o: unknown) => String(o).trim())
                .filter(Boolean)
                .map((text: string) => ({
                    text,
                    votes:
                        proposal.options.find((existing: { text: string; votes: number }) => existing.text === text)
                            ?.votes ?? 0,
                }));

            if (cleanOptions.length < 2) {
                return NextResponse.json({ error: 'At least 2 non-empty options required' }, { status: 400 });
            }

            if (new Set(cleanOptions.map((o) => o.text.toLowerCase())).size !== cleanOptions.length) {
                return NextResponse.json({ error: 'Duplicate options are not allowed' }, { status: 400 });
            }

            proposal.options = cleanOptions;
            proposal.totalVotes = cleanOptions.reduce((sum, opt) => sum + opt.votes, 0);
        }

        if (status !== undefined) {
            if (!['open', 'closed', 'archived'].includes(status)) {
                return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
            }
            proposal.status = status;
        }

        await proposal.save();

        return NextResponse.json({
            proposal: serializeProposal(proposal.toObject() as unknown as SerializableProposal),
        });
    } catch (error) {
        console.error('[PATCH /api/proposals/[id]]', error);
        return NextResponse.json({ error: 'Failed to update proposal' }, { status: 500 });
    }
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;
        const voterId = await getVoterId();

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json({ error: 'Invalid proposal ID' }, { status: 400 });
        }

        await connectDB();

        const proposal = await Proposal.findById(id);
        if (!proposal) {
            return NextResponse.json({ error: 'Proposal not found' }, { status: 404 });
        }

        if (proposal.createdBy !== voterId) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        await Promise.all([Proposal.findByIdAndDelete(id), Vote.deleteMany({ proposalId: id })]);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('[DELETE /api/proposals/[id]]', error);
        return NextResponse.json({ error: 'Failed to delete proposal' }, { status: 500 });
    }
}
