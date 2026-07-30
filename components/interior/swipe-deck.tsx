"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import {
  AnimatePresence,
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
  useTransform,
} from "motion/react";

const CELL = { type: "spring", stiffness: 520, damping: 34, mass: 0.45 } as const;
const DISCLOSE = { type: "spring", stiffness: 150, damping: 27, mass: 1 } as const;
const CROSSFADE = { type: "spring", stiffness: 260, damping: 34, mass: 0.8 } as const;
const LEAVE = [0.4, 0, 1, 1] as const;

export type SwipeChoice = "left" | "right";

export type SwipeIntent = { dir: -1 | 0 | 1; step: number };

export type SwipeDeckFlow = { dir: -1 | 1; kind: "decide" | "undo" };

const BLANK: SwipeIntent = { dir: 0, step: 0 };

const spent = (out: boolean) => (out ? "opacity-0" : "");

export type UseSwipeDeckOptions = {
  count: number;
  threshold?: number;
  steps?: number;
  flick?: number;
  onDecide?: (index: number, choice: SwipeChoice) => void;
  onUndo?: (index: number) => void;
  disabled?: boolean;
};

export function useSwipeDeck({
  count,
  threshold = 92,
  steps = 6,
  flick = 520,
  onDecide,
  onUndo,
  disabled = false,
}: UseSwipeDeckOptions) {
  const total = Math.max(0, Math.floor(count));
  const grain = Math.max(1, Math.floor(steps));
  const reach = Math.max(1, threshold);

  const [decisions, setDecisions] = useState<SwipeChoice[]>([]);
  const [flow, setFlow] = useState<SwipeDeckFlow>({ dir: 1, kind: "decide" });
  const [intent, setIntent] = useState<SwipeIntent>(BLANK);

  const index = Math.min(decisions.length, total);

  const len = useRef(decisions.length);
  len.current = decisions.length;
  const size = useRef(total);
  size.current = total;
  const made = useRef(decisions);
  made.current = decisions;

  const decided = useRef(onDecide);
  decided.current = onDecide;
  const reverted = useRef(onUndo);
  reverted.current = onUndo;

  const clear = useCallback(() => {
    setIntent((prev) => (prev.step === 0 && prev.dir === 0 ? prev : BLANK));
  }, []);

  const decide = useCallback(
    (choice: SwipeChoice) => {
      if (disabled) return;
      const at = len.current;
      if (at >= size.current) return;
      len.current = at + 1;
      setDecisions((prev) => [...prev, choice]);
      setFlow({ dir: choice === "right" ? 1 : -1, kind: "decide" });
      setIntent(BLANK);
      decided.current?.(at, choice);
    },
    [disabled],
  );

  const undo = useCallback(() => {
    if (disabled) return;
    const at = len.current;
    if (at === 0) return;
    const last = made.current[at - 1];
    len.current = at - 1;
    setDecisions((prev) => prev.slice(0, prev.length - 1));
    setFlow({ dir: last === "right" ? 1 : -1, kind: "undo" });
    setIntent(BLANK);
    reverted.current?.(at - 1);
  }, [disabled]);

  const report = useCallback(
    (dx: number) => {
      const step = Math.min(grain, Math.round((Math.abs(dx) / reach) * grain));
      const dir: -1 | 0 | 1 = step === 0 ? 0 : dx > 0 ? 1 : -1;
      setIntent((prev) =>
        prev.dir === dir && prev.step === step ? prev : { dir, step },
      );
    },
    [grain, reach],
  );

  const release = useCallback(
    (dx: number, vx: number) => {
      const far = Math.abs(dx) >= reach;
      const fast = Math.abs(vx) >= flick && Math.abs(dx) >= reach * 0.35;
      if (!far && !fast) {
        clear();
        return;
      }
      decide((far ? dx : vx) > 0 ? "right" : "left");
    },
    [reach, flick, clear, decide],
  );

  const onKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (event.target !== event.currentTarget) return;
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        decide("left");
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        decide("right");
      } else if (event.key === "Backspace" || event.key === "Delete") {
        event.preventDefault();
        undo();
      } else if (event.key === "Escape") {
        clear();
      }
    },
    [decide, undo, clear],
  );

  useEffect(() => {
    const bail = () => clear();
    const hidden = () => document.hidden && clear();
    window.addEventListener("blur", bail);
    document.addEventListener("visibilitychange", hidden);
    return () => {
      window.removeEventListener("blur", bail);
      document.removeEventListener("visibilitychange", hidden);
    };
  }, [clear]);

  return {
    index,
    count: total,
    remaining: total - index,
    done: index >= total,
    decisions,
    flow,
    intent,
    steps: grain,
    threshold: reach,
    armed: intent.step >= grain,
    canUndo: decisions.length > 0,
    decide,
    undo,
    clear,
    report,
    release,
    deckProps: {
      role: "group" as const,
      "aria-roledescription": "card deck",
      tabIndex: 0,
      onKeyDown,
    },
  };
}

