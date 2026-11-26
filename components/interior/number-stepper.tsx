"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent,
} from "react";
import {
  AnimatePresence,
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
} from "motion/react";

const ROLL = { type: "spring", stiffness: 700, damping: 40, mass: 0.4 } as const;
const BUMP = { type: "spring", stiffness: 620, damping: 22, mass: 0.5 } as const;
const DROP = { duration: 0.09, ease: [0.4, 0, 1, 1] } as const;
const INSTANT = { duration: 0 } as const;

const WAIT = 380;
const SLOW = 120;
const FAST = 38;
const RAMP = 0.86;
const WARN = 620;

const plain = (value: number) => value.toLocaleString("en-US");

export type StepDirection = 1 | -1;

export type UseNumberStepperOptions = {
  value: number;
  onValueChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
};

export type NumberStepperState = {
  direction: StepDirection;
  atMin: boolean;
  atMax: boolean;
  blocked: StepDirection | null;
  bumps: number;
  running: boolean;
  nudge: (direction: StepDirection) => void;
  hold: (direction: StepDirection) => {
    onPointerDown: (event: PointerEvent<HTMLButtonElement>) => void;
    onPointerUp: () => void;
    onPointerLeave: () => void;
    onPointerCancel: () => void;
    onLostPointerCapture: () => void;
    onClick: (event: { detail: number }) => void;
  };
  field: {
    role: "spinbutton";
    tabIndex: number;
    "aria-valuenow": number;
    "aria-valuemin": number | undefined;
    "aria-valuemax": number | undefined;
    onKeyDown: (event: KeyboardEvent<HTMLElement>) => void;
  };
};

export function useNumberStepper({
  value,
  onValueChange,
  min,
  max,
  step = 1,
  disabled = false,
}: UseNumberStepperOptions): NumberStepperState {
  const [direction, setDirection] = useState<StepDirection>(1);
  const [blocked, setBlocked] = useState<StepDirection | null>(null);
  const [bumps, setBumps] = useState(0);
  const [running, setRunning] = useState(false);

  const latest = useRef(value);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const warn = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    latest.current = value;
  }, [value]);

  const stop = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
    setRunning(false);
  }, []);

  const nudge = useCallback(
    (toward: StepDirection) => {
      if (disabled) return false;
      const raw = latest.current + toward * step;
      const next = Math.min(max ?? Infinity, Math.max(min ?? -Infinity, raw));
      setDirection(toward);
      if (next === latest.current) {
        setBlocked(toward);
        setBumps((n) => n + 1);
        if (warn.current) clearTimeout(warn.current);
        warn.current = setTimeout(() => setBlocked(null), WARN);
        return false;
      }
      latest.current = next;
      onValueChange(next);
      return true;
    },
    [disabled, max, min, onValueChange, step],
  );

  const run = useCallback(
    (toward: StepDirection, delay: number) => {
      timer.current = setTimeout(() => {
        if (!nudge(toward)) {
          stop();
          return;
        }
        setRunning(true);
        run(toward, Math.max(FAST, delay * RAMP));
      }, delay);
    },
    [nudge, stop],
  );

  useEffect(() => {
    const release = () => stop();
    window.addEventListener("blur", release);
    document.addEventListener("visibilitychange", release);
    return () => {
      window.removeEventListener("blur", release);
      document.removeEventListener("visibilitychange", release);
      stop();
      if (warn.current) clearTimeout(warn.current);
    };
  }, [stop]);

  const hold = useCallback(
    (toward: StepDirection) => ({
      onPointerDown: (event: PointerEvent<HTMLButtonElement>) => {
        if (event.button !== 0 || disabled) return;
        event.currentTarget.setPointerCapture(event.pointerId);
        stop();
        if (nudge(toward)) {
          timer.current = setTimeout(() => run(toward, SLOW), WAIT);
        }
      },
      onPointerUp: stop,
      onPointerLeave: stop,
      onPointerCancel: stop,
      onLostPointerCapture: stop,
      onClick: (event: { detail: number }) => {
        if (event.detail === 0) nudge(toward);
      },
    }),
    [disabled, nudge, run, stop],
  );

  const onKeyDown = useCallback(
    (event: KeyboardEvent<HTMLElement>) => {
      if (event.key === "ArrowUp" || event.key === "ArrowRight") {
        event.preventDefault();
        nudge(1);
      } else if (event.key === "ArrowDown" || event.key === "ArrowLeft") {
        event.preventDefault();
        nudge(-1);
      } else if (event.key === "Home" && min !== undefined) {
        event.preventDefault();
        setDirection(-1);
        latest.current = min;
        onValueChange(min);
      } else if (event.key === "End" && max !== undefined) {
        event.preventDefault();
        setDirection(1);
        latest.current = max;
        onValueChange(max);
      }
    },
    [max, min, nudge, onValueChange],
  );

  return {
    direction,
    atMin: min !== undefined && value <= min,
    atMax: max !== undefined && value >= max,
    blocked,
    bumps,
    running,
    nudge: (toward) => {
      nudge(toward);
    },
    hold,
    field: {
      role: "spinbutton",
      tabIndex: disabled ? -1 : 0,
      "aria-valuenow": value,
      "aria-valuemin": min,
      "aria-valuemax": max,
      onKeyDown,
    },
  };
}

