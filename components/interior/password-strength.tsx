"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, useReducedMotion } from "motion/react";

const CELL = { type: "spring", stiffness: 520, damping: 34, mass: 0.45 } as const;
const CROSSFADE = { type: "spring", stiffness: 260, damping: 34, mass: 0.8 } as const;
const INSTANT = { duration: 0 } as const;

const COMMON = /^(?:password|passw0rd|qwerty|letmein|welcome|admin|iloveyou|monkey|dragon|abc123|111111|123123|123456)/i;
const RUN = /(.)\1{3,}/;
const RUN_UP = /(?:0123|1234|2345|3456|4567|5678|6789|abcd|bcde|cdef|defg|qwer|wert|erty|asdf)/i;
const SYMBOL = /[!-/:-@[-`{-~]/;

export type PasswordRule = {
  id: string;
  label: string;
  test: (value: string) => boolean;
};

export type EvaluatedRule = PasswordRule & { met: boolean };

export type UsePasswordStrengthOptions = {
  rules?: readonly PasswordRule[];
  labels?: readonly string[];
  announceDelay?: number;
};

export type PasswordStrengthState = {
  score: number;
  max: number;
  label: string;
  rules: EvaluatedRule[];
  guessable: boolean;
  announcement: string;
};

export const defaultPasswordRules: readonly PasswordRule[] = [
  { id: "length", label: "12 characters or more", test: (v) => v.length >= 12 },
  {
    id: "case",
    label: "Upper and lower case",
    test: (v) => /[a-z]/.test(v) && /[A-Z]/.test(v),
  },
  { id: "digit", label: "A number", test: (v) => /\d/.test(v) },
  { id: "symbol", label: "A symbol", test: (v) => SYMBOL.test(v) },
];

const defaultLabels = ["Empty", "Weak", "Fair", "Good", "Strong"] as const;

export function usePasswordStrength(
  value: string,
  {
    rules = defaultPasswordRules,
    labels = defaultLabels,
    announceDelay = 700,
  }: UsePasswordStrengthOptions = {},
): PasswordStrengthState {
  const state = useMemo(() => {
    const evaluated = rules.map((rule) => ({ ...rule, met: rule.test(value) }));
    const passed = evaluated.reduce((n, r) => n + (r.met ? 1 : 0), 0);
    const guessable =
      value.length > 0 && (COMMON.test(value) || RUN.test(value) || RUN_UP.test(value));

    const score =
      value.length === 0 ? 0 : guessable ? 1 : Math.min(rules.length, Math.max(1, passed));

    const label = labels[Math.min(score, labels.length - 1)] ?? "";
    const unmet = evaluated.filter((r) => !r.met);

    const announcement =
      value.length === 0
        ? ""
        : [
            `Password strength ${label.toLowerCase()}.`,
            guessable ? "This is a commonly guessed pattern." : "",
            unmet.length === 0
              ? "All requirements met."
              : `Still needed: ${unmet.map((r) => r.label.toLowerCase()).join(", ")}.`,
          ]
            .filter(Boolean)
            .join(" ");

    return { score, max: rules.length, label, rules: evaluated, guessable, announcement };
  }, [value, rules, labels]);

  const [settled, setSettled] = useState("");

  useEffect(() => {
    if (state.announcement === "") {
      setSettled("");
      return;
    }
    const id = setTimeout(() => setSettled(state.announcement), announceDelay);
    return () => clearTimeout(id);
  }, [state.announcement, announceDelay]);

  return { ...state, announcement: settled };
}

export type PasswordStrengthProps = {
  value: string;
  rules?: readonly PasswordRule[];
  labels?: readonly string[];
  announceDelay?: number;
  showRules?: boolean;
  className?: string;
};

const TONES = {
  none: { bar: "bg-stone-300 dark:bg-white/20", text: "text-stone-500 dark:text-stone-400" },
  danger: { bar: "bg-red-500", text: "text-red-600 dark:text-red-400" },
  caution: { bar: "bg-amber-500", text: "text-amber-600 dark:text-amber-400" },
  safe: { bar: "bg-emerald-500", text: "text-emerald-600 dark:text-emerald-400" },
} as const;

function toneFor(score: number, max: number) {
  if (score === 0) return TONES.none;
  const ratio = score / max;
  if (ratio <= 0.34) return TONES.danger;
  if (ratio <= 0.67) return TONES.caution;
  return TONES.safe;
}

export function PasswordStrength({
  value,
  rules = defaultPasswordRules,
  labels = defaultLabels,
  announceDelay = 700,
  showRules = true,
  className = "",
}: PasswordStrengthProps) {
  const {
    score,
    max,
    label,
    rules: evaluated,
    guessable,
    announcement,
  } = usePasswordStrength(value, { rules, labels, announceDelay });
  const reduced = useReducedMotion();
  const tone = toneFor(score, max);

  return (
    <div className={`w-full ${className}`}>
      <div
        role="meter"
        aria-label="Password strength"
        aria-valuemin={0}
        aria-valuemax={max}
        aria-valuenow={score}
        aria-valuetext={label}
        className="grid gap-1.5"
        style={{ gridTemplateColumns: `repeat(${max}, minmax(0, 1fr))` }}
      >
        {Array.from({ length: max }, (_, i) => (
          <div
            key={i}
            className="relative h-1.5 overflow-hidden rounded-[2px] bg-stone-200 dark:bg-white/12"
          >
            <motion.span
              className={`absolute inset-0 origin-left rounded-[2px] transition-colors duration-200 ${tone.bar}`}
              initial={false}
              animate={{ scaleX: i < score ? 1 : 0 }}
              transition={
                reduced ? INSTANT : { ...CELL, delay: i < score ? i * 0.03 : 0 }
              }
            />
          </div>
        ))}
      </div>

      <div className="mt-2 flex h-5 items-center justify-between gap-3">
        <span className="inline-grid text-[12.5px] font-medium leading-5">
          {labels.map((text, i) => (
            <motion.span
              key={text}
              aria-hidden
              className={`col-start-1 row-start-1 whitespace-nowrap transition-colors duration-200 ${tone.text}`}
              initial={false}
              animate={{ opacity: i === Math.min(score, labels.length - 1) ? 1 : 0 }}
              transition={reduced ? INSTANT : CROSSFADE}
            >
              {text}
            </motion.span>
          ))}
        </span>

        <motion.span
          aria-hidden
          className="whitespace-nowrap text-[11.5px] leading-5 text-amber-600 dark:text-amber-400"
          initial={false}
          animate={{ opacity: guessable ? 1 : 0 }}
          transition={reduced ? INSTANT : CROSSFADE}
        >
          Commonly guessed
        </motion.span>
      </div>

      {showRules && (
        <ul className="mt-3 grid gap-1.5">
          {evaluated.map((rule) => (
            <li key={rule.id} className="flex items-center gap-2">
              <span className="relative grid size-[14px] shrink-0 place-items-center rounded-[4px] border border-stone-200 text-white dark:border-white/[0.16] dark:text-stone-900">
                <motion.span
                  className="absolute inset-0 rounded-[3px] bg-emerald-500"
                  initial={false}
                  animate={{ opacity: rule.met ? 1 : 0 }}
                  transition={reduced ? INSTANT : CROSSFADE}
                />
                <motion.svg
                  viewBox="0 0 12 12"
                  fill="none"
                  aria-hidden
                  className="relative size-[9px]"
                  initial={false}
                  animate={{ opacity: rule.met ? 1 : 0, scale: rule.met ? 1 : 0.6 }}
                  transition={reduced ? INSTANT : CELL}
                >
                  <path
                    d="M2 6.2 4.7 8.9 10 3.3"
                    stroke="currentColor"
                    strokeWidth={1.9}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </motion.svg>
              </span>
              <span
                className={`text-[12.5px] leading-5 transition-colors duration-200 ${
                  rule.met
                    ? "text-stone-700 dark:text-stone-200"
                    : "text-stone-500 dark:text-stone-400"
                }`}
              >
                {rule.label}
              </span>
              <span className="sr-only">{rule.met ? "met" : "not met"}</span>
            </li>
          ))}
        </ul>
      )}

      <p aria-live="polite" className="sr-only">
        {announcement}
      </p>
    </div>
  );
}