export type UseSwipeDeckResult = ReturnType<typeof useSwipeDeck>;

const ICON_LEFT = (
  <svg width="12" height="12" viewBox="0 0 256 256" fill="none" aria-hidden="true">
    <line
      x1="200"
      y1="56"
      x2="56"
      y2="200"
      stroke="currentColor"
      strokeWidth="16"
      strokeLinecap="round"
    />
    <line
      x1="200"
      y1="200"
      x2="56"
      y2="56"
      stroke="currentColor"
      strokeWidth="16"
      strokeLinecap="round"
    />
  </svg>
);

const ICON_RIGHT = (
  <svg width="12" height="12" viewBox="0 0 256 256" fill="none" aria-hidden="true">
    <polyline
      points="216 72 104 184 48 128"
      stroke="currentColor"
      strokeWidth="16"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const ICON_UNDO = (
  <svg width="12" height="12" viewBox="0 0 256 256" fill="none" aria-hidden="true">
    <polyline
      points="72 104 24 104 24 56"
      stroke="currentColor"
      strokeWidth="16"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M67.6,192.1a88,88,0,1,0,0-128.2L24,104"
      stroke="currentColor"
      strokeWidth="16"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

type DeckCardProps = {
  depth: number;
  height: number;
  entryX: number;
  active: boolean;
  reduced: boolean;
  label: string;
  leftLabel: string;
  rightLabel: string;
  intent: SwipeIntent;
  steps: number;
  onMove: (dx: number) => void;
  onRelease: (dx: number, vx: number) => void;
  children: React.ReactNode;
};

function DeckCard({
  depth,
  height,
  entryX,
  active,
  reduced,
  label,
  leftLabel,
  rightLabel,
  intent,
  steps,
  onMove,
  onRelease,
  children,
}: DeckCardProps) {
  const x = useMotionValue(entryX);
  const rotate = useTransform(x, [-200, 0, 200], [-8, 0, 8], { clamp: false });
  const fade = useTransform(x, [-340, -150, 0, 150, 340], [0, 1, 1, 1, 0]);

  const skip = useRef(reduced);
  skip.current = reduced;

  useEffect(() => {
    if (x.get() === 0) return;
    const controls = animate(x, 0, skip.current ? { duration: 0 } : DISCLOSE);
    return () => controls.stop();
  }, [x, entryX]);

  const commit = active ? 0 : depth === 1 ? intent.step / steps : 0;
  const y = depth * 10 - commit * 10;
  const scale = 1 - depth * 0.045 + commit * 0.045;

  const badge = (side: -1 | 1, text: string, place: string) => {
    const on = intent.dir === side;
    return (
      <motion.span
        aria-hidden
        initial={false}
        animate={{
          opacity: on ? intent.step / steps : 0,
          scale: on ? 1 : 0.94,
        }}
        transition={reduced ? { duration: 0 } : CELL}
        className={`pointer-events-none absolute top-3 whitespace-nowrap rounded-[6px] border bg-white px-2 py-1 text-[10.5px] font-semibold uppercase tracking-[0.08em] transition-colors duration-150 dark:bg-[#1D1D1A] ${
          on && intent.step >= steps
            ? "border-[#4568FF] text-[#4568FF] dark:border-[#93B0FF] dark:text-[#93B0FF]"
            : "border-stone-300 text-stone-700 dark:border-white/20 dark:text-stone-200"
        } ${place}`}
      >
        {text}
      </motion.span>
    );
  };

  return (
    <motion.div
      role="group"
      aria-label={label}
      aria-hidden={!active}
      inert={!active}
      variants={{
        exit: (dir: number) => ({
          x: dir * 560,
          zIndex: 12,
          borderColor: "rgba(0,0,0,0)",
          transition: reduced
            ? { duration: 0 }
            : {
                x: { duration: 0.3, ease: LEAVE },
                borderColor: { duration: 0.1, ease: "linear" },
              },
        }),
      }}
      initial={{ y, scale }}
      animate={{ y, scale }}
      exit="exit"
      transition={
        reduced
          ? { duration: 0 }
          : active
            ? { ...CROSSFADE, delay: 0.1 }
            : CROSSFADE
      }
      drag={active ? "x" : false}
      dragDirectionLock
      dragMomentum={false}
      dragElastic={1}
      dragConstraints={{ left: 0, right: 0 }}
      dragTransition={{ bounceStiffness: 260, bounceDamping: 34 }}
      whileDrag={reduced ? undefined : { scale: 1.03 }}
      onDrag={(_event, info) => onMove(info.offset.x)}
      onDragEnd={(_event, info) => onRelease(info.offset.x, info.velocity.x)}
      style={{
        x,
        rotate,
        opacity: fade,
        height,
        zIndex: 10 - depth,
        transformOrigin: "50% 100%",
        touchAction: "pan-y",
      }}
      className={`absolute inset-x-5 top-0 select-none overflow-hidden rounded-[14px] border border-stone-200 bg-white dark:border-white/[0.16] dark:bg-[#1D1D1A] ${
        active
          ? "cursor-grab shadow-[0_1px_2px_rgba(28,25,23,0.06),0_16px_32px_-18px_rgba(28,25,23,0.55)] active:cursor-grabbing dark:shadow-[0_2px_16px_rgba(0,0,0,0.6)]"
          : "shadow-[0_1px_2px_rgba(28,25,23,0.05),0_6px_14px_-12px_rgba(28,25,23,0.4)] dark:shadow-[0_1px_6px_rgba(0,0,0,0.45)]"
      }`}
    >
      {children}
      {active ? badge(-1, leftLabel, "left-3") : null}
      {active ? badge(1, rightLabel, "right-3") : null}
    </motion.div>
  );
}

export type SwipeDeckProps<T> = {
  items: readonly T[];
  itemKey: (item: T) => string;
  itemLabel: (item: T) => string;
  children: (item: T) => React.ReactNode;
  onDecide?: (item: T, choice: SwipeChoice) => void;
  onUndo?: (item: T) => void;
  label?: string;
  leftLabel?: string;
  rightLabel?: string;
  undoLabel?: string;
  emptyLabel?: string;
  height?: number;
  threshold?: number;
  steps?: number;
  peek?: number;
  className?: string;
};

export function SwipeDeck<T>({
  items,
  itemKey,
  itemLabel,
  children,
  onDecide,
  onUndo,
  label = "Card deck",
  leftLabel = "Skip",
  rightLabel = "Keep",
  undoLabel = "Undo",
  emptyLabel = "Deck cleared",
  height = 180,
  threshold = 92,
  steps = 6,
  peek = 3,
  className = "",
}: SwipeDeckProps<T>) {
  const hintId = useId();
  const reduced = useReducedMotion() === true;

  const deck = useSwipeDeck({
    count: items.length,
    threshold,
    steps,
    onDecide: (at, choice) => {
      const item = items[at];
      if (item !== undefined) onDecide?.(item, choice);
    },
    onUndo: (at) => {
      const item = items[at];
      if (item !== undefined) onUndo?.(item);
    },
  });

  const stack = items.slice(deck.index, deck.index + Math.max(1, peek));
  const current = items[deck.index];

  const control =
    "inline-flex h-8 items-center gap-1.5 rounded-[9px] border border-stone-200 bg-white px-2.5 text-[12px] font-medium text-stone-700 outline-none transition-[background-color,border-color,opacity] duration-150 hover:bg-stone-100 focus-visible:border-[#4568FF] dark:border-white/[0.16] dark:bg-[#1D1D1A] dark:text-stone-200 dark:hover:bg-white/10 dark:focus-visible:border-[#93B0FF]";

  return (
    <div className={`w-full ${className}`}>
      <div
        aria-label={label}
        aria-describedby={hintId}
        style={{ height: height + 26 }}
        className="relative w-full overflow-hidden rounded-[14px] outline-none focus-visible:shadow-[0_0_0_1px_#4568FF] dark:focus-visible:shadow-[0_0_0_1px_#93B0FF]"
        {...deck.deckProps}
      >
        <div className="absolute inset-0 overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_20px,black_calc(100%-20px),transparent)]">
          <motion.div
            aria-hidden={!deck.done}
            initial={false}
            animate={{ opacity: deck.done ? 1 : 0 }}
            transition={reduced ? { duration: 0 } : CROSSFADE}
            style={{ height }}
            className="absolute inset-x-5 top-0 z-0 grid place-items-center rounded-[14px] bg-stone-100/70 px-4 text-center text-[12.5px] text-stone-500 shadow-[inset_0_1px_2px_rgba(28,25,23,0.07)] dark:bg-[#252522] dark:text-stone-400 dark:shadow-[inset_0_1px_2px_rgba(0,0,0,0.45)]"
          >
            {emptyLabel}
          </motion.div>
          <AnimatePresence initial={false} custom={deck.flow.dir}>
            {stack.map((item, depth) => (
              <DeckCard
              key={itemKey(item)}
              depth={depth}
              height={height}
              entryX={
                depth === 0 && deck.flow.kind === "undo" ? deck.flow.dir * 560 : 0
              }
              active={depth === 0}
              reduced={reduced}
              label={itemLabel(item)}
              leftLabel={leftLabel}
              rightLabel={rightLabel}
              intent={deck.intent}
              steps={deck.steps}
              onMove={deck.report}
              onRelease={deck.release}
            >
                {children(item)}
              </DeckCard>
            ))}
          </AnimatePresence>
        </div>
      </div>
      <div className="mt-3 grid h-8 grid-cols-[1fr_auto_1fr] items-center gap-3">
        <button
          type="button"
          onClick={() => deck.decide("left")}
          inert={deck.done}
          className={`${control} justify-self-start ${spent(deck.done)}`}
        >
          {ICON_LEFT}
          <span>{leftLabel}</span>
        </button>
        <span className="flex items-center gap-2 font-mono text-[10.5px] tabular-nums text-stone-500 dark:text-stone-400">
          <span aria-hidden className="inline-grid justify-items-end">
            <span className="invisible col-start-1 row-start-1">
              {items.length}
            </span>
            <span className="col-start-1 row-start-1">{deck.remaining}</span>
          </span>
          <span aria-hidden>left</span>
          <button
            type="button"
            onClick={deck.undo}
            inert={!deck.canUndo}
            className={`inline-flex items-center gap-1 rounded-[5px] px-1 py-0.5 text-stone-700 outline-none transition-[background-color,box-shadow,opacity] duration-150 hover:bg-stone-100 focus-visible:bg-[#4568FF]/[0.06] focus-visible:shadow-[inset_0_0_0_1px_#4568FF] dark:text-stone-200 dark:hover:bg-white/10 dark:focus-visible:bg-[#93B0FF]/[0.1] dark:focus-visible:shadow-[inset_0_0_0_1px_#93B0FF] ${spent(
              !deck.canUndo,
            )}`}
          >
            {ICON_UNDO}
            <span>{undoLabel}</span>
          </button>
        </span>
        <button
          type="button"
          onClick={() => deck.decide("right")}
          inert={deck.done}
          className={`${control} justify-self-end ${spent(deck.done)}`}
        >
          <span>{rightLabel}</span>
          {ICON_RIGHT}
        </button>
      </div>
      <p aria-live="polite" aria-atomic className="sr-only">
        {deck.done || current === undefined
          ? emptyLabel
          : `${itemLabel(current)}. Card ${deck.index + 1} of ${items.length}.`}
      </p>
      <span id={hintId} className="sr-only">
        Left and right arrow keys decide the top card. Backspace brings the last
        one back.
      </span>
    </div>
  );
}
