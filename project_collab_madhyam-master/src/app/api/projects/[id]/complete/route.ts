import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import Project from "@/models/Project";
import ProjectDoc from "@/models/ProjectDoc";
import Task from "@/models/Task";

interface DocInput {
  kind: "business" | "how-to-use" | "technical" | "api" | "other";
  title?: string;
  format: "markdown" | "pdf" | "external-url";
  contentMd?: string;
  fileUrl?: string;
  externalUrl?: string;
}

interface CompleteBody {
  version:      string;             // "v1.0.0"
  releaseNotes?: string;
  liveUrl?:      string;
  stagingUrl?:   string;
  demoVideoUrl?: string;
  apiDocsUrl?:   string;
  coverImage?:   string;             // external URL until Cloudinary wired
  docs?: DocInput[];
  showcase?: { isPublic?: boolean; caseStudyOptIn?: boolean };
  marketplace?: {
    forSale?:      boolean;
    licenseType?:  string;
    priceINR?:     number;
    contactEmail?: string;
  };
}

function isAdmin(s: any) {
  return s && ["sankalp_associate", "master_admin"].includes(s.user?.role);
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    await dbConnect();

    const project = await Project.findById(id);
    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const userId = (session.user as any).id;
    const isLead = project.lead?.toString() === userId;
    if (!isLead && !isAdmin(session)) {
      return NextResponse.json({ error: "Only the project lead or an admin can mark this complete" }, { status: 403 });
    }

    if (project.status === "completed") {
      return NextResponse.json({ error: "Project is already marked complete" }, { status: 400 });
    }

    const body: CompleteBody = await req.json();

    // ── Validate required fields ─────────────────────────────────
    if (!body.version || !/^v?\d+\.\d+\.\d+/.test(body.version)) {
      return NextResponse.json(
        { error: "A semantic version (e.g. v1.0.0) is required" },
        { status: 400 }
      );
    }

    // ── Pre-flight checklist: warn (not block) if active tasks ──
    const activeTaskCount = await Task.countDocuments({
      projectId: id,
      status: { $in: ["in-progress", "pending"] },
    });

    // Auto-archive remaining open tasks rather than block (configurable later)
    if (activeTaskCount > 0) {
      await Task.updateMany(
        { projectId: id, status: { $in: ["in-progress", "pending"] } },
        { $set: { status: "completed", progress: 100 } }
      );
    }

    // ── Persist project completion fields ───────────────────────
    project.status        = "completed";
    project.completedAt   = new Date();
    project.completedBy   = userId;
    project.progress      = 100;
    project.version       = body.version.startsWith("v") ? body.version : `v${body.version}`;
    project.releaseNotes  = body.releaseNotes  ?? "";
    project.liveUrl       = body.liveUrl       ?? "";
    project.stagingUrl    = body.stagingUrl    ?? "";
    project.demoVideoUrl  = body.demoVideoUrl  ?? "";
    project.apiDocsUrl    = body.apiDocsUrl    ?? "";
    project.coverImage    = body.coverImage    ?? "";

    if (body.showcase) {
      project.showcase = {
        isPublic:       body.showcase.isPublic       ?? true,
        caseStudyOptIn: body.showcase.caseStudyOptIn ?? false,
        featured:       project.showcase?.featured   ?? false,
      };
    }

    if (body.marketplace) {
      project.marketplace = {
        forSale:        body.marketplace.forSale        ?? false,
        licenseType:    body.marketplace.licenseType    ?? "",
        priceINR:       body.marketplace.priceINR       ?? 0,
        contactEmail:   body.marketplace.contactEmail   ?? "",
        inquiriesCount: project.marketplace?.inquiriesCount ?? 0,
      };
    }

    // Push initial release into history
    project.releases = [
      ...(project.releases || []),
      {
        version:    project.version,
        notes:      project.releaseNotes,
        releasedAt: new Date(),
        releasedBy: userId,
      },
    ];

    await project.save();

    // ── Persist docs (separate collection) ──────────────────────
    if (body.docs?.length) {
      const docsToInsert = body.docs
        .filter(d => {
          if (d.format === "markdown")     return !!d.contentMd?.trim();
          if (d.format === "external-url") return !!d.externalUrl?.trim();
          if (d.format === "pdf")          return !!d.fileUrl?.trim();
          return false;
        })
        .map(d => ({
          projectId:   project._id,
          kind:        d.kind,
          title:       d.title || d.kind.replace("-", " "),
          format:      d.format,
          contentMd:   d.contentMd   ?? "",
          fileUrl:     d.fileUrl     ?? "",
          externalUrl: d.externalUrl ?? "",
          uploadedBy:  userId,
          version:     project.version,
        }));

      if (docsToInsert.length) {
        await ProjectDoc.insertMany(docsToInsert);
      }
    }

    return NextResponse.json({
      ok: true,
      projectId: project._id,
      message: `Project marked complete (${project.version})`,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Internal error" }, { status: 500 });
  }
}
