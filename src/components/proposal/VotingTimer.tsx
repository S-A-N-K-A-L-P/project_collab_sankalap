"use client";

import { useEffect, useState } from "react";
import { Clock } from "lucide-react";

export default function VotingTimer({ endTime }: { endTime: string }) {
    const [timeLeft, setTimeLeft] = useState("");
    const [isExpired, setIsExpired] = useState(false);

    useEffect(() => {
        const interval = setInterval(() => {
            const now = new Date().getTime();
            const distance = new Date(endTime).getTime() - now;

            if (distance < 0) {
                clearInterval(interval);
                setTimeLeft("CLOSED");
                setIsExpired(true);
                return;
            }

            const days = Math.floor(distance / (1000 * 60 * 60 * 24));
            const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));

            if (days > 0) {
                setTimeLeft(`${days}d ${hours}h left`);
            } else if (hours > 0) {
                setTimeLeft(`${hours}h ${minutes}m left`);
            } else {
                setTimeLeft(`${minutes}m left`);
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [endTime]);

    return (
        <div className={`flex items-center gap-1.5 px-2 py-1 rounded bg-[#17171a] border border-[#1f1f23] ${isExpired ? 'opacity-50' : ''}`}>
            <Clock className={`w-3 h-3 ${isExpired ? 'text-[#9ca3af]' : 'text-[#6366f1]'}`} />
            <span className={`text-[9px] font-mono font-black uppercase tracking-widest ${isExpired ? 'text-[#9ca3af]' : 'text-[#e5e7eb]'}`}>
                {timeLeft}
            </span>
        </div>
    );
}
