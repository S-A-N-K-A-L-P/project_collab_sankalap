import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import Project from "@/models/Project";

function isAdmin(s: any) {
  return s && ["admin", "pixel_head"].includes(s.user?.role);
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!isAdmin(session)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const search = searchParams.get("search");
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);
    const skip = (page - 1) * limit;

    await dbConnect();

    const query: Record<string, unknown> = {};
    if (status) query.status = status;
    if (search) query.title = { $regex: search, $options: "i" };

    const [projects, total] = await Promise.all([
      Project.find(query)
        .populate("lead", "name email avatar role")
        .populate("orgId", "name slug")
        .populate("proposalId", "title status totalVotes")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Project.countDocuments(query),
    ]);

    return NextResponse.json({ projects, total, page, pages: Math.ceil(total / limit) });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
