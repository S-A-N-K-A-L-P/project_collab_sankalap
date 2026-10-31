import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold leading-none transition-colors whitespace-nowrap",
  {
    variants: {
      variant: {
        default:     "border-transparent bg-primary text-primary-foreground",
        secondary:   "border-primary/15 bg-primary-light text-primary",
        outline:     "border-border bg-card text-foreground",
        destructive: "border-transparent bg-destructive text-destructive-foreground",

        // Contextual status badges with soft tinted backgrounds
        success: "border-emerald-500/20 bg-[color:var(--success-muted)] text-[color:var(--success-text)]",
        info:    "border-primary/15 bg-[color:var(--info-muted)] text-[color:var(--info-text)]",
        warning: "border-amber-500/20 bg-[color:var(--warning-muted)] text-[color:var(--warning-text)]",
        error:   "border-red-500/20 bg-[color:var(--error-muted)] text-[color:var(--error-text)]",
        primary: "border-primary/15 bg-[color:var(--primary-light)] text-[color:var(--primary)]",
        neutral: "border-border bg-muted text-muted-foreground",
      },
      size: {
        sm: "px-2 py-0.5 text-[10px]",
        md: "px-2.5 py-1 text-[11px]",
        lg: "px-3 py-1 text-[12px]",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, size, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant, size }), className)} {...props} />;
}

export { Badge, badgeVariants };
