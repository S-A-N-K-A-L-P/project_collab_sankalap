import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import dbConnect from "@/lib/mongodb";
import Proposal from "@/models/Proposal";
import User from "@/models/User";
import Activity from "@/models/Activity";
import { mkdir, writeFile } from "fs/promises";
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

    const { id, title, description, type, techStack } = await req.json();
    if (!id) return NextResponse.json({ error: "Proposal ID required" }, { status: 400 });

    await dbConnect();

    const proposal = await Proposal.findById(id);
    if (!proposal) return NextResponse.json({ error: "Proposal not found" }, { status: 404 });

    // Verify Ownership
    const user = await User.findOne({ email: session.user?.email });
    if (proposal.createdBy.toString() !== user?._id.toString()) {
      return NextResponse.json({ error: "Forbidden: Not the creator" }, { status: 403 });
    }

    const updated = await Proposal.findByIdAndUpdate(
      id,
      { $set: { title, description, type, techStack } },
      { new: true }
    );

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
