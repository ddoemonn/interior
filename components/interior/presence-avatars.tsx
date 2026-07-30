"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

const SLOT = { type: "spring", stiffness: 520, damping: 34, mass: 0.45 } as const;
const FADE = { duration: 0.24, ease: [0.23, 1, 0.32, 1] } as const;
const INSTANT = { duration: 0 } as const;

export type PresencePerson = {
  id: string;
  name: string;
  src?: string;
};

export type UsePresenceOptions = {
  people: PresencePerson[];
  max?: number;
  announceAfter?: number;
};

export type UsePresenceResult = {
  ordered: PresencePerson[];
  visible: PresencePerson[];
  hidden: PresencePerson[];
  overflow: number;
  total: number;
  summary: string;
  announcement: string;
};

function initials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "?";
  const first = Array.from(words[0])[0] ?? "";
  const last = words.length > 1 ? (Array.from(words[words.length - 1])[0] ?? "") : "";
  return (first + last).toUpperCase();
}

function describe(names: string[]): string {
  if (names.length === 0) return "Nobody here";
  if (names.length === 1) return `${names[0]} is here`;
  if (names.length === 2) return `${names[0]} and ${names[1]} are here`;
  const rest = names.length - 2;
  return `${names[0]}, ${names[1]} and ${rest} ${rest === 1 ? "other" : "others"} are here`;
}

export function usePresence({
  people,
  max = 5,
  announceAfter = 900,
}: UsePresenceOptions): UsePresenceResult {
  const seen = useRef(new Map<string, number>());
  const next = useRef(0);

  const ordered = useMemo(() => {
    const order = seen.current;
    for (const person of people) {
      if (!order.has(person.id)) {
        order.set(person.id, next.current);
        next.current += 1;
      }
    }
    return people
      .slice()
      .toSorted((a, b) => (order.get(a.id) ?? 0) - (order.get(b.id) ?? 0));
  }, [people]);

  const slots = Math.max(1, max);
  const visible = ordered.slice(0, slots);
  const hidden = ordered.slice(slots);
  const summary = describe(ordered.map((person) => person.name));

  const [announcement, setAnnouncement] = useState(summary);

  useEffect(() => {
    const timer = setTimeout(() => setAnnouncement(summary), announceAfter);
    return () => clearTimeout(timer);
  }, [summary, announceAfter]);

  return {
    ordered,
    visible,
    hidden,
    overflow: hidden.length,
    total: ordered.length,
    summary,
    announcement,
  };
}

const TILE =
  "absolute left-0 top-0 select-none rounded-[10px] bg-stone-200 p-[3px] dark:bg-stone-700";
const WELL =
  "relative grid size-full place-items-center overflow-hidden rounded-[7px] bg-stone-100 font-medium leading-none text-stone-500 dark:bg-white/10 dark:text-stone-300";

type TileProps = {
  person: PresencePerson;
  index: number;
  step: number;
  size: number;
  zIndex: number;
  reduced: boolean;
};

function PresenceTile({ person, index, step, size, zIndex, reduced }: TileProps) {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);

  return (
    <motion.span
      aria-hidden
      initial={{ opacity: 0, scale: 0.86, x: index * step }}
      animate={{ opacity: 1, scale: 1, x: index * step }}
      exit={{ opacity: 0, scale: 0.86 }}
      transition={reduced ? INSTANT : SLOT}
      style={{ width: size, height: size, zIndex, fontSize: Math.round(size * 0.34) }}
      className={TILE}
    >
      <span className={WELL}>
        {initials(person.name)}

        {person.src && !failed ? (
          <motion.img
            src={person.src}
            alt=""
            width={size}
            height={size}
            decoding="async"
            onLoad={() => setLoaded(true)}
            onError={() => setFailed(true)}
            initial={false}
            animate={{ opacity: loaded ? 1 : 0 }}
            transition={reduced ? INSTANT : FADE}
            className="absolute inset-0 size-full object-cover"
          />
        ) : null}
      </span>
    </motion.span>
  );
}

export type PresenceAvatarsProps = {
  people: PresencePerson[];
  max?: number;
  size?: number;
  overlap?: number;
  label?: string;
  announceAfter?: number;
  onOverflowSelect?: (hidden: PresencePerson[]) => void;
  className?: string;
};

export function PresenceAvatars({
  people,
  max = 5,
  size = 28,
  overlap = 9,
  label = "People here",
  announceAfter,
  onOverflowSelect,
  className = "",
}: PresenceAvatarsProps) {
  const reduced = useReducedMotion();
  const { ordered, visible, hidden, overflow, announcement } = usePresence({
    people,
    max,
    announceAfter,
  });

  const slots = Math.max(1, max);
  const step = size - overlap;
  const chip = size + 8;

  const rail =
    visible.length === 0
      ? 0
      : overflow > 0
        ? visible.length * step + chip
        : (visible.length - 1) * step + size;

  const chipCount = `+${Math.min(overflow, 99)}`;
  const chipMotion = {
    initial: { opacity: 0, scale: 0.86 },
    animate: { opacity: 1, scale: 1, x: visible.length * step },
    exit: { opacity: 0, scale: 0.86 },
    transition: reduced ? INSTANT : SLOT,
  };
  const chipClass =
    "absolute left-0 top-0 grid place-items-center rounded-[9px] border border-stone-200 bg-white font-mono text-[10.5px] leading-none tabular-nums text-stone-500 outline-none ring-2 ring-white dark:border-white/[0.16] dark:bg-[#1D1D1A] dark:text-stone-400 dark:ring-stone-900";

  return (
    <div role="group" aria-label={label} className={`inline-flex items-center ${className}`}>
      <motion.div
        className="relative shrink-0"
        style={{ height: size }}
        initial={false}
        animate={{ width: rail }}
        transition={reduced ? INSTANT : SLOT}
      >
        <AnimatePresence initial={false}>
          {visible.map((person, i) => (
            <PresenceTile
              key={person.id}
              person={person}
              index={i}
              step={step}
              size={size}
              zIndex={slots - i}
              reduced={Boolean(reduced)}
            />
          ))}

          {overflow > 0 &&
            (onOverflowSelect ? (
              <motion.button
                key="overflow"
                type="button"
                onClick={() => onOverflowSelect(hidden)}
                aria-label={`Show ${overflow} more`}
                style={{ width: chip, height: size, zIndex: 0 }}
                className={`${chipClass} focus-visible:border-[#4568FF] dark:focus-visible:border-[#93B0FF]`}
                {...chipMotion}
              >
                <span aria-hidden>{chipCount}</span>
              </motion.button>
            ) : (
              <motion.span
                key="overflow"
                aria-hidden
                style={{ width: chip, height: size, zIndex: 0 }}
                className={chipClass}
                {...chipMotion}
              >
                {chipCount}
              </motion.span>
            ))}
        </AnimatePresence>
      </motion.div>
      <ul className="sr-only">
        {ordered.map((person) => (
          <li key={person.id}>{person.name}</li>
        ))}
      </ul>
      <span role="status" aria-live="polite" aria-atomic="true" className="sr-only">
        {announcement}
      </span>
    </div>
  );
}
