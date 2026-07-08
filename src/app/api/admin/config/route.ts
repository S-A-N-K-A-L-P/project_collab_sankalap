import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import { getOrSeedConfig } from "@/models/PlatformConfig";
import { isAdminRole, isMasterAdmin } from "@/lib/roles";

/** GET /api/admin/config — full config (read: any admin role; write is gated per-section) */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const role = (session.user as any).role;
    if (!isAdminRole(role)) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    await dbConnect();
    const cfg = await getOrSeedConfig();

    return NextResponse.json({
      config: JSON.parse(JSON.stringify(cfg)),
      canEdit: isMasterAdmin(role),
    });
  } catch (error: any) {
    console.error("[GET /api/admin/config]", error);
    return NextResponse.json({ message: error.message || "Internal Error" }, { status: 500 });
  }
}
