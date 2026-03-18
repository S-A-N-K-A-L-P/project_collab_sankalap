import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import { Search, MapPin, Zap } from "lucide-react";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import ConnectButton from "@/components/profile/ConnectButton";

export default async function DiscoverPage() {
  await dbConnect();
  const session = await getServerSession(authOptions);
  
  // Fetch current user's following list for connection status
  const currentUser = session?.user?.email 
    ? await User.findOne({ email: session.user.email }).select("following").lean()
    : null;

  // Fetch all users except the current one
  const developers = await User.find({
    email: { $ne: session?.user?.email }
  })
  .select("name role universityName avatar bio skills location followers following")
  .limit(20)
  .lean();

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tighter text-slate-900 dark:text-white uppercase italic">Network Explorer</h1>
          <p className="text-slate-500 font-medium text-sm mt-1">Discover and connect with developers across the collective.</p>
        </div>
        <div className="px-4 py-2 bg-blue-600 rounded-2xl flex items-center gap-2 shadow-lg shadow-blue-500/20">
          <Zap className="w-4 h-4 text-white fill-current" />
          <span className="text-xs font-black text-white uppercase tracking-widest">Global Standings</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {developers.map((dev: any) => {
          const isFollowing = currentUser?.following?.some((id: any) => id.toString() === dev._id.toString());
          
          return (
            <div key={dev._id.toString()} className="bg-white dark:bg-slate-900/50 rounded-[2rem] border border-slate-200 dark:border-slate-800 p-6 hover:border-blue-500/30 transition-all group flex flex-col h-full shadow-sm">
              <div className="flex items-start justify-between mb-4">
                <div className="w-16 h-16 rounded-2xl bg-blue-100 dark:bg-blue-900/30 border-2 border-white dark:border-slate-800 overflow-hidden flex items-center justify-center text-2xl font-bold text-blue-600 shadow-sm relative">
                  {dev.avatar ? (
                    <img src={dev.avatar} alt={dev.name} className="w-full h-full object-cover" />
                  ) : (dev.name?.[0]?.toUpperCase() || "U")}
                </div>
                <ConnectButton targetId={dev._id.toString()} initialIsConnected={!!isFollowing} variant="icon" />
              </div>

              <div className="mb-4">
                <Link href={`/dashboard/profile/${dev._id}`} className="hover:text-blue-500 transition-colors">
                  <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter italic">{dev.name}</h3>
                </Link>
                <p className="text-[10px] font-mono font-black text-blue-600 dark:text-blue-400 uppercase tracking-[0.2em] mb-2">{(dev.role || "user").replace('_', ' ')}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 font-medium leading-relaxed">{dev.bio || "No telemetry broadcasted yet."}</p>
              </div>

              <div className="mt-auto pt-4 border-t border-slate-50 dark:border-slate-800 flex flex-wrap gap-1.5">
                {dev.skills?.slice(0, 3).map((skill: string) => (
                  <span key={skill} className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-lg text-[9px] font-black uppercase tracking-tight">
                    {skill}
                  </span>
                ))}
                {dev.skills?.length > 3 && <span className="text-[9px] text-slate-400 font-bold ml-1">+{dev.skills.length - 3}</span>}
              </div>
              
              <div className="mt-4 flex items-center justify-between text-[10px] font-mono text-slate-400 uppercase tracking-widest font-bold">
                  <div className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> {dev.location || "Remote"}
                  </div>
                  <div className="text-blue-500 italic">0x{dev._id.toString().slice(-4)}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
