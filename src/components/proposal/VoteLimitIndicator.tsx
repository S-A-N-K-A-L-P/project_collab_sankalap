"use client";

interface VoteLimitIndicatorProps {
  current: number;
  max: number;
}

export default function VoteLimitIndicator({ current, max }: VoteLimitIndicatorProps) {
  // Only show when multi-vote is allowed
  if (max <= 1) return null;

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-muted">
        {current}/{max} votes used
      </span>
      <div className="flex gap-0.5">
        {Array.from({ length: max }).map((_, i) => (
          <div
            key={i}
            className={`w-3 h-1.5 rounded-full transition-all duration-300 ${
              i < current ? "bg-primary" : "bg-border"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
