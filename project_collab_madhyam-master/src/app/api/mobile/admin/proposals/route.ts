import { NextResponse } from "next/server";
import { getMobileSession } from "@/lib/mobileAuth";
import dbConnect from "@/lib/mongodb";
import Proposal from "@/models/Proposal";
import Activity from "@/models/Activity";

// GET /api/mobile/admin/proposals
// Admin: list all proposals with optional filters
export async function GET(req: Request) {
  try {
    const session = getMobileSession(req);
    if (!["sankalp_associate", "master_admin"].includes(session.role)) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const stage  = searchParams.get("stage");
    const type   = searchParams.get("type");
    const search = searchParams.get("search");
    const page   = parseInt(searchParams.get("page")  || "1",   10);
    const limit  = parseInt(searchParams.get("limit") || "100", 10);
    const skip   = (page - 1) * limit;

    await dbConnect();

    const query: Record<string, unknown> = {};
    if (status) query.status = status;
    if (stage)  query.stage  = stage;
    if (type)   query.type   = type;
    if (search) {
      query.$or = [
        { title:       { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    const [proposals, total] = await Promise.all([
      Proposal.find(query)
        .populate("createdBy",   "name avatar role")
        .populate("projectLead", "name avatar role")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Proposal.countDocuments(query),
    ]);

    return NextResponse.json({ proposals, total, page, pages: Math.ceil(total / limit) });
  } catch (error: any) {
    if (error.message?.includes("Missing") || error.message?.includes("jwt")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PATCH /api/mobile/admin/proposals
// Admin: update proposal status, stage, projectLead
export async function PATCH(req: Request) {
  try {
    const session = getMobileSession(req);
    if (!["sankalp_associate", "master_admin"].includes(session.role)) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const { id, status, stage, projectLead } = await req.json();
    if (!id) return NextResponse.json({ error: "Proposal ID required" }, { status: 400 });

    await dbConnect();

    const updates: Record<string, unknown> = {};
    if (status) updates.status = status;
    if (stage)  updates.stage  = stage;
    if (projectLead !== undefined) updates.projectLead = projectLead || null;

    const updated = await Proposal.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true }
    )
      .populate("createdBy",   "name avatar role")
      .populate("projectLead", "name avatar role");

    if (!updated) return NextResponse.json({ error: "Proposal not found" }, { status: 404 });

    await Activity.create({
      actorId:    session.id,
      type:       "ADMIN_UPDATE",
      targetId:   id,
      targetType: "PROPOSAL",
      metadata:   { status, stage, projectLead },
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    if (error.message?.includes("Missing") || error.message?.includes("jwt")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
