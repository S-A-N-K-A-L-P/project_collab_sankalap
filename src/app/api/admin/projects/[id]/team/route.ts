import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import Project from "@/models/Project";
import ActivityLog from "@/models/ActivityLog";
import { applyRosterChanges, validateRosterChanges, RosterMemberUpdate } from "@/lib/teamRoster";

function isAdmin(s: any) {
  return s && ["sankalp_associate", "master_admin"].includes(s.user?.role);
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!isAdmin(session)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const { add, remove, memberUpdates } = (await req.json()) as {
      add?: string[]; remove?: string[]; memberUpdates?: RosterMemberUpdate[];
    };

    if (!add?.length && !remove?.length && !memberUpdates?.length) {
      return NextResponse.json({ error: "Provide add, remove or memberUpdates" }, { status: 400 });
    }
    const invalid = validateRosterChanges({ add, remove, memberUpdates });
    if (invalid) return NextResponse.json({ error: invalid }, { status: 400 });

    await dbConnect();

    const project = await Project.findById(id);
    if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });

    applyRosterChanges(project, { add, remove, memberUpdates });
    await project.save();

    await ActivityLog.create({
      projectId: id,
      userId: (session?.user as any)?.id || "",
      userName: session?.user?.email || session?.user?.name || "",
      action: "Updated project team roster & file ownership scopes (admin)",
      metadata: { added: add?.length || 0, removed: remove?.length || 0, updatedRoles: memberUpdates?.length || 0 },
    });

    const updated = await Project.findById(id).populate("members", "name email avatar role universityName skills");
    return NextResponse.json(updated);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
