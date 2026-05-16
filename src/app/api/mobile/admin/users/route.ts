import { NextResponse } from "next/server";
import { getMobileSession } from "@/lib/mobileAuth";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";

const VALID_ROLES = ["normal_user", "pixel_member", "project_lead", "pixel_head", "admin"];

// GET /api/mobile/admin/users?q=&role=
// Search all users — public (no auth required for search)
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const q    = searchParams.get("q")    || "";
    const role = searchParams.get("role") || "";

    await dbConnect();

    const query: Record<string, unknown> = {};
    if (q) {
      query.$or = [
        { name:   { $regex: q, $options: "i" } },
        { email:  { $regex: q, $options: "i" } },
        { skills: { $elemMatch: { $regex: q, $options: "i" } } },
        { universityName: { $regex: q, $options: "i" } },
      ];
    }
    if (role) query.role = role;

    const users = await User.find(query)
      .select("name email avatar role universityName skills reputation createdAt")
      .sort({ reputation: -1 })
      .limit(30)
      .lean();

    return NextResponse.json(users);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PATCH /api/mobile/admin/users
// Admin: assign role to a user
export async function PATCH(req: Request) {
  try {
    const session = getMobileSession(req);
    if (!["admin", "pixel_head"].includes(session.role)) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const { userId, role } = await req.json();
    if (!userId || !role) {
      return NextResponse.json({ error: "userId and role are required" }, { status: 400 });
    }
    if (!VALID_ROLES.includes(role)) {
      return NextResponse.json({ error: `Invalid role. Must be one of: ${VALID_ROLES.join(", ")}` }, { status: 400 });
    }

    await dbConnect();

    const updated = await User.findByIdAndUpdate(
      userId,
      { $set: { role } },
      { new: true }
    ).select("name email avatar role universityName reputation");

    if (!updated) return NextResponse.json({ error: "User not found" }, { status: 404 });

    return NextResponse.json(updated);
  } catch (error: any) {
    if (error.message?.includes("Missing") || error.message?.includes("jwt")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
