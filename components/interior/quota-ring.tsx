"use client";

import { useEffect, useRef } from "react";
import {
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useSpring,
  useTransform,
} from "motion/react";

const SWEEP = { stiffness: 140, damping: 16, mass: 1 } as const;
const COUNT = { stiffness: 120, damping: 24, mass: 1 } as const;

const RADIUS = 42;
const LENGTH = 2 * Math.PI * RADIUS;
const GAP = 0.25;
const ARC = LENGTH * (1 - GAP);
const TURN = 2 * Math.PI * (1 - GAP);
const round = (value: number) => Math.round(value * 100) / 100;
const TICKS = Array.from({ length: 28 }, (_, i) => (i / 27) * TURN);

const plain = (value: number) => value.toLocaleString("en-US");

export type QuotaTone = "good" | "warn" | "over";

export type UseQuotaRingOptions = {
  value: number;
  max: number;
  warnAt?: number;
  overAt?: number;
};

export type QuotaRingState = {
  ratio: number;
  percent: number;
  tone: QuotaTone;
  left: number;
};

export function useQuotaRing({
  value,
  max,
  warnAt = 0.7,
  overAt = 0.9,
}: UseQuotaRingOptions): QuotaRingState {
  const ratio = max > 0 ? Math.min(1, Math.max(0, value / max)) : 0;
  const tone: QuotaTone = ratio >= overAt ? "over" : ratio >= warnAt ? "warn" : "good";
  return { ratio, percent: Math.round(ratio * 100), tone, left: Math.max(0, max - value) };
}

const STROKE: Record<QuotaTone, string> = {
  good: "stroke-[#06B457] dark:stroke-[#2FE582]",
  warn: "stroke-[#F29D00] dark:stroke-[#FFC21F]",
  over: "stroke-[#F2303F] dark:stroke-[#FF4658]",
};

const INK: Record<QuotaTone, string> = {
  good: "text-[#058A43] dark:text-[#2FE582]",
  warn: "text-[#B87400] dark:text-[#FFC21F]",
  over: "text-[#D11F2E] dark:text-[#FF4658]",
};

const WORD: Record<QuotaTone, string> = {
  good: "Plenty left",
  warn: "Running low",
  over: "Almost out",
};

export type QuotaRingProps = UseQuotaRingOptions & {
  label: string;
  unit?: string;
  format?: (value: number) => string;
  className?: string;
};

