"use client";

import { useMemo, useState, useEffect, type ComponentType } from "react";
import { Monitor, Moon, SunMedium } from "lucide-react";
import { useTheme } from "next-themes";
import { isThemeMode, type ThemeMode } from "@/lib/theme";

type Props = {
    className?: string;
    orientation?: "horizontal" | "vertical";
};

const options: Array<{ value: ThemeMode; label: string; icon: ComponentType<{ className?: string }> }> = [
    { value: "light", label: "Light", icon: SunMedium },
    { value: "dark", label: "Dark", icon: Moon },
    { value: "system", label: "System", icon: Monitor },
];

export default function ThemeSelector({ className = "", orientation = "horizontal" }: Props) {
    const { theme, setTheme } = useTheme();
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const activeTheme: ThemeMode = useMemo(() => {
        if (!isMounted) return "light";
        if (theme && isThemeMode(theme)) return theme;
        return "light";
    }, [theme, isMounted]);

    const containerBase = "rounded-xl border border-border bg-card p-1 shadow-xs";
    const gridClass = orientation === "vertical" ? "grid grid-cols-1 gap-1" : "grid grid-cols-3 gap-1";

    return (
        <div className={`${containerBase} ${className}`} role="radiogroup" aria-label="Theme mode">
            <div className={gridClass}>
                {options.map(({ value, label, icon: Icon }) => {
                    const isActive = activeTheme === value;

                    return (
                        <button
                            key={value}
                            type="button"
                            role="radio"
                            aria-checked={isActive}
                            aria-label={label}
                            title={label}
                            onClick={() => {
                                setTheme(value);
                            }}
                            className={`flex h-9 w-9 items-center justify-center rounded-lg border text-[12px] font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${isActive
                                ? "border-primary/25 bg-primary-light text-primary shadow-xs"
                                : "border-transparent text-muted hover:border-border hover:bg-muted-bg hover:text-foreground"
                                }`}
                        >
                            <Icon className="h-4 w-4" />
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
