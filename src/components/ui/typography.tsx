import React from "react";
import { cn } from "@/lib/utils";

// 1. Typography Hierarchy
// Title: 24px (text-2xl)
// Section: 18px (text-lg)
// Subtitle: 14px (text-sm)
// Metadata: 12px (text-xs)

interface TypographyProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode;
  as?: React.ElementType;
}

export function TypographyTitle({ className, children, as: Component = "h1", ...props }: TypographyProps) {
  return (
    <Component
      className={cn("text-2xl font-bold tracking-tight text-foreground", className)}
      {...props}
    >
      {children}
    </Component>
  );
}

export function TypographySection({ className, children, as: Component = "h2", ...props }: TypographyProps) {
  return (
    <Component
      className={cn("text-lg font-semibold tracking-tight text-foreground", className)}
      {...props}
    >
      {children}
    </Component>
  );
}

export function TypographySubtitle({ className, children, as: Component = "p", ...props }: TypographyProps) {
  return (
    <Component
      className={cn("text-sm font-medium text-muted-foreground", className)}
      {...props}
    >
      {children}
    </Component>
  );
}

export function TypographyMetadata({ className, children, as: Component = "span", ...props }: TypographyProps) {
  return (
    <Component
      className={cn("text-xs font-normal text-muted-foreground uppercase tracking-wider", className)}
      {...props}
    >
      {children}
    </Component>
  );
}
