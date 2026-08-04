import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import Season from "@/models/Season";
import SeasonPricing from "@/models/SeasonPricing";
import SeasonEnrollment from "@/models/SeasonEnrollment";

export async function POST(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ message: "Sign in to join this season" }, { status: 401 });
  const { slug } = await params;
  await dbConnect();
  const season = await Season.findOne({ slug, status: { $ne: "draft" } });
  if (!season) return NextResponse.json({ message: "Season not found" }, { status: 404 });
  if (!['registration', 'proposal_submission', 'applications'].includes(season.status)) return NextResponse.json({ message: "Enrollment is not open" }, { status: 409 });

  const userId = (session.user as any).id;
  const existing = await SeasonEnrollment.findOne({ seasonId: season._id, userId });
  if (existing) return NextResponse.json({ enrollment: existing });
  const activeCount = await SeasonEnrollment.countDocuments({ seasonId: season._id, status: { $in: ["payment_pending", "active"] } });
  if (activeCount >= (season.rules?.participantCapacity || 100)) return NextResponse.json({ message: "This season has reached participant capacity" }, { status: 409 });

  const pricing = await SeasonPricing.findOne({ seasonId: season._id }).lean() as any;
  const isFree = !pricing || pricing.mode === "free";
  const enrollment = await SeasonEnrollment.create({
    seasonId: season._id,
    userId,
    status: isFree ? "active" : "payment_pending",
    paymentStatus: isFree ? "not_required" : "pending",
    accessStatus: isFree ? "active" : "pending",
    pricingSnapshot: pricing || null,
    joinedAt: isFree ? new Date() : undefined,
  });
  if (isFree) await Season.updateOne({ _id: season._id }, { $inc: { "stats.participantCount": 1 } });
  return NextResponse.json({ enrollment }, { status: 201 });
}
