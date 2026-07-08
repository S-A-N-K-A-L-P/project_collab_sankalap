"use client";

import React from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import { Button, ButtonProps } from "./button";
import { cn } from "@/lib/utils";

type AnimatedButtonProps = ButtonProps & Omit<HTMLMotionProps<"button">, "ref" | "onAnimationStart" | "onDragStart" | "onDragEnd" | "onDrag">;

export const AnimatedButton = React.forwardRef<HTMLButtonElement, AnimatedButtonProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <motion.button
        ref={ref}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        transition={{ type: "spring", stiffness: 400, damping: 20 }}
        className={cn(
          "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
          className
        )}
        {...props as any}
      >
        {children}
      </motion.button>
    );
  }
);
AnimatedButton.displayName = "AnimatedButton";
