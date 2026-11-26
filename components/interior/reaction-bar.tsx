"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

const PLACE = { type: "spring", stiffness: 460, damping: 36, mass: 0.8 } as const;
const POP = { type: "spring", stiffness: 620, damping: 16, mass: 0.6 } as const;
const ROLL = { type: "spring", stiffness: 460, damping: 32, mass: 0.55 } as const;
const DROP = { duration: 0.14, ease: [0.4, 0, 1, 1] } as const;
const INSTANT = { duration: 0 } as const;
const FLY = { duration: 0.46, ease: [0.23, 1, 0.32, 1] } as const;

const SPARKS = [-150, -95, -35, 30, 85, 145].map((degrees, i) => {
  const angle = (degrees * Math.PI) / 180;
  const reach = 15 + (i % 2) * 5;
  return { x: Math.round(Math.cos(angle) * reach), y: Math.round(Math.sin(angle) * reach), size: 3 + (i % 2) };
});

export type ReactionTone = "pink" | "amber" | "blue" | "violet" | "green" | "orange";

export type Reaction = {
  id: string;
  emoji: string;
  label: string;
  count: number;
  tone?: ReactionTone;
};

export type UseReactionBarOptions = {
  reactions: Reaction[];
  value?: string | null;
  defaultValue?: string | null;
  onValueChange?: (id: string | null) => void;
  sort?: boolean;
};

export type ReactionBarState = {
  items: Array<Reaction & { mine: boolean; shown: number }>;
  selected: string | null;
  toggle: (id: string) => void;
};

export function useReactionBar({
  reactions,
  value,
  defaultValue = null,
  onValueChange,
  sort = true,
}: UseReactionBarOptions): ReactionBarState {
  const [inner, setInner] = useState<string | null>(defaultValue);
  const selected = value !== undefined ? value : inner;

  const toggle = useCallback(
    (id: string) => {
      const next = selected === id ? null : id;
      if (value === undefined) setInner(next);
      onValueChange?.(next);
    },
    [onValueChange, selected, value],
  );

  const items = useMemo(() => {
    const withMine = reactions.map((reaction, index) => ({
      ...reaction,
      mine: reaction.id === selected,
      shown: reaction.count + (reaction.id === selected ? 1 : 0),
      index,
    }));
    if (sort) withMine.sort((a, b) => b.shown - a.shown || a.index - b.index);
    return withMine;
  }, [reactions, selected, sort]);

  return { items, selected, toggle };
}

const TINT: Record<ReactionTone, string> = {
  pink: "bg-[#F02D92]/[0.12] text-[#C4186F] shadow-[inset_0_0_0_1px_rgba(240,45,146,0.4)] dark:bg-[#FF4BAB]/[0.16] dark:text-[#FF7DC2] dark:shadow-[inset_0_0_0_1px_rgba(255,75,171,0.45)]",
  amber:
    "bg-[#F29D00]/[0.14] text-[#A66A00] shadow-[inset_0_0_0_1px_rgba(242,157,0,0.45)] dark:bg-[#FFC21F]/[0.16] dark:text-[#FFC21F] dark:shadow-[inset_0_0_0_1px_rgba(255,194,31,0.45)]",
  blue: "bg-[#0F6FFF]/[0.1] text-[#0B5CD6] shadow-[inset_0_0_0_1px_rgba(15,111,255,0.4)] dark:bg-[#2E8BFF]/[0.18] dark:text-[#7DB8FF] dark:shadow-[inset_0_0_0_1px_rgba(46,139,255,0.5)]",
  violet:
    "bg-[#7A3DFF]/[0.1] text-[#5F25DB] shadow-[inset_0_0_0_1px_rgba(122,61,255,0.4)] dark:bg-[#9B6BFF]/[0.18] dark:text-[#BFA2FF] dark:shadow-[inset_0_0_0_1px_rgba(155,107,255,0.5)]",
  green:
    "bg-[#06B457]/[0.12] text-[#058A43] shadow-[inset_0_0_0_1px_rgba(6,180,87,0.4)] dark:bg-[#2FE582]/[0.16] dark:text-[#2FE582] dark:shadow-[inset_0_0_0_1px_rgba(47,229,130,0.45)]",
  orange:
    "bg-[#FF5A12]/[0.12] text-[#CC3F00] shadow-[inset_0_0_0_1px_rgba(255,90,18,0.4)] dark:bg-[#FF7A2B]/[0.16] dark:text-[#FF9A5C] dark:shadow-[inset_0_0_0_1px_rgba(255,122,43,0.45)]",
};

