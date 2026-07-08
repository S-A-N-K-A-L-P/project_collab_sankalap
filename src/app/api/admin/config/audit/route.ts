import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import { PlatformConfigHistory } from "@/models/PlatformConfig";
import { isAdminRole } from "@/lib/roles";

/** GET /api/admin/config/audit — config change history (read: any admin role) */
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const role = (session.user as any).role;
    if (!isAdminRole(role)) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    await dbConnect();

    const { searchParams } = new URL(req.url);
    const limit = Math.min(100, parseInt(searchParams.get("limit") || "50"));

    const entries = await PlatformConfigHistory.find({})
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    return NextResponse.json({ entries: JSON.parse(JSON.stringify(entries)) });
  } catch (error: any) {
    console.error("[GET /api/admin/config/audit]", error);
    return NextResponse.json({ message: error.message || "Internal Error" }, { status: 500 });
  }
}
