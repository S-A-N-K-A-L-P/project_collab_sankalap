import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import Org from "@/models/Org";

/** GET /api/orgs/my-requests — fetch requests submitted by the logged-in user */
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    await dbConnect();

    // Fetch orgs where createdBy is the current user
    const requests = await Org.find({ createdBy: userId })
      .select("name slug description category orgType charter roadmap tagline logo status createdAt review")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      requests: JSON.parse(JSON.stringify(requests)),
    });
  } catch (error: any) {
    console.error("[GET /api/orgs/my-requests]", error);
    return NextResponse.json(
      { message: error.message || "Failed to fetch requests" },
      { status: 500 }
    );
  }
}
