import { ROLE_LABELS, type AppRole } from "@/lib/permissions";

const BADGE_STYLES: Record<AppRole, string> = {
  admin: "bg-primary/15 text-primary border-primary/20",
  head: "bg-accent/15 text-accent border-accent/20",
  member: "bg-[hsl(210,80%,52%)]/15 text-[hsl(210,80%,52%)] border-[hsl(210,80%,52%)]/20",
  user: "bg-muted text-muted-foreground border-border",
};

export default function RoleBadge({ role }: { role: AppRole }) {
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${BADGE_STYLES[role]}`}>
      {ROLE_LABELS[role]}
    </span>
  );
}
