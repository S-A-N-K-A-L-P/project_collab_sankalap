export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";

/**
 * Razorpay server-to-server webhook — the source of truth for payments.
 *
 * Even if the browser callback (/verify) never fires, Razorpay calls this
 * endpoint after a successful capture, so a paying user is always upgraded.
 *
 * Configure in Razorpay Dashboard → Settings → Webhooks:
 *   URL:    https://<your-domain>/api/payments/razorpay/webhook
 *   Secret: RAZORPAY_WEBHOOK_SECRET   (same value in your env)
 *   Events: payment.captured
 */
export async function POST(req: NextRequest) {
  try {
    // Read the RAW body — signature is computed over the exact bytes sent.
    const rawBody = await req.text();
    const signature = req.headers.get("x-razorpay-signature") || "";

    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
    if (!secret) {
      console.error("[RAZORPAY_WEBHOOK] RAZORPAY_WEBHOOK_SECRET not set");
      return NextResponse.json({ error: "Webhook not configured" }, { status: 500 });
    }

    // Verify the webhook actually came from Razorpay
    const expected = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
    const valid =
      signature.length === expected.length &&
      crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));

    if (!valid) {
      console.warn("[RAZORPAY_WEBHOOK] invalid signature");
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    const event = JSON.parse(rawBody);

    if (event.event === "payment.captured") {
      const payment = event.payload?.payment?.entity;
      const userId = payment?.notes?.userId;
      const paymentId = payment?.id;

      if (userId) {
        await dbConnect();
        // Idempotent: only flips a non-Pro user, safe to receive twice.
        await User.findByIdAndUpdate(userId, {
          isPro: true,
          proSince: new Date(),
          razorpayPaymentId: paymentId,
        });
        console.log(`[RAZORPAY_WEBHOOK] user ${userId} upgraded via payment ${paymentId}`);
      }
    }

    // Always 200 so Razorpay stops retrying once we've accepted the event.
    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error("[RAZORPAY_WEBHOOK_ERROR]", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
