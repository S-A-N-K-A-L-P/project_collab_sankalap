"use client";

interface VoteLimitIndicatorProps {
    current: number;
    max: number;
}

export default function VoteLimitIndicator({ current, max }: VoteLimitIndicatorProps) {
    if (max <= 1) return null;

    return (
        <div className="flex flex-col gap-1.5 min-w-[60px]">
            <div className="flex justify-between items-center text-[10px] font-mono font-bold uppercase tracking-widest text-[#9ca3af]">
                <span>Allocation</span>
                <span className={current >= max ? "text-[#6366f1]" : ""}>{current}/{max}</span>
            </div>
            <div className="h-1 bg-[#1f1f23] rounded-full overflow-hidden flex gap-0.5">
                {Array.from({ length: max }).map((_, i) => (
                    <div 
                        key={i}
                        className={`flex-1 h-full rounded-full transition-all duration-300 ${
                            i < current ? "bg-[#6366f1]" : "bg-transparent"
                        }`}
                    />
                ))}
            </div>
        </div>
    );
}
