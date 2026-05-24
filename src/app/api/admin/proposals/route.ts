import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import Proposal from "@/models/Proposal";

function isAdmin(session: any) {
  return session && ["admin", "pixel_head"].includes(session.user?.role);
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!isAdmin(session)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const stage = searchParams.get("stage");
    const type = searchParams.get("type");
    const search = searchParams.get("search");
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);
    const skip = (page - 1) * limit;

    await dbConnect();

    const query: Record<string, unknown> = {};
    if (status) query.status = status;
    if (stage) query.stage = stage;
    if (type) query.type = type;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    const [proposals, total] = await Promise.all([
      Proposal.find(query)
        .populate("createdBy", "name avatar role")
        .populate("projectLead", "name avatar role")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Proposal.countDocuments(query),
    ]);

    return NextResponse.json({ proposals, total, page, pages: Math.ceil(total / limit) });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!isAdmin(session)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id, status, stage, projectLead } = await req.json();
    if (!id) return NextResponse.json({ error: "Proposal ID required" }, { status: 400 });

    await dbConnect();

    const updates: Record<string, unknown> = {};
    if (status) updates.status = status;
    if (stage) updates.stage = stage;
    if (projectLead !== undefined) updates.projectLead = projectLead || null;

    const updated = await Proposal.findByIdAndUpdate(id, { $set: updates }, { new: true })
      .populate("createdBy", "name avatar role")
      .populate("projectLead", "name avatar role");

    if (!updated) return NextResponse.json({ error: "Proposal not found" }, { status: 404 });

    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
