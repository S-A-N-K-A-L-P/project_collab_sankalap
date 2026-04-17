import { NextResponse } from "next/server";
import { getMobileSession } from "@/lib/mobileAuth";
import dbConnect from "@/lib/mongodb";
import Org from "@/models/Org";
import OrgMember from "@/models/OrgMember";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = getMobileSession(req);
    const userId = session.id;

    const { id: orgId } = await params;

    await dbConnect();

    const org = await Org.findById(orgId);
    if (!org) return NextResponse.json({ message: "Organization not found" }, { status: 404 });

    const existingMember = await OrgMember.findOne({ userId, orgId });
    if (existingMember) {
      return NextResponse.json({ message: "Already a member" }, { status: 400 });
    }

    const membership = await OrgMember.create({ userId, orgId, role: "member" });

    await Org.findByIdAndUpdate(orgId, { $push: { members: userId } });

    return NextResponse.json(membership, { status: 201 });
  } catch (error: any) {
    if (error.message?.includes("Missing") || error.message?.includes("jwt")) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ message: "Internal Error" }, { status: 500 });
  }
}
