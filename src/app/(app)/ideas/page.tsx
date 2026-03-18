import dbConnect from "@/lib/mongodb";
import Proposal from "@/models/Proposal";
import ProposalFeed from "@/components/feed/ProposalFeed";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { Lightbulb } from "lucide-react";

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

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="bg-[#121214] p-8 rounded-2xl border border-[#1f1f23] shadow-sm">
        <h1 className="text-3xl font-bold tracking-tight text-[#e5e7eb]">My Protocols</h1>
        <p className="text-[#9ca3af] text-[13px] font-medium mt-2 leading-relaxed">Manage your active network proposals and internal protocol contributions.</p>
      </div>

      <div className="space-y-6">
        <div className="flex items-center gap-2.5 px-1">
          <Lightbulb className="w-4 h-4 text-[#6366f1]" />
          <h2 className="text-[11px] font-bold uppercase tracking-[0.15em] text-[#9ca3af] font-mono">Active Local Signals</h2>
        </div>
        <ProposalFeed proposals={proposals} />
      </div>
    </div>
  );
}
