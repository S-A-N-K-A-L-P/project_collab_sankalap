"use client";

import type React from "react";
import { motion, useMotionTemplate, useMotionValue, type MotionValue } from "framer-motion";

/**
 * Cursor-follow radial glow, shared by PremiumCard and any <Card glow /> instance
 * so the hover treatment stays in one place instead of being copy-pasted per file.
 */
export function useCardGlow() {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  function onMouseMove({ currentTarget, clientX, clientY }: React.MouseEvent) {
    const { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }

  const background = useMotionTemplate`
    radial-gradient(350px circle at ${mouseX}px ${mouseY}px, var(--ring), transparent 80%)
  `;

  return { onMouseMove, background };
}

export function CardGlow({ background }: { background: MotionValue<string> }) {
  return (
    <motion.div
      aria-hidden
      className="pointer-events-none absolute -inset-px rounded-[inherit] opacity-0 transition duration-300 group-hover:opacity-100"
      style={{ background }}
    />
  );
}
