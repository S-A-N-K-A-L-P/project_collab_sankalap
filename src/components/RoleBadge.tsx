import { ROLE_LABELS, type AppRole } from "@/lib/permissions";

const BADGE_STYLES: Record<AppRole, string> = {
  user:               "bg-muted text-muted-foreground border-border",
  sankalp_member:     "bg-primary-light text-primary border-primary/20",
  sankalp_associate:  "bg-violet-500/12 text-violet-700 dark:text-violet-300 border-violet-500/20",
  platform_moderator: "bg-emerald-500/12 text-emerald-700 dark:text-emerald-300 border-emerald-500/20",
  master_admin:       "bg-rose-500/12 text-rose-700 dark:text-rose-300 border-rose-500/20",
};

export default function RoleBadge({ role }: { role: AppRole }) {
  const style = BADGE_STYLES[role] ?? "bg-muted text-muted-foreground border-border";
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold tracking-tight ${style}`}>
      {ROLE_LABELS[role] ?? role}
    </span>
  );
}
