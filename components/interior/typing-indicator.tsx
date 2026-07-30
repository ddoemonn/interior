"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  AnimatePresence,
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
  useTransform,
  type MotionValue,
} from "motion/react";

const WAVE_MS = 1.25;

const SURFACE = { type: "spring", stiffness: 380, damping: 30, mass: 0.8 } as const;
const CROSSFADE = { type: "spring", stiffness: 260, damping: 34, mass: 0.8 } as const;
const EASE = [0.23, 1, 0.32, 1] as const;
const LEAVE = [0.4, 0, 1, 1] as const;
const INSTANT = { duration: 0 } as const;

const SEND_MS = 340;

export type UseTypingPresenceOptions = {
  timeout?: number;
  minVisible?: number;
};

export type TypingPresence = {
  typists: string[];
  beat: number;
  sending: boolean;
  ping: (name: string) => void;
  send: (name: string) => void;
  clear: (name: string) => void;
  reset: () => void;
};

export function useTypingPresence({
  timeout = 3000,
  minVisible = 900,
}: UseTypingPresenceOptions = {}): TypingPresence {
  const [presence, setPresence] = useState<{ typists: string[]; beat: number }>({
    typists: [],
    beat: 0,
  });
  const [sending, setSending] = useState(false);

  const seen = useRef(new Map<string, number>());
  const shown = useRef<string[]>([]);
  const shownAt = useRef(0);
  const sweep = useRef<ReturnType<typeof setTimeout> | null>(null);
  const release = useRef<ReturnType<typeof setTimeout> | null>(null);
  const settle = useRef<(bump: boolean) => void>(() => {});

  const commit = useCallback(
    (bump: boolean) => {
      const now = Date.now();

      for (const [name, at] of seen.current) {
        if (at + timeout <= now) seen.current.delete(name);
      }

      let next = Infinity;
      for (const at of seen.current.values()) next = Math.min(next, at + timeout);

      let roster = Array.from(seen.current.keys());
      if (roster.length === 0 && shown.current.length > 0) {
        const until = shownAt.current + minVisible;
        if (until > now) {
          roster = shown.current;
          next = Math.min(next, until);
        }
      }

      const changed =
        roster.length !== shown.current.length ||
        roster.some((name, i) => name !== shown.current[i]);

      if (changed) {
        if (shown.current.length === 0) shownAt.current = now;
        shown.current = roster;
      }

      if (changed || bump) {
        setPresence((prev) => ({
          typists: changed ? roster : prev.typists,

          beat: changed && roster.length === 0 ? 0 : bump ? prev.beat + 1 : prev.beat,
        }));
      }

      if (sweep.current) clearTimeout(sweep.current);
      sweep.current =
        next === Infinity
          ? null
          : setTimeout(() => settle.current(false), Math.max(24, next - now));
    },
    [timeout, minVisible],
  );

  settle.current = commit;

  const ping = useCallback(
    (name: string) => {
      if (release.current) {
        clearTimeout(release.current);
        release.current = null;
        setSending(false);
        shown.current = [];
        shownAt.current = 0;
      }
      seen.current.set(name, Date.now());
      commit(true);
    },
    [commit],
  );

  const clear = useCallback(
    (name: string) => {
      if (!seen.current.delete(name)) return;
      commit(false);
    },
    [commit],
  );

  const send = useCallback((name: string) => {
    if (!seen.current.has(name) && !shown.current.includes(name)) return;
    seen.current.delete(name);
    if (sweep.current) clearTimeout(sweep.current);
    sweep.current = null;
    setSending(true);

    if (release.current) clearTimeout(release.current);
    release.current = setTimeout(() => {
      release.current = null;
      setSending(false);
      shown.current = [];
      shownAt.current = 0;
      setPresence({ typists: [], beat: 0 });

      if (seen.current.size > 0) settle.current(false);
    }, SEND_MS);
  }, []);

  const reset = useCallback(() => {
    if (sweep.current) clearTimeout(sweep.current);
    if (release.current) clearTimeout(release.current);
    sweep.current = null;
    release.current = null;
    seen.current.clear();
    shown.current = [];
    shownAt.current = 0;
    setSending(false);
    setPresence({ typists: [], beat: 0 });
  }, []);

  useEffect(() => {
    return () => {
      if (sweep.current) clearTimeout(sweep.current);
      if (release.current) clearTimeout(release.current);
      sweep.current = null;
      release.current = null;
    };
  }, []);

  return {
    typists: presence.typists,
    beat: presence.beat,
    sending,
    ping,
    send,
    clear,
    reset,
  };
}

