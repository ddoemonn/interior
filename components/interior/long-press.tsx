"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";

const CELL = { type: "spring", stiffness: 520, damping: 34, mass: 0.45 } as const;
const POP = { type: "spring", stiffness: 640, damping: 22, mass: 0.7 } as const;
const INSTANT = { duration: 0 } as const;

export type UseLongPressOptions = {
  onLongPress: () => void;
  duration?: number;
  steps?: number;
  moveTolerance?: number;
  haptic?: boolean;
  disabled?: boolean;
  onCancel?: () => void;
};

type Phase = "idle" | "holding" | "fired";

export function useLongPress({
  onLongPress,
  duration = 550,
  steps = 12,
  moveTolerance = 8,
  haptic = true,
  disabled = false,
  onCancel,
}: UseLongPressOptions) {
  const cells = Math.max(1, Math.round(steps));

  const [step, setStep] = useState(0);
  const [holding, setHolding] = useState(false);

  const phase = useRef<Phase>("idle");
  const raf = useRef(0);
  const startedAt = useRef(0);
  const origin = useRef<{ x: number; y: number } | null>(null);
  const settle = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fire = useRef(onLongPress);
  fire.current = onLongPress;
  const cancelled = useRef(onCancel);
  cancelled.current = onCancel;

  const reset = useCallback(() => {
    cancelAnimationFrame(raf.current);
    raf.current = 0;
    if (settle.current) {
      clearTimeout(settle.current);
      settle.current = null;
    }
    origin.current = null;
    phase.current = "idle";
    setHolding(false);
    setStep(0);
  }, []);

  const end = useCallback(() => {
    if (phase.current !== "holding") return;
    reset();
    cancelled.current?.();
  }, [reset]);

  const begin = useCallback(
    (point?: { x: number; y: number }) => {
      if (disabled || phase.current !== "idle") return;

      phase.current = "holding";
      origin.current = point ?? null;
      startedAt.current = performance.now();
      setHolding(true);
      setStep(0);

      const tick = (now: number) => {
        const p = Math.min(1, (now - startedAt.current) / duration);

        const s = Math.floor(p * cells);
        setStep((prev) => (prev === s ? prev : s));

        if (p < 1) {
          raf.current = requestAnimationFrame(tick);
          return;
        }

        raf.current = 0;
        phase.current = "fired";
        setStep(cells);
        if (haptic) navigator.vibrate?.(12);
        fire.current();

        settle.current = setTimeout(() => {
          if (phase.current === "fired") reset();
        }, 260);
      };

      raf.current = requestAnimationFrame(tick);
    },
    [disabled, duration, cells, haptic, reset],
  );

  useEffect(() => {
    const bail = () => end();
    const onVisibility = () => document.hidden && end();
    window.addEventListener("blur", bail);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.removeEventListener("blur", bail);
      document.removeEventListener("visibilitychange", onVisibility);
      cancelAnimationFrame(raf.current);
      if (settle.current) clearTimeout(settle.current);
    };
  }, [end]);

  const bind = {
    onPointerDown: (e: React.PointerEvent) => {
      if (e.button !== 0 && e.pointerType === "mouse") return;
      e.currentTarget.setPointerCapture?.(e.pointerId);
      begin({ x: e.clientX, y: e.clientY });
    },
    onPointerMove: (e: React.PointerEvent) => {
      const from = origin.current;
      if (phase.current !== "holding" || !from) return;
      if (Math.hypot(e.clientX - from.x, e.clientY - from.y) > moveTolerance) {
        end();
      }
    },
    onPointerUp: end,
    onPointerCancel: end,
    onPointerLeave: end,
    onKeyDown: (e: React.KeyboardEvent) => {
      if (e.repeat) return;
      if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        begin();
      }
    },
    onKeyUp: (e: React.KeyboardEvent) => {
      if (e.key === " " || e.key === "Enter") end();
      if (e.key === "Escape") end();
    },
    onBlur: end,
    onClick: (e: React.MouseEvent) => {
      if (phase.current === "fired") {
        e.preventDefault();
        e.stopPropagation();
      }
    },
    onContextMenu: (e: React.MouseEvent) => e.preventDefault(),
  };

  return {
    bind,
    step,
    steps: cells,
    holding,
    fired: step === cells,
    progress: step / cells,
  };
}

export type LongPressButtonProps = {
  onLongPress: () => void;
  children: React.ReactNode;
  duration?: number;
  steps?: number;
  disabled?: boolean;
  className?: string;
};

export function LongPressButton({
  onLongPress,
  children,
  duration = 550,
  steps = 12,
  disabled = false,
  className = "",
}: LongPressButtonProps) {
  const hintId = useId();
  const reduced = useReducedMotion() === true;
  const { bind, step, steps: cells, holding, fired } = useLongPress({
    onLongPress,
    duration,
    steps,
    disabled,
  });

  const progress = fired ? 1 : step / cells;

  return (
    <motion.button
      type="button"
      aria-disabled={disabled}
      aria-describedby={hintId}
      initial={false}
      animate={{ scale: !reduced && fired ? 1.045 : 1 }}
      transition={reduced ? INSTANT : POP}
      className={`group relative inline-flex h-9 select-none items-center rounded-[9px] bg-white px-[15px] text-[13px] font-medium shadow-[0_0_0_1px_rgba(0,0,0,0.12),0_1px_2px_rgba(0,0,0,0.06)] outline-none transition-[filter,transform] duration-150 focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-2 focus-visible:outline-[#4568FF] dark:bg-[#282828] dark:shadow-[0_0_0_1px_#202020,0_1px_2px_rgba(0,0,0,0.25)] ${
        holding
          ? "translate-y-px brightness-[0.97] dark:brightness-90"
          : fired
            ? ""
            : "hover:brightness-[0.98] dark:hover:brightness-110"
      } ${disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"} ${className}`}
      style={{ touchAction: "manipulation", WebkitTouchCallout: "none" }}
      {...bind}
    >
      <span className="relative grid">
        <span className="col-start-1 row-start-1 whitespace-nowrap text-neutral-700 dark:text-neutral-200">
          {children}
        </span>
        <motion.span
          aria-hidden
          initial={false}
          animate={{
            clipPath: `inset(0 ${((1 - progress) * 100).toFixed(2)}% 0 0)`,
          }}
          transition={reduced ? INSTANT : CELL}
          className="col-start-1 row-start-1 whitespace-nowrap text-[#4568FF]"
        >
          {children}
        </motion.span>
      </span>
      <span id={hintId} className="sr-only">
        Press and hold for {Math.round(duration / 100) / 10} seconds to confirm
      </span>
    </motion.button>
  );
}
