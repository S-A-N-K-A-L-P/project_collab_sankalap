import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { generateUploadSignature, isUploadEnabled } from "@/lib/cloudinary";

/** GET /api/upload/signature?folder=... — returns signed upload params for direct-to-Cloudinary uploads */
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    if (!isUploadEnabled()) {
      return NextResponse.json(
        { message: "Cloudinary is not configured." },
        { status: 503 }
      );
    }

    const { searchParams } = new URL(req.url);
    const folder    = searchParams.get("folder") || "sankalp/uploads/general";
    const timestamp = Math.round(Date.now() / 1000);

    const signatureData = generateUploadSignature({ folder, timestamp });

    return NextResponse.json(signatureData);
  } catch (error: any) {
    console.error("[upload/signature]", error);
    return NextResponse.json(
      { message: error.message || "Failed to generate signature" },
      { status: 500 }
    );
  }
}
