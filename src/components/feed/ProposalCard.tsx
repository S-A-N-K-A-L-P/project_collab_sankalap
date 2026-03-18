import { motion } from "framer-motion";

interface ProposalCardProps {
  proposal: {
    _id: string;
    title: string;
    description: string;
    type: "idea" | "research" | "implementation" | "collaboration";
    status: "proposal" | "active" | "disabled";
    stage: string;
    votes: number;
    techStack: string[];
    createdAt: string;
    createdBy: {
      _id: string;
      name: string;
      avatar?: string;
      role: string;
    };
    contributors: any[];
    commentsCount?: number;
    sharesCount?: number;
  };
}

const typeStyles = {
  idea: { label: "IDEA", icon: Rocket, color: "text-amber-500", bg: "bg-amber-100/50 dark:bg-amber-900/20" },
  research: { label: "RESEARCH", icon: FileText, color: "text-blue-500", bg: "bg-blue-100/50 dark:bg-blue-900/20" },
  implementation: { label: "BUILD", icon: Code, color: "text-green-500", bg: "bg-green-100/50 dark:bg-green-900/20" },
  collaboration: { label: "COLLAB", icon: UserPlus, color: "text-purple-500", bg: "bg-purple-100/50 dark:bg-purple-900/20" },
};

export default function ProposalCard({ proposal }: ProposalCardProps) {
  const { data: session } = useSession();
  const [voteCount, setVoteCount] = useState(proposal.votes);
  const [voted, setVoted] = useState<"up" | "down" | null>(null);
  const [isJoining, setIsJoining] = useState(false);
  const [hasJoined, setHasJoined] = useState(proposal.contributors?.some(c => (c._id || c) === (session?.user as any)?.id));

  const handleVote = async (type: "up" | "down") => {
    try {
      const oldVoted = voted;
      const oldVoteCount = voteCount;
      let newVoteCount = voteCount;
      let newVoted: "up" | "down" | null = type;

      if (voted === type) {
        newVoted = null;
        newVoteCount = type === "up" ? voteCount - 1 : voteCount + 1;
      } else {
        newVoteCount = voted === (type === "up" ? "down" : "up") 
          ? (type === "up" ? voteCount + 2 : voteCount - 2) 
          : (type === "up" ? voteCount + 1 : voteCount - 1);
      }

      setVoted(newVoted);
      setVoteCount(newVoteCount);

      const res = await fetch("/api/proposals/vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ proposalId: proposal._id, voteType: type }),
      });

      if (!res.ok) {
        setVoted(oldVoted);
        setVoteCount(oldVoteCount);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleJoin = async () => {
    if (!session) return;
    setIsJoining(true);
    try {
      const res = await fetch("/api/proposals/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ proposalId: proposal._id }),
      });
      if (res.ok) {
        const data = await res.json();
        setHasJoined(data.status === "joined");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsJoining(false);
    }
  };

  const style = typeStyles[proposal.type] || typeStyles.idea;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileHover={{ y: -2 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden hover:shadow-md transition-all group"
    >
      <div className="p-4 sm:p-5">
        <div className="flex justify-between items-start mb-4">
          <div className="flex gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center font-bold text-blue-600 shadow-sm overflow-hidden relative">
              {proposal.createdBy.avatar ? (
                <img src={proposal.createdBy.avatar} alt={proposal.createdBy.name} className="object-cover w-full h-full" />
              ) : (
                proposal.createdBy.name[0]
              )}
            </div>
            <div className="min-w-0">
              <h4 className="font-black text-slate-900 dark:text-white text-sm leading-none hover:text-blue-600 cursor-pointer transition-colors truncate tracking-tight">{proposal.createdBy.name}</h4>
              <p className="text-[10px] text-slate-500 font-mono mt-1 opacity-70">3H AGO • <span className={style.color}>{style.label}</span></p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className={`px-2 py-1 rounded-lg text-[9px] font-black flex items-center gap-1 ${style.bg} ${style.color} uppercase tracking-wider`}>
              <style.icon className="w-2.5 h-2.5" />
              {style.label}
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight leading-snug group-hover:text-blue-600 transition-colors">
            {proposal.title}
          </h3>
          
          <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
            {proposal.description}
          </p>

          <div className="flex flex-wrap gap-2 pt-1">
            {proposal.techStack.map(tag => (
              <span key={tag} className="px-2 py-0.5 bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 text-[10px] font-mono font-bold rounded ring-1 ring-slate-200 dark:ring-slate-700/50 uppercase">
                #{tag}
              </span>
            ))}
          </div>
        </div>

        {/* Stats Section - DENSE */}
        <div className="mt-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
                <div className="flex -space-x-1.5 overflow-hidden">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="inline-block h-6 w-6 rounded-lg ring-2 ring-white dark:ring-slate-900 bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-[8px] font-bold">
                            U{i}
                        </div>
                    ))}
                    <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-blue-50 ring-2 ring-white dark:ring-slate-900 dark:bg-blue-950 text-[8px] font-bold text-blue-600 dark:text-blue-400">
                        +{(proposal.contributors?.length || 0) + 5}
                    </div>
                </div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">
                   <span className="text-green-500 font-black">+3 JOINED TODAY</span>
                </p>
            </div>
            
            <div className="flex items-center gap-3 text-slate-400">
                <div className="flex items-center gap-1">
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span className="text-[11px] font-mono font-bold">{proposal.commentsCount || 12}</span>
                </div>
                <div className="flex items-center gap-1">
                    <Share2 className="w-3.5 h-3.5" />
                    <span className="text-[11px] font-mono font-bold">{proposal.sharesCount || 5}</span>
                </div>
            </div>
        </div>
      </div>

      <div className="flex border-t border-slate-100 dark:border-slate-800 divide-x divide-slate-100 dark:divide-slate-800">
        <button 
            onClick={() => handleVote("up")}
            className={`flex-1 flex items-center justify-center gap-2 py-3 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all font-bold text-[11px] uppercase tracking-wider ${voted === "up" ? "text-blue-600" : "text-slate-500"}`}
        >
          <motion.div whileTap={{ scale: 1.4 }}><ThumbsUp className={`w-3.5 h-3.5 ${voted === "up" ? "fill-blue-600" : ""}`} /></motion.div>
          {voteCount}
        </button>
        <button 
            onClick={handleJoin}
            disabled={isJoining}
            className={`flex-1 flex items-center justify-center gap-2 py-3 transition-all font-bold text-[11px] uppercase tracking-wider ${
                hasJoined 
                ? "bg-green-50 dark:bg-green-950/20 text-green-600" 
                : "hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500"
            }`}
        >
          {isJoining ? <Plus className="w-3.5 h-3.5 animate-spin" /> : <Rocket className={`w-3.5 h-3.5 ${hasJoined ? "fill-green-600" : ""}`} />}
          {hasJoined ? "Participating" : "Join Project"}
        </button>
        <button className="px-4 flex items-center justify-center py-3 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500 transition-all group-hover:text-blue-600">
          <ExternalLink className="w-3.5 h-3.5" />
        </button>
      </div>
    </motion.div>
  );
}
