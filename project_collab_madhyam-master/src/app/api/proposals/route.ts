import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import Proposal from "@/models/Proposal";
import User from "@/models/User";
import Activity from "@/models/Activity";
import { mkdir, unlink, writeFile } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

export const runtime = "nodejs";

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;
const ALLOWED_EXTENSIONS = new Set([".pdf", ".docx", ".png", ".jpg", ".jpeg"]);
const ALLOWED_MIME_TYPES = new Set([
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "image/png",
  "image/jpeg",
]);

function getExtension(filename: string): string {
  const ext = path.extname(filename || "").toLowerCase();
  return ext;
}

async function saveAttachment(file: File): Promise<string> {
  const extension = getExtension(file.name);

  if (!ALLOWED_EXTENSIONS.has(extension) || !ALLOWED_MIME_TYPES.has(file.type)) {
    throw new Error("Invalid file type. Allowed: PDF, DOCX, PNG, JPG.");
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    throw new Error("File is too large. Maximum size is 5 MB.");
  }

  const uploadDir = path.join(process.cwd(), "public", "uploads", "proposals");
  await mkdir(uploadDir, { recursive: true });

  const fileName = `${Date.now()}-${randomUUID()}${extension}`;
  const fullPath = path.join(uploadDir, fileName);
  const buffer = Buffer.from(await file.arrayBuffer());

  await writeFile(fullPath, buffer);

  return `/uploads/proposals/${fileName}`;
}

