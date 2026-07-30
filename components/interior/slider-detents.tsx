"use client";

import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import {
  motion,
  useMotionTemplate,
  useReducedMotion,
  useSpring,
} from "motion/react";

const CARRIAGE = { stiffness: 520, damping: 34, mass: 0.45 } as const;

const GRAB = { type: "spring", stiffness: 700, damping: 46, mass: 0.5 } as const;
const CROSSFADE = {
  type: "spring",
  stiffness: 260,
  damping: 34,
  mass: 0.8,
} as const;
const INSTANT = { duration: 0 } as const;
const THUMB = 18;

const plain = (value: number) => String(value);

function tidy(value: number) {
  return Math.round(value * 1e6) / 1e6;
}

export type SliderDetent = { value: number; label?: string };

const NONE: readonly (number | SliderDetent)[] = [];

export type UseSliderDetentsOptions = {
  value: number;
  onValueChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  detents?: readonly (number | SliderDetent)[];
  pull?: number;
  thumbSize?: number;
  disabled?: boolean;
  haptic?: boolean;
  format?: (value: number) => string;
  label?: string;
  labelledBy?: string;
};

export function useSliderDetents({
  value,
  onValueChange,
  min = 0,
  max = 100,
  step = 1,
  detents = NONE,
  pull,
  thumbSize = THUMB,
  disabled = false,
  haptic = true,
  format = plain,
  label,
  labelledBy,
}: UseSliderDetentsOptions) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);

  const list = useMemo<SliderDetent[]>(
    () => detents.map((d) => (typeof d === "number" ? { value: d } : d)),
    [detents],
  );

  const range = max - min;
  const grab = pull ?? range * 0.045;

  const emit = useRef(onValueChange);
  emit.current = onValueChange;
  const emitted = useRef(value);
  emitted.current = value;

  const activeDetent = useMemo(
    () => list.findIndex((d) => tidy(d.value) === tidy(value)),
    [list, value],
  );

  const marked = useRef(activeDetent);
  const held = useRef(false);

  const commit = useCallback(
    (next: number) => {
      const settled = Math.min(max, Math.max(min, tidy(next)));
      const index = list.findIndex((d) => tidy(d.value) === settled);
      if (index !== marked.current) {
        marked.current = index;
        if (haptic && index >= 0) navigator.vibrate?.(6);
      }
      if (settled !== emitted.current) {
        emitted.current = settled;
        emit.current(settled);
      }
    },
    [haptic, list, max, min],
  );

  const capture = useCallback(
    (clientX: number) => {
      const el = trackRef.current;
      if (!el || range <= 0) return null;
      const rect = el.getBoundingClientRect();
      const travel = rect.width - thumbSize;
      if (travel <= 0) return null;

      const ratio = (clientX - rect.left - thumbSize / 2) / travel;
      const raw = Math.min(max, Math.max(min, min + ratio * range));

      let index = -1;
      let nearest = grab;
      for (let i = 0; i < list.length; i += 1) {
        const distance = Math.abs(raw - list[i].value);
        if (distance <= nearest) {
          nearest = distance;
          index = i;
        }
      }
      if (index >= 0) return list[index].value;
      return min + Math.round((raw - min) / step) * step;
    },
    [grab, list, max, min, range, step, thumbSize],
  );

  const release = useCallback(() => {
    if (!held.current) return;
    held.current = false;
    setDragging(false);
  }, []);

  const toDetent = useCallback(
    (direction: number) => {
      const sorted = list.map((d) => d.value).toSorted((a, b) => a - b);
      const forward = sorted.find((d) => d > value + 1e-6);
      const backward = sorted.findLast((d) => d < value - 1e-6);
      const target = direction > 0 ? forward : backward;
      commit(target ?? (direction > 0 ? max : min));
    },
    [commit, list, max, min, value],
  );

  useEffect(() => {
    window.addEventListener("blur", release);
    return () => window.removeEventListener("blur", release);
  }, [release]);

  const detentLabel = list[activeDetent]?.label;
  const valueText = detentLabel
    ? `${format(value)}, ${detentLabel}`
    : format(value);

  const percent = range > 0 ? Math.min(1, Math.max(0, (value - min) / range)) : 0;

  const trackProps = {
    role: "slider" as const,
    tabIndex: 0,
    "aria-orientation": "horizontal" as const,
    "aria-valuemin": min,
    "aria-valuemax": max,
    "aria-valuenow": value,
    "aria-valuetext": valueText,
    "aria-disabled": disabled || undefined,
    "aria-label": labelledBy ? undefined : label,
    "aria-labelledby": labelledBy,
    style: { touchAction: "none" as const },
    onPointerDown: (e: React.PointerEvent<HTMLDivElement>) => {
      if (disabled) return;
      if (e.pointerType === "mouse" && e.button !== 0) return;
      e.currentTarget.setPointerCapture?.(e.pointerId);
      e.currentTarget.focus({ preventScroll: true });
      held.current = true;
      setDragging(true);
      const next = capture(e.clientX);
      if (next !== null) commit(next);
    },
    onPointerMove: (e: React.PointerEvent<HTMLDivElement>) => {
      if (!held.current) return;
      const next = capture(e.clientX);
      if (next !== null) commit(next);
    },
    onPointerUp: release,
    onPointerCancel: release,
    onLostPointerCapture: release,
    onKeyDown: (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (disabled) return;
      const forward = e.key === "ArrowRight" || e.key === "ArrowUp";
      const back = e.key === "ArrowLeft" || e.key === "ArrowDown";

      if (forward || back) {
        const direction = forward ? 1 : -1;
        if (e.shiftKey) toDetent(direction);
        else commit(value + direction * step);
      } else if (e.key === "PageUp") {
        toDetent(1);
      } else if (e.key === "PageDown") {
        toDetent(-1);
      } else if (e.key === "Home") {
        commit(min);
      } else if (e.key === "End") {
        commit(max);
      } else {
        return;
      }
      e.preventDefault();
    },
  };

  return {
    trackRef,
    trackProps,
    detents: list,
    activeDetent,
    percent,
    dragging,
    valueText,
  };
}

