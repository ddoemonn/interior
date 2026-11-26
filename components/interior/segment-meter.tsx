"use client";

import { useEffect, useRef, useState } from "react";
import { useMotionValueEvent, useReducedMotion, useSpring } from "motion/react";

const STEP = 16;
const COUNT = { stiffness: 150, damping: 24, mass: 1 } as const;
const HATCH =
  "repeating-linear-gradient(135deg, currentColor 0 1.5px, transparent 1.5px 4px)";

const plain = (value: number) => value.toLocaleString("en-US");

export type MeterTone = "good" | "warn" | "over";

export type UseSegmentMeterOptions = {
  value: number;
  max?: number;
  segments?: number;
  warnAt?: number;
  overAt?: number;
};

export type SegmentMeterState = {
  ratio: number;
  filled: number;
  tone: MeterTone;
  tones: MeterTone[];
};

export function useSegmentMeter({
  value,
  max = 100,
  segments = 28,
  warnAt = 0.7,
  overAt = 0.9,
}: UseSegmentMeterOptions): SegmentMeterState {
  const ratio = max > 0 ? Math.min(1, Math.max(0, value / max)) : 0;
  const filled = Math.round(ratio * segments);
  const rank = (share: number): MeterTone =>
    share > overAt ? "over" : share > warnAt ? "warn" : "good";
  const tones = Array.from({ length: segments }, (_, i) => rank((i + 1) / segments));
  return { ratio, filled, tone: rank(ratio), tones };
}

const FILL: Record<MeterTone, string> = {
  good: "bg-[#06B457] dark:bg-[#2FE582]",
  warn: "bg-[#F29D00] dark:bg-[#FFC21F]",
  over: "bg-[#F2303F] dark:bg-[#FF4658]",
};

const INK: Record<MeterTone, string> = {
  good: "text-[#058A43] dark:text-[#2FE582]",
  warn: "text-[#B87400] dark:text-[#FFC21F]",
  over: "text-[#D11F2E] dark:text-[#FF4658]",
};

function Figure({
  value,
  format,
  still,
}: {
  value: number;
  format: (value: number) => string;
  still: boolean;
}) {
  const node = useRef<HTMLSpanElement>(null);
  const spring = useSpring(value, COUNT);

  useEffect(() => {
    if (still) spring.jump(value);
    else spring.set(value);
  }, [value, still, spring]);

  useMotionValueEvent(spring, "change", (latest) => {
    if (node.current) node.current.textContent = format(Math.round(latest));
  });

  return <span ref={node}>{format(value)}</span>;
}

export type SegmentMeterProps = UseSegmentMeterOptions & {
  label: string;
  unit?: string;
  format?: (value: number) => string;
  className?: string;
};

export function SegmentMeter({
  value,
  max = 100,
  segments = 28,
  warnAt = 0.7,
  overAt = 0.9,
  label,
  unit,
  format = plain,
  className = "",
}: SegmentMeterProps) {
  const reduced = useReducedMotion();
  const { filled, tone, tones, ratio } = useSegmentMeter({
    value,
    max,
    segments,
    warnAt,
    overAt,
  });

  const [mounted, setMounted] = useState(false);
  const last = useRef(0);
  const shown = mounted ? filled : 0;
  const from = last.current;

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    last.current = shown;
  }, [shown]);

  return (
    <div className={`w-full ${className}`}>
      <div className="mb-2 flex items-baseline justify-between gap-3">
        <span className="text-[12.5px] font-medium text-neutral-900 dark:text-neutral-100">
          {label}
        </span>
        <span className="text-[12.5px] tabular-nums text-neutral-500 dark:text-neutral-400">
          <span className={`font-medium transition-colors duration-200 ${INK[tone]}`}>
            <Figure value={value} format={format} still={Boolean(reduced)} />
          </span>
          {" / "}
          {format(max)}
          {unit ? ` ${unit}` : ""}
        </span>
      </div>

      <div
        role="meter"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-valuenow={value}
        aria-valuetext={`${format(value)} of ${format(max)}${unit ? ` ${unit}` : ""}, ${Math.round(ratio * 100)} percent`}
        className="grid h-7 gap-[3px] rounded-[9px] bg-neutral-100 p-[5px] shadow-[inset_0_1px_2px_rgba(0,0,0,0.09),inset_0_0_0_1px_rgba(0,0,0,0.07),0_1px_0_rgba(255,255,255,0.95)] dark:bg-[#121211] dark:shadow-[inset_0_1px_2px_rgba(0,0,0,0.6),inset_0_0_0_1px_rgba(0,0,0,0.5),0_1px_0_rgba(255,255,255,0.055)]"
        style={{ gridTemplateColumns: `repeat(${segments}, minmax(0, 1fr))` }}
      >
        {tones.map((segmentTone, i) => {
          const on = i < shown;
          const distance = on ? i - from : from - 1 - i;
          const delay = reduced ? 0 : Math.max(0, distance) * STEP;
          return (
            <span
              key={i}
              aria-hidden
              className="relative overflow-hidden rounded-[2px] text-neutral-300 dark:text-white/[0.14]"
            >
              <span className="absolute inset-0" style={{ backgroundImage: HATCH }} />
              <span
                className={`absolute inset-0 origin-bottom rounded-[2px] shadow-[inset_0_1px_0_rgba(255,255,255,0.45)] transition-[transform,opacity] duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${FILL[segmentTone]}`}
                style={{
                  transform: on ? "scaleY(1)" : "scaleY(0.2)",
                  opacity: on ? 1 : 0,
                  transitionDelay: `${delay}ms`,
                }}
              />
            </span>
          );
        })}
      </div>

      <div aria-hidden className="relative mt-1.5 h-4 text-[10.5px] tabular-nums">
        {[
          { at: warnAt, tone: "warn" as const },
          { at: overAt, tone: "over" as const },
        ].map((mark) => (
          <span
            key={mark.tone}
            className={`absolute top-0 flex -translate-x-1/2 flex-col items-center gap-0.5 transition-opacity duration-300 ${
              ratio >= mark.at ? `opacity-100 ${INK[mark.tone]}` : "text-neutral-400 opacity-70 dark:text-neutral-500"
            }`}
            style={{ left: `${mark.at * 100}%` }}
          >
            <span className="block h-[3px] w-px bg-current" />
            {Math.round(mark.at * 100)}%
          </span>
        ))}
      </div>
    </div>
  );
}
