import dbConnect from "@/lib/mongodb";
import Activity from "@/models/Activity";
import User from "@/models/User"; // Explicitly import for populate
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { Bell, UserPlus, ArrowBigUp, Projector, MessageCircle, Zap } from "lucide-react";
import Link from "next/link";

export default async function NotificationsPage() {
  const session = await getServerSession(authOptions);
  if (!session) return <div>Unauthorized</div>;

  await dbConnect();
  const userId = (session.user as any).id;

  // Fetch activities meant for the user or global relevant signals
  // For now, let's fetch global signals excluding the user's own actions
  const activitiesItems = await Activity.find({ actorId: { $ne: userId } })
    .populate({
      path: "actorId",
      model: User,
      select: "name avatar role"
    })
    .sort({ createdAt: -1 })
    .limit(20)
    .lean({ strictPopulate: false });

  const activities = JSON.parse(JSON.stringify(activitiesItems));

  const getIcon = (type: string) => {
    switch(type) {
      case 'FOLLOW': return <UserPlus className="w-4 h-4 text-[#6366f1]" />;
      case 'VOTE': return <ArrowBigUp className="w-4 h-4 text-orange-500" />;
      case 'JOIN': return <Projector className="w-4 h-4 text-emerald-500" />;
      case 'COMMENT': return <MessageCircle className="w-4 h-4 text-blue-500" />;
      default: return <Bell className="w-4 h-4 text-[#9ca3af]" />;
    }
  };

  const getMessage = (activity: any) => {
    const actorName = activity.actorId?.name || "System Agent";
    switch(activity.type) {
      case 'FOLLOW': return (
        <><span className="font-bold text-[#e5e7eb]">{actorName}</span> synchronized with your node</>
      );
      case 'VOTE': return (
        <><span className="font-bold text-[#e5e7eb]">{actorName}</span> endorsed protocol <span className="text-[#6366f1]">{activity.metadata?.title}</span></>
      );
      case 'JOIN': return (
        <><span className="font-bold text-[#e5e7eb]">{actorName}</span> requested authorization for <span className="text-[#6366f1]">{activity.metadata?.title}</span></>
      );
      case 'CREATE_PROPOSAL': return (
        <><span className="font-bold text-[#e5e7eb]">{actorName}</span> initialized new protocol <span className="text-white">{activity.metadata?.title}</span></>
      );
      default: return `${actorName} performed a system action`;
    }
  };

  const formatDate = (value: string) => {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? "unknown-date" : date.toISOString().split("T")[0];
  };

  const formatTime = (value: string) => {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? "--:--" : date.toISOString().slice(11, 16);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="bg-[#121214] p-8 rounded-2xl border border-[#1f1f23] shadow-sm">
        <h1 className="text-3xl font-bold tracking-tight text-[#e5e7eb] italic uppercase">Internal Logs</h1>
        <p className="text-[#9ca3af] text-[13px] font-medium mt-2 leading-relaxed">Network packet tracking and signal interception across the collective layer.</p>
      </div>

      <div className="bg-[#121214] border border-[#1f1f23] rounded-2xl overflow-hidden divide-y divide-[#1f1f23]">
        {activities.length === 0 ? (
          <div className="p-12 text-center text-[#1f1f23] font-mono text-[11px] uppercase tracking-widest font-black">
            No incoming signals detected.
          </div>
        ) : (
          activities.map((activity: any) => (
            <div key={activity._id.toString()} className="p-5 flex items-start gap-5 hover:bg-white/[0.01] transition-all group border-l-2 border-transparent hover:border-[#6366f1]/30">
              <div className="mt-1 w-9 h-9 rounded-xl bg-[#17171a] border border-[#1f1f23] flex items-center justify-center shadow-sm">
                {getIcon(activity.type)}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-[13px] text-[#9ca3af] leading-relaxed tracking-tight font-medium">
                    {getMessage(activity)}
                  </p>
                </div>
                <div className="flex items-center gap-3 mt-1.5 font-mono text-[9px] font-bold uppercase tracking-widest text-[#1f1f23]">
                  <span>{formatDate(activity.createdAt)}</span>
                  <div className="w-1 h-1 rounded-full bg-[#1f1f23]" />
                  <span>{formatTime(activity.createdAt)}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
