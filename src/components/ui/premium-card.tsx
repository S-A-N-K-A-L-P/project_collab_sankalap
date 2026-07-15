"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useCardGlow, CardGlow } from "./card-glow";

interface PremiumCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  withGlow?: boolean;
}

export function PremiumCard({ className, children, withGlow = true, ...props }: PremiumCardProps) {
  const { onMouseMove, background } = useCardGlow();

  return (
    <motion.div
      className={cn(
        "group relative rounded-2xl border border-border bg-card p-6 shadow-sm transition-all hover:shadow-md dark:bg-white/5",
        className
      )}
      onMouseMove={onMouseMove}
      whileHover={{ y: -4, scale: 1.01 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      {...(props as any)}
    >
      {withGlow && <CardGlow background={background} />}
      <div className="relative z-10">{children}</div>
    </motion.div>
  );
}
