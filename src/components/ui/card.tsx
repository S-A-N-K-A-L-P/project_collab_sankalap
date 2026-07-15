"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { useCardGlow, CardGlow } from "./card-glow";

/* ============================================================================
   MudBlazor-style Card — uses strong Material elevation that's actually
   visible in dark mode. Variants: flat, raised (default), elevated.
   Pass `glow` to opt into the cursor-follow hover glow (see PremiumCard for
   the single-slot, motion-driven version of this same treatment).
   ========================================================================= */

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  elevation?: 0 | 1 | 2 | 3 | 4;
  glow?: boolean;
}

const ELEVATION = {
  0: "",                  // flat — border only
  1: "elevation-1",
  2: "elevation-2",
  3: "elevation-3",
  4: "elevation-4",
} as const;

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, elevation = 1, glow = false, onMouseMove, ...props }, ref) => {
    const { onMouseMove: onGlowMove, background } = useCardGlow();

    return (
      <div
        ref={ref}
        onMouseMove={glow ? (e) => { onGlowMove(e); onMouseMove?.(e); } : onMouseMove}
        className={cn(
          "group relative rounded-lg border border-border bg-card text-card-foreground",
          ELEVATION[elevation],
          className,
        )}
        {...props}
      >
        {glow && <CardGlow background={background} />}
        <div className="relative z-10">{props.children}</div>
      </div>
    );
  },
);
Card.displayName = "Card";

const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex flex-col space-y-1.5 p-5", className)} {...props} />
  ),
);
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3 ref={ref} className={cn("text-base font-semibold leading-none tracking-tight", className)} {...props} />
  ),
);
CardTitle.displayName = "CardTitle";

const CardDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p ref={ref} className={cn("text-sm text-muted-foreground", className)} {...props} />
  ),
);
CardDescription.displayName = "CardDescription";

const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => <div ref={ref} className={cn("p-5 pt-0", className)} {...props} />,
);
CardContent.displayName = "CardContent";

const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex items-center p-5 pt-0", className)} {...props} />
  ),
);
CardFooter.displayName = "CardFooter";

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent };
