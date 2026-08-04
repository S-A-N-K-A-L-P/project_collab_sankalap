import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { isPlatformReviewer } from "@/lib/roles";
import dbConnect from "@/lib/mongodb";
import Season from "@/models/Season";
import SeasonPricing from "@/models/SeasonPricing";
import SeasonEnrollment from "@/models/SeasonEnrollment";
import SeasonRoleAssignment from "@/models/SeasonRoleAssignment";
import { canTransitionSeason, normalizeSeasonPricing, validateSeasonPricing, validateSeasonSchedule } from "@/lib/season-validation";

async function getAuthorizedSeason(slug: string, session: any) {
  const season = await Season.findOne({ slug });
  if (!season) return { error: NextResponse.json({ message: "Season not found" }, { status: 404 }) };
  const userId = String((session.user as any).id);
  const creator = String(season.createdBy) === userId;
  const platformOrganizer = isPlatformReviewer((session.user as any).role);
  const assignment = !creator && !platformOrganizer ? await SeasonRoleAssignment.findOne({ seasonId: season._id, userId, role: "organizer", status: "active" }) : null;
  if (!creator && !platformOrganizer && !assignment) return { error: NextResponse.json({ message: "Forbidden" }, { status: 403 }) };
  return { season };
}

export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  const { slug } = await params;
  await dbConnect();
  const authorized = await getAuthorizedSeason(slug, session);
  if (authorized.error) return authorized.error;
  const season = authorized.season!;
  const [pricing, enrollmentCounts] = await Promise.all([
    SeasonPricing.findOne({ seasonId: season._id }).lean(),
    SeasonEnrollment.aggregate([{ $match: { seasonId: season._id } }, { $group: { _id: "$status", count: { $sum: 1 } } }]),
  ]);
  return NextResponse.json(JSON.parse(JSON.stringify({ season, pricing, enrollmentCounts })));
}

export async function PATCH(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  const { slug } = await params;
  const body = await req.json();
  await dbConnect();
  const authorized = await getAuthorizedSeason(slug, session);
  if (authorized.error) return authorized.error;
  const season = authorized.season!;

  if (body.action === "publish") {
    if (!canTransitionSeason(season.status, "registration")) return NextResponse.json({ message: "This season cannot be published from its current status" }, { status: 409 });
    const pricing = await SeasonPricing.findOne({ seasonId: season._id }).lean();
    const errors = [...validateSeasonSchedule(season.timeline?.toObject?.() || season.timeline || {}), ...validateSeasonPricing(normalizeSeasonPricing((pricing || {}) as any, season.durationWeeks))];
    if (errors.length) return NextResponse.json({ message: "Complete the season configuration before publishing", errors }, { status: 400 });
    season.status = "registration";
    if (pricing && (pricing as any).mode !== "free") await SeasonPricing.updateOne({ seasonId: season._id }, { $set: { paymentsEnabled: true } });
    await season.save();
    return NextResponse.json({ season: JSON.parse(JSON.stringify(season)) });
  }

  if (season.status !== "draft") return NextResponse.json({ message: "Only draft seasons can be edited here" }, { status: 409 });
  const durationWeeks = Math.max(1, Math.min(52, Number(body.durationWeeks || season.durationWeeks || 8)));
  const pricing = normalizeSeasonPricing(body.pricing || {}, durationWeeks);
  const errors = [...validateSeasonSchedule(body.timeline || {}), ...validateSeasonPricing(pricing)];
  if (errors.length) return NextResponse.json({ message: "Season configuration is invalid", errors }, { status: 400 });
  const allowed = ["name", "tagline", "description", "visibility", "timezone", "durationWeeks", "bannerImage", "themeColor", "timeline", "rules"];
  for (const field of allowed) if (body[field] !== undefined) season.set(field, body[field]);
  await season.save();
  await SeasonPricing.findOneAndUpdate({ seasonId: season._id }, { $set: { ...pricing, configuredBy: (session.user as any).id } }, { upsert: true, new: true, runValidators: true });
  return NextResponse.json({ season: JSON.parse(JSON.stringify(season)), pricing });
}
