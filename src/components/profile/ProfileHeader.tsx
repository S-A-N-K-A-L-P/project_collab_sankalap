"use client";

import Image from "next/image";
import { Camera, Edit2, Hexagon, MapPin, Calendar, Link as LinkIcon } from "lucide-react";
import ConnectButton from "./ConnectButton";
import { formatIsoYear } from "@/lib/hydration-safe-date";

interface ProfileHeaderProps {
  user: any;
  isOwnProfile: boolean;
  isConnected: boolean;
}

export default function ProfileHeader({ user, isOwnProfile, isConnected }: ProfileHeaderProps) {
  const joinedYear = formatIsoYear(user?.createdAt, "unknown-year");

  return (
    <div className="w-full bg-[#121214] rounded-2xl border border-[#1f1f23] overflow-hidden shadow-sm">
      {/* Banner */}
      <div className="h-40 bg-[#17171a] relative border-b border-[#1f1f23]">
        <div className="absolute inset-0 bg-[#6366f1]/5 opacity-10" />
      </div>

      {/* Info Area */}
      <div className="px-8 pb-8 relative">
        <div className="flex justify-between items-start">
          <div className="relative -mt-16 mb-6">
            <div className="w-32 h-32 rounded-2xl border-4 border-[#0b0b0c] bg-[#121214] overflow-hidden relative shadow-lg">
              {user.avatar ? (
                <Image src={user.avatar} alt={user.name} fill className="object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-4xl font-black text-[#6366f1] italic uppercase">
                  {user.name?.[0]}
                </div>
              )}
            </div>
          </div>
          <div className="pt-6 flex gap-3">
            {isOwnProfile ? (
              <button className="flex items-center gap-2 px-6 py-2.5 bg-[#6366f1] hover:bg-[#4f46e5] text-white rounded-xl text-[12px] font-bold uppercase tracking-tight transition-all active:scale-95 shadow-lg shadow-[#6366f1]/10">
                <Edit2 className="w-4 h-4" /> Edit Profile
              </button>
            ) : (
                <ConnectButton targetId={user._id} initialIsConnected={isConnected} />
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-[#e5e7eb] tracking-tight italic uppercase">{user.name}</h1>
              <Hexagon className="w-5 h-5 text-[#6366f1] fill-current opacity-20" />
            </div>
            <p className="text-[#6366f1] font-mono font-bold text-[11px] uppercase tracking-widest mt-1">
              {user.role?.replace('_', ' ') || "unverified node"} <span className="text-[#1f1f23] mx-2">|</span> {user.universityName}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-y-3 gap-x-6 text-[10px] font-bold text-[#9ca3af] uppercase tracking-[0.15em] font-mono">
            {user.location && (
              <div className="flex items-center gap-1.5 cursor-default">
                <MapPin className="w-3.5 h-3.5 text-[#1f1f23]" /> {user.location}
              </div>
            )}
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-[#1f1f23]" /> Synchronization since {joinedYear}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
