import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import Season from "@/models/Season";
import SeasonPricing from "@/models/SeasonPricing";
import Org from "@/models/Org";
import OrgMember from "@/models/OrgMember";
import { normalizeSeasonPricing, validateSeasonPricing, validateSeasonSchedule } from "@/lib/season-validation";

export async function GET(req: Request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const query = status && status !== "all" ? { status } : { status: { $ne: "draft" } };
    const seasons = await Season.find(query).populate("hostOrgId", "name slug logo tagline").sort({ "timeline.registrationOpens": -1, createdAt: -1 }).lean();
    return NextResponse.json({ seasons: JSON.parse(JSON.stringify(seasons)) });
  } catch (error) {
    console.error("[GET /api/seasons]", error);
    return NextResponse.json({ message: "Unable to load seasons" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const name = String(body.name || "").trim();
    const slug = String(body.slug || "").trim().toLowerCase();
    const description = String(body.description || "").trim();
    const hostOrgId = String(body.hostOrgId || "").trim();
    if (!name || !description) return NextResponse.json({ message: "Name and description are required" }, { status: 400 });
    if (!hostOrgId) return NextResponse.json({ message: "Select the organization hosting this season" }, { status: 400 });
    if (!/^[a-z0-9-]{3,60}$/.test(slug)) return NextResponse.json({ message: "Invalid season slug" }, { status: 400 });

    const durationWeeks = Math.max(1, Math.min(52, Number(body.durationWeeks || 8)));
    const scheduleErrors = validateSeasonSchedule(body.timeline || {});
    const pricing = normalizeSeasonPricing(body.pricing || {}, durationWeeks);
    const pricingErrors = validateSeasonPricing(pricing);
    if (scheduleErrors.length || pricingErrors.length) return NextResponse.json({ message: "Season configuration is invalid", errors: [...scheduleErrors, ...pricingErrors] }, { status: 400 });

    await dbConnect();
    const [hostOrg, membership] = await Promise.all([
      Org.findOne({ _id: hostOrgId, status: { $in: ["approved", "active"] } }).select("_id"),
      OrgMember.findOne({ orgId: hostOrgId, userId: (session.user as any).id, status: "active", role: { $in: ["owner", "admin"] } }).select("_id"),
    ]);
    if (!hostOrg) return NextResponse.json({ message: "The host organization is not active" }, { status: 400 });
    if (!membership) return NextResponse.json({ message: "Only an organization owner or admin can create its season" }, { status: 403 });
    const season = await Season.create({
      name, slug, description,
      hostOrgId,
      tagline: body.tagline || "",
      bannerImage: body.bannerImage || "",
      themeColor: body.themeColor || "#4f46e5",
      visibility: body.visibility || "public",
      timezone: body.timezone || "Asia/Kolkata",
      durationWeeks,
      timeline: body.timeline || {},
      rules: body.rules || {},
      rubric: body.rubric || [],
      createdBy: (session.user as any).id,
    });
    try {
      await SeasonPricing.create({ ...pricing, seasonId: season._id, configuredBy: (session.user as any).id });
    } catch (pricingError) {
      await Season.deleteOne({ _id: season._id });
      throw pricingError;
    }
    return NextResponse.json({ season: JSON.parse(JSON.stringify(season)), pricing }, { status: 201 });
  } catch (error: any) {
    if (error?.code === 11000) return NextResponse.json({ message: "This season slug is already in use" }, { status: 409 });
    console.error("[POST /api/seasons]", error);
    return NextResponse.json({ message: error.message || "Unable to create season" }, { status: 500 });
  }
}
