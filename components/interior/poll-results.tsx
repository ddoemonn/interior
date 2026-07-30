"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  animate,
  AnimatePresence,
  motion,
  motionValue,
  useMotionValueEvent,
  useReducedMotion,
  useTransform,
} from "motion/react";

const FILL = { type: "spring", stiffness: 210, damping: 34, mass: 0.9 } as const;

const POP = { type: "spring", stiffness: 640, damping: 22, mass: 0.7 } as const;
const EASE = [0.23, 1, 0.32, 1] as const;
const ENTER = { duration: 0.2, ease: EASE } as const;
const STILL = { duration: 0 } as const;

export type PollOption = {
  id: string;
  label: string;
  votes: number;
};

export type UsePollResultsOptions = {
  options: PollOption[];

  value?: string | null;
  defaultValue?: string | null;
  onVote?: (id: string) => void;
};

export function usePollResults({
  options,
  value,
  defaultValue = null,
  onVote,
}: UsePollResultsOptions) {
  const [internal, setInternal] = useState<string | null>(defaultValue);
  const controlled = value !== undefined;
  const chosen = controlled ? value : internal;

  const emit = useRef(onVote);
  emit.current = onVote;

  const vote = useCallback(
    (id: string) => {
      if (chosen !== null) return;
      if (!controlled) setInternal(id);
      emit.current?.(id);
    },
    [chosen, controlled],
  );

  const total = options.reduce((sum, o) => sum + Math.max(0, o.votes), 0);
  const top = options.reduce(
    (best, o) => (o.votes > best ? o.votes : best),
    0,
  );

  const rows = options.map((option) => ({
    ...option,
    share: total > 0 ? Math.max(0, option.votes) / total : 0,
    winner: total > 0 && option.votes === top,
    mine: option.id === chosen,
  }));

  return {
    rows,
    total,
    chosen,
    revealed: chosen !== null,
    vote,
  };
}

const Tick = (
  <svg viewBox="0 0 256 256" width="11" height="11" fill="none" aria-hidden>
    <polyline
      points="216 72 104 184 48 128"
      stroke="currentColor"
      strokeWidth="26"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

type RowProps = {
  label: string;
  share: number;
  winner: boolean;
  mine: boolean;
  revealed: boolean;
  reduced: boolean;
  onPick: () => void;
};

function Row({ label, share, winner, mine, revealed, reduced, onPick }: RowProps) {
  const progress = useRef(motionValue(0)).current;
  const clipPath = useTransform(
    progress,
    (p) => `inset(0 ${((1 - p) * 100).toFixed(2)}% 0 0 round 5px)`,
  );

  const [landed, setLanded] = useState(false);
  const readout = useRef<HTMLSpanElement | null>(null);

  useMotionValueEvent(progress, "change", (p) => {
    const node = readout.current;
    if (!node) return;
    const next = `${Math.round(p * 100)}%`;
    if (node.textContent !== next) node.textContent = next;
  });

  useEffect(() => {
    if (!revealed) return;
    if (reduced) {
      progress.jump(share);
      setLanded(true);
      return;
    }
    const controls = animate(progress, share, FILL);
    void controls.finished.then(() => setLanded(true));
    return () => controls.stop();
  }, [revealed, share, reduced, progress]);

  return (
    // eslint-disable-next-line jsx-a11y/control-has-associated-label
    <button
      type="button"
      onClick={onPick}
      aria-disabled={revealed}
      aria-pressed={revealed ? mine : undefined}
      className={`group relative h-9 w-full overflow-hidden rounded-[8px] border text-left outline-none transition-[border-color,background-color,box-shadow,transform] duration-200 focus-visible:after:pointer-events-none focus-visible:after:absolute focus-visible:after:inset-0 focus-visible:after:rounded-[7px] focus-visible:after:bg-[#4568FF]/[0.06] focus-visible:after:shadow-[inset_0_0_0_1px_#4568FF] dark:focus-visible:after:bg-[#93B0FF]/[0.1] dark:focus-visible:after:shadow-[inset_0_0_0_1px_#93B0FF] ${
        revealed
          ? "cursor-default border-stone-200 bg-stone-100/70 shadow-[inset_0_1px_2px_rgba(28,25,23,0.07)] dark:border-white/[0.08] dark:bg-[#1D1D1A] dark:shadow-[inset_0_1px_2px_rgba(0,0,0,0.45)]"
          : "border-stone-200 bg-white shadow-[inset_0_1.5px_0_rgba(255,255,255,0.95),inset_0_-1px_0_rgba(28,25,23,0.06),0_1px_2px_rgba(28,25,23,0.08)] hover:bg-stone-50 active:translate-y-px active:shadow-[inset_0_1px_2px_rgba(28,25,23,0.06)] dark:border-white/[0.16] dark:bg-[#252522] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.07),0_1px_2px_rgba(0,0,0,0.4)] dark:hover:bg-[#2A2A27]"
      }`}
    >
      <motion.span
        aria-hidden
        style={{ clipPath }}
        className={`absolute inset-[3px] rounded-[5px] ${
          mine
            ? "bg-[#4568FF]/[0.22] shadow-[inset_0_1px_0_rgba(255,255,255,0.55),inset_0_-1px_0_rgba(69,104,255,0.28)] dark:bg-[#93B0FF]/[0.26] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.16),inset_0_-1px_0_rgba(0,0,0,0.3)]"
            : "bg-stone-800/[0.10] shadow-[inset_0_1px_0_rgba(255,255,255,0.5),inset_0_-1px_0_rgba(28,25,23,0.1)] dark:bg-white/[0.12] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.12),inset_0_-1px_0_rgba(0,0,0,0.3)]"
        }`}
      />
      <span className="relative flex h-full items-center gap-2 px-3">
        <span
          className={`min-w-0 flex-1 truncate text-[13px] transition-[color,font-weight] duration-200 ${
            revealed && winner
              ? "font-medium text-stone-800 dark:text-stone-100"
              : "text-stone-600 group-hover:text-stone-800 dark:text-stone-300 dark:group-hover:text-stone-100"
          }`}
        >
          {label}
        </span>
        <span className="grid size-4 shrink-0 place-items-center">
          <AnimatePresence initial={false}>
            {revealed && winner && landed ? (
              <motion.span
                key="win"
                initial={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.4 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, transition: STILL }}
                transition={reduced ? STILL : POP}
                className="text-stone-800 dark:text-stone-100"
              >
                {Tick}
              </motion.span>
            ) : null}
          </AnimatePresence>
        </span>
        <span className="relative grid shrink-0 text-right">
          <span
            aria-hidden
            className="invisible col-start-1 row-start-1 font-mono text-[11px] tabular-nums"
          >
            100%
          </span>
          <motion.span
            ref={readout}
            aria-hidden
            initial={false}
            animate={{ opacity: revealed ? 1 : 0 }}
            transition={reduced ? STILL : ENTER}
            className="col-start-1 row-start-1 font-mono text-[11px] tabular-nums text-stone-500 dark:text-stone-400"
          >
            0%
          </motion.span>
        </span>
      </span>
    </button>
  );
}

