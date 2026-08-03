import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Org from "@/models/Org";
import SeasonOrganization from "@/models/SeasonOrganization";
import "@/models/Season";

export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    await dbConnect();
    const org = await Org.findOne({ slug, status: "active" }).select("_id").lean();
    if (!org) return NextResponse.json({ message: "Organization not found" }, { status: 404 });
    const participation = await SeasonOrganization.find({ orgId: (org as any)._id, status: "active" })
      .populate("seasonId")
      .sort({ joinedAt: -1, createdAt: -1 })
      .lean();
    return NextResponse.json({ seasons: JSON.parse(JSON.stringify(participation)) });
  } catch (error) {
    console.error("[GET /api/orgs/[slug]/seasons]", error);
    return NextResponse.json({ message: "Unable to load organization seasons" }, { status: 500 });
  }
}
