"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import type { IOrgMemberPopulated } from "@/types/org";
import { ORG_ROLE_COLORS, ORG_ROLE_LABELS } from "@/lib/org-permissions";

interface MemberGridProps {
  members:    IOrgMemberPopulated[];
  maxVisible?: number;
  className?:  string;
}

export default function MemberGrid({ members, maxVisible = 12, className = "" }: MemberGridProps) {
  const [showAll, setShowAll] = useState(false);
  const visible = showAll ? members : members.slice(0, maxVisible);

  return (
    <div className={className}>
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
        {visible.map((m: any, i: number) => {
          const user = m.userId || {};
          const initials = (user.name || "?").split(" ").map((w: string) => w[0]).slice(0, 2).join("").toUpperCase();
          const roleLabel = ORG_ROLE_LABELS[m.role as keyof typeof ORG_ROLE_LABELS] || m.role;
          const roleColor = ORG_ROLE_COLORS[m.role as keyof typeof ORG_ROLE_COLORS] || "bg-white/10 text-white/60";

          return (
            <motion.div
              key={m._id || i}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.03 }}
              className="group flex flex-col items-center gap-2 p-3 rounded-xl bg-muted dark:bg-white/5 border border-border dark:border-white/8 hover:border-primary dark:hover:border-white/20 hover:bg-muted-strong dark:hover:bg-white/10 transition-all cursor-pointer"
            >
              <div className="relative">
                <div className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center text-sm font-bold bg-gradient-to-br from-primary to-primary/60 text-primary-foreground dark:from-indigo-500 dark:to-purple-600 dark:text-white">
                  {user.avatar
                    ? <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                    : initials
                  }
                </div>
                {/* Role dot */}
                {(m.role === "owner" || m.role === "admin") && (
                  <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-card dark:border-black ${
                    m.role === "owner" ? "bg-warning dark:bg-yellow-400" : "bg-orange-500 dark:bg-orange-400"
                  }`} />
                )}
              </div>
              <div className="w-full text-center">
                <p className="text-xs font-medium text-foreground dark:text-white/80 truncate">{user.name || "Member"}</p>
                <span className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-semibold mt-0.5 ${roleColor.replace("bg-white/10 text-white/60", "bg-muted-strong dark:bg-white/10 text-muted-foreground dark:text-white/60")}`}>
                  {roleLabel}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {members.length > maxVisible && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="mt-4 w-full py-2 rounded-xl border border-border dark:border-white/10 text-xs text-muted-foreground dark:text-white/50 hover:text-foreground dark:hover:text-white/80 hover:border-border dark:hover:border-white/20 transition-all"
        >
          {showAll ? "Show less" : `Show ${members.length - maxVisible} more members`}
        </button>
      )}
    </div>
  );
}
