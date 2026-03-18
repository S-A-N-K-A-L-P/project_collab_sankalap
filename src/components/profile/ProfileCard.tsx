"use client";

import { motion } from "framer-motion";
import { MapPin, Link as LinkIcon, Calendar, Camera, Edit2, Hexagon } from "lucide-react";
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
    <div className="w-full bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
      {/* Banner */}
      <div className="h-32 md:h-48 bg-gradient-to-r from-blue-600 to-indigo-700 relative">
        {isOwnProfile && (
          <button className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-full text-white transition-all">
            <Camera className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Profile Info */}
      <div className="px-6 pb-6 relative">
        <div className="flex justify-between items-start">
          <div className="relative -mt-16 mb-4">
            <div className="w-32 h-32 rounded-2xl border-4 border-white dark:border-slate-900 bg-slate-100 dark:bg-slate-800 overflow-hidden relative shadow-lg">
              {user.avatar ? (
                <Image src={user.avatar} alt={user.name} fill className="object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-blue-600">
                  {user.name[0]}
                </div>
              )}
            </div>
          </div>
          <div className="pt-4 flex gap-2">
            {isOwnProfile && (
              <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-full text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">
                <Edit2 className="w-4 h-4" /> Edit Profile
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-4">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white capitalize">{user.name}</h1>
                <Hexagon className="w-5 h-5 text-blue-500 fill-blue-500/20" />
              </div>
              <p className="text-slate-600 dark:text-slate-400 font-medium text-sm">
                {(user.role || "user").replace('_', ' ').toUpperCase()} at {user.universityName}
              </p>
            </div>

            {user.bio && (
              <p className="text-slate-700 dark:text-slate-300 max-w-2xl text-sm leading-relaxed">{user.bio}</p>
            )}

            <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-tight">
              {user.location && (
                <div className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-blue-500" /> {user.location}
                </div>
              )}
              <div className="flex items-center gap-1 text-blue-600 cursor-pointer hover:underline">
                <LinkIcon className="w-3.5 h-3.5" /> {user.proposalsCount || 0} Proposals
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" /> Joined {user.createdAt ? new Date(user.createdAt).toLocaleDateString(undefined, { month: 'long', year: 'numeric' }) : "Recently"}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800/50">
              <div className="w-10 h-10 bg-white dark:bg-slate-900 rounded-lg flex items-center justify-center p-2 shadow-sm text-xs font-black text-slate-400">
                 UNI
              </div>
              <p className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                {user.universityName}
              </p>
            </div>

            <div className="flex items-center justify-between p-4 bg-blue-50/50 dark:bg-blue-900/10 rounded-2xl border border-blue-100/50 dark:border-blue-800/50">
                <div className="text-center flex-1">
                    <p className="text-[9px] font-mono font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Followers</p>
                    <p className="text-lg font-black text-slate-900 dark:text-white leading-none">{user.followersCount || 0}</p>
                </div>
                <div className="w-px h-8 bg-slate-200 dark:bg-slate-800 mx-2" />
                <div className="text-center flex-1">
                    <p className="text-[9px] font-mono font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Following</p>
                    <p className="text-lg font-black text-slate-900 dark:text-white leading-none">{user.followingCount || 0}</p>
                </div>
            </div>
            
            {!isOwnProfile && (
                <ConnectButton targetId={user._id} initialIsConnected={!!user.isConnected} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
