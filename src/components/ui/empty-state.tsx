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
        "flex flex-col items-center justify-center p-8 text-center space-y-4 rounded-2xl border border-dashed border-border dark:border-white/10 bg-muted/30 dark:bg-white/5",
        className
      )}
      {...props}
    >
      {icon && (
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted-bg dark:bg-white/10 mb-2">
          <div className="text-muted-foreground dark:text-white/60">
            {icon}
          </div>
        </div>
      )}
      
      <div className="space-y-1.5 max-w-sm">
        <TypographyTitle as="h3" className="text-xl">{title}</TypographyTitle>
        <TypographySubtitle>{description}</TypographySubtitle>
      </div>
      
      {action && (
        <div className="pt-2">
          {action}
        </div>
      )}
    </div>
  );
}
