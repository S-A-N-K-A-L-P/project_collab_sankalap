import React from "react";
import { cn } from "@/lib/utils";
import { TypographyTitle, TypographySubtitle } from "./typography";

interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon, title, description, action, className, ...props }: EmptyStateProps) {
  return (
    <div
      className={cn(
        "saas-card flex flex-col items-center justify-center p-10 text-center space-y-4",
        className
      )}
      {...props}
    >
      {icon && (
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-light border border-primary/15 mb-1">
          <div className="text-primary">
            {icon}
          </div>
        </div>
      )}
      
      <div className="space-y-1.5 max-w-sm">
        <TypographyTitle as="h3" className="text-base font-bold text-foreground">{title}</TypographyTitle>
        <TypographySubtitle className="text-xs text-muted leading-relaxed">{description}</TypographySubtitle>
      </div>
      
      {action && (
        <div className="pt-2">
          {action}
        </div>
      )}
    </div>
  );
}
