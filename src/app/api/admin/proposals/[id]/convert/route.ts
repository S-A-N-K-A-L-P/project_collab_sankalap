import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import Proposal from "@/models/Proposal";
import Project from "@/models/Project";
import Org from "@/models/Org";

function isAdmin(s: any) {
  return s && ["admin", "pixel_head"].includes(s.user?.role);
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!isAdmin(session)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const { orgId, title, description, leadId } = await req.json();

    await dbConnect();

    const proposal = await Proposal.findById(id);
    if (!proposal) return NextResponse.json({ error: "Proposal not found" }, { status: 404 });

    if (!["approved", "active"].includes(proposal.status)) {
      return NextResponse.json(
        { error: "Proposal must be approved or active to convert" },
        { status: 400 }
      );
    }

    // Resolve org — use provided, fall back to first org, or auto-create
    let resolvedOrgId = orgId;
    if (!resolvedOrgId) {
      const firstOrg = await Org.findOne().select("_id").lean();
      if (firstOrg) {
        resolvedOrgId = (firstOrg as any)._id;
      } else {
        const adminId = (session!.user as any).id;
        const defaultOrg = await Org.create({
          name: "SANKALP",
          slug: "sankalp",
          description: "Default organization",
          createdBy: adminId,
          admins: [adminId],
          members: [adminId],
          visibility: "public",
        });
        resolvedOrgId = defaultOrg._id;
      }
    }

    const lead = leadId || proposal.projectLead || (session!.user as any).id;

    const project = await Project.create({
      proposalId: proposal._id,
      orgId: resolvedOrgId,
      title: title || proposal.title,
      description: description || proposal.description,
      status: "planning",
      lead,
      members: [lead],
      techStack: proposal.techStack ?? [],
      progress: 0,
    });

    await Proposal.findByIdAndUpdate(id, {
      $set: { stage: "setup", status: "active" },
    });

    return NextResponse.json({ project }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
