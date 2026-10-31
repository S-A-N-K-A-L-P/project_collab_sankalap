import { ROLE_LABELS, type AppRole } from "@/lib/permissions";

const BADGE_STYLES: Record<AppRole, string> = {
  user:               "bg-zinc-500/15 text-zinc-400 border-zinc-500/20",
  sankalp_member:     "bg-indigo-500/15 text-indigo-400 border-indigo-500/20",
  sankalp_associate:  "bg-purple-500/15 text-purple-400 border-purple-500/20",
  master_admin:       "bg-rose-500/15 text-rose-400 border-rose-500/20",
};

export default function RoleBadge({ role }: { role: AppRole }) {
  const style = BADGE_STYLES[role] ?? "bg-muted text-muted-foreground border-border";
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${style}`}>
      {ROLE_LABELS[role] ?? role}
    </span>
  );
}
