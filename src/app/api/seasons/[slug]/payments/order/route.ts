import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import { getRazorpayClient, getRazorpayKeyId } from "@/lib/razorpay";
import Season from "@/models/Season";
import SeasonPricing from "@/models/SeasonPricing";
import SeasonEnrollment from "@/models/SeasonEnrollment";
import SeasonPayment from "@/models/SeasonPayment";

export async function POST(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    const { slug } = await params;
    await dbConnect();
    const season = await Season.findOne({ slug });
    if (!season) return NextResponse.json({ message: "Season not found" }, { status: 404 });
    const pricing = await SeasonPricing.findOne({ seasonId: season._id });
    if (!pricing || pricing.mode === "free") return NextResponse.json({ message: "No payment is required" }, { status: 409 });
    if (!pricing.paymentsEnabled) return NextResponse.json({ message: "Payments are not enabled for this season" }, { status: 409 });

    const userId = (session.user as any).id;
    const enrollment = await SeasonEnrollment.findOne({ seasonId: season._id, userId });
    if (!enrollment) return NextResponse.json({ message: "Join the season before paying" }, { status: 409 });
    if (enrollment.paymentStatus === "paid" && pricing.mode === "one_time") return NextResponse.json({ message: "Season fee is already paid" }, { status: 409 });

    const cycleNumber = pricing.mode === "monthly" ? (enrollment.paidCycleCount || 0) + 1 : 1;
    if (cycleNumber > pricing.billingCycleCount) return NextResponse.json({ message: "All billing cycles are already paid" }, { status: 409 });
    const purpose = pricing.mode === "monthly" ? "monthly" : "one_time";
    const existing = await SeasonPayment.findOne({ enrollmentId: enrollment._id, purpose, cycleNumber });
    if (existing?.status === "paid") return NextResponse.json({ message: "This payment is already complete" }, { status: 409 });

    const amountRupees = Number(pricing.amount) + (cycleNumber === 1 ? Number(pricing.joiningFee || 0) : 0);
    const amountPaise = Math.round(amountRupees * 100);
    if (amountPaise < 100) return NextResponse.json({ message: "Razorpay requires an amount of at least ₹1" }, { status: 400 });
    const razorpay = getRazorpayClient();
    const order = await razorpay.orders.create({
      amount: amountPaise,
      currency: pricing.currency,
      receipt: `s_${String(season._id).slice(-8)}_${String(enrollment._id).slice(-8)}_${cycleNumber}`.slice(0, 40),
      notes: { paymentType: "season", seasonId: String(season._id), enrollmentId: String(enrollment._id), userId: String(userId), cycleNumber: String(cycleNumber) },
    });
    const payment = await SeasonPayment.findOneAndUpdate(
      { enrollmentId: enrollment._id, purpose, cycleNumber },
      { $set: { seasonId: season._id, userId, amount: amountPaise, currency: pricing.currency, status: "created", razorpayOrderId: order.id, metadata: { seasonSlug: slug } } },
      { upsert: true, new: true, runValidators: true }
    );
    return NextResponse.json({ orderId: order.id, amount: order.amount, currency: order.currency, keyId: getRazorpayKeyId(), paymentId: payment._id, seasonName: season.name, cycleNumber });
  } catch (error: any) {
    console.error("[SEASON_RAZORPAY_ORDER]", error);
    return NextResponse.json({ message: error?.error?.description || error.message || "Unable to create payment order" }, { status: 500 });
  }
}
