import dbConnect from "@/lib/mongodb";
import Proposal from "@/models/Proposal";
import ProposalFeed from "@/components/feed/ProposalFeed";
import FeedActions from "./FeedActions"; 
import LiveActivityStream from "@/components/feed/LiveActivityStream";
import BuildersOnline from "@/components/feed/BuildersOnline";
import TopBuildersLeaderboard from "@/components/feed/TopBuildersLeaderboard";

export default async function ProposalsPage() {
  await dbConnect();

  const proposals = await Proposal.find({})
    .populate("createdBy", "name avatar role")
    .populate("contributors", "name avatar")
    .sort({ createdAt: -1 })
    .lean();

  return (
    <div className="space-y-8">
        
        {/* TOP BENTO ROW: Branding & Key Action */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8 bg-slate-900 p-8 rounded-[2.5rem] border border-slate-800 shadow-2xl relative overflow-hidden flex flex-col justify-center min-h-[220px]">
                <div className="relative z-10 space-y-3">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="flex h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
                        <span className="text-[10px] font-mono font-black text-blue-400 uppercase tracking-[0.3em]">Protocol Active</span>
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-white uppercase italic">
                        THE <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">PIXEL</span> ARCHIVE
                    </h1>
                    <p className="text-slate-400 font-medium text-sm md:text-base max-w-lg leading-relaxed opacity-80">
                        Synchronizing community vision with architectural implementation. Explore the latest terminal ideas.
                    </p>
                </div>
                <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-600/20 rounded-full blur-[120px]" />
                <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />
            </div>

            <div className="lg:col-span-4 bg-gradient-to-br from-blue-600 to-indigo-700 p-8 rounded-[2.5rem] shadow-xl shadow-blue-500/20 flex flex-col items-center justify-center text-center group relative overflow-hidden">
                <div className="relative z-10">
                    <h3 className="text-white text-2xl font-black mb-3 uppercase tracking-tighter group-hover:scale-105 transition-transform italic">Broadcast</h3>
                    <p className="text-blue-100 text-xs mb-8 font-medium leading-relaxed opacity-80">Initialize a new project proposal and recruit contributors from the network.</p>
                    <div className="w-full">
                        <FeedActions />
                    </div>
                </div>
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            </div>
        </div>

        {/* MAIN BENTO GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* LEFT COLUMN: Main Feed */}
            <div className="lg:col-span-8 space-y-8">
                <div className="flex items-center justify-between px-4 mb-2">
                    <div className="flex items-center gap-3">
                        <div className="w-1 h-4 bg-blue-500 rounded-full" />
                        <h2 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 font-mono">Streamed Packets</h2>
                    </div>
                    <div className="flex items-center gap-6 text-[10px] font-mono font-black text-slate-500">
                        <span className="hover:text-blue-500 cursor-pointer text-blue-500 underline underline-offset-4 decoration-2 tracking-widest">RECENT</span>
                        <span className="hover:text-blue-500 cursor-pointer tracking-widest opacity-40">TRENDING</span>
                        <span className="hover:text-blue-500 cursor-pointer tracking-widest opacity-40">ARCHIVE</span>
                    </div>
                </div>
                <ProposalFeed proposals={proposals as any[]} />
            </div>

            {/* RIGHT COLUMN: Intelligence Hub */}
            <aside className="lg:col-span-4 space-y-8 lg:sticky lg:top-28">
                
                {/* System Activity */}
                <div className="bg-white dark:bg-slate-900/50 p-7 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm backdrop-blur-xl cyber-border">
                    <LiveActivityStream />
                </div>

                {/* Network Nodes (Builders) */}
                <div className="bg-white dark:bg-slate-900/50 p-7 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm backdrop-blur-xl cyber-border">
                    <BuildersOnline />
                </div>

                {/* Leaderboard */}
                <div className="bg-white dark:bg-slate-900/50 p-7 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm backdrop-blur-xl cyber-border">
                    <TopBuildersLeaderboard />
                </div>

                {/* Footer / System Info */}
                <div className="px-6 text-[9px] font-mono text-slate-400 uppercase flex justify-between tracking-widest opacity-40 font-bold">
                    <span>© 2026 PIXEL.OS</span>
                    <span className="flex items-center gap-2">
                        <span className="w-1 h-1 rounded-full bg-green-500" />
                        V.2.4.9-STABLE
                    </span>
                </div>
            </aside>
        </div>
    </div>
  );
}
