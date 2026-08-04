import Season from "@/models/Season";
import SeasonEnrollment from "@/models/SeasonEnrollment";
import SeasonPayment from "@/models/SeasonPayment";

export async function captureSeasonPayment(razorpayOrderId: string, razorpayPaymentId: string) {
  const payment = await SeasonPayment.findOneAndUpdate(
    { razorpayOrderId, status: { $ne: "paid" } },
    { $set: { status: "paid", razorpayPaymentId, paidAt: new Date() } },
    { new: true }
  );
  if (!payment) return SeasonPayment.findOne({ razorpayOrderId, status: "paid" });

  const enrollment = await SeasonEnrollment.findById(payment.enrollmentId);
  if (!enrollment) throw new Error("Season enrollment not found for payment");
  const firstActivation = enrollment.accessStatus !== "active";
  const snapshot = enrollment.pricingSnapshot || {};
  const paidCycleCount = Math.max(Number(enrollment.paidCycleCount || 0), Number(payment.cycleNumber || 1));
  const cycleCount = Number(snapshot.billingCycleCount || 1);
  const graceDays = Number(snapshot.gracePeriodDays || 5);
  const nextPaymentDueAt = snapshot.mode === "monthly" && paidCycleCount < cycleCount
    ? new Date(Date.now() + (30 + graceDays) * 86400000)
    : undefined;
  enrollment.set({
    status: "active",
    paymentStatus: "paid",
    accessStatus: "active",
    paidCycleCount,
    nextPaymentDueAt,
    joinedAt: enrollment.joinedAt || new Date(),
  });
  await enrollment.save();
  if (firstActivation) await Season.updateOne({ _id: payment.seasonId }, { $inc: { "stats.participantCount": 1 } });
  return payment;
}
