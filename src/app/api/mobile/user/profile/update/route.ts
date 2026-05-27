import { NextResponse } from "next/server";
import { getMobileSession } from "@/lib/mobileAuth";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";

export async function PATCH(req: Request) {
  try {
    const session = getMobileSession(req);

    const body = await req.json();
    const { bio, location, skills, github } = body;
    // Note: role is intentionally excluded — users cannot self-assign roles.
    // Role changes are admin-only via PATCH /api/mobile/admin/users.

    await dbConnect();

    const updatedUser = await User.findByIdAndUpdate(
      session.id,
      { $set: { bio, location, skills, github } },
      { new: true }
    ).select("-password");

    if (!updatedUser) return NextResponse.json({ error: "User not found" }, { status: 404 });

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (error: any) {
    if (error.message?.includes("Missing") || error.message?.includes("jwt")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
