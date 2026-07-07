import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import Project from "@/models/Project";

function isAdmin(s: any) {
  return s && ["sankalp_associate", "master_admin"].includes(s.user?.role);
}

/** PATCH — update showcase / marketplace settings or push a new release */
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    await dbConnect();

    const project = await Project.findById(id);
    if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });

    const userId = (session.user as any).id;
    const isLead = project.lead?.toString() === userId;
    if (!isLead && !isAdmin(session)) {
      return NextResponse.json({ error: "Only the project lead or an admin can edit showcase" }, { status: 403 });
    }

    const body = await req.json();

    // Showcase visibility toggles
    if (body.showcase) {
      project.showcase = {
        ...(project.showcase || {}),
        isPublic:       body.showcase.isPublic       ?? project.showcase?.isPublic,
        caseStudyOptIn: body.showcase.caseStudyOptIn ?? project.showcase?.caseStudyOptIn,
        // featured is admin-only — only allow toggle if admin
        featured:       isAdmin(session) && body.showcase.featured !== undefined
          ? body.showcase.featured
          : project.showcase?.featured,
      };
    }

    // Marketplace settings
    if (body.marketplace) {
      project.marketplace = {
        ...(project.marketplace || {}),
        forSale:       body.marketplace.forSale       ?? project.marketplace?.forSale,
        licenseType:   body.marketplace.licenseType   ?? project.marketplace?.licenseType,
        priceINR:      body.marketplace.priceINR      ?? project.marketplace?.priceINR,
        contactEmail:  body.marketplace.contactEmail  ?? project.marketplace?.contactEmail,
        inquiriesCount: project.marketplace?.inquiriesCount ?? 0,
      };
    }

    // Cover image / live URL refresh
    if (body.coverImage   !== undefined) project.coverImage   = body.coverImage;
    if (body.liveUrl      !== undefined) project.liveUrl      = body.liveUrl;
    if (body.demoVideoUrl !== undefined) project.demoVideoUrl = body.demoVideoUrl;
    if (body.apiDocsUrl   !== undefined) project.apiDocsUrl   = body.apiDocsUrl;

    // New release version
    if (body.newRelease) {
      const { version, notes, githubTag } = body.newRelease;
      if (!version || !/^v?\d+\.\d+\.\d+/.test(version)) {
        return NextResponse.json({ error: "Invalid semver version" }, { status: 400 });
      }
      const v = version.startsWith("v") ? version : `v${version}`;
      project.releases.push({
        version: v, notes: notes || "", githubTag: githubTag || "",
        releasedAt: new Date(), releasedBy: userId,
      });
      project.version      = v;
      project.releaseNotes = notes || "";
    }

    await project.save();
    return NextResponse.json({ ok: true, project: JSON.parse(JSON.stringify(project)) });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
