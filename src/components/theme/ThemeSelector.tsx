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
        if (!isMounted) return "system";
        if (theme && isThemeMode(theme)) return theme;
        return "system";
    }, [theme, isMounted]);

    const containerBase = "rounded-xl border border-border-subtle bg-surface p-1 shadow-sm";
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
                            className={`flex h-10 w-10 items-center justify-center rounded-lg border text-[12px] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${isActive
                                ? "border-accent bg-accent/10 text-foreground shadow-[0_0_0_1px_var(--accent-glow)]"
                                : "border-transparent text-muted hover:border-border-subtle hover:bg-surface-alt hover:text-foreground"
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
