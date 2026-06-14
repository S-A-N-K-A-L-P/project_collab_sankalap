import dbConnect from "@/lib/mongodb";
import Proposal from "@/models/Proposal";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import MyProposalsClient from "./MyProposalsClient";

export const dynamic = "force-dynamic";

export default async function MyIdeasPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  await dbConnect();

  const userId = (session.user as any).id;
  const rawProposals = await Proposal.find({ createdBy: userId })
    .populate("createdBy", "name avatar role")
    .sort({ createdAt: -1 })
    .lean();

  const proposals = JSON.parse(JSON.stringify(rawProposals));

  return <MyProposalsClient proposals={proposals} />;
}
