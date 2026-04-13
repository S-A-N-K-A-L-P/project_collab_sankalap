"use client";

import { motion } from "framer-motion";
import { MapPin, Link as LinkIcon, Calendar, Camera, Edit2, Hexagon, Zap } from "lucide-react";
import Image from "next/image";
import ConnectButton from "./ConnectButton";

interface ProfileCardProps {
  user: {
    _id: string;
    name: string;
    role: string;
    universityName: string;
    avatar?: string;
    universityLogo?: string;
    bio?: string;
    skills?: string[];
    location?: string;
    createdAt?: string;
    proposalsCount?: number;
    followersCount?: number;
    followingCount?: number;
    isConnected?: boolean;
  };
  isOwnProfile?: boolean;
}

export default function ProfileCard({ user, isOwnProfile }: ProfileCardProps) {
  const joinedDate = user.createdAt ? new Date(user.createdAt) : null;
  const joinedYear = joinedDate && !Number.isNaN(joinedDate.getTime()) ? String(joinedDate.getUTCFullYear()) : "2026";

  return (
    <div className="w-full bg-surface rounded-2xl border border-border-subtle overflow-hidden shadow-sm">
      <div className="h-32 md:h-40 bg-surface-alt relative overflow-hidden border-b border-border-subtle">
        <div className="absolute inset-0 bg-accent/5 opacity-10" />
        {isOwnProfile && (
          <button className="absolute top-4 right-4 p-2 bg-surface/80 hover:bg-surface rounded-full text-muted hover:text-foreground transition-all border border-border-subtle">
            <Camera className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="px-8 pb-8 relative">
        <div className="flex justify-between items-start">
          <div className="relative -mt-10 mb-6">
            <div className="w-24 h-24 rounded-2xl border-4 border-background bg-surface overflow-hidden relative shadow-md">
              {user.avatar ? (
                <Image src={user.avatar} alt={user.name} fill className="object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-2xl font-black text-accent italic uppercase">
                  {user.name?.[0]}
                </div>
              )}
            </div>
          </div>
          <div className="pt-6 flex gap-3">
            {isOwnProfile ? (
              <button className="flex items-center gap-2 px-5 py-2.5 bg-accent hover:bg-[#4f46e5] text-white rounded-xl text-[11px] font-bold uppercase tracking-tight transition-all active:scale-95 shadow-[0_0_18px_var(--accent-glow)]">
                <Edit2 className="w-3.5 h-3.5" /> Edit Profile
              </button>
            ) : (
              <ConnectButton targetId={user._id} initialIsConnected={!!user.isConnected} />
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-4">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-foreground tracking-tight">{user.name}</h1>
                <Hexagon className="w-4 h-4 text-accent" />
              </div>
              <p className="text-accent font-mono font-bold text-[10px] uppercase tracking-widest mt-1 leading-none">
                {(user.role || "user").replace('_', ' ')} <span className="text-border-subtle mx-2">|</span> {user.universityName}
              </p>
            </div>

            {user.bio ? (
              <p className="text-muted text-[13px] leading-relaxed font-medium max-w-2xl">{user.bio}</p>
            ) : (
              <p className="text-muted text-[10px] italic font-mono uppercase tracking-widest">No telemetry broadcasted yet.</p>
            )}

            <div className="flex flex-wrap items-center gap-y-3 gap-x-6 text-[10px] font-bold text-muted uppercase tracking-wider font-mono pt-2">
              {user.location && (
                <div className="flex items-center gap-1.5 cursor-default">
                  <MapPin className="w-3.5 h-3.5 text-border-subtle" /> {user.location}
                </div>
              )}
              <div className="flex items-center gap-1.5 text-accent/80 cursor-pointer hover:text-accent hover:underline">
                <LinkIcon className="w-3.5 h-3.5" /> {user.proposalsCount || 0} Signals
              </div>
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-border-subtle" /> Joined {joinedYear}
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 space-y-4">
            <div className="flex items-center justify-between p-5 bg-surface-alt rounded-2xl border border-border-subtle shadow-sm">
              <div className="text-center flex-1">
                <p className="text-[9px] font-black text-muted uppercase tracking-widest mb-1.5 font-mono">Nodes</p>
                <p className="text-xl font-bold text-foreground leading-none">{user.followersCount || 0}</p>
              </div>
              <div className="w-px h-10 bg-border-subtle mx-2" />
              <div className="text-center flex-1">
                <p className="text-[9px] font-black text-muted uppercase tracking-widest mb-1.5 font-mono">Syncs</p>
                <p className="text-xl font-bold text-foreground leading-none">{user.followingCount || 0}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-surface rounded-2xl border border-border-subtle hover:border-accent/30 transition-all cursor-default group">
              <div className="w-8 h-8 bg-surface-alt border border-border-subtle rounded-lg flex items-center justify-center p-2 text-[10px] font-bold text-muted uppercase">
                <Zap className="w-4 h-4 text-border-subtle" />
              </div>
              <p className="text-[11px] font-bold text-foreground leading-tight uppercase tracking-tight group-hover:text-accent transition-colors">
                {user.universityName}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