export type PollResultsProps = UsePollResultsOptions & {
  label: string;
  className?: string;
};

export function PollResults({
  options,
  value,
  defaultValue,
  onVote,
  label,
  className = "",
}: PollResultsProps) {
  const poll = usePollResults({ options, value, defaultValue, onVote });
  const reduced = useReducedMotion() === true;

  const [spoken, setSpoken] = useState("");
  useEffect(() => {
    if (!poll.revealed) return;
    const winner = poll.rows.find((r) => r.winner);
    const t = setTimeout(
      () =>
        setSpoken(
          winner
            ? `Results: ${winner.label} leads with ${Math.round(winner.share * 100)} percent of ${poll.total} votes`
            : `Results shown, ${poll.total} votes`,
        ),
      700,
    );
    return () => clearTimeout(t);
  }, [poll.revealed, poll.rows, poll.total]);

  return (
    <div role="group" aria-label={label} className={`w-full ${className}`}>
      <p className="mb-2.5 text-[13px] font-medium text-stone-800 dark:text-stone-100">
        {label}
      </p>
      <div className="space-y-1.5">
        {poll.rows.map((row) => (
          <Row
            key={row.id}
            label={row.label}
            share={row.share}
            winner={row.winner}
            mine={row.mine}
            revealed={poll.revealed}
            reduced={reduced}
            onPick={() => poll.vote(row.id)}
          />
        ))}
      </div>
      <p className="mt-2 h-4 font-mono text-[10.5px] tabular-nums text-stone-400 dark:text-stone-500">
        <motion.span
          initial={false}
          animate={{ opacity: poll.revealed ? 1 : 0 }}
          transition={reduced ? STILL : { ...ENTER, delay: 0.4 }}
          className="inline-block"
        >
          {poll.total.toLocaleString("en-US")} votes
        </motion.span>
      </p>
      <span role="status" className="sr-only">
        {spoken}
      </span>
    </div>
  );
}