async function removeStoredAttachment(url: string): Promise<void> {
  const relative = String(url || "").trim();
  if (!relative.startsWith("/uploads/proposals/")) {
    return;
  }

  const uploadRoot = path.resolve(process.cwd(), "public", "uploads", "proposals");
  const targetPath = path.resolve(process.cwd(), "public", relative.replace(/^\//, ""));

  if (!targetPath.startsWith(uploadRoot + path.sep) && targetPath !== uploadRoot) {
    return;
  }

  try {
    await unlink(targetPath);
  } catch {
    // Ignore missing files to avoid breaking proposal updates.
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "50", 10);
    const skip = (page - 1) * limit;

    await dbConnect();

    const query = userId ? { createdBy: userId } : {};
    const proposals = await Proposal.find(query)
      .populate("createdBy", "name avatar role universityName")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Proposal.countDocuments(query);

    // Filter out orphaned data
    const validProposals = proposals.filter((p: any) => p.createdBy);
    const pages = Math.ceil(total / limit);

    return NextResponse.json({
      proposals: validProposals,
      total,
      page,
      pages,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const contentType = req.headers.get("content-type") || "";

    let title = "";
    let description = "";
    let type = "idea";
    let techStack: string[] = [];
    let media: string[] = [];

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      title = String(formData.get("title") || "").trim();
      description = String(formData.get("description") || "").trim();
      type = String(formData.get("type") || "idea").trim();
      techStack = String(formData.get("techStack") || "")
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);

      const attachment = formData.get("attachment");
      if (attachment instanceof File && attachment.size > 0) {
        const attachmentUrl = await saveAttachment(attachment);
        media = [attachmentUrl];
      }
    } else {
      const payload = await req.json();
      title = String(payload?.title || "").trim();
      description = String(payload?.description || "").trim();
      type = String(payload?.type || "idea").trim();
      techStack = Array.isArray(payload?.techStack) ? payload.techStack : [];
    }

    if (!title || !description) {
      return NextResponse.json({ error: "Title and description are required" }, { status: 400 });
    }

    await dbConnect();

    const user = await User.findOne({ email: session.user?.email });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const proposal = await Proposal.create({
      title,
      description,
      type,
      techStack,
      media,
      createdBy: user._id,
      stage: "proposal",
      status: "proposal",
    });

    // Record Activity
    await Activity.create({
      actorId: user._id,
      type: "CREATE_PROPOSAL",
      targetId: proposal._id,
      targetType: "PROPOSAL",
      metadata: { title: proposal.title }
    });

    return NextResponse.json(proposal, { status: 201 });
  } catch (error: any) {
    console.error("PROPOSAL_CREATE_ERROR:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const contentType = req.headers.get("content-type") || "";

    let id = "";
    let title = "";
    let description = "";
    let type = "";
    let techStack: string[] = [];
    let hasType = false;
    let hasTechStack = false;
    let retainMedia: string[] | null = null;
    let newAttachments: File[] = [];

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      id = String(formData.get("id") || "").trim();
      title = String(formData.get("title") || "").trim();
      description = String(formData.get("description") || "").trim();
      type = String(formData.get("type") || "").trim();
      hasType = formData.has("type");
      techStack = String(formData.get("techStack") || "")
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
      hasTechStack = formData.has("techStack");

      const retainMediaRaw = formData.get("retainMedia");
      if (typeof retainMediaRaw === "string") {
        try {
          const parsed = JSON.parse(retainMediaRaw);
          if (Array.isArray(parsed)) {
            retainMedia = parsed.filter((item) => typeof item === "string").map((item) => item.trim()).filter(Boolean);
          }
        } catch {
          return NextResponse.json({ error: "Invalid retainMedia payload" }, { status: 400 });
        }
      }

      const attachments = formData.getAll("attachments");
      newAttachments = attachments.filter((item): item is File => item instanceof File && item.size > 0);

      const legacyAttachment = formData.get("attachment");
      if (legacyAttachment instanceof File && legacyAttachment.size > 0) {
        newAttachments.push(legacyAttachment);
      }
    } else {
      const payload = await req.json();
      id = String(payload?.id || "").trim();
      title = String(payload?.title || "").trim();
      description = String(payload?.description || "").trim();
      type = String(payload?.type || "").trim();
      hasType = payload?.type !== undefined;
      techStack = Array.isArray(payload?.techStack)
        ? payload.techStack.map((item: unknown) => String(item || "").trim()).filter(Boolean)
        : [];
      hasTechStack = Array.isArray(payload?.techStack);
      if (Array.isArray(payload?.media)) {
        retainMedia = payload.media.map((item: unknown) => String(item || "").trim()).filter(Boolean);
      }
    }

    if (!id) return NextResponse.json({ error: "Proposal ID required" }, { status: 400 });

    await dbConnect();

    const proposal = await Proposal.findById(id);
    if (!proposal) return NextResponse.json({ error: "Proposal not found" }, { status: 404 });

    // Verify Ownership
    const user = await User.findOne({ email: session.user?.email });
    if (proposal.createdBy.toString() !== user?._id.toString()) {
      return NextResponse.json({ error: "Forbidden: Not the creator" }, { status: 403 });
    }

    if (!title || !description) {
      return NextResponse.json({ error: "Title and description are required" }, { status: 400 });
    }

    const existingMedia: string[] = Array.isArray(proposal.media)
      ? proposal.media.map((item: unknown) => String(item || "").trim()).filter(Boolean)
      : [];
    const existingType = String(proposal.type || "idea");
    const existingTechStack = Array.isArray(proposal.techStack)
      ? proposal.techStack.map((item: unknown) => String(item || "").trim()).filter(Boolean)
      : [];
    const retainedMedia: string[] = retainMedia === null
      ? existingMedia
      : retainMedia.filter((item) => existingMedia.includes(item));

    const addedMedia: string[] = [];
    for (const file of newAttachments) {
      const attachmentUrl = await saveAttachment(file);
      addedMedia.push(attachmentUrl);
    }

    const nextMedia = Array.from(new Set([...retainedMedia, ...addedMedia]));

    const updated = await Proposal.findByIdAndUpdate(
      id,
      {
        $set: {
          title,
          description,
          type: hasType && type ? type : existingType,
          techStack: hasTechStack ? techStack : existingTechStack,
          media: nextMedia,
        },
      },
      { new: true }
    );

    const removedMedia = existingMedia.filter((item) => !nextMedia.includes(item));
    await Promise.all(removedMedia.map((url) => removeStoredAttachment(url)));

    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Proposal ID required" }, { status: 400 });

    await dbConnect();

    const proposal = await Proposal.findById(id);
    if (!proposal) return NextResponse.json({ error: "Proposal not found" }, { status: 404 });

    // Verify Ownership
    const user = await User.findOne({ email: session.user?.email });
    if (proposal.createdBy.toString() !== user?._id.toString()) {
      return NextResponse.json({ error: "Forbidden: Not the creator" }, { status: 403 });
    }

    await Proposal.findByIdAndDelete(id);

    // Optional: Delete associated activities
    await Activity.deleteMany({ targetId: id });

    return NextResponse.json({ message: "Proposal neutralized" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
