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
  return (
    <div className="w-full bg-[#121214] rounded-2xl border border-[#1f1f23] overflow-hidden shadow-sm">
      {/* Banner - Professional Subtlety */}
      <div className="h-32 md:h-40 bg-[#17171a] relative overflow-hidden border-b border-[#1f1f23]">
        <div className="absolute inset-0 bg-[#6366f1]/5 opacity-10" />
        {isOwnProfile && (
          <button className="absolute top-4 right-4 p-2 bg-black/40 hover:bg-black/60 rounded-full text-[#9ca3af] hover:text-[#e5e7eb] transition-all border border-white/10">
            <Camera className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Profile Info */}
      <div className="px-8 pb-8 relative">
        <div className="flex justify-between items-start">
          <div className="relative -mt-10 mb-6">
            <div className="w-24 h-24 rounded-2xl border-4 border-[#0b0b0c] bg-[#121214] overflow-hidden relative shadow-md">
              {user.avatar ? (
                <Image src={user.avatar} alt={user.name} fill className="object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-2xl font-black text-[#6366f1] italic uppercase">
                  {user.name?.[0]}
                </div>
              )}
            </div>
          </div>
          <div className="pt-6 flex gap-3">
            {isOwnProfile ? (
              <button className="flex items-center gap-2 px-5 py-2.5 bg-[#6366f1] hover:bg-[#4f46e5] text-white rounded-xl text-[11px] font-bold uppercase tracking-tight transition-all shadow-sm active:scale-95">
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
                <h1 className="text-2xl font-bold text-[#e5e7eb] tracking-tight">{user.name}</h1>
                <Hexagon className="w-4 h-4 text-[#6366f1]" />
              </div>
              <p className="text-[#6366f1] font-mono font-bold text-[10px] uppercase tracking-widest mt-1 leading-none">
                {(user.role || "user").replace('_', ' ')} <span className="text-[#1f1f23] mx-2">|</span> {user.universityName}
              </p>
            </div>

            {user.bio ? (
              <p className="text-[#9ca3af] text-[13px] leading-relaxed font-medium max-w-2xl">{user.bio}</p>
            ) : (
                <p className="text-slate-700 text-[10px] italic font-mono uppercase tracking-widest">No telemetry broadcasted yet.</p>
            )}

            <div className="flex flex-wrap items-center gap-y-3 gap-x-6 text-[10px] font-bold text-[#9ca3af] uppercase tracking-wider font-mono pt-2">
              {user.location && (
                <div className="flex items-center gap-1.5 cursor-default">
                  <MapPin className="w-3.5 h-3.5 text-[#1f1f23]" /> {user.location}
                </div>
              )}
              <div className="flex items-center gap-1.5 text-[#6366f1]/80 cursor-pointer hover:text-[#6366f1] hover:underline">
                <LinkIcon className="w-3.5 h-3.5" /> {user.proposalsCount || 0} Signals
              </div>
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#1f1f23]" /> Joined {user.createdAt ? new Date(user.createdAt).toLocaleDateString(undefined, { year: 'numeric' }) : "2026"}
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 space-y-4">
            <div className="flex items-center justify-between p-5 bg-[#17171a] rounded-2xl border border-[#1f1f23] shadow-sm">
                <div className="text-center flex-1">
                    <p className="text-[9px] font-black text-[#9ca3af] uppercase tracking-widest mb-1.5 font-mono">Nodes</p>
                    <p className="text-xl font-bold text-[#e5e7eb] leading-none">{user.followersCount || 0}</p>
                </div>
                <div className="w-px h-10 bg-[#1f1f23] mx-2" />
                <div className="text-center flex-1">
                    <p className="text-[9px] font-black text-[#9ca3af] uppercase tracking-widest mb-1.5 font-mono">Syncs</p>
                    <p className="text-xl font-bold text-[#e5e7eb] leading-none">{user.followingCount || 0}</p>
                </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-[#121214] rounded-2xl border border-[#1f1f23] hover:border-[#6366f1]/30 transition-all cursor-default group">
                <div className="w-8 h-8 bg-[#17171a] border border-[#1f1f23] rounded-lg flex items-center justify-center p-2 text-[10px] font-bold text-[#9ca3af] uppercase">
                   <Zap className="w-4 h-4 text-[#1f1f23]" />
                </div>
                <p className="text-[11px] font-bold text-[#e5e7eb] leading-tight uppercase tracking-tight group-hover:text-[#6366f1] transition-colors">
                    {user.universityName}
                </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
