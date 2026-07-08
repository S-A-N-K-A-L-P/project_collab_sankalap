import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import Org from "@/models/Org";
import OrgMember from "@/models/OrgMember";
import User from "@/models/User";
import { isPlatformReviewer } from "@/lib/roles";

/** GET /api/admin/org-requests — list org requests for review */
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const platformRole = (session.user as any).role;
    if (!isPlatformReviewer(platformRole)) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    await dbConnect();

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") || "requested";
    const page   = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit  = Math.min(50, parseInt(searchParams.get("limit") || "20"));

    const filter: any = {};
    if (status !== "all") {
      filter.status = status === "pending"
        ? { $in: ["requested", "in_review"] }
        : status;
    }

    const [requests, total] = await Promise.all([
      Org.find(filter)
        .populate("ownerId",   "name avatar email handle")
        .populate("createdBy", "name avatar email handle")
        .select("name slug description category orgType charter roadmap tagline logo status createdAt review")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Org.countDocuments(filter),
    ]);

    return NextResponse.json({
      requests: JSON.parse(JSON.stringify(requests)),
      total,
      page,
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("[GET /api/admin/org-requests]", error);
    return NextResponse.json({ message: "Internal Error" }, { status: 500 });
  }
}
