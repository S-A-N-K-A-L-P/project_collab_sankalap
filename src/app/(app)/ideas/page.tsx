import dbConnect from "@/lib/mongodb";
import Proposal from "@/models/Proposal";
import ProposalFeed from "@/components/feed/ProposalFeed";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

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
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Hero card — matches HTML reference border-l-8 pattern */}
      <div className="bg-card border-l-4 border-l-primary border border-border rounded-xl p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-foreground">My Proposals</h1>
        <p className="text-sm text-muted mt-1 leading-relaxed">
          Manage your submitted project proposals, track their status, and view feedback.
        </p>
        <div className="mt-4">
          <Link
            href="/ideas/create"
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg text-sm font-semibold transition-colors shadow-sm"
          >
            + New Proposal
          </Link>
        </div>
      </div>

      {/* Proposals list */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-sm font-semibold text-foreground">
            All Proposals
            <span className="ml-2 text-xs font-normal text-muted">({proposals.length})</span>
          </h2>
        </div>
        <ProposalFeed proposals={proposals} />
      </div>
    </div>
  );
}
