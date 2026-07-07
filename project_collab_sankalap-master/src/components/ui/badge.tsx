import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[11px] font-medium leading-none transition-colors whitespace-nowrap",
  {
    variants: {
      variant: {
        default:     "border-transparent bg-primary text-primary-foreground",
        secondary:   "border-transparent bg-secondary text-secondary-foreground",
        outline:     "border-border text-foreground",
        destructive: "border-transparent bg-destructive text-destructive-foreground",

        // Semantic intent (use these for status / priority / outcome)
        success: "border-[color:color-mix(in_srgb,var(--success)_20%,transparent)] bg-[color:var(--success-muted)] text-[color:var(--success)]",
        info:    "border-[color:color-mix(in_srgb,var(--info)_20%,transparent)] bg-[color:var(--info-muted)] text-[color:var(--info)]",
        warning: "border-[color:color-mix(in_srgb,var(--warning)_20%,transparent)] bg-[color:var(--warning-muted)] text-[color:var(--warning)]",
        error:   "border-[color:color-mix(in_srgb,var(--error)_20%,transparent)] bg-[color:var(--error-muted)] text-[color:var(--error)]",
        primary: "border-[color:color-mix(in_srgb,var(--primary)_20%,transparent)] bg-[color:var(--primary-muted)] text-[color:var(--primary)]",
        neutral: "border-border bg-muted text-muted-foreground",
      },
      size: {
        sm: "px-1.5 py-0 text-[10px]",
        md: "px-2 py-0.5 text-[11px]",
        lg: "px-2.5 py-1 text-[12px]",
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
