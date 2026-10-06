"use client";

import { useRef, useState } from "react";
import {
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from "motion/react";

const SMOOTH = { stiffness: 240, damping: 44, mass: 0.6 } as const;

export type UseCondenseOptions = {
  range?: number;
};

export type UseCondenseResult<T extends HTMLElement> = {
  ref: React.RefObject<T | null>;
  progress: MotionValue<number>;
  condensed: boolean;
};

export function useCondense<T extends HTMLElement = HTMLDivElement>({
  range = 48,
}: UseCondenseOptions = {}): UseCondenseResult<T> {
  const ref = useRef<T | null>(null);
  const { scrollY } = useScroll({ container: ref });

  const progress = useTransform(scrollY, [0, Math.max(1, range)], [0, 1], {
    clamp: true,
  });

  const [condensed, setCondensed] = useState(false);
  useMotionValueEvent(progress, "change", (p) => {
    const done = p >= 1;
    setCondensed((prev) => (prev === done ? prev : done));
  });

  return { ref, progress, condensed };
}

export type StickyHeaderProps = {
  title: string;
  children: React.ReactNode;
  subtitle?: string;
  leading?: React.ReactNode;
  actions?: React.ReactNode;
  expandedHeight?: number;
  compactHeight?: number;
  maxHeight?: number;
  className?: string;
};

export function StickyHeader({
  title,
  children,
  subtitle,
  leading,
  actions,
  expandedHeight = 68,
  compactHeight = 48,
  maxHeight = 320,
  className = "",
}: StickyHeaderProps) {
  const tall = Math.max(expandedHeight, compactHeight);
  const short = Math.min(expandedHeight, compactHeight);
  const travel = Math.max(1, tall - short);

  const { ref, progress: tracked, condensed } = useCondense<HTMLDivElement>({
    range: Math.max(64, travel * 3),
  });
  const reduced = useReducedMotion();
  const sprung = useSpring(tracked, SMOOTH);
  const progress = reduced ? tracked : sprung;

  const plate = useTransform(progress, (p) => (tall - travel * p) / tall);
  const edge = useTransform(progress, (p) => tall - travel * p);
  const lifted = useTransform(progress, [0, 0.12], [0, 1], { clamp: true });

  const bigY = useTransform(progress, (p) => -travel * p);
  const bigOpacity = useTransform(progress, [0, 0.45], [1, 0], { clamp: true });
  const bigScale = useTransform(progress, (p) => 1 - 0.05 * p);

  const smallOpacity = useTransform(progress, [0.55, 0.9], [0, 1], {
    clamp: true,
  });
  const smallY = useTransform(smallOpacity, (o) => (1 - o) * 6);

  return (
    <div
      className={`relative overflow-hidden rounded-[14px] border border-black/10 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.05)] dark:border-white/10 dark:bg-[#111111] dark:shadow-[0_1px_2px_rgba(0,0,0,0.4)] ${className}`}
    >
      <div
        ref={ref}

        // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
        tabIndex={0}
        role="region"
        aria-label={title}
        style={{ maxHeight, scrollPaddingTop: short + 10 }}
        className="overflow-y-auto overscroll-y-contain outline-none [scrollbar-gutter:stable] focus-visible:bg-[#4568FF]/[0.06] focus-visible:shadow-[inset_0_0_0_1px_#4568FF] dark:focus-visible:bg-[#4568FF]/[0.08]"
      >
        <div aria-hidden style={{ height: tall }} />
        {children}

        <div
          aria-hidden
          className="pointer-events-none sticky bottom-0 -mt-6 h-6 bg-gradient-to-t from-white to-transparent dark:from-[#111111]"
        />
      </div>
      <header
        data-condensed={condensed ? "true" : "false"}
        style={{ height: tall }}
        className="pointer-events-none absolute inset-x-0 top-0"
      >
        <motion.div
          aria-hidden
          style={{ height: tall, scaleY: plate }}
          className="absolute inset-x-0 top-0 origin-top bg-white dark:bg-[#111111]"
        />
        <motion.div
          aria-hidden
          style={{ y: edge, opacity: lifted }}
          className="absolute inset-x-0 top-0 h-px shadow-[0_6px_16px_-10px_rgba(0,0,0,0.3)] dark:shadow-[0_6px_16px_-10px_rgba(0,0,0,0.7)]"
        />
        <motion.div
          aria-hidden
          style={{ y: edge, opacity: lifted }}
          className="absolute inset-x-0 top-0 h-5 bg-gradient-to-b from-white to-transparent dark:from-[#111111]"
        />
        <motion.div
          aria-hidden
          style={{ y: edge, opacity: lifted }}
          className="absolute inset-x-0 top-0 h-px bg-black/10 dark:bg-white/10"
        />
        <div className="absolute inset-x-0 top-0 flex items-start gap-2.5 px-4 pt-3">
          {leading ? (
            <div className="pointer-events-auto flex h-6 shrink-0 items-center">
              {leading}
            </div>
          ) : null}

          <div className="relative min-w-0 flex-1">
            <motion.div
              style={{
                y: bigY,
                opacity: bigOpacity,
                scale: bigScale,
                transformOrigin: "left top",
              }}
            >
              <h2 className="truncate text-[20px] font-medium leading-[1.2] tracking-[-0.03em] text-neutral-900 dark:text-neutral-100">
                {title}
              </h2>
              {subtitle ? (
                <p className="mt-0.5 truncate text-[11.5px] leading-[1.35] text-neutral-500 dark:text-neutral-400">
                  {subtitle}
                </p>
              ) : null}
            </motion.div>
            <motion.span
              aria-hidden
              style={{ opacity: smallOpacity, y: smallY }}
              className="absolute inset-x-0 top-[3px] truncate text-[13px] font-medium leading-[1.4] text-neutral-900 dark:text-neutral-100"
            >
              {title}
            </motion.span>
          </div>

          {actions ? (
            <div className="pointer-events-auto flex h-6 shrink-0 items-center gap-1.5">
              {actions}
            </div>
          ) : null}
        </div>
      </header>
    </div>
  );
}
