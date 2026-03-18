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

  const session = await getServerSession(authOptions);
  const isOwnProfile = session?.user?.email === user.email;

  const proposals = await Proposal.find({ createdBy: id })
    .populate("createdBy", "name avatar role")
    .sort({ createdAt: -1 })
    .lean();

  return (
    <div className="max-w-5xl mx-auto space-y-8 p-4 md:p-8">
      <ProfileCard user={user as any} isOwnProfile={isOwnProfile} />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
            <ProposalFeed proposals={proposals} title="Recent Activity" />
        </div>
        
        <div className="space-y-6">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
                <h3 className="font-bold text-slate-900 dark:text-white mb-4">Skills & Expertise</h3>
                <div className="flex flex-wrap gap-2">
                    {(user as any).skills?.length > 0 ? (user as any).skills.map((skill: string) => (
                        <span key={skill} className="px-3 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-full text-xs font-bold">
                            {skill}
                        </span>
                    )) : (
                        <p className="text-sm text-slate-400 italic">No skills added yet.</p>
                    )}
                </div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
                <h3 className="font-bold text-slate-900 dark:text-white mb-4">Engagement Stats</h3>
                <div className="space-y-4">
                    <div className="flex justify-between items-center text-sm font-medium">
                        <span className="text-slate-500">Total Proposals</span>
                        <span className="text-slate-900 dark:text-white font-bold">{proposals.length}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm font-medium">
                        <span className="text-slate-500">Avg. Engagement</span>
                        <span className="text-slate-900 dark:text-white font-bold">128</span>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}
