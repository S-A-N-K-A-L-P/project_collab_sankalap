import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { uploadWebFile, LIMITS, ALLOWED_IMAGE_TYPES, isUploadEnabled } from "@/lib/cloudinary";

/** POST /api/upload — authenticated server-proxied file upload */
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    if (!isUploadEnabled()) {
      return NextResponse.json(
        { message: "File uploads are not configured. Please paste an external URL instead." },
        { status: 503 }
      );
    }

    const formData     = await req.formData();
    const file         = formData.get("file") as File | null;
    const folder       = (formData.get("folder") as string) || "sankalp/uploads/general";
    const resourceType = (formData.get("resourceType") as "image" | "video" | "raw") || "image";

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ message: "No file provided" }, { status: 400 });
    }

    // Determine size limit from folder
    let maxBytes = LIMITS.general;
    if (folder.includes("avatars") || folder.includes("logo")) maxBytes = LIMITS.avatar;
    else if (folder.includes("banner")) maxBytes = LIMITS.banner;
    else if (folder.includes("gallery")) maxBytes = LIMITS.gallery;
    else if (resourceType === "video") maxBytes = LIMITS.video;

    // Validate MIME type for images
    if (resourceType === "image" && !ALLOWED_IMAGE_TYPES.includes(file.type)) {
      return NextResponse.json(
        { message: "Invalid file type. Allowed: JPEG, PNG, WebP, GIF, SVG." },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > maxBytes) {
      const limitMB = (maxBytes / 1024 / 1024).toFixed(1);
      return NextResponse.json(
        { message: `File too large. Maximum allowed: ${limitMB} MB.` },
        { status: 400 }
      );
    }

    const result = await uploadWebFile(file, { folder, resourceType, maxBytes });

    return NextResponse.json(result, { status: 200 });
  } catch (error: any) {
    console.error("[upload]", error);
    return NextResponse.json(
      { message: error.message || "Upload failed" },
      { status: 500 }
    );
  }
}