export type SliderDetentsProps = {
  value: number;
  onValueChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  detents?: readonly (number | SliderDetent)[];
  pull?: number;
  label?: string;
  format?: (value: number) => string;
  disabled?: boolean;
  haptic?: boolean;
  className?: string;
};

export function SliderDetents({
  value,
  onValueChange,
  min = 0,
  max = 100,
  step = 1,
  detents = NONE,
  pull,
  label = "Value",
  format = plain,
  disabled = false,
  haptic = true,
  className = "",
}: SliderDetentsProps) {
  const labelId = useId();
  const reduced = useReducedMotion();

  const {
    trackRef,
    trackProps,
    detents: list,
    activeDetent,
    percent,
    dragging,
  } = useSliderDetents({
    value,
    onValueChange,
    min,
    max,
    step,
    detents,
    pull,
    disabled,
    haptic,
    format,
    labelledBy: labelId,
  });

  const carriage = useSpring(percent * 100, CARRIAGE);
  const offset = useMotionTemplate`${carriage}%`;

  useEffect(() => {
    const target = percent * 100;
    if (reduced) carriage.jump(target);
    else carriage.set(target);
  }, [carriage, percent, reduced]);

  const widest = useMemo(() => {
    const options = [
      format(min),
      format(max),
      ...list.map((d) =>
        d.label ? `${format(d.value)} · ${d.label}` : format(d.value),
      ),
    ];
    return options.reduce((a, b) => (b.length > a.length ? b : a), "");
  }, [format, list, max, min]);

  const suffix = list[activeDetent]?.label ?? "";

  const lastLabel = useRef(suffix);
  if (suffix) lastLabel.current = suffix;

  const span = max - min;

  return (
    <div className={`w-full select-none ${className}`}>
      <div className="mb-2.5 flex items-baseline justify-between gap-3">
        <span
          id={labelId}
          className="text-[12.5px] text-stone-500 dark:text-stone-400"
        >
          {label}
        </span>
        <span className="grid justify-items-start">
          <span
            aria-hidden
            className="invisible col-start-1 row-start-1 whitespace-pre font-mono text-[11px] tabular-nums"
          >
            {widest}
          </span>
          <span
            aria-hidden
            className="col-start-1 row-start-1 whitespace-pre font-mono text-[11px] tabular-nums text-stone-700 dark:text-stone-200"
          >
            {format(value)}
            <motion.span
              initial={false}
              animate={{ opacity: suffix ? 1 : 0 }}
              transition={reduced ? INSTANT : CROSSFADE}
              className="text-stone-500 dark:text-stone-400"
            >
              {lastLabel.current ? ` · ${lastLabel.current}` : ""}
            </motion.span>
          </span>
        </span>
      </div>
      <div
        ref={trackRef}
        {...trackProps}
        className={`relative h-9 w-full rounded-[9px] outline-none focus-visible:bg-[#4568FF]/[0.06] focus-visible:shadow-[inset_0_0_0_1px_#4568FF] dark:focus-visible:bg-[#93B0FF]/[0.1] dark:focus-visible:shadow-[inset_0_0_0_1px_#93B0FF] ${
          disabled
            ? "pointer-events-none opacity-50"
            : dragging
              ? "cursor-grabbing"
              : "cursor-grab"
        }`}
      >
        <div className="pointer-events-none absolute inset-x-0 top-[9px] h-[10px] overflow-hidden rounded-[5px] bg-stone-200 dark:bg-white/15">
          <div
            className="absolute inset-y-0"
            style={{ left: THUMB / 2, right: THUMB / 2 }}
          >
            <motion.div
              className="absolute inset-y-0 left-0 right-0"
              style={{ x: offset }}
            >
              <div className="absolute inset-y-0 right-full w-[2000px] bg-stone-800 dark:bg-stone-100" />
            </motion.div>
          </div>
        </div>
        <div
          className="pointer-events-none absolute inset-y-0"
          style={{ left: THUMB / 2, right: THUMB / 2 }}
        >

          {list.map((d) => (
            <span
              key={String(d.value)}
              aria-hidden
              className="absolute top-[26px] block h-[5px] w-[2px] -translate-x-1/2 bg-stone-800/35 dark:bg-stone-100/35"
              style={{
                left: span > 0 ? `${((d.value - min) / span) * 100}%` : "0%",
              }}
            />
          ))}
        </div>
        <div
          className="pointer-events-none absolute inset-y-0"
          style={{ left: THUMB / 2, right: THUMB / 2 }}
        >
          <motion.div
            className="absolute inset-y-0 left-0 right-0"
            style={{ x: offset }}
          >
            <motion.div
              className="absolute top-[4px] h-[20px] w-[18px] rounded-[6px] border-2 border-white bg-stone-800 dark:border-stone-900 dark:bg-stone-100"
              style={{ marginLeft: -THUMB / 2 }}
              initial={false}
              animate={{ scale: dragging ? 1.08 : 1 }}
              transition={reduced ? INSTANT : GRAB}
            />
          </motion.div>
        </div>
      </div>
    </div>
  );
}
