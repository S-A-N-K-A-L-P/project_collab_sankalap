"use client";

import { LayoutDashboard, ListTodo, Users, Activity, ClipboardCheck } from "lucide-react";
import { cn } from "@/lib/utils";

const TABS = [
  { id: "overview",     label: "Overview",   icon: LayoutDashboard  },
  { id: "tasks",        label: "Tasks",      icon: ListTodo         },
  { id: "contributors", label: "Team",       icon: Users            },
  { id: "activity",     label: "Activity",   icon: Activity         },
  { id: "verification", label: "Review",     icon: ClipboardCheck   },
];

export function TrackerTabs({
  activeTab,
  setActiveTab,
}: {
  activeTab: string;
  setActiveTab: (t: string) => void;
}) {
  return (
    <div className="flex items-center gap-0 border-b border-border bg-card rounded-t-lg overflow-hidden elevation-1">
      {TABS.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex items-center gap-2 px-5 py-3 text-sm font-medium relative whitespace-nowrap transition-colors",
              isActive
                ? "text-[color:var(--primary)] bg-[color:var(--primary-muted)]"
                : "text-[color:var(--muted-foreground)] hover:text-foreground hover:bg-[color:var(--muted)]"
            )}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
            {isActive && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[color:var(--primary)]" />
            )}
          </button>
        );
      })}
    </div>
  );
}
