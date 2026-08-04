"use client";

import { useSession } from "next-auth/react";
import { useCallback, useRef, useState } from "react";

export function useSeasonRazorpay(slug: string, onSuccess: () => void) {
  const { data: session } = useSession();
  const loaded = useRef(false);
  const [state, setState] = useState<"idle" | "loading" | "processing" | "success" | "error">("idle");
  const [error, setError] = useState("");
  const loadScript = () => new Promise<void>((resolve, reject) => {
    if (loaded.current || (window as any).Razorpay) { loaded.current = true; resolve(); return; }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => { loaded.current = true; resolve(); };
    script.onerror = () => reject(new Error("Unable to load Razorpay Checkout"));
    document.head.appendChild(script);
  });

  const openCheckout = useCallback(async () => {
    setState("loading"); setError("");
    try {
      const response = await fetch(`/api/seasons/${slug}/payments/order`, { method: "POST" });
      const order = await response.json();
      if (!response.ok) throw new Error(order.message || "Unable to create payment order");
      await loadScript();
      setState("processing");
      const user = session?.user as any;
      const razorpay = new (window as any).Razorpay({
        key: order.keyId, amount: order.amount, currency: order.currency, order_id: order.orderId,
        name: "S.A.N.K.A.L.P.", description: `${order.seasonName}${order.cycleNumber > 1 ? ` — cycle ${order.cycleNumber}` : " — participation fee"}`,
        image: "/logo.png", prefill: { name: user?.name || "", email: user?.email || "" }, theme: { color: "#4f46e5" },
        handler: async (result: any) => {
          try {
            const verified = await fetch(`/api/seasons/${slug}/payments/verify`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(result) });
            const data = await verified.json();
            if (!verified.ok) throw new Error(data.message || "Payment verification failed");
            setState("success"); onSuccess();
          } catch (err: any) { setError(err.message); setState("error"); }
        },
        modal: { ondismiss: () => setState((current) => current === "success" ? current : "idle") },
      });
      razorpay.on("payment.failed", (result: any) => { setError(result.error?.description || "Payment failed"); setState("error"); });
      razorpay.open();
    } catch (err: any) { setError(err.message || "Payment could not start"); setState("error"); }
  }, [slug, session, onSuccess]);
  return { openCheckout, state, error, isLoading: state === "loading" || state === "processing" };
}
