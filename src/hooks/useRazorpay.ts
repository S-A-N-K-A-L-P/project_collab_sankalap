"use client";

import { useSession } from "next-auth/react";
import { useCallback, useRef, useState } from "react";

type PaymentState = "idle" | "loading" | "processing" | "success" | "error";

export function useRazorpay() {
  const { data: session, update: updateSession } = useSession();
  const [state, setState] = useState<PaymentState>("idle");
  const [error, setError] = useState<string | null>(null);
  const scriptLoaded = useRef(false);

  const loadScript = (): Promise<void> =>
    new Promise((resolve, reject) => {
      if (scriptLoaded.current || (window as any).Razorpay) {
        scriptLoaded.current = true;
        resolve();
        return;
      }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      script.onload = () => { scriptLoaded.current = true; resolve(); };
      script.onerror = () => reject(new Error("Failed to load Razorpay script"));
      document.head.appendChild(script);
    });

  const openCheckout = useCallback(async () => {
    const user = session?.user as any;
    if (!user) return;

    setState("loading");
    setError(null);

    try {
      // 1. Create order
      const orderRes = await fetch("/api/payments/razorpay/order", { method: "POST" });
      const orderData = await orderRes.json();
      if (!orderRes.ok) {
        throw new Error(orderData.error || `Order creation failed (HTTP ${orderRes.status})`);
      }
      if (!orderData.keyId) {
        throw new Error("RAZORPAY_KEY_ID is not set on the server (Netlify env vars).");
      }

      // 2. Load Razorpay SDK
      await loadScript();

      // 3. Open checkout
      setState("processing");
      await new Promise<void>((resolve, reject) => {
        const rzp = new (window as any).Razorpay({
          key: orderData.keyId,
          amount: orderData.amount,
          currency: orderData.currency,
          order_id: orderData.orderId,
          name: "S.A.N.K.A.L.P.",
          description: "Pro Plan — Unlock premium features",
          image: "/logo.png",
          prefill: {
            name: user.name || "",
            email: user.email || "",
          },
          theme: { color: "#7c3aed" },
          handler: async (response: any) => {
            try {
              // 4. Verify payment
              const verifyRes = await fetch("/api/payments/razorpay/verify", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  razorpay_order_id:   response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature:  response.razorpay_signature,
                }),
              });
              const verifyData = await verifyRes.json();
              if (!verifyRes.ok) throw new Error(verifyData.error || "Verification failed");

              // 5. Refresh session so isPro propagates
              await updateSession();
              setState("success");
              resolve();
            } catch (err: any) {
              setState("error");
              setError(err.message);
              reject(err);
            }
          },
          modal: {
            ondismiss: () => {
              if (state !== "success") {
                setState("idle");
                resolve();
              }
            },
          },
        });
        rzp.on("payment.failed", (response: any) => {
          setState("error");
          setError(response.error?.description || "Payment failed");
          reject(new Error(response.error?.description));
        });
        rzp.open();
      });
    } catch (err: any) {
      const msg = err.message || "Something went wrong";
      setState("error");
      setError(msg);
      // Surface the failure so it is never silent
      console.error("[Razorpay]", err);
      if (typeof window !== "undefined") alert(`Payment could not start:\n${msg}`);
    }
  }, [session, updateSession, state]);

  return { openCheckout, state, error, isLoading: state === "loading" || state === "processing" };
}