const KEY =
  "grid size-7 place-items-center rounded-[7px] border border-black/[0.13] bg-white bg-[linear-gradient(180deg,rgba(255,255,255,0),rgba(0,0,0,0.035))] text-neutral-700 shadow-[inset_0_1px_0_rgba(255,255,255,0.95),inset_0_-1px_0_rgba(0,0,0,0.05)] outline-none transition-[color,opacity,transform] duration-100 active:translate-y-px focus-visible:shadow-[0_0_0_2px_#0F6FFF] aria-disabled:opacity-40 dark:border-[#050505] dark:bg-[#2E2E2D] dark:bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0))] dark:text-neutral-200 dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.09),inset_0_-1px_0_rgba(0,0,0,0.35)] dark:focus-visible:shadow-[0_0_0_2px_#2E8BFF]";

export type NumberStepperProps = UseNumberStepperOptions & {
  label: string;
  format?: (value: number) => string;
  className?: string;
};

export function NumberStepper({
  label,
  format = plain,
  className = "",
  ...options
}: NumberStepperProps) {
  const reduced = useReducedMotion();
  const { direction, atMin, atMax, blocked, bumps, running, hold, field } = useNumberStepper(options);
  const { value, min, max, disabled } = options;
  const x = useMotionValue(0);

  const wall = useRef<StepDirection | null>(null);
  wall.current = blocked;

  useEffect(() => {
    if (bumps === 0 || reduced || wall.current === null) return;
    x.set(wall.current * 4);
    animate(x, 0, BUMP);
  }, [bumps, reduced, x]);

  const widest = Math.max(format(min ?? value).length, format(max ?? value).length, format(value).length);

  return (
    <div
      className={`relative inline-flex select-none items-center gap-1 rounded-[11px] bg-neutral-100 p-[4px] shadow-[inset_0_1px_2px_rgba(0,0,0,0.09),inset_0_0_0_1px_rgba(0,0,0,0.07),0_1px_0_rgba(255,255,255,0.95)] dark:bg-[#121211] dark:shadow-[inset_0_1px_2px_rgba(0,0,0,0.6),inset_0_0_0_1px_rgba(0,0,0,0.5),0_1px_0_rgba(255,255,255,0.055)] ${
        disabled ? "opacity-50" : ""
      } ${className}`}
      style={{ touchAction: "manipulation" }}
    >
      {min !== undefined && max !== undefined && max > min ? (
        <span
          aria-hidden
          className="pointer-events-none absolute inset-x-[38px] bottom-[5px] h-[2px] overflow-hidden rounded-full bg-neutral-900/[0.08] dark:bg-white/[0.1]"
        >
          <span
            className="block h-full origin-left rounded-full bg-[linear-gradient(90deg,#0F6FFF,#7A3DFF)] transition-transform duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] dark:bg-[linear-gradient(90deg,#2E8BFF,#9B6BFF)]"
            style={{ transform: `scaleX(${Math.round(((value - min) / (max - min)) * 1000) / 1000})` }}
          />
        </span>
      ) : null}

      <button
        type="button"
        tabIndex={-1}
        aria-label={`Decrease ${label}`}
        aria-disabled={atMin || disabled}
        {...hold(-1)}
        className={KEY}
      >
        <svg viewBox="0 0 16 16" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden>
          <path d="M3.5 8h9" />
        </svg>
      </button>

      <motion.span
        {...field}
        aria-label={label}
        aria-valuetext={format(value)}
        style={{ x, minWidth: `calc(${widest}ch + 20px)` }}
        className={`relative inline-grid h-7 place-items-center overflow-hidden rounded-[7px] px-2 text-[13.5px] font-medium tabular-nums outline-none transition-colors duration-200 focus-visible:shadow-[inset_0_0_0_1.5px_#0F6FFF] dark:focus-visible:shadow-[inset_0_0_0_1.5px_#2E8BFF] ${
          blocked !== null
            ? "text-[#B87400] dark:text-[#FFC21F]"
            : "text-neutral-900 dark:text-neutral-100"
        }`}
      >
        <span aria-hidden className="inline-flex">
          {Array.from(format(value)).map((char, i, all) => (
            <span key={all.length - i} className="relative inline-grid overflow-hidden">
              <AnimatePresence initial={false} mode="popLayout">
                <motion.span
                  key={char}
                  initial={
                    reduced || running
                      ? false
                      : { y: direction > 0 ? "0.5em" : "-0.5em", opacity: 0 }
                  }
                  animate={{ y: "0em", opacity: 1 }}
                  exit={
                    reduced || running
                      ? { opacity: 0, transition: INSTANT }
                      : { y: direction > 0 ? "-0.5em" : "0.5em", opacity: 0, transition: DROP }
                  }
                  transition={reduced || running ? INSTANT : ROLL}
                  className="col-start-1 row-start-1"
                >
                  {char}
                </motion.span>
              </AnimatePresence>
            </span>
          ))}
        </span>
      </motion.span>

      <button
        type="button"
        tabIndex={-1}
        aria-label={`Increase ${label}`}
        aria-disabled={atMax || disabled}
        {...hold(1)}
        className={KEY}
      >
        <svg viewBox="0 0 16 16" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden>
          <path d="M3.5 8h9M8 3.5v9" />
        </svg>
      </button>
    </div>
  );
}
