import Link from "next/link";
import { Github, Star, Users } from "lucide-react";
import StatusBadge from "./StatusBadge";

interface ProposerCardProps {
  user: {
    _id: string;
    name: string;
    email: string;
    avatar?: string;
    role: string;
    universityName?: string;
    enrollmentNumber?: string;
    skills?: string[];
    reputation?: number;
    bio?: string;
    github?: string;
    followers?: unknown[];
    following?: unknown[];
  };
  otherProposals?: {
    _id: string;
    title: string;
    status: string;
    totalVotes: number;
  }[];
}

export default function ProposerCard({ user, otherProposals = [] }: ProposerCardProps) {
  const initials = user.name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="bg-surface border border-border-subtle rounded-2xl overflow-hidden space-y-0">
      {/* Header */}
      <div className="p-5 border-b border-border-subtle">
        <p className="text-[10px] font-mono font-bold text-muted uppercase tracking-widest mb-3">
          Proposer
        </p>
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-accent/20 flex items-center justify-center text-accent font-bold text-sm flex-shrink-0 overflow-hidden">
            {user.avatar ? (
              <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
            ) : (
              initials
            )}
          </div>
          <div className="min-w-0">
            <p className="text-[14px] font-bold text-foreground truncate">{user.name}</p>
            <p className="text-[11px] text-muted font-mono truncate">{user.email}</p>
          </div>
        </div>
        <div className="mt-3 flex items-center gap-2 flex-wrap">
          <StatusBadge value={user.role} />
          {user.universityName && (
            <span className="text-[10px] text-muted font-mono truncate">{user.universityName}</span>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="px-5 py-3 border-b border-border-subtle flex items-center gap-4">
        <div className="flex items-center gap-1.5">
          <Star className="w-3.5 h-3.5 text-yellow-400" />
          <span className="text-[12px] font-bold text-foreground">{user.reputation ?? 0}</span>
          <span className="text-[10px] text-muted font-mono">rep</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Users className="w-3.5 h-3.5 text-muted" />
          <span className="text-[12px] font-bold text-foreground">
            {(user.followers as any[])?.length ?? 0}
          </span>
          <span className="text-[10px] text-muted font-mono">followers</span>
        </div>
      </div>

      {/* Bio */}
      {user.bio && (
        <div className="px-5 py-3 border-b border-border-subtle">
          <p className="text-[12px] text-muted leading-relaxed">{user.bio}</p>
        </div>
      )}

      {/* Skills */}
      {user.skills && user.skills.length > 0 && (
        <div className="px-5 py-3 border-b border-border-subtle">
          <p className="text-[10px] font-mono font-bold text-muted uppercase tracking-widest mb-2">
            Skills
          </p>
          <div className="flex flex-wrap gap-1.5">
            {user.skills.slice(0, 8).map((s) => (
              <span
                key={s}
                className="text-[10px] font-mono px-2 py-0.5 rounded-lg bg-accent/10 text-accent"
              >
                {s}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Other proposals */}
      {otherProposals.length > 0 && (
        <div className="px-5 py-3 border-b border-border-subtle">
          <p className="text-[10px] font-mono font-bold text-muted uppercase tracking-widest mb-2">
            Other Proposals
          </p>
          <div className="space-y-2">
            {otherProposals.map((p) => (
              <Link
                key={p._id}
                href={`/admin/proposals/${p._id}`}
                className="flex items-center justify-between gap-2 hover:bg-background p-2 rounded-lg transition-colors"
              >
                <span className="text-[12px] text-foreground truncate">{p.title}</span>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <StatusBadge value={p.status} />
                  <span className="text-[10px] text-muted font-mono">{p.totalVotes}v</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="px-5 py-3 flex items-center gap-2">
        <Link
          href={`/admin/users/${user._id}`}
          className="flex-1 text-center text-[11px] font-bold uppercase tracking-wider px-3 py-2 rounded-xl bg-accent/10 text-accent hover:bg-accent/20 transition-colors"
        >
          Full Profile
        </Link>
        {user.github && (
          <a
            href={`https://github.com/${user.github}`}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-xl hover:bg-background text-muted hover:text-foreground transition-colors"
          >
            <Github className="w-4 h-4" />
          </a>
        )}
      </div>
    </div>
  );
}
