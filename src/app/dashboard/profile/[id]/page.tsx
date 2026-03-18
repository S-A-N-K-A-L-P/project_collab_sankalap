import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import Proposal from "@/models/Proposal";
import ProfileCard from "@/components/profile/ProfileCard";
import ProposalFeed from "@/components/feed/ProposalFeed";
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export default async function UserProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await dbConnect();

  const user = await User.findById(id).lean();
  if (!user) notFound();

  const proposals = await Proposal.find({ createdBy: id })
    .populate("createdBy", "name avatar role")
    .sort({ createdAt: -1 })
    .lean();

  const session = await getServerSession(authOptions);
  const isOwnProfile = session?.user?.email === user.email;
  
  // Check if current user follows this user
  const currentUser = session?.user?.email 
    ? await User.findOne({ email: session.user.email }).select("following").lean() 
    : null;
  const isConnected = currentUser?.following?.some((fid: any) => fid.toString() === id);

  // Enrich user with real stats
  const enrichedUser = {
    ...user,
    proposalsCount: proposals.length,
    followersCount: user.followers?.length || 0,
    followingCount: user.following?.length || 0,
    isConnected
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <ProfileCard user={enrichedUser as any} isOwnProfile={isOwnProfile} />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
            <ProposalFeed proposals={proposals} title="Recent Activity" />
        </div>
        
        <div className="space-y-6">
            <div className="bg-white dark:bg-slate-900/50 p-6 rounded-[2rem] shadow-sm border border-slate-200 dark:border-slate-800 backdrop-blur-xl">
                <h3 className="font-bold text-slate-900 dark:text-white mb-4 uppercase text-xs tracking-widest opacity-60">Expertise</h3>
                <div className="flex flex-wrap gap-2">
                    {(user as any).skills?.length > 0 ? (user as any).skills.map((skill: string) => (
                        <span key={skill} className="px-3 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-full text-[10px] font-black uppercase">
                            {skill}
                        </span>
                    )) : (
                        <p className="text-xs text-slate-400 italic font-mono">No telemetry found.</p>
                    )}
                </div>
            </div>

            <div className="bg-white dark:bg-slate-900/50 p-6 rounded-[2rem] shadow-sm border border-slate-200 dark:border-slate-800 backdrop-blur-xl">
                <h3 className="font-bold text-slate-900 dark:text-white mb-4 uppercase text-xs tracking-widest opacity-60">System Stats</h3>
                <div className="space-y-4">
                    <div className="flex justify-between items-center text-xs font-medium">
                        <span className="text-slate-500 font-mono uppercase">Proposals</span>
                        <span className="text-slate-900 dark:text-white font-black">{proposals.length}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm font-medium">
                        <span className="text-slate-500 font-mono uppercase text-xs">Auth Layer</span>
                        <span className="text-green-500 font-black text-[10px]">VERIFIED</span>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}
