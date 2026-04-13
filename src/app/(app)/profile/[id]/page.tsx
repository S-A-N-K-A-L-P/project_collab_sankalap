import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import Proposal from "@/models/Proposal";
import Activity from "@/models/Activity";
import ProfileHeader from "@/components/profile/ProfileHeader";
import ProfileStatsBar from "@/components/profile/ProfileStatsBar";
import FeedList from "@/components/feed/FeedList";
import GitProfileMetrics from "@/components/profile/GitProfileMetrics";
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

type ProfileUser = {
  email?: string;
  bio?: string;
  location?: string;
  reputation?: number;
  followers?: Array<{ toString: () => string } | string>;
  following?: Array<{ toString: () => string } | string>;
};

export default async function UserProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await dbConnect();

  const user = (await User.findById(id).lean()) as ProfileUser | null;
  if (!user) notFound();

  const rawProposals = await Proposal.find({ createdBy: id })
    .populate("createdBy", "name avatar role")
    .sort({ createdAt: -1 })
    .lean();

  const rawActivities = await Activity.find({ actorId: id })
    .populate("actorId", "name avatar role")
    .sort({ createdAt: -1 })
    .limit(10)
    .lean();

  const session = await getServerSession(authOptions);
  const isOwnProfile = session?.user?.email === user.email;
  const currentUserId = (session?.user as any)?.id;

  const proposals = JSON.parse(JSON.stringify(rawProposals));
  const activities = JSON.parse(JSON.stringify(rawActivities));

  const isConnected = user.followers?.some((fid: any) => fid.toString() === currentUserId) ?? false;

  const stats = {
    followers: user.followers?.length || 0,
    following: user.following?.length || 0,
    proposals: proposals.length,
    reputation: (user as any).reputation || 0,
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      {/* LinkedIn-style Header */}
      <ProfileHeader
        user={JSON.parse(JSON.stringify(user))}
        isOwnProfile={isOwnProfile}
        isConnected={isConnected}
      />

      {/* Stats Quick-Bar */}
      <ProfileStatsBar stats={stats} />

      {/* Content Tabs (Simplified for now, using sections) */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        <div className="md:col-span-8 space-y-8">
          <section className="space-y-4">
            <div className="flex items-center gap-2.5 px-1">
              <div className="w-1 h-3 bg-[#6366f1] rounded-full" />
              <h2 className="text-[11px] font-bold uppercase tracking-[0.15em] text-[#9ca3af] font-mono">Telemetry Broadcasts</h2>
            </div>
            <FeedList items={proposals} />
          </section>

          <section className="space-y-4">
            <div className="flex items-center gap-2.5 px-1">
              <div className="w-1 h-3 bg-emerald-500 rounded-full" />
              <h2 className="text-[11px] font-bold uppercase tracking-[0.15em] text-[#9ca3af] font-mono">System Activity</h2>
            </div>
            <FeedList items={activities} />
          </section>
        </div>

        <div className="md:col-span-4 space-y-6">
          <div className="bg-surface border border-border-subtle rounded-2xl p-5 shadow-sm">
            <h3 className="text-[11px] font-bold uppercase tracking-widest text-foreground mb-4">About Node</h3>
            <p className="text-[13px] text-muted leading-relaxed font-medium">
              {user.bio || "No telemetry broadcasted yet."}
            </p>
            <div className="mt-6 pt-6 border-t border-border-subtle space-y-3">
              <div className="flex justify-between text-[11px] font-mono">
                <span className="text-muted font-bold uppercase">Identity</span>
                <span className="text-muted uppercase">Verified</span>
              </div>
              <div className="flex justify-between text-[11px] font-mono">
                <span className="text-muted font-bold uppercase">Location</span>
                <span className="text-muted uppercase">{user.location || "Private"}</span>
              </div>
            </div>
          </div>

          <GitProfileMetrics userId={id} />
        </div>
      </div>
    </div>
  );
}
