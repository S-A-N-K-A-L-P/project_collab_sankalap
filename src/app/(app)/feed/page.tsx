import FeedActions from "./FeedActions"; 
import FeedContainer from "@/components/feed/FeedContainer";

export default async function ProposalsPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-10">
        {/* Create Box */}
        <FeedActions />

        {/* Dynamic Feed (Interleaved Proposals + Activity) */}
        <FeedContainer />
    </div>
  );
}