export function QuotaRing({
  value,
  max,
  warnAt = 0.7,
  overAt = 0.9,
  label,
  unit,
  format = plain,
  className = "",
}: QuotaRingProps) {
  const reduced = useReducedMotion();
  const { ratio, percent, tone, left } = useQuotaRing({ value, max, warnAt, overAt });

  const sweep = useSpring(0, SWEEP);
  const count = useSpring(0, COUNT);
  const offset = useTransform(sweep, (share) => ARC * (1 - Math.min(1.04, Math.max(0, share))));
  const knobX = useTransform(sweep, (share) => 50 + RADIUS * Math.cos(Math.max(0, share) * TURN));
  const knobY = useTransform(sweep, (share) => 50 + RADIUS * Math.sin(Math.max(0, share) * TURN));
  const figure = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (reduced) {
      sweep.jump(ratio);
      count.jump(percent);
      return;
    }
    sweep.set(ratio);
    count.set(percent);
  }, [ratio, percent, reduced, sweep, count]);

  useMotionValueEvent(count, "change", (latest) => {
    if (figure.current) figure.current.textContent = String(Math.round(latest));
  });

  return (
    <div className={`inline-flex items-center gap-4 ${className}`}>
      <div
        role="meter"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-valuenow={value}
        aria-valuetext={`${format(value)} of ${format(max)}${unit ? ` ${unit}` : ""}, ${percent} percent`}
        className="relative size-[104px] shrink-0"
      >
        <svg viewBox="0 0 100 100" className="size-full rotate-[135deg]" aria-hidden>
          <circle
            cx="50"
            cy="50"
            r={RADIUS}
            fill="none"
            strokeWidth="9"
            strokeLinecap="round"
            strokeDasharray={`${ARC} ${LENGTH}`}
            transform="translate(-0.45 0.45)"
            className="stroke-white dark:stroke-white/[0.09]"
          />
          <circle
            cx="50"
            cy="50"
            r={RADIUS}
            fill="none"
            strokeWidth="9"
            strokeLinecap="round"
            strokeDasharray={`${ARC} ${LENGTH}`}
            className="stroke-neutral-300 dark:stroke-black"
          />
          <circle
            cx="50"
            cy="50"
            r={RADIUS}
            fill="none"
            strokeWidth="7.6"
            strokeLinecap="round"
            strokeDasharray={`${ARC} ${LENGTH}`}
            className="stroke-neutral-200 dark:stroke-[#1C1C1B]"
          />
          <motion.circle
            cx="50"
            cy="50"
            r={RADIUS}
            fill="none"
            strokeWidth="9"
            strokeLinecap="round"
            strokeDasharray={`${ARC} ${LENGTH}`}
            style={{ strokeDashoffset: offset }}
            className={`transition-[stroke] duration-300 ${STROKE[tone]}`}
          />
          <motion.circle
            cx="50"
            cy="50"
            r={RADIUS}
            fill="none"
            strokeWidth="6.4"
            strokeLinecap="round"
            strokeDasharray={`${ARC} ${LENGTH}`}
            style={{ strokeDashoffset: offset }}
            className="stroke-black/20"
          />
          <motion.circle
            cx="50"
            cy="50"
            r={RADIUS}
            fill="none"
            strokeWidth="5"
            strokeLinecap="round"
            strokeDasharray={`${ARC} ${LENGTH}`}
            transform="translate(0.75 -0.75)"
            style={{ strokeDashoffset: offset }}
            className={`transition-[stroke] duration-300 ${STROKE[tone]}`}
          />
          <motion.circle
            cx="50"
            cy="50"
            r={RADIUS}
            fill="none"
            strokeWidth="1.3"
            strokeLinecap="round"
            strokeDasharray={`${ARC} ${LENGTH}`}
            transform="translate(1.55 -1.55)"
            style={{ strokeDashoffset: offset }}
            className="stroke-white/45"
          />
          {TICKS.map((angle, i) => (
            <line
              key={angle}
              x1={round(50 + (i % 9 === 0 ? 30.5 : 32) * Math.cos(angle))}
              y1={round(50 + (i % 9 === 0 ? 30.5 : 32) * Math.sin(angle))}
              x2={round(50 + 34.5 * Math.cos(angle))}
              y2={round(50 + 34.5 * Math.sin(angle))}
              strokeWidth="0.9"
              strokeLinecap="round"
              className={
                angle <= ratio * TURN + 0.001
                  ? `transition-[stroke] duration-300 ${STROKE[tone]}`
                  : "stroke-neutral-300 transition-[stroke] duration-300 dark:stroke-white/15"
              }
            />
          ))}
          <motion.circle cx={knobX} cy={knobY} r="3.1" className="fill-black/35" />
          <motion.circle cx={knobX} cy={knobY} r="2.5" className="fill-white" />
        </svg>
        <span className="absolute inset-0 grid place-items-center">
          <span className="flex items-baseline text-neutral-900 tabular-nums dark:text-neutral-100">
            <span
              ref={figure}
              className="text-[26px] font-medium leading-none tracking-[-0.04em]"
            >
              {percent}
            </span>
            <span className="ml-px text-[12px] text-neutral-400 dark:text-neutral-500">%</span>
          </span>
        </span>
      </div>

      <div className="min-w-0">
        <div className="text-[13.5px] font-medium text-neutral-900 dark:text-neutral-100">
          {label}
        </div>
        <div className="mt-0.5 text-[12.5px] tabular-nums text-neutral-500 dark:text-neutral-400">
          {format(value)} of {format(max)}
          {unit ? ` ${unit}` : ""}
        </div>
        <div
          className={`mt-2 inline-flex h-[22px] items-center rounded-full bg-current/[0.12] px-2 text-[12px] font-medium transition-colors duration-300 ${INK[tone]}`}
        >
          <span>
            {WORD[tone]} · {format(left)} left
          </span>
        </div>
      </div>
    </div>
  );
}