const REST =
  "border-black/[0.13] bg-white text-neutral-600 shadow-[inset_0_1px_0_rgba(255,255,255,0.95),inset_0_-1px_0_rgba(0,0,0,0.05)] hover:text-neutral-900 dark:border-[#050505] dark:bg-[#141413] dark:text-neutral-400 dark:shadow-[inset_0_1px_2px_rgba(0,0,0,0.6),0_1px_0_rgba(255,255,255,0.055)] dark:hover:text-neutral-100";

export type ReactionBarProps = UseReactionBarOptions & {
  label?: string;
  className?: string;
};

export function ReactionBar({
  label = "Reactions",
  className = "",
  ...options
}: ReactionBarProps) {
  const reduced = useReducedMotion();
  const { items, toggle } = useReactionBar(options);
  const touched = useRef(false);

  return (
    <div role="group" aria-label={label} className={`flex flex-wrap gap-1.5 ${className}`}>
      {items.map((item) => (
        <motion.button
          key={item.id}
          layout={reduced ? false : "position"}
          transition={reduced ? INSTANT : PLACE}
          type="button"
          aria-pressed={item.mine}
          aria-label={`${item.label}, ${item.shown}`}
          onClick={() => {
            touched.current = true;
            toggle(item.id);
          }}
          whileTap={reduced ? undefined : { scale: 0.95 }}
          style={{ touchAction: "manipulation", WebkitTapHighlightColor: "transparent" }}
          className={`relative inline-flex h-8 select-none items-center gap-1.5 rounded-full border pl-2 pr-2.5 text-[12.5px] font-medium outline-none transition-[background-color,color,box-shadow,border-color] duration-150 focus-visible:shadow-[0_0_0_2px_#0F6FFF] dark:focus-visible:shadow-[0_0_0_2px_#2E8BFF] ${
            item.mine ? `border-transparent ${TINT[item.tone ?? "blue"]}` : REST
          }`}
        >
          <motion.span
            key={item.mine ? "on" : "off"}
            aria-hidden
            initial={reduced || !item.mine ? false : { scale: 0.5, rotate: -18 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={reduced ? INSTANT : POP}
            className="block text-[15px] leading-none"
          >
            {item.emoji}
          </motion.span>
          {item.mine && touched.current && !reduced ? (
            <span aria-hidden className="pointer-events-none absolute left-[16px] top-1/2 block size-0">
              {SPARKS.map((spark) => (
                <motion.span
                  key={`${spark.x}-${spark.y}`}
                  initial={{ x: 0, y: 0, scale: 0.4, opacity: 0.9 }}
                  animate={{ x: spark.x, y: spark.y, scale: 1, opacity: 0 }}
                  transition={FLY}
                  className="absolute block rounded-full bg-current"
                  style={{ width: spark.size, height: spark.size, marginLeft: -spark.size / 2, marginTop: -spark.size / 2 }}
                />
              ))}
            </span>
          ) : null}
          <span aria-hidden className="relative inline-grid overflow-hidden tabular-nums">
            <AnimatePresence initial={false} mode="popLayout">
              <motion.span
                key={item.shown}
                initial={
                  reduced ? { opacity: 0 } : { y: item.mine ? "0.9em" : "-0.9em", opacity: 0 }
                }
                animate={{ y: "0em", opacity: 1 }}
                exit={
                  reduced
                    ? { opacity: 0, transition: INSTANT }
                    : { y: item.mine ? "-0.9em" : "0.9em", opacity: 0, transition: DROP }
                }
                transition={reduced ? INSTANT : ROLL}
                className="col-start-1 row-start-1"
              >
                {item.shown.toLocaleString("en-US")}
              </motion.span>
            </AnimatePresence>
          </span>
        </motion.button>
      ))}
    </div>
  );
}
