export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Razorpay from "razorpay";

const PRO_AMOUNT_PAISE = 29900; // ₹299 in paise
const CURRENCY = "INR";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const order = await razorpay.orders.create({
      amount: PRO_AMOUNT_PAISE,
      currency: CURRENCY,
      receipt: `pro_${(session.user as any).id}_${Date.now()}`,
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
    console.error("[RAZORPAY_ORDER_ERROR]", error);
    return NextResponse.json({ error: error.message || "Failed to create order" }, { status: 500 });
  }
}
