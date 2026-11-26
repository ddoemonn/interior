"use client";

import { useCallback, useEffect, useRef, type KeyboardEvent } from "react";
import {
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
  useTransform,
  type MotionValue,
  type PanInfo,
} from "motion/react";

const SETTLE = { type: "spring", stiffness: 520, damping: 30, mass: 0.7 } as const;

const TRAVEL = 20;
const FLICK = 220;
const SLOP = 3;

export type UseSpringSwitchOptions = {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
};

export type SpringSwitchState = {
  x: MotionValue<number>;
  travel: number;
  button: {
    role: "switch";
    "aria-checked": boolean;
    disabled: boolean;
    onClick: () => void;
    onKeyDown: (event: KeyboardEvent<HTMLButtonElement>) => void;
  };
  thumb: {
    drag: "x" | false;
    dragConstraints: { left: number; right: number };
    dragElastic: number;
    dragMomentum: boolean;
    onDragStart: () => void;
    onDragEnd: (event: unknown, info: PanInfo) => void;
  };
};

export function useSpringSwitch({
  checked,
  onCheckedChange,
  disabled = false,
}: UseSpringSwitchOptions): SpringSwitchState {
  const reduced = useReducedMotion();
  const x = useMotionValue(checked ? TRAVEL : 0);
  const dragged = useRef(false);

  const settle = useCallback(
    (to: boolean, velocity = 0) => {
      const target = to ? TRAVEL : 0;
      if (reduced) {
        x.set(target);
        return;
      }
      animate(x, target, { ...SETTLE, velocity });
    },
    [reduced, x],
  );

  useEffect(() => {
    settle(checked);
  }, [checked, settle]);

  const onClick = useCallback(() => {
    if (dragged.current) {
      dragged.current = false;
      return;
    }
    onCheckedChange(!checked);
  }, [checked, onCheckedChange]);

  const onKeyDown = useCallback(
    (event: KeyboardEvent<HTMLButtonElement>) => {
      if (event.key === "ArrowRight" && !checked) onCheckedChange(true);
      if (event.key === "ArrowLeft" && checked) onCheckedChange(false);
    },
    [checked, onCheckedChange],
  );

  const onDragEnd = useCallback(
    (_event: unknown, info: PanInfo) => {
      const moved = Math.abs(info.offset.x) > SLOP;
      dragged.current = moved;
      if (!moved) return;
      const next =
        Math.abs(info.velocity.x) > FLICK ? info.velocity.x > 0 : x.get() > TRAVEL / 2;
      if (next === checked) settle(checked, info.velocity.x);
      else onCheckedChange(next);
    },
    [checked, onCheckedChange, settle, x],
  );

  return {
    x,
    travel: TRAVEL,
    button: { role: "switch", "aria-checked": checked, disabled, onClick, onKeyDown },
    thumb: {
      drag: disabled ? false : "x",
      dragConstraints: { left: 0, right: TRAVEL },
      dragElastic: 0.14,
      dragMomentum: false,
      onDragStart: () => {
        dragged.current = false;
      },
      onDragEnd,
    },
  };
}

export type SpringSwitchProps = UseSpringSwitchOptions & {
  label: string;
  className?: string;
};

export function SpringSwitch({
  checked,
  onCheckedChange,
  disabled = false,
  label,
  className = "",
}: SpringSwitchProps) {
  const { x, travel, button, thumb } = useSpringSwitch({ checked, onCheckedChange, disabled });
  const lit = useTransform(x, [0, travel], [0, 1], { clamp: true });
  const stretch = useTransform(x, [-6, 0, travel, travel + 6], [1.12, 1, 1, 1.12]);

  return (
    <button
      type="button"
      aria-label={label}
      {...button}
      style={{ touchAction: "pan-y", WebkitTapHighlightColor: "transparent" }}
      className={`relative inline-flex h-[28px] w-[48px] shrink-0 items-center rounded-full bg-neutral-200 p-[3px] shadow-[inset_0_1px_2px_rgba(0,0,0,0.12),inset_0_0_0_1px_rgba(0,0,0,0.07),0_1px_0_rgba(255,255,255,0.95)] outline-none focus-visible:shadow-[0_0_0_2px_#fff,0_0_0_4px_#0F6FFF] disabled:opacity-50 dark:bg-[#121211] dark:shadow-[inset_0_1px_2px_rgba(0,0,0,0.6),inset_0_0_0_1px_rgba(0,0,0,0.5),0_1px_0_rgba(255,255,255,0.055)] dark:focus-visible:shadow-[0_0_0_2px_#1e1e1d,0_0_0_4px_#2E8BFF] ${className}`}
    >
      <motion.span
        aria-hidden
        style={{ opacity: lit }}
        className="absolute inset-0 rounded-full bg-[linear-gradient(180deg,#19C96A,#06B457)] shadow-[inset_0_1px_0_rgba(255,255,255,0.35),inset_0_0_0_1px_rgba(0,0,0,0.12)] dark:bg-[linear-gradient(180deg,#4BF09A,#2FE582)]"
      />
      <motion.span
        aria-hidden
        {...thumb}
        style={{ x, scaleX: stretch }}
        whileTap={disabled ? undefined : { scale: 0.94 }}
        className="relative grid size-[22px] place-items-center rounded-full border border-black/[0.16] bg-white bg-[linear-gradient(180deg,rgba(255,255,255,0),rgba(0,0,0,0.06))] shadow-[inset_0_1px_0_rgba(255,255,255,0.95),0_1px_2px_rgba(0,0,0,0.2)] dark:border-black dark:bg-neutral-100 dark:bg-[linear-gradient(180deg,#fff,rgba(214,214,210,0.9))] dark:shadow-[inset_0_1px_0_#fff,0_1px_2px_rgba(0,0,0,0.55)]"
      >
        <svg viewBox="0 0 16 16" width="11" height="11" fill="none">
          <motion.path
            d="M3.2 8.4l3 2.9L12.8 5"
            stroke="#06B457"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ pathLength: lit, opacity: lit }}
          />
        </svg>
      </motion.span>
    </button>
  );
}
