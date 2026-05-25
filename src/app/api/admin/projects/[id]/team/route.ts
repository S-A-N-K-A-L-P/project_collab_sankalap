import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import Project from "@/models/Project";

function isAdmin(s: any) {
  return s && ["admin", "pixel_head"].includes(s.user?.role);
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!isAdmin(session)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const { add, remove } = await req.json();

    if (!add?.length && !remove?.length) {
      return NextResponse.json({ error: "Provide add or remove arrays" }, { status: 400 });
    }

    await dbConnect();

    const ops: Record<string, unknown> = {};
    if (add?.length) ops.$addToSet = { members: { $each: add } };
    if (remove?.length) ops.$pull = { members: { $in: remove } };

    const updated = await Project.findByIdAndUpdate(id, ops, { new: true }).populate(
      "members",
      "name email avatar role universityName skills"
    );

    if (!updated) return NextResponse.json({ error: "Project not found" }, { status: 404 });

    return NextResponse.json(updated);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
