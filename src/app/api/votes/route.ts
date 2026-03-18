import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import dbConnect from "@/lib/mongodb";
import Proposal from "@/models/Proposal";
import Vote from "@/models/Vote";
import Activity from "@/models/Activity";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const { proposalId, value = 1 } = await req.json();
    const userId = (session.user as any).id;

    await dbConnect();

    // 1. Validate Proposal
    const proposal = await Proposal.findById(proposalId);
    if (!proposal) return NextResponse.json({ message: "Proposal not found" }, { status: 404 });

    // 2. Validate Time Window
    const now = new Date();
    if (now < proposal.startTime) return NextResponse.json({ message: "Voting hasn't started yet" }, { status: 400 });
    if (now > proposal.endTime) return NextResponse.json({ message: "Voting has closed" }, { status: 400 });

    // 3. Validate Vote Limit
    const existingVote = await Vote.findOne({ userId, proposalId });
    const currentVoteValue = existingVote ? existingVote.value : 0;
    
    // Check if new vote would exceed limit
    // In 'fixed' mode, value is usually 1. In 'flexible', it could be more.
    if (value > proposal.maxVotesPerUser) {
        return NextResponse.json({ message: `Max votes per user is ${proposal.maxVotesPerUser}` }, { status: 400 });
    }

    // 4. Update or Create Vote
    if (existingVote) {
        if (!proposal.allowVoteEdit && existingVote.value !== value) {
            return NextResponse.json({ message: "Vote editing is disabled for this protocol" }, { status: 400 });
        }
        existingVote.value = value;
        await existingVote.save();
    } else {
        await Vote.create({ userId, proposalId, value });
    }

    // 5. Recalculate Proposal Total Votes (Atomic update is better, but let's sync)
    // We fetch all votes for this proposal to be accurate, or use $inc
    const allVotes = await Vote.find({ proposalId });
    const totalVotes = allVotes.reduce((acc, v) => acc + v.value, 0);
    proposal.totalVotes = totalVotes;
    await proposal.save();

    // 6. Record Activity
    await Activity.create({
        actorId: userId,
        type: "VOTE",
        targetId: proposalId,
        targetType: "PROPOSAL",
        metadata: { value, title: proposal.title }
    });

    return NextResponse.json({ 
        message: "Vote recorded", 
        totalVotes,
        userVotes: value 
    });

  } catch (error: any) {
    console.error("VOTE_ERROR:", error);
    return NextResponse.json({ message: error.message || "Internal Server Error" }, { status: 500 });
  }
}

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const proposalId = searchParams.get("proposalId");
        const session = await getServerSession(authOptions);
        
        if (!proposalId) return NextResponse.json({ message: "proposalId required" }, { status: 400 });
        
        await dbConnect();
        const userId = session?.user ? (session.user as any).id : null;
        
        const vote = userId ? await Vote.findOne({ userId, proposalId }).lean() : null;
        const proposal = await Proposal.findById(proposalId).select("totalVotes maxVotesPerUser startTime endTime").lean();

        return NextResponse.json({
            userVotes: vote ? (vote as any).value : 0,
            totalVotes: proposal?.totalVotes || 0,
            maxVotes: proposal?.maxVotesPerUser || 1,
            isActive: proposal ? (new Date() >= proposal.startTime && new Date() <= proposal.endTime) : false
        });
    } catch (error) {
        return NextResponse.json({ message: "Internal Error" }, { status: 500 });
    }
}
