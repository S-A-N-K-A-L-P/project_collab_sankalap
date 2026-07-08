import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Org from "@/models/Org";

const RESERVED_SLUGS = new Set([
  "launch", "status", "admin", "new", "settings", "api", "o",
  "directory", "explore", "create", "request", "join",
]);

/** GET /api/orgs/slug-available?slug=xxx — check if a slug is available */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const raw = searchParams.get("slug") || "";
    const slug = raw.trim().toLowerCase();

    if (!slug) {
      return NextResponse.json({ available: false, reason: "Slug is required" });
    }

    if (!/^[a-z0-9-]{3,40}$/.test(slug)) {
      return NextResponse.json({
        available: false,
        reason: "Slug must be 3–40 characters: lowercase letters, numbers, hyphens only.",
      });
    }

    if (RESERVED_SLUGS.has(slug)) {
      return NextResponse.json({
        available: false,
        reason: `"${slug}" is reserved and cannot be used.`,
        suggestion: `${slug}-org`,
      });
    }

    await dbConnect();
    const existing = await Org.findOne({ slug }).select("_id").lean();

    if (existing) {
      return NextResponse.json({
        available: false,
        reason: "This slug is already taken.",
        suggestion: `${slug}-${Math.floor(Math.random() * 900) + 100}`,
      });
    }

    return NextResponse.json({ available: true });
  } catch (error) {
    console.error("[slug-available]", error);
    return NextResponse.json({ available: false, reason: "Check failed" }, { status: 500 });
  }
}
