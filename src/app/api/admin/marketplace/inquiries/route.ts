import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import MarketplaceInquiry from "@/models/MarketplaceInquiry";

function isAdmin(s: any) {
  return s && ["sankalp_associate", "master_admin"].includes(s.user?.role);
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!isAdmin(session)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const inquiries = await MarketplaceInquiry.find()
      .populate("projectId", "title")
      .sort({ createdAt: -1 })
      .limit(200)
      .lean();

    return NextResponse.json(JSON.parse(JSON.stringify(inquiries)));
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
