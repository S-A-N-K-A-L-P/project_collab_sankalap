const STATUS_COLORS: Record<string, string> = {
  proposal: "bg-blue-500/10 text-blue-400",
  active: "bg-emerald-500/10 text-emerald-400",
  approved: "bg-green-500/10 text-green-400",
  rejected: "bg-red-500/10 text-red-400",
  closed: "bg-zinc-500/10 text-zinc-400",
  draft: "bg-yellow-500/10 text-yellow-400",
  disabled: "bg-zinc-600/10 text-zinc-500",
  planning: "bg-purple-500/10 text-purple-400",
  ideation: "bg-indigo-500/10 text-indigo-400",
  architecture: "bg-cyan-500/10 text-cyan-400",
  setup: "bg-orange-500/10 text-orange-400",
  development: "bg-blue-500/10 text-blue-400",
  completed: "bg-green-500/10 text-green-400",
  archived: "bg-zinc-500/10 text-zinc-400",
  pending: "bg-yellow-500/10 text-yellow-400",
  "in-progress": "bg-blue-500/10 text-blue-400",
  delayed: "bg-red-500/10 text-red-400",
};

interface StatusBadgeProps {
  value: string;
  size?: "sm" | "md";
}

export default function StatusBadge({ value, size = "sm" }: StatusBadgeProps) {
  const color = STATUS_COLORS[value] ?? "bg-zinc-500/10 text-zinc-400";
  const textSize = size === "md" ? "text-[11px] px-3 py-1" : "text-[10px] px-2 py-0.5";
  return (
    <span
      className={`inline-block font-mono font-bold uppercase tracking-wider rounded-lg ${textSize} ${color}`}
    >
      {value}
    </span>
  );
}
