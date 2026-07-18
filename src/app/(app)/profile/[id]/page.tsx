import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import Proposal from "@/models/Proposal";
import Activity from "@/models/Activity";
import Project from "@/models/Project";
import Contribution from "@/models/Contribution";
import ProfileHeader from "@/components/profile/ProfileHeader";
import ProfileStatsBar from "@/components/profile/ProfileStatsBar";
import FeedList from "@/components/feed/FeedList";
import GitProfileMetrics from "@/components/profile/GitProfileMetrics";
import ProfileTabs from "@/components/portfolio/ProfileTabs";
import ImpactAnalytics from "@/components/profile/ImpactAnalytics";
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

type ProfileUser = {
  email?: string;
  bio?: string;
  location?: string;
  reputation?: number;
  followers?: Array<{ toString: () => string } | string>;
  following?: Array<{ toString: () => string } | string>;
  [key: string]: any;
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

  const completedProjectsCount = await Project.countDocuments({
    $or: [{ lead: id }, { members: id }],
    status: "completed",
  });
  const approvedContributionsCount = await Contribution.countDocuments({
    userId: id,
    status: "approved",
  });
  const profileViews = (user as any).profileViews || 0;

  // increment views (fire-and-forget) — skip the owner's own visits
  if (!isOwnProfile) {
    User.updateOne({ _id: id }, { $inc: { profileViews: 1 } }).catch(() => null);
  }

  const followersCount = user.followers?.length || 0;
  const reputation = (user as any).reputation || 0;
  const impactScore =
    reputation * 10 + completedProjectsCount * 25 + followersCount * 5 + approvedContributionsCount * 15;

  const analyticsStats = {
    projectsBuilt: completedProjectsCount,
    views: profileViews,
    followers: followersCount,
    contributions: approvedContributionsCount,
    impactScore,
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

      {/* Overview / Portfolio tabs */}
      <ProfileTabs isOwnProfile={isOwnProfile} handle={(user as any).handle}>
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        <div className="md:col-span-8 space-y-8">
          <ImpactAnalytics stats={analyticsStats} />

          <section className="space-y-3">
            <h2 className="text-sm font-semibold text-foreground px-1">
              Proposals
              <span className="ml-2 text-xs font-normal text-muted">({proposals.length})</span>
            </h2>
            <FeedList items={proposals} />
          </section>

          {activities.length > 0 && (
            <section className="space-y-3">
              <h2 className="text-sm font-semibold text-foreground px-1">Recent Activity</h2>
              <FeedList items={activities} />
            </section>
          )}
        </div>

        <div className="md:col-span-4 space-y-5">
          <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-foreground mb-3">About</h3>
            <p className="text-sm text-muted leading-relaxed">
              {user.bio || "No bio added yet."}
            </p>
            {user.location && (
              <div className="mt-4 pt-4 border-t border-border">
                <div className="flex items-center gap-2 text-sm text-muted">
                  <span className="font-medium text-foreground">Location:</span>
                  <span>{user.location}</span>
                </div>
              </div>
            )}
          </div>

          <GitProfileMetrics userId={id} />
        </div>
      </div>
      </ProfileTabs>
    </div>
  );
}
