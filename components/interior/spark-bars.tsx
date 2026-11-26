"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent,
} from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

const SNAP = { type: "spring", stiffness: 700, damping: 44, mass: 0.6 } as const;
const GROW = { type: "spring", stiffness: 320, damping: 30, mass: 0.8 } as const;
const SWAP = { type: "spring", stiffness: 520, damping: 36, mass: 0.6 } as const;
const LEAVE = { duration: 0.1, ease: [0.4, 0, 1, 1] } as const;
const INSTANT = { duration: 0 } as const;

const STAGGER = 0.022;

const plain = (value: number) => value.toLocaleString("en-US");

export type SparkPoint = { label: string; value: number };

export type UseSparkBarsOptions = {
  data: SparkPoint[];
};

export type SparkBarsState = {
  active: number | null;
  best: number;
  max: number;
  total: number;
  plot: {
    ref: (node: HTMLDivElement | null) => void;
    tabIndex: number;
    role: "slider";
    "aria-valuemin": number;
    "aria-valuemax": number;
    "aria-valuenow": number;
    "aria-valuetext": string;
    onPointerMove: (event: PointerEvent<HTMLDivElement>) => void;
    onPointerLeave: () => void;
    onKeyDown: (event: KeyboardEvent<HTMLDivElement>) => void;
    onBlur: () => void;
  };
};

export function useSparkBars({ data }: UseSparkBarsOptions): SparkBarsState {
  const [active, setActive] = useState<number | null>(null);
  const node = useRef<HTMLDivElement | null>(null);
  const count = data.length;

  const max = data.reduce((m, p) => Math.max(m, p.value), 0);
  const total = data.reduce((sum, p) => sum + p.value, 0);
  const best = data.reduce((at, p, i) => (p.value > data[at].value ? i : at), 0);

  useEffect(() => {
    setActive((current) => (current !== null && current >= count ? null : current));
  }, [count]);

  const onPointerMove = useCallback(
    (event: PointerEvent<HTMLDivElement>) => {
      const box = node.current?.getBoundingClientRect();
      if (!box || count === 0) return;
      const share = (event.clientX - box.left) / box.width;
      setActive(Math.min(count - 1, Math.max(0, Math.floor(share * count))));
    },
    [count],
  );

  const onKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      if (count === 0) return;
      const at = active ?? best;
      const next =
        event.key === "ArrowRight" || event.key === "ArrowUp"
          ? Math.min(count - 1, at + 1)
          : event.key === "ArrowLeft" || event.key === "ArrowDown"
            ? Math.max(0, at - 1)
            : event.key === "Home"
              ? 0
              : event.key === "End"
                ? count - 1
                : event.key === "Escape"
                  ? -1
                  : null;
      if (next === null) return;
      event.preventDefault();
      setActive(next < 0 ? null : next);
    },
    [active, best, count],
  );

  const shown = active ?? best;

  return {
    active,
    best,
    max,
    total,
    plot: {
      ref: (el) => {
        node.current = el;
      },
      tabIndex: 0,
      role: "slider",
      "aria-valuemin": 0,
      "aria-valuemax": Math.max(0, count - 1),
      "aria-valuenow": shown,
      "aria-valuetext": count ? `${data[shown].label}: ${data[shown].value}` : "",
      onPointerMove,
      onPointerLeave: () => setActive(null),
      onKeyDown,
      onBlur: () => setActive(null),
    },
  };
}

export type SparkBarsProps = {
  data: SparkPoint[];
  label: string;
  unit?: string;
  mark?: string;
  format?: (value: number) => string;
  className?: string;
};

