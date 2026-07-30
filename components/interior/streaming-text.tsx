"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";

const CHARS_PER_TOKEN = 4;

const CROSSFADE = {
  type: "spring",
  stiffness: 260,
  damping: 34,
  mass: 0.8,
} as const;

const MAX_FRAME_DELTA = 64;

export type StreamingTextStatus = "idle" | "streaming" | "paused" | "done";

export type StreamingToken = { word: string; gap: string };

function tokenize(text: string): StreamingToken[] {
  const tokens: StreamingToken[] = [];
  for (const part of text.split(/(\s+)/)) {
    if (!part) continue;
    if (part.trim() === "") {
      const last = tokens[tokens.length - 1];
      if (last) last.gap += part;
      else tokens.push({ word: "", gap: part });
      continue;
    }
    tokens.push({ word: part, gap: "" });
  }
  return tokens;
}

export type UseStreamingTextOptions = {
  text: string;
  tokensPerSecond?: number;
  autoStart?: boolean;
  onDone?: () => void;
};

export function useStreamingText({
  text,
  tokensPerSecond = 18,
  autoStart = true,
  onDone,
}: UseStreamingTextOptions) {
  const reduced = useReducedMotion();
  const tokens = useMemo(() => tokenize(text), [text]);
  const total = text.length;

  const [index, setIndex] = useState(0);
  const [status, setStatus] = useState<StreamingTextStatus>(
    autoStart ? "streaming" : "idle",
  );

  const cursor = useRef(0);
  const finished = useRef(onDone);

  useEffect(() => {
    finished.current = onDone;
  }, [onDone]);

  const start = useCallback(() => {
    setStatus((s) => (s === "done" ? s : "streaming"));
  }, []);

  const pause = useCallback(() => {
    setStatus((s) => (s === "streaming" ? "paused" : s));
  }, []);

  const skip = useCallback(() => {
    cursor.current = total;
    setIndex(total);
    setStatus("done");
  }, [total]);

  const reset = useCallback(() => {
    cursor.current = 0;
    setIndex(0);
    setStatus(autoStart ? "streaming" : "idle");
  }, [autoStart]);

  useEffect(() => {
    cursor.current = 0;
    setIndex(0);
    setStatus(autoStart ? "streaming" : "idle");
  }, [text, autoStart]);

  useEffect(() => {
    if (status !== "streaming") return;
    if (reduced || cursor.current >= total) {
      cursor.current = total;
      setIndex(total);
      setStatus("done");
      return;
    }

    const interval = 1000 / Math.max(1, tokensPerSecond * CHARS_PER_TOKEN);
    let frame = 0;
    let last = performance.now();
    let carry = 0;

    const tick = (now: number) => {
      carry += Math.min(now - last, MAX_FRAME_DELTA);
      last = now;

      if (carry >= interval) {
        const advance = Math.floor(carry / interval);
        carry -= advance * interval;
        const next = Math.min(total, cursor.current + advance);
        cursor.current = next;
        setIndex(next);
        if (next >= total) {
          setStatus("done");
          return;
        }
      }

      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [status, total, tokensPerSecond, reduced]);

  useEffect(() => {
    if (status === "done") finished.current?.();
  }, [status]);

  useEffect(() => {
    if (!reduced) return;
    cursor.current = total;
    setIndex(total);
    setStatus("done");
  }, [reduced, total]);

  const visible = useMemo(() => text.slice(0, index), [text, index]);

  return {
    tokens,
    index,
    total,
    status,
    visible,
    start,
    pause,
    skip,
    reset,
  };
}

export type StreamingTextProps = {
  text: string;
  tokensPerSecond?: number;
  autoStart?: boolean;
  showSkip?: boolean;
  label?: string;
  onDone?: () => void;
  className?: string;
};

export function StreamingText({
  text,
  tokensPerSecond = 18,
  autoStart = true,
  showSkip = true,
  label = "Streamed response",
  onDone,
  className = "",
}: StreamingTextProps) {
  const { visible, status, skip, start, reset } = useStreamingText({
    text,
    tokensPerSecond,
    autoStart,
    onDone,
  });
  const reduced = useReducedMotion();

  const done = status === "done";
  const blink = !reduced && (status === "idle" || status === "paused");


  const caret = (
    <span
      aria-hidden
      className="relative inline-block h-[1.1em] w-0 align-[-0.22em]"
    >
      <motion.span
        className="absolute inset-y-0 left-px block w-[2px] bg-stone-800 dark:bg-stone-100"
        initial={false}
        animate={blink ? { opacity: [1, 1, 0, 0] } : { opacity: done ? 0 : 1 }}
        transition={
          blink
            ? {
                duration: 1.06,
                times: [0, 0.45, 0.5, 0.95],
                repeat: Infinity,
                ease: "linear",
              }
            : CROSSFADE
        }
      />
    </span>
  );

  return (
    <div
      role="group"
      aria-label={label}
      aria-busy={status === "streaming"}
      className={`text-[13.5px] leading-relaxed text-stone-700 dark:text-stone-200 ${className}`}
    >
      <p aria-hidden className="relative whitespace-pre-line">
        <span className="invisible">{text}</span>

        <span className="absolute inset-0 whitespace-pre-line">
          {visible}
          {caret}
        </span>
      </p>

      <span role="status" aria-live="polite" className="sr-only">
        {done ? text : ""}
      </span>

      {showSkip ? (
        <div className="mt-2.5 flex justify-end">
          <button
            type="button"
            onClick={
              done
                ? () => {
                    reset();
                    start();
                  }
                : skip
            }
            aria-label={
              done
                ? `Replay ${label}`
                : "Skip to the end"
            }
            className="inline-grid h-7 place-items-center rounded-[6px] border border-stone-200 px-2.5 text-[11.5px] font-medium text-stone-500 transition-colors duration-150 hover:text-stone-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-400 dark:border-white/[0.16] dark:text-stone-400 dark:hover:text-stone-200 dark:focus-visible:ring-stone-500"
          >
            <motion.span
              aria-hidden
              className="col-start-1 row-start-1"
              initial={false}
              animate={{ opacity: done ? 0 : 1 }}
              transition={reduced ? { duration: 0 } : CROSSFADE}
            >
              Skip
            </motion.span>
            <motion.span
              aria-hidden
              className="col-start-1 row-start-1"
              initial={false}
              animate={{ opacity: done ? 1 : 0 }}
              transition={reduced ? { duration: 0 } : CROSSFADE}
            >
              Replay
            </motion.span>
          </button>
        </div>
      ) : null}
    </div>
  );
}
