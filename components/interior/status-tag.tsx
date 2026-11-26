"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

const SWAP = { type: "spring", stiffness: 460, damping: 34, mass: 0.6 } as const;
const DRAW = { duration: 0.26, ease: [0.23, 1, 0.32, 1] } as const;
const LEAVE = { duration: 0.12, ease: [0.4, 0, 1, 1] } as const;
const POP = { duration: 0.34, ease: [0.23, 1, 0.32, 1] } as const;
const SHEEN = { duration: 1.15, ease: "linear", repeat: Infinity, repeatDelay: 0.25 } as const;
const INSTANT = { duration: 0 } as const;

export type TagTone = "neutral" | "blue" | "violet" | "teal" | "amber" | "green" | "red";

export type TagKind = "idle" | "busy" | "done" | "failed";

export type TagState = {
  label: string;
  tone?: TagTone;
  kind?: TagKind;
};

export type UseStatusTagOptions<K extends string> = {
  state: K;
  states: Record<K, TagState>;
  announceAfter?: number;
};

export type StatusTagState<K extends string> = {
  current: TagState;
  key: K;
  labels: string[];
  settled: string;
};

export function useStatusTag<K extends string>({
  state,
  states,
  announceAfter = 400,
}: UseStatusTagOptions<K>): StatusTagState<K> {
  const current = states[state];
  const [settled, setSettled] = useState(current.label);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setSettled(current.label), announceAfter);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [current.label, announceAfter]);

  const labels = (Object.values(states) as TagState[]).map((entry) => entry.label);

  return { current, key: state, labels, settled };
}

const TINT: Record<TagTone, string> = {
  neutral: "bg-neutral-900/[0.07] text-neutral-700 dark:bg-white/[0.1] dark:text-neutral-200",
  blue: "bg-[#0F6FFF]/[0.11] text-[#0B5CD6] dark:bg-[#2E8BFF]/[0.18] dark:text-[#7DB8FF]",
  violet: "bg-[#7A3DFF]/[0.11] text-[#5F25DB] dark:bg-[#9B6BFF]/[0.18] dark:text-[#BFA2FF]",
  teal: "bg-[#00B3A1]/[0.13] text-[#008577] dark:bg-[#14E3C5]/[0.16] dark:text-[#14E3C5]",
  amber: "bg-[#F29D00]/[0.15] text-[#A66A00] dark:bg-[#FFC21F]/[0.16] dark:text-[#FFC21F]",
  green: "bg-[#06B457]/[0.13] text-[#058A43] dark:bg-[#2FE582]/[0.16] dark:text-[#2FE582]",
  red: "bg-[#F2303F]/[0.12] text-[#D11F2E] dark:bg-[#FF4658]/[0.16] dark:text-[#FF4658]",
};

export type StatusTagProps<K extends string> = UseStatusTagOptions<K> & {
  className?: string;
};

