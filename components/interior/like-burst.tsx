"use client";

import {
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

const EASE = [0.23, 1, 0.32, 1] as const;
const CELL = { type: "spring", stiffness: 520, damping: 34, mass: 0.45 } as const;
const CROSSFADE = { type: "spring", stiffness: 260, damping: 34, mass: 0.8 } as const;
const INSTANT = { duration: 0 } as const;

const HEART =
  "M12 20.3 4.3 12.6a4.8 4.8 0 0 1 6.8-6.8l.9.9.9-.9a4.8 4.8 0 0 1 6.8 6.8Z";

const SPARKS = Array.from({ length: 8 }, (_, i) => {
  const h = (((i + 1) * 2654435761) % 997) / 997;
  const angle = (i / 8) * Math.PI * 2 - Math.PI / 2 + (h - 0.5) * 0.4;
  const distance = 13 + h * 9;
  return {
    x: Math.round(Math.cos(angle) * distance * 10) / 10,
    y: Math.round(Math.sin(angle) * distance * 10) / 10,
    size: h > 0.5 ? 4 : 3,
    delay: Math.round(h * 50) / 1000,
  };
});

const DEFAULT_FORMAT = (value: number) =>
  new Intl.NumberFormat("en-US").format(value);

export type LikeCommit = (
  liked: boolean,
  signal: AbortSignal,
) => Promise<unknown>;

export type LikeBurstHandle = {
  toggle: () => void;
};

export type UseOptimisticLikeOptions = {
  initialLiked?: boolean;
  initialCount?: number;
  onCommit?: LikeCommit;
  onError?: (error: unknown) => void;
  settle?: number;
};

export type OptimisticLike = {
  liked: boolean;
  count: number;
  base: number;
  pending: boolean;
  burst: number;
  settled: { liked: boolean; count: number };
  toggle: () => void;
};

export function useOptimisticLike({
  initialLiked = false,
  initialCount = 0,
  onCommit,
  onError,
  settle = 400,
}: UseOptimisticLikeOptions = {}): OptimisticLike {
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);
  const [pending, setPending] = useState(false);
  const [burst, setBurst] = useState(0);
  const [settled, setSettled] = useState({
    liked: initialLiked,
    count: initialCount,
  });

  const likedNow = useRef(initialLiked);
  const countNow = useRef(initialCount);
  const truth = useRef({ liked: initialLiked, count: initialCount });
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inFlight = useRef<AbortController | null>(null);
  const seq = useRef(0);

  const commit = useRef(onCommit);
  commit.current = onCommit;
  const failed = useRef(onError);
  failed.current = onError;

  const flush = useCallback(() => {
    timer.current = null;
    inFlight.current?.abort();
    inFlight.current = null;
    seq.current += 1;

    const intent = likedNow.current;

    if (intent === truth.current.liked) {
      countNow.current = truth.current.count;
      setLiked(truth.current.liked);
      setCount(truth.current.count);
      setPending(false);
      return;
    }

    const target = { liked: intent, count: countNow.current };
    const run = commit.current;

    if (!run) {
      truth.current = target;
      setSettled(target);
      setPending(false);
      return;
    }

    const controller = new AbortController();
    const id = seq.current;
    inFlight.current = controller;
    setPending(true);

    run(intent, controller.signal).then(
      () => {
        if (id !== seq.current) return;
        inFlight.current = null;
        truth.current = target;
        setSettled(target);
        setPending(false);
      },
      (error: unknown) => {
        if (id !== seq.current) return;
        inFlight.current = null;
        likedNow.current = truth.current.liked;
        countNow.current = truth.current.count;
        setLiked(truth.current.liked);
        setCount(truth.current.count);
        setPending(false);
        failed.current?.(error);
      },
    );
  }, []);

  const toggle = useCallback(() => {
    const next = !likedNow.current;
    likedNow.current = next;
    countNow.current += next ? 1 : -1;

    setLiked(next);
    setCount(countNow.current);
    setPending(true);
    if (next) setBurst((b) => b + 1);

    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(flush, settle);
  }, [flush, settle]);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
      timer.current = null;
      seq.current += 1;
      inFlight.current?.abort();
      inFlight.current = null;
    },
    [],
  );

  return {
    liked,
    count,
    base: liked ? count - 1 : count,
    pending,
    burst,
    settled,
    toggle,
  };
}

export type LikeBurstProps = {
  initialLiked?: boolean;
  initialCount?: number;
  onCommit?: LikeCommit;
  onError?: (error: unknown) => void;
  onToggle?: (liked: boolean) => void;
  settle?: number;
  label?: string;
  activeLabel?: string;
  format?: (value: number) => string;
  disabled?: boolean;
  className?: string;
};

