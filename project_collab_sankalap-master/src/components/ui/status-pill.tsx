"use client";

import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Circle, CircleDot, CheckCircle2, AlertCircle, Clock } from "lucide-react";

/* ============================================================================
   StatusPill — maps domain values to MudBlazor-style semantic intent.
   ----------------------------------------------------------------------------
   "Different colour at required place" — central source of truth so the same
   value ("approved", "high", "completed") looks the same everywhere.
   ========================================================================= */

type Intent =
  | "default" | "secondary" | "outline" | "destructive"
  | "success" | "info" | "warning" | "error"
  | "primary" | "neutral";

interface Mapping {
  intent: Intent;
  label?: string;
  icon?: React.ComponentType<{ className?: string }>;
}

// ─── TASK STATUS ─────────────────────────────────────────────────────────────
const TASK_STATUS: Record<string, Mapping> = {
  pending:        { intent: "neutral", label: "Backlog",     icon: Circle        },
  "in-progress":  { intent: "info",    label: "In Progress", icon: CircleDot     },
  completed:      { intent: "success", label: "Completed",   icon: CheckCircle2  },
  delayed:        { intent: "error",   label: "Delayed",     icon: AlertCircle   },
};

// ─── TASK PRIORITY ───────────────────────────────────────────────────────────
const TASK_PRIORITY: Record<string, Mapping> = {
  low:    { intent: "neutral", label: "Low"    },
  medium: { intent: "warning", label: "Medium" },
  high:   { intent: "error",   label: "High"   },
};

// ─── PROPOSAL STATUS ─────────────────────────────────────────────────────────
const PROPOSAL_STATUS: Record<string, Mapping> = {
  proposal:  { intent: "info",      label: "Proposal" },
  approved:  { intent: "success",   label: "Approved" },
  active:    { intent: "success",   label: "Active"   },
  rejected:  { intent: "error",     label: "Rejected" },
  closed:    { intent: "neutral",   label: "Closed"   },
  draft:     { intent: "warning",   label: "Draft"    },
  disabled:  { intent: "neutral",   label: "Disabled" },
};

// ─── PROPOSAL STAGE ──────────────────────────────────────────────────────────
const PROPOSAL_STAGE: Record<string, Mapping> = {
  proposal:     { intent: "info",      label: "Proposal"     },
  planning:     { intent: "primary",   label: "Planning"     },
  ideation:     { intent: "primary",   label: "Ideation"     },
  architecture: { intent: "primary",   label: "Architecture" },
  setup:        { intent: "warning",   label: "Setup"        },
  development:  { intent: "info",      label: "Development"  },
  completed:    { intent: "success",   label: "Completed"    },
};

// ─── PROJECT STATUS ──────────────────────────────────────────────────────────
const PROJECT_STATUS: Record<string, Mapping> = {
  planning:  { intent: "info",     label: "Planning"  },
  active:    { intent: "success",  label: "Active"    },
  completed: { intent: "primary",  label: "Completed" },
  archived:  { intent: "neutral",  label: "Archived"  },
};

// ─── ROLE ────────────────────────────────────────────────────────────────────
const ROLE: Record<string, Mapping> = {
  user:                { intent: "neutral",   label: "User"               },
  sankalp_member:      { intent: "info",      label: "SANKALP Member"     },
  sankalp_associate:   { intent: "primary",   label: "SANKALP Associate"  },
  master_admin:        { intent: "error",     label: "Master Admin"       },
};

// ─── PROPOSAL TYPE ───────────────────────────────────────────────────────────
const TYPE: Record<string, Mapping> = {
  idea:           { intent: "info",     label: "Idea"           },
  research:       { intent: "primary",  label: "Research"       },
  implementation: { intent: "success",  label: "Implementation" },
  collaboration: { intent: "warning",   label: "Collaboration"  },
  protocol:       { intent: "primary",  label: "Protocol"       },
  node:           { intent: "neutral",  label: "Node"           },
  infrastructure: { intent: "warning",  label: "Infrastructure" },
};

// ─── Registry ────────────────────────────────────────────────────────────────
const REGISTRIES = {
  "task-status":     TASK_STATUS,
  "task-priority":   TASK_PRIORITY,
  "proposal-status": PROPOSAL_STATUS,
  "proposal-stage":  PROPOSAL_STAGE,
  "project-status":  PROJECT_STATUS,
  "role":            ROLE,
  "type":            TYPE,
} as const;

type Kind = keyof typeof REGISTRIES;

// ─── Component ───────────────────────────────────────────────────────────────

interface StatusPillProps {
  kind: Kind;
  value: string;
  showIcon?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function StatusPill({ kind, value, showIcon = false, size = "md", className }: StatusPillProps) {
  const registry = REGISTRIES[kind];
  const mapping  = registry?.[value] ?? { intent: "neutral" as const, label: value };
  const Icon     = showIcon ? mapping.icon : undefined;

  return (
    <Badge variant={mapping.intent} size={size} className={className}>
      {Icon && <Icon className="w-3 h-3" />}
      {mapping.label ?? value}
    </Badge>
  );
}

/* Re-export of helpers (sometimes useful directly) */
export { TASK_STATUS, TASK_PRIORITY, PROPOSAL_STATUS, PROPOSAL_STAGE, PROJECT_STATUS, ROLE, TYPE };
