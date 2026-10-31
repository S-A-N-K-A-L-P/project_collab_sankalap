import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import MadhyamLanding from "@/components/landing/MadhyamLanding";

export const metadata: Metadata = {
  title: "Madhyam AI — From developer intent to intelligent execution",
  description:
    "Madhyam AI transforms natural-language engineering proposals into validated, assignable and trackable development workflows — with GitHub PR orchestration, scheduling and approvals.",
};

export default async function Home() {
  const session = await getServerSession(authOptions);

  if (session) {
    redirect("/feed");
  }

  return <MadhyamLanding />;
}
