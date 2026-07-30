"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

const CELL = { type: "spring", stiffness: 520, damping: 34, mass: 0.45 } as const;

const ROLL = { type: "spring", stiffness: 460, damping: 32, mass: 0.55 } as const;

const POP = { type: "spring", stiffness: 640, damping: 22, mass: 0.7 } as const;

const LIFT = { type: "spring", stiffness: 380, damping: 26, mass: 0.7 } as const;

const SETTLE = { type: "spring", stiffness: 260, damping: 34, mass: 0.8 } as const;

const CLEAR = { duration: 0.16, ease: [0.4, 0, 1, 1] } as const;
const DROP = { duration: 0.14, ease: [0.4, 0, 1, 1] } as const;
const STILL = { duration: 0 } as const;

const GLYPH: Record<"up" | "down", ReactNode> = {
  up: <path d="M128 68 L210 180 H46 Z" />,
  down: <path d="M128 188 L46 76 H210 Z" />,
};

export type FlashDirection = "up" | "down";

export type UseValueFlashOptions<T> = {
  hold?: number;
  compare?: (next: T, previous: T) => number;
};

export type ValueFlashState<T> = {
  direction: FlashDirection | null;
  from: T;
  changeId: number;
  flashing: boolean;
};

export function useValueFlash<T>(
  value: T,
  { hold = 900, compare }: UseValueFlashOptions<T> = {},
): ValueFlashState<T> {
  const [state, setState] = useState<ValueFlashState<T>>({
    direction: null,
    from: value,
    changeId: 0,
    flashing: false,
  });

  const previous = useRef(value);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const rank = useRef(compare);

  useEffect(() => {
    rank.current = compare;
  });

  useEffect(() => {
    const prior = previous.current;
    if (Object.is(prior, value)) return;
    previous.current = value;

    const measure = rank.current;
    const delta = measure
      ? measure(value, prior)
      : typeof value === "number" && typeof prior === "number"
        ? value - prior
        : 0;

    if (delta === 0) return;

    setState((prev) => ({
      direction: delta > 0 ? "up" : "down",
      from: prior,
      changeId: prev.changeId + 1,
      flashing: true,
    }));

    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      timer.current = null;
      setState((prev) => (prev.flashing ? { ...prev, flashing: false } : prev));
    }, hold);
  }, [value, hold]);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  return state;
}

export type ValueFlashProps = {
  value: number;
  format?: (value: number) => string;
  label?: string;
  hold?: number;
  announceAfter?: number;
  className?: string;
};

export function ValueFlash({
  value,
  format,
  label,
  hold = 900,
  announceAfter = 700,
  className = "",
}: ValueFlashProps) {
  const { direction, flashing, changeId } = useValueFlash(value, { hold });
  const reduced = useReducedMotion();

  const text = format ? format(value) : String(value);
  const [settled, setSettled] = useState(text);

  useEffect(() => {
    const id = setTimeout(() => setSettled(text), announceAfter);
    return () => clearTimeout(id);
  }, [text, announceAfter]);

  const tone = flashing
    ? direction === "up"
      ? "text-emerald-600 dark:text-emerald-400"
      : "text-red-600 dark:text-red-400"
    : "text-stone-700 dark:text-stone-200";

  const tint =
    direction === "up"
      ? "bg-emerald-500/[0.12] dark:bg-emerald-400/[0.14]"
      : "bg-red-500/[0.12] dark:bg-red-400/[0.14]";

  return (
    <motion.span
      initial={false}
      animate={{ scale: reduced ? 1 : flashing ? 1.05 : 1 }}
      transition={reduced ? STILL : flashing ? LIFT : SETTLE}
      className={`relative inline-grid grid-flow-col items-center gap-1.5 rounded-[6px] px-1.5 py-[3px] text-[13px] font-medium tabular-nums transition-colors duration-200 ${tone} ${className}`}
    >
      {direction ? (
        <motion.span
          aria-hidden
          initial={{ opacity: 0 }}
          animate={{ opacity: flashing ? 1 : 0 }}
          transition={reduced ? STILL : flashing ? CELL : CLEAR}
          className={`pointer-events-none absolute inset-0 rounded-[6px] ${tint}`}
        />
      ) : null}

      <span aria-hidden className="relative inline-grid overflow-hidden">
        <AnimatePresence initial={false} mode="popLayout">
          <motion.span
            key={changeId}
            initial={
              reduced
                ? { opacity: 0 }
                : {
                    opacity: 0,
                    y: direction === "down" ? "-0.85em" : "0.85em",
                    filter: "blur(5px)",
                  }
            }
            animate={{ opacity: 1, y: "0em", filter: "blur(0px)" }}
            exit={
              reduced
                ? { opacity: 0, transition: STILL }
                : {
                    opacity: 0,
                    y: direction === "down" ? "0.7em" : "-0.7em",
                    filter: "blur(4px)",
                    transition: DROP,
                  }
            }
            transition={reduced ? STILL : ROLL}
            className="col-start-1 row-start-1"
          >
            {text}
          </motion.span>
        </AnimatePresence>
      </span>
      <span aria-hidden className="relative grid size-[1em] place-items-center">
        <AnimatePresence initial={false}>
          {flashing && direction ? (
            <motion.svg
              key={`${changeId}-${direction}`}
              viewBox="0 0 256 256"
              fill="currentColor"
              initial={
                reduced
                  ? { opacity: 0 }
                  : {
                      opacity: 0,
                      scale: 0.4,
                      y: direction === "up" ? "0.3em" : "-0.3em",
                    }
              }
              animate={{ opacity: 1, scale: 1, y: "0em" }}
              exit={
                reduced
                  ? { opacity: 0, transition: STILL }
                  : { opacity: 0, scale: 0.8, transition: CLEAR }
              }
              transition={reduced ? STILL : POP}
              className="col-start-1 row-start-1 block h-[0.68em] w-[0.68em]"
            >
              {GLYPH[direction]}
            </motion.svg>
          ) : null}
        </AnimatePresence>
      </span>
      <span className="sr-only" aria-live="polite">
        {label ? `${label}: ${settled}` : settled}
      </span>
    </motion.span>
  );
}