function describe(names: string[], max: number): string {
  if (names.length === 0) return "";

  const head = names.slice(0, Math.max(1, max));
  const rest = names.length - head.length;

  if (rest > 0) {
    return `${head.join(", ")} and ${rest} ${rest === 1 ? "other" : "others"} are typing`;
  }
  if (head.length === 1) return `${head[0]} is typing`;

  return `${head.slice(0, -1).join(", ")} and ${head[head.length - 1]} are typing`;
}

function Dot({
  index,
  wave,
  size,
}: {
  index: number;
  wave: MotionValue<number>;
  size: number;
}) {
  const lift = useTransform(wave, (w) => {
    let distance = (w - index) % 3;
    if (distance < 0) distance += 3;
    if (distance > 1.5) distance -= 3;
    return Math.max(0, 1 - Math.abs(distance));
  });

  const scale = useTransform(lift, [0, 1], [0.74, 1]);
  const opacity = useTransform(lift, [0, 1], [0.32, 1]);

  return (
    <motion.span
      className="block rounded-full bg-stone-500 dark:bg-stone-300"
      style={{ width: size, height: size, scale, opacity }}
    />
  );
}

export type TypingIndicatorProps = {
  typists: string[];
  sending?: boolean;
  max?: number;

  size?: number;
  showLabel?: boolean;
  announceAfter?: number;
  className?: string;
};

export function TypingIndicator({
  typists,
  sending = false,
  max = 2,
  size = 34,
  showLabel = true,
  announceAfter = 700,
  className = "",
}: TypingIndicatorProps) {
  const reduced = useReducedMotion();

  const label = useMemo(() => describe(typists, max), [typists, max]);
  const active = typists.length > 0;

  const wave = useMotionValue(0);
  useEffect(() => {
    if (!active || reduced) {
      wave.jump(0);
      return;
    }
    const controls = animate(wave, 3, {
      duration: WAVE_MS,
      ease: "linear",
      repeat: Infinity,
      repeatType: "loop",
    });
    return () => controls.stop();
  }, [active, reduced, wave]);

  const [announced, setAnnounced] = useState(label);
  useEffect(() => {
    const timer = setTimeout(() => setAnnounced(label), announceAfter);
    return () => clearTimeout(timer);
  }, [label, announceAfter]);

  const width = Math.round(size * 2);
  const dot = Math.round(size * 0.23);
  const gap = Math.round(size * 0.15);
  const radius = Math.round(size * 0.47);

  return (
    <div
      className={`inline-flex max-w-full items-end gap-3 ${className}`}
      style={{ height: size }}
    >
      <div className="relative shrink-0" style={{ width, height: size }}>
        <AnimatePresence initial={false}>
          {active ? (
            <motion.div
              key="bubble"
              aria-hidden
              className="absolute inset-0 flex items-center justify-center bg-stone-200 dark:bg-white/[0.09]"
              style={{ borderRadius: radius, transformOrigin: "0% 100%", gap }}
              initial={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.74 }}
              animate={
                sending && !reduced
                  ? { opacity: 0, scale: 0.45, y: 0 }
                  : { opacity: 1, scale: 1, y: 0 }
              }
              exit={
                reduced
                  ? { opacity: 0, transition: INSTANT }
                  : {
                      opacity: 0,
                      scale: 0.4,
                      transition: { duration: 0.26, ease: EASE },
                    }
              }
              transition={
                reduced
                  ? INSTANT
                  : sending
                    ? { duration: SEND_MS / 1000, ease: LEAVE }
                    : { ...SURFACE, opacity: { duration: 0.18, ease: EASE } }
              }
            >
              {[0, 1, 2].map((i) =>
                reduced ? (
                  <span
                    key={i}
                    className="block rounded-full bg-stone-500 opacity-80 dark:bg-stone-300"
                    style={{ width: dot, height: dot }}
                  />
                ) : (
                  <Dot key={i} index={i} wave={wave} size={dot} />
                ),
              )}
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>

      {showLabel ? (
        <span className="grid min-w-0 flex-1" style={{ height: size * 0.6 }}>
          <AnimatePresence initial={false}>
            {label && !sending ? (
              <motion.span
                key={label}
                aria-hidden
                className="col-start-1 row-start-1 self-center truncate text-[13px] text-stone-500 dark:text-stone-400"
                initial={reduced ? { opacity: 0 } : { opacity: 0, y: 7 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduced ? { opacity: 0 } : { opacity: 0, y: -7 }}
                transition={reduced ? INSTANT : CROSSFADE}
              >
                {label}
              </motion.span>
            ) : null}
          </AnimatePresence>
        </span>
      ) : null}

      <span role="status" aria-live="polite" aria-atomic="true" className="sr-only">
        {announced}
      </span>
    </div>
  );
}
