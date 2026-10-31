import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await dbConnect();

    const user = await User.findById(id).select("-password -email").lean();
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
      // Logic for updating user profile (bio, skills, etc.)
      const { id } = await params;
      const data = await req.json();
      await dbConnect();
      
      const updatedUser = await User.findByIdAndUpdate(id, data, { new: true }).select("-password");
      return NextResponse.json(updatedUser);
  } catch (error: any) {
      return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
