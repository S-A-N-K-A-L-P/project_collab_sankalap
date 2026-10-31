"use client";

import Image from "next/image";
import Link from "next/link";
import { Edit2, MapPin, Calendar, GraduationCap, ShieldCheck } from "lucide-react";
import ConnectButton from "./ConnectButton";
import { formatIsoYear } from "@/lib/hydration-safe-date";

interface ProfileHeaderProps {
  user: any;
  isOwnProfile: boolean;
  isConnected: boolean;
}

export default function ProfileHeader({ user, isOwnProfile, isConnected }: ProfileHeaderProps) {
  const joinedYear = formatIsoYear(user?.createdAt, "2025");
  const roleDisplay = (user.role || "Member").replace(/_/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase());

  return (
    <div className="w-full saas-card overflow-hidden">
      {/* Subtle Lavender & Indigo SaaS Banner */}
      <div
        className="h-32 sm:h-36 relative border-b border-border overflow-hidden"
        style={{
          background: "linear-gradient(125deg, #EEECFF 0%, rgba(154, 138, 239, 0.28) 50%, rgba(98, 87, 232, 0.18) 100%)",
        }}
      >
        <div
          className="absolute -right-12 -top-12 w-56 h-56 rounded-full pointer-events-none"
          style={{
            background: "radial-gradient(circle, rgba(98, 87, 232, 0.18) 0%, transparent 70%)",
          }}
        />
      </div>

      {/* Info Area */}
      <div className="px-6 sm:px-8 pb-6 relative">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4 -mt-12 mb-4">
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl border-4 border-card bg-primary-light overflow-hidden relative shadow-md shrink-0">
            {user.avatar ? (
              <Image src={user.avatar} alt={user.name} fill className="object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-3xl font-bold text-primary uppercase">
                {user.name?.[0] || "U"}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2.5 self-start sm:self-end">
            {isOwnProfile ? (
              <Link
                href="/settings"
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-xl text-xs font-semibold transition-all shadow-[0_2px_10px_-2px_rgba(98,87,232,0.4)]"
              >
                <Edit2 className="w-3.5 h-3.5" /> Edit Profile
              </Link>
            ) : (
              <ConnectButton targetId={user._id} initialIsConnected={isConnected} />
            )}
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">{user.name}</h1>
              <span className="pill-primary text-[11px] font-semibold px-2.5 py-0.5 rounded-full inline-flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                {roleDisplay}
              </span>
            </div>

            {user.bio && (
              <p className="text-sm text-muted mt-1.5 max-w-2xl leading-relaxed">
                {user.bio}
              </p>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-y-2 gap-x-5 text-xs text-muted pt-1">
            {user.universityName && (
              <div className="flex items-center gap-1.5">
                <GraduationCap className="w-3.5 h-3.5 text-primary" />
                <span>{user.universityName}</span>
              </div>
            )}
            {user.location && (
              <div className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-primary" />
                <span>{user.location}</span>
              </div>
            )}
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-primary" />
              <span>Joined {joinedYear}</span>
            </div>
          </div>

          {Array.isArray(user.skills) && user.skills.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-2">
              {user.skills.slice(0, 8).map((skill: string) => (
                <span key={skill} className="pill-info text-[11px] font-medium px-2.5 py-0.5 rounded-full">
                  {skill}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
