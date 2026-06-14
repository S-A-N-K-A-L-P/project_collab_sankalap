import { NextResponse } from "next/server";
import { getMobileSession } from "@/lib/mobileAuth";
import dbConnect from "@/lib/mongodb";
import Vote from "@/models/Vote";

export async function GET(req: Request) {
    try {
        const session = getMobileSession(req);
        const voterId = session.id;

        await dbConnect();

        const votes = await Vote.find({ userId: voterId }).lean();

        return NextResponse.json({
            votes: votes.map((v) => ({
                _id: String((v as any)._id ?? ""),
                userId: (v as any).userId,
                proposalId: String((v as any).proposalId ?? ""),
                optionIndex: (v as any).optionIndex,
                value: (v as any).value,
                createdAt:
                    (v as any).createdAt instanceof Date
                        ? (v as any).createdAt.toISOString()
                        : (v as any).createdAt,
            })),
            voterId,
        });
    } catch (error: any) {
        if (error.message?.includes("Missing") || error.message?.includes("jwt")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        console.error("[GET /api/mobile/votes/my]", error);
        return NextResponse.json({ error: "Failed to fetch user votes" }, { status: 500 });
    }
}
