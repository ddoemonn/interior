"use client";

import type { ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";

const EASE = [0.23, 1, 0.32, 1] as const;

export function Enter({
  children,
  delay = 0,
  className = "",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const reduce = useReducedMotion();

  return (
    <motion.div
      className={className}
      initial={
        reduce ? { opacity: 0 } : { opacity: 0, y: 10, filter: "blur(5px)" }
      }
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={
        reduce ? { duration: 0.01 } : { duration: 0.34, ease: EASE, delay }
      }
    >
      {children}
    </motion.div>
  );
}
