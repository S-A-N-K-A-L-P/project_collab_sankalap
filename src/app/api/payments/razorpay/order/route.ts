export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Razorpay from "razorpay";

const PRO_AMOUNT_PAISE = 100; // ₹1 in paise (test)
const CURRENCY = "INR";

function getRazorpayClient() {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    throw new Error("Razorpay is not configured");
  }

  return new Razorpay({
    key_id: keyId,
    key_secret: keySecret,
  });
}

export async function POST() {
  try {
    const razorpay = getRazorpayClient();
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const order = await razorpay.orders.create({
      amount: PRO_AMOUNT_PAISE,
      currency: CURRENCY,
      receipt: `p_${(session.user as any).id}_${Date.now().toString().slice(-8)}`,
      notes: {
        userId: (session.user as any).id,
        plan: "pro",
      },
    });

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error: any) {
    console.error("[RAZORPAY_ORDER_ERROR]", JSON.stringify(error, null, 2));

    // The Razorpay SDK throws an object shaped like
    //   { statusCode, error: { code, description, reason } }
    // NOT a standard Error — so error.message is usually undefined.
    const rzpStatus = error?.statusCode;
    const rzpDesc = error?.error?.description || error?.error?.reason;

    // Surface the REAL reason so the client alert is actionable.
    let reason = rzpDesc || error?.message || "Failed to create order";
    if (rzpStatus === 401) {
      reason = "Razorpay authentication failed — RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET do not match (re-copy both from the SAME key generation).";
    }

    return NextResponse.json(
      { error: reason, statusCode: rzpStatus ?? 500 },
      { status: 500 }
    );
  }
}
