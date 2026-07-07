import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";

const VALID_ROLES = ["user", "sankalp_member", "sankalp_associate", "master_admin"];

function isAdmin(session: any) {
  return session && ["sankalp_associate", "master_admin"].includes(session.user?.role);
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!isAdmin(session)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q") || "";
    const role = searchParams.get("role") || "";
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);
    const skip = (page - 1) * limit;

    await dbConnect();

    const query: Record<string, unknown> = {};
    if (q) {
      query.$or = [
        { name: { $regex: q, $options: "i" } },
        { email: { $regex: q, $options: "i" } },
        { universityName: { $regex: q, $options: "i" } },
      ];
    }
    if (role) query.role = role;

    const [users, total] = await Promise.all([
      User.find(query)
        .select("name email avatar role universityName skills reputation createdAt")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      User.countDocuments(query),
    ]);

    return NextResponse.json({ users, total, page, pages: Math.ceil(total / limit) });
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

    const { userId, role } = await req.json();
    if (!userId || !role) {
      return NextResponse.json({ error: "userId and role are required" }, { status: 400 });
    }
    if (!VALID_ROLES.includes(role)) {
      return NextResponse.json(
        { error: `Invalid role. Must be one of: ${VALID_ROLES.join(", ")}` },
        { status: 400 }
      );
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
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