export function SparkBars({
  data,
  label,
  unit,
  mark,
  format = plain,
  className = "",
}: SparkBarsProps) {
  const reduced = useReducedMotion();
  const { active, best, max, total, plot } = useSparkBars({ data });
  const count = Math.max(1, data.length);
  const point = active !== null ? data[active] : null;

  return (
    <div
      className={`w-full rounded-[14px] bg-neutral-100 p-3 shadow-[inset_0_1px_2px_rgba(0,0,0,0.09),inset_0_0_0_1px_rgba(0,0,0,0.07),0_1px_0_rgba(255,255,255,0.95)] dark:bg-[#121211] dark:shadow-[inset_0_1px_2px_rgba(0,0,0,0.6),inset_0_0_0_1px_rgba(0,0,0,0.5),0_1px_0_rgba(255,255,255,0.055)] ${className}`}
    >
      <div className="flex items-baseline justify-between gap-3">
        <span className="min-w-0 truncate text-[12.5px] text-neutral-500 dark:text-neutral-400">
          {point ? point.label : label}
        </span>
        <span className="shrink-0 text-[11px] text-neutral-400 dark:text-neutral-500">
          {mark}
        </span>
      </div>
      <div className="mt-0.5 flex items-baseline gap-1.5 tabular-nums">
        <span className="relative inline-grid overflow-hidden text-[22px] font-medium leading-7 tracking-[-0.03em] text-neutral-900 dark:text-neutral-100">
          <AnimatePresence initial={false} mode="popLayout">
            <motion.span
              key={point ? "point" : "total"}
              initial={reduced ? { opacity: 0 } : { opacity: 0, y: "0.5em", filter: "blur(4px)" }}
              animate={{ opacity: 1, y: "0em", filter: "blur(0px)" }}
              exit={
                reduced
                  ? { opacity: 0, transition: INSTANT }
                  : { opacity: 0, y: "-0.5em", filter: "blur(4px)", transition: LEAVE }
              }
              transition={reduced ? INSTANT : SWAP}
              className="col-start-1 row-start-1"
            >
              {format(point ? point.value : total)}
            </motion.span>
          </AnimatePresence>
        </span>
        {unit ? (
          <span className="text-[12.5px] text-neutral-500 dark:text-neutral-400">{unit}</span>
        ) : null}
      </div>

      <div
        {...plot}
        aria-label={label}
        className="relative mt-3 grid h-[88px] cursor-crosshair touch-none items-end rounded-[6px] outline-none focus-visible:shadow-[0_0_0_2px_#0F6FFF] dark:focus-visible:shadow-[0_0_0_2px_#2E8BFF]"
        style={{ gridTemplateColumns: `repeat(${count}, minmax(0, 1fr))` }}
      >
        {active !== null ? (
          <motion.span
            aria-hidden
            initial={false}
            animate={{ x: `${active * 100}%` }}
            transition={reduced ? INSTANT : SNAP}
            className="pointer-events-none absolute inset-y-[-4px] left-0 rounded-[5px] bg-neutral-900/[0.06] dark:bg-white/[0.07]"
            style={{ width: `${100 / count}%` }}
          />
        ) : null}

        {max > 0 ? (
          <span
            aria-hidden
            className="pointer-events-none absolute inset-x-0 flex items-center gap-1.5"
            style={{ bottom: `${Math.round((total / count / max) * 100)}%` }}
          >
            <span className="h-px flex-1 bg-[repeating-linear-gradient(90deg,currentColor_0_3px,transparent_3px_6px)] text-neutral-400/70 dark:text-white/25" />
            <span className="text-[10.5px] tabular-nums text-neutral-400 dark:text-neutral-500">
              avg {format(Math.round(total / count))}
            </span>
          </span>
        ) : null}

        {data.map((p, i) => {
          const height = max > 0 ? Math.max(4, Math.round((p.value / max) * 100)) : 4;
          const dim = active !== null && active !== i;
          return (
            <span
              key={p.label}
              aria-hidden
              className={`relative flex h-full items-end px-[1.5px] transition-transform duration-200 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
                active === i ? "-translate-y-[3px]" : ""
              }`}
            >
              <motion.span
                initial={reduced ? false : { scaleY: 0 }}
                animate={{ scaleY: 1 }}
                transition={reduced ? INSTANT : { ...GROW, delay: i * STAGGER }}
                className={`block w-full origin-bottom rounded-[3px] bg-[linear-gradient(180deg,#00B3A1,#0F6FFF)] shadow-[inset_0_1px_0_rgba(255,255,255,0.55)] transition-opacity duration-150 dark:bg-[linear-gradient(180deg,#14E3C5,#2E8BFF)] ${
                  dim ? "opacity-45" : "opacity-100"
                }`}
                style={{ height: `${height}%` }}
              />
              {i === best && active === null ? (
                <span
                  className="absolute left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-[#00B3A1]/[0.14] px-1.5 text-[10.5px] font-medium leading-4 text-[#008577] dark:bg-[#14E3C5]/[0.16] dark:text-[#14E3C5]"
                  style={{ bottom: `calc(${height}% + 5px)` }}
                >
                  Best
                </span>
              ) : null}
            </span>
          );
        })}
      </div>

      <div className="mt-2 flex justify-between text-[11px] tabular-nums text-neutral-400 dark:text-neutral-500">
        <span>{data[0]?.label}</span>
        <span>{data[data.length - 1]?.label}</span>
      </div>
    </div>
  );
}