export function LikeBurst({
  initialLiked = false,
  initialCount = 0,
  onCommit,
  onError,
  onToggle,
  settle = 400,
  label = "Like",
  activeLabel = "Liked",
  format = DEFAULT_FORMAT,
  disabled = false,
  className = "",
  ref,
}: LikeBurstProps & { ref?: React.Ref<LikeBurstHandle> }) {
  const reduced = useReducedMotion();
  const { liked, count, base, pending, burst, settled, toggle } =
    useOptimisticLike({ initialLiked, initialCount, onCommit, onError, settle });

  useImperativeHandle(ref, () => ({ toggle }), [toggle]);

  const low = format(base);
  const high = format(base + 1);
  const widest = high.length >= low.length ? high : low;
  const shown = format(count);

  return (
    <span className={`inline-flex items-center ${className}`}>
      <button
        type="button"
        disabled={disabled}
        aria-pressed={liked}
        aria-busy={pending}
        aria-label={label}
        onClick={() => {
          toggle();
          onToggle?.(!liked);
        }}
        style={{ touchAction: "manipulation" }}
        className="inline-flex h-9 select-none items-center gap-2 rounded-[9px] border border-stone-200 bg-white px-3 text-[13px] font-medium text-stone-700 outline-none focus-visible:ring-2 focus-visible:ring-stone-400 disabled:opacity-50 dark:border-white/[0.16] dark:bg-[#1D1D1A] dark:text-stone-200 dark:focus-visible:ring-stone-500"
      >
        <span aria-hidden className="relative block size-[18px]">
          <motion.svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.7}
            strokeLinejoin="round"
            className="absolute inset-0 size-[18px] text-stone-500 dark:text-stone-400"
            initial={false}
            animate={{ opacity: liked ? 0 : 1 }}
            transition={reduced ? INSTANT : CROSSFADE}
          >
            <path d={HEART} />
          </motion.svg>

          <motion.svg
            viewBox="0 0 24 24"
            fill="currentColor"
            className="absolute inset-0 size-[18px] text-stone-800 dark:text-stone-100"
            initial={false}
            animate={{ opacity: liked ? 1 : 0, scale: liked ? 1 : 0.55 }}
            transition={reduced ? INSTANT : CELL}
          >
            <path d={HEART} />
          </motion.svg>

          {!reduced && burst > 0 ? (
            <span
              key={burst}
              className="pointer-events-none absolute left-1/2 top-1/2 block size-0"
            >
              {SPARKS.map((spark, i) => (
                <motion.span
                  key={i}
                  className="absolute block rounded-[1.5px] bg-stone-800 dark:bg-stone-100"
                  style={{
                    width: spark.size,
                    height: spark.size,
                    marginLeft: -spark.size / 2,
                    marginTop: -spark.size / 2,
                  }}
                  initial={{ x: 0, y: 0, scale: 0.6, opacity: 0.85 }}
                  animate={{ x: spark.x, y: spark.y, scale: 1, opacity: 0 }}
                  transition={{ duration: 0.44, delay: spark.delay, ease: EASE }}
                />
              ))}
            </span>
          ) : null}
        </span>

        <span aria-hidden className="grid">
          <motion.span
            className="col-start-1 row-start-1"
            initial={false}
            animate={{ opacity: liked ? 0 : 1 }}
            transition={reduced ? INSTANT : CROSSFADE}
          >
            {label}
          </motion.span>
          <motion.span
            className="col-start-1 row-start-1"
            initial={false}
            animate={{ opacity: liked ? 1 : 0 }}
            transition={reduced ? INSTANT : CROSSFADE}
          >
            {activeLabel}
          </motion.span>
        </span>

        <span
          aria-hidden
          className="grid overflow-hidden text-[12px] tabular-nums text-stone-500 dark:text-stone-400"
        >
          <span className="invisible col-start-1 row-start-1">{widest}</span>
          <AnimatePresence initial={false}>
            <motion.span
              key={shown}
              className="col-start-1 row-start-1 justify-self-end"
              initial={{ opacity: 0, y: reduced ? 0 : -7 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: reduced ? 0 : 7 }}
              transition={reduced ? INSTANT : CROSSFADE}
            >
              {shown}
            </motion.span>
          </AnimatePresence>
        </span>

      </button>

      <span role="status" aria-live="polite" className="sr-only">
        {`${format(settled.count)} likes, ${settled.liked ? "liked" : "not liked"}`}
      </span>
    </span>
  );
}
