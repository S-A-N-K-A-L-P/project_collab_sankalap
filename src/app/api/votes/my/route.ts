import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb/connect';
import { getVoterId } from '@/lib/voting/identity';
import Vote from '@/models/Vote';

export async function GET() {
    try {
        const voterId = await getVoterId();
        await connectDB();

        const votes = await Vote.find({ userId: voterId }).lean();

        return NextResponse.json({
            votes: votes.map((v) => ({
                _id: String((v as any)._id ?? ''),
                userId: (v as any).userId,
                proposalId: String((v as any).proposalId ?? ''),
                optionIndex: (v as any).optionIndex,
                createdAt:
                    (v as any).createdAt instanceof Date
                        ? (v as any).createdAt.toISOString()
                        : (v as any).createdAt,
            })),
            voterId,
        });
    } catch (error) {
        console.error('[GET /api/votes/my]', error);
        return NextResponse.json({ error: 'Failed to fetch user votes' }, { status: 500 });
    }
}