export function StatusTag<K extends string>({
  state,
  states,
  announceAfter,
  className = "",
}: StatusTagProps<K>) {
  const reduced = useReducedMotion();
  const { current, key, labels, settled } = useStatusTag({ state, states, announceAfter });
  const kind = current.kind ?? "idle";
  const marked = (Object.values(states) as TagState[]).some(
    (entry) => entry.kind && entry.kind !== "idle",
  );
  const sizer = useRef<HTMLSpanElement>(null);
  const [width, setWidth] = useState<number | null>(null);

  useLayoutEffect(() => {
    const node = sizer.current;
    if (!node) return;
    const measure = () => setWidth(node.offsetWidth + 1);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(node);
    return () => observer.disconnect();
  }, [current.label]);

  return (
    <motion.span
      initial={false}
      animate={{ scale: !reduced && (kind === "done" || kind === "failed") ? [1, 1.08, 1] : 1 }}
      transition={reduced ? INSTANT : POP}
      className={`relative inline-flex h-6 items-center gap-1.5 overflow-hidden rounded-full px-2.5 text-[12.5px] font-medium transition-colors duration-200 ${
        TINT[current.tone ?? "neutral"]
      } ${className}`}
    >
      {kind === "busy" && !reduced ? (
        <motion.span
          aria-hidden
          initial={{ x: "-120%" }}
          animate={{ x: "320%" }}
          transition={SHEEN}
          className="pointer-events-none absolute inset-y-0 left-0 w-1/3 bg-[linear-gradient(100deg,transparent,currentColor,transparent)] opacity-20"
        />
      ) : null}
      {marked ? (
        <span aria-hidden className="relative -ml-0.5 grid size-3 place-items-center">
          <AnimatePresence initial={false} mode="popLayout">
            {kind === "busy" ? (
              <motion.svg
                key="busy"
                viewBox="0 0 16 16"
                fill="none"
                initial={{ opacity: 0, scale: 0.6 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.6, transition: LEAVE }}
                transition={reduced ? INSTANT : SWAP}
                className="col-start-1 row-start-1 size-3"
              >
                <circle cx="8" cy="8" r="6" stroke="currentColor" strokeOpacity="0.25" strokeWidth="2" />
                <path
                  d="M8 2a6 6 0 0 1 6 6"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  className={reduced ? "" : "origin-center animate-spin [animation-duration:0.8s]"}
                />
              </motion.svg>
            ) : kind === "done" ? (
              <motion.svg
                key="done"
                viewBox="0 0 16 16"
                fill="none"
                exit={{ opacity: 0, transition: LEAVE }}
                className="col-start-1 row-start-1 size-3"
              >
                <motion.path
                  d="M3 8.4l3.2 3.1L13 4.8"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  initial={reduced ? false : { pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={reduced ? INSTANT : DRAW}
                />
              </motion.svg>
            ) : kind === "failed" ? (
              <motion.svg
                key="failed"
                viewBox="0 0 16 16"
                fill="none"
                exit={{ opacity: 0, transition: LEAVE }}
                className="col-start-1 row-start-1 size-3"
              >
                <motion.path
                  d="M4 4l8 8M12 4l-8 8"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  initial={reduced ? false : { pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={reduced ? INSTANT : DRAW}
                />
              </motion.svg>
            ) : (
              <motion.span
                key="idle"
                initial={{ opacity: 0, scale: 0.4 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.4, transition: LEAVE }}
                transition={reduced ? INSTANT : SWAP}
                className="col-start-1 row-start-1 block size-[6px] rounded-[2px] bg-current"
              />
            )}
          </AnimatePresence>
        </span>
      ) : null}

      <motion.span
        initial={false}
        animate={width === null ? undefined : { width }}
        transition={reduced ? INSTANT : SWAP}
        className="relative inline-grid justify-items-start overflow-hidden"
      >
        <span ref={sizer} aria-hidden className="invisible absolute left-0 top-0 whitespace-nowrap">
          {current.label}
        </span>
        <span aria-hidden className="invisible col-start-1 row-start-1 w-0 whitespace-nowrap">
          {labels[0]}
        </span>
        <AnimatePresence initial={false} mode="popLayout">
          <motion.span
            key={key}
            aria-hidden
            initial={reduced ? { opacity: 0 } : { opacity: 0, y: "0.6em", filter: "blur(4px)" }}
            animate={{ opacity: 1, y: "0em", filter: "blur(0px)" }}
            exit={
              reduced
                ? { opacity: 0, transition: INSTANT }
                : { opacity: 0, y: "-0.6em", filter: "blur(4px)", transition: LEAVE }
            }
            transition={reduced ? INSTANT : SWAP}
            className="col-start-1 row-start-1 whitespace-nowrap"
          >
            {current.label}
          </motion.span>
        </AnimatePresence>
      </motion.span>

      <span className="sr-only" role="status" aria-live="polite">
        {settled}
      </span>
    </motion.span>
  );
}
