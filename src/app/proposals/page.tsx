import dbConnect from "@/lib/mongodb";
import Proposal from "@/models/Proposal";
import User from "@/models/User";
import ProposalFeed from "@/components/feed/ProposalFeed";
import CreateProposalModal from "@/components/feed/CreateProposalModal";
import FeedActions from "./FeedActions"; // Client component for modal state

export default async function ProposalsPage() {
  await dbConnect();

  const proposals = await Proposal.find({})
    .populate("createdBy", "name avatar role")
    .sort({ createdAt: -1 })
    .lean();

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Community Proposals</h1>
          <p className="text-slate-500 font-medium tracking-tight">Discover and shape the future projects of Pixel Club.</p>
        </div>
        <FeedActions />
      </div>

      <ProposalFeed proposals={proposals as any[]} />
    </div>
  );
}
