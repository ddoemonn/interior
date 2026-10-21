"use client";

import { Fragment, useMemo, useRef } from "react";
import { motion, useInView, useReducedMotion } from "motion/react";

const EASE = [0.23, 1, 0.32, 1] as const;
const DURATION = 0.6;

const HIDDEN = { opacity: 0, y: 10, filter: "blur(8px)" } as const;
const SHOWN = { opacity: 1, y: 0, filter: "blur(0px)" } as const;

export type TextRevealSplit = "word" | "character";

export type TextRevealUnit = {
  key: string;
  text: string;
  index: number;
};

export type TextRevealGroup = {
  key: string;
  units: TextRevealUnit[];
};

export type UseTextRevealOptions = {
  text: string;
  by?: TextRevealSplit;
  stagger?: number;
  maxDuration?: number;
  startOnView?: boolean;
  play?: boolean;
  once?: boolean;
  amount?: number;
};

export function useTextReveal<T extends HTMLElement = HTMLSpanElement>({
  text,
  by = "word",
  stagger = 0.055,
  maxDuration = 1.6,
  startOnView = true,
  play = true,
  once = true,
  amount = 0.35,
}: UseTextRevealOptions) {
  const ref = useRef<T>(null);
  const inView = useInView(ref, { once, amount });
  const reduced = useReducedMotion();

  const { groups, step, count } = useMemo(() => {
    const words = text.trim().length ? text.trim().split(/\s+/) : [];

    let index = 0;
    const built: TextRevealGroup[] = words.map((word, w) => {
      if (by === "character") {
        return {
          key: `w${w}`,
          units: Array.from(word).map((char, c) => ({
            key: `w${w}c${c}`,
            text: char,
            index: index++,
          })),
        };
      }
      return {
        key: `w${w}`,
        units: [{ key: `w${w}`, text: word, index: index++ }],
      };
    });

    const total = index;
    const span = Math.max(0, maxDuration - DURATION);

    return {
      groups: built,
      count: total,
      step: total > 1 ? Math.min(stagger, span / (total - 1)) : 0,
    };
  }, [text, by, stagger, maxDuration]);

  const started = play && (!startOnView || inView);

  return {
    ref,
    groups,
    step,
    count,
    started,
    reduced: Boolean(reduced),
    duration: count > 1 ? (count - 1) * step + DURATION : DURATION,
  };
}

export type TextRevealProps = UseTextRevealOptions & {
  className?: string;
};

export function TextReveal({
  text,
  by = "word",
  stagger = 0.055,
  maxDuration = 1.6,
  startOnView = true,
  play = true,
  once = true,
  amount = 0.35,
  className = "",
}: TextRevealProps) {
  const { ref, groups, step, started, reduced } = useTextReveal<HTMLSpanElement>(
    { text, by, stagger, maxDuration, startOnView, play, once, amount },
  );

  return (
    <span ref={ref} className={`text-stone-700 dark:text-stone-200 ${className}`}>
      <span className="sr-only">{text}</span>

      <span aria-hidden="true">
        {groups.map((group, g) => (
          <Fragment key={group.key}>
            {g > 0 ? " " : null}
            <span className="inline-block whitespace-nowrap align-baseline">
              {group.units.map((unit) => (
                <motion.span
                  key={unit.key}
                  className="inline-block align-baseline"
                  initial={reduced ? false : HIDDEN}
                  animate={started ? SHOWN : HIDDEN}
                  transition={
                    reduced
                      ? { duration: 0 }
                      : {
                          duration: DURATION,
                          ease: EASE,
                          delay: started ? unit.index * step : 0,
                        }
                  }
                >
                  {unit.text}
                </motion.span>
              ))}
            </span>
          </Fragment>
        ))}
      </span>
    </span>
  );
}
