import crypto from "crypto";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import { captureSeasonPayment } from "@/lib/season-payments";
import Season from "@/models/Season";
import SeasonPayment from "@/models/SeasonPayment";

export async function POST(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    const { slug } = await params;
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await req.json();
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) return NextResponse.json({ message: "Missing payment fields" }, { status: 400 });
    const secret = process.env.RAZORPAY_KEY_SECRET;
    if (!secret) return NextResponse.json({ message: "Razorpay is not configured" }, { status: 500 });
    const expected = crypto.createHmac("sha256", secret).update(`${razorpay_order_id}|${razorpay_payment_id}`).digest("hex");
    const valid = razorpay_signature.length === expected.length && crypto.timingSafeEqual(Buffer.from(razorpay_signature), Buffer.from(expected));
    if (!valid) return NextResponse.json({ message: "Payment verification failed" }, { status: 400 });

    await dbConnect();
    const season = await Season.findOne({ slug }).select("_id").lean();
    if (!season) return NextResponse.json({ message: "Season not found" }, { status: 404 });
    const payment = await SeasonPayment.findOne({ razorpayOrderId: razorpay_order_id, seasonId: (season as any)._id });
    if (!payment || String(payment.userId) !== String((session.user as any).id)) return NextResponse.json({ message: "Payment order does not belong to this account" }, { status: 403 });
    await captureSeasonPayment(razorpay_order_id, razorpay_payment_id);
    return NextResponse.json({ success: true, message: "Season access activated" });
  } catch (error: any) {
    console.error("[SEASON_RAZORPAY_VERIFY]", error);
    return NextResponse.json({ message: error.message || "Verification failed" }, { status: 500 });
  }
}
