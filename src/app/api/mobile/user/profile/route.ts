export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { getMobileSession } from "@/lib/mobileAuth";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";

export async function GET(req: Request) {
  try {
    const session = getMobileSession(req);

    await dbConnect();
    const user = await User.findById(session.id).select("-password");

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error: any) {
    if (error.message?.includes("Missing") || error.message?.includes("jwt")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("[PROFILE_GET_ERROR]", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
