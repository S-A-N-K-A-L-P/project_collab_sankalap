import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Proposal from "@/models/Proposal";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await dbConnect();

    const proposals = await Proposal.find({ createdBy: id })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json(proposals);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
