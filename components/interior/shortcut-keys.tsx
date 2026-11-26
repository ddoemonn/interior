"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

const PRESS = { type: "spring", stiffness: 900, damping: 38, mass: 0.5 } as const;
const SWAP = { type: "spring", stiffness: 460, damping: 34, mass: 0.6 } as const;
const LEAVE = { duration: 0.12, ease: [0.4, 0, 1, 1] } as const;
const INSTANT = { duration: 0 } as const;

const DEPTH = 3;

const ICON: Record<string, string> = {
  meta:
    "M180,140H164V116h16a40,40,0,1,0-40-40V92H116V76a40,40,0,1,0-40,40H92v24H76a40,40,0,1,0,40,40V164h24v16a40,40,0,1,0,40-40ZM164,76a16,16,0,1,1,16,16H164ZM60,76a16,16,0,0,1,32,0V92H76A16,16,0,0,1,60,76ZM92,180a16,16,0,1,1-16-16H92Zm24-64h24v24H116Zm64,80a16,16,0,0,1-16-16V164h16a16,16,0,0,1,0,32Z",
  control:
    "M208.49,128.49a12,12,0,0,1-17,0L128,65,64.49,128.49a12,12,0,0,1-17-17l72-72a12,12,0,0,1,17,0l72,72A12,12,0,0,1,208.49,128.49Z",
  shift:
    "M232.48,111.51l-96-96a12,12,0,0,0-17,0l-96,96A12,12,0,0,0,32,132H68v76a20,20,0,0,0,20,20h80a20,20,0,0,0,20-20V132h36a12,12,0,0,0,8.48-20.49ZM176,108a12,12,0,0,0-12,12v84H92V120a12,12,0,0,0-12-12H61l67-67,67,67Z",
  alt:
    "M236,192a12,12,0,0,1-12,12H160.94a19.89,19.89,0,0,1-17.88-11.06L92.58,92H32a12,12,0,0,1,0-24H95.06a19.89,19.89,0,0,1,17.88,11.06L163.42,180H224A12,12,0,0,1,236,192ZM152,92h72a12,12,0,0,0,0-24H152a12,12,0,0,0,0,24Z",
  enter:
    "M204,32V176a12,12,0,0,1-12,12H77l27.52,27.51a12,12,0,0,1-17,17l-48-48a12,12,0,0,1,0-17l48-48a12,12,0,1,1,17,17L77,164H180V32a12,12,0,0,1,24,0Z",
  backspace:
    "M216,36H68.53a20.09,20.09,0,0,0-17.15,9.71L5.71,121.83a12,12,0,0,0,0,12.34l45.67,76.12A20.09,20.09,0,0,0,68.53,220H216a20,20,0,0,0,20-20V56A20,20,0,0,0,216,36Zm-4,160H70.8L30,128,70.8,60H212ZM103.51,143.51,119,128l-15.52-15.51a12,12,0,0,1,17-17L136,111l15.51-15.52a12,12,0,0,1,17,17L153,128l15.52,15.51a12,12,0,0,1-17,17L136,145l-15.51,15.52a12,12,0,0,1-17-17Z",
  arrowup:
    "M208.49,120.49a12,12,0,0,1-17,0L140,69V216a12,12,0,0,1-24,0V69L64.49,120.49a12,12,0,0,1-17-17l72-72a12,12,0,0,1,17,0l72,72A12,12,0,0,1,208.49,120.49Z",
  arrowdown:
    "M208.49,152.49l-72,72a12,12,0,0,1-17,0l-72-72a12,12,0,0,1,17-17L116,187V40a12,12,0,0,1,24,0V187l51.51-51.52a12,12,0,0,1,17,17Z",
  arrowleft:
    "M228,128a12,12,0,0,1-12,12H69l51.52,51.51a12,12,0,0,1-17,17l-72-72a12,12,0,0,1,0-17l72-72a12,12,0,0,1,17,17L69,116H216A12,12,0,0,1,228,128Z",
  arrowright:
    "M224.49,136.49l-72,72a12,12,0,0,1-17-17L187,140H40a12,12,0,0,1,0-24H187L135.51,64.48a12,12,0,0,1,17-17l72,72A12,12,0,0,1,224.49,136.49Z",
};

const WORD: Record<string, string> = {
  escape: "esc",
  tab: "tab",
  " ": "space",
};

const NAME: Record<string, string> = {
  meta: "Command",
  control: "Control",
  shift: "Shift",
  alt: "Option",
  enter: "Enter",
  escape: "Escape",
  " ": "Space",
};

export type UseShortcutKeysOptions = {
  keys: string[];
  onTrigger?: () => void;
  hold?: number;
  preventDefault?: boolean;
  disabled?: boolean;
};

export type ShortcutKeysState = {
  pressed: boolean[];
  matched: boolean;
  count: number;
};

export function useShortcutKeys({
  keys,
  onTrigger,
  hold = 900,
  preventDefault = true,
  disabled = false,
}: UseShortcutKeysOptions): ShortcutKeysState {
  const [down, setDown] = useState<Set<string>>(() => new Set());
  const [matched, setMatched] = useState(false);
  const [count, setCount] = useState(0);

  const wanted = keys.map((key) => key.toLowerCase());
  const signature = wanted.join("+");
  const fire = useRef(onTrigger);
  const armed = useRef(true);
  const held = useRef<Set<string>>(new Set());
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    fire.current = onTrigger;
  });

  const release = useCallback(() => {
    armed.current = true;
    held.current.clear();
    setDown((current) => (current.size === 0 ? current : new Set()));
  }, []);

  useEffect(() => {
    if (disabled) return;
    const list = signature.split("+");

    const onKeyDown = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      if (!list.includes(key)) return;
      if (!held.current.has(key)) {
        held.current.add(key);
        setDown(new Set(held.current));
      }
      if (!list.every((wantedKey) => held.current.has(wantedKey))) return;
      if (preventDefault) event.preventDefault();
      if (!armed.current) return;
      armed.current = false;
      setMatched(true);
      setCount((n) => n + 1);
      fire.current?.();
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => setMatched(false), hold);
    };

    const onKeyUp = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      if (key === "meta") {
        release();
        return;
      }
      if (!held.current.has(key)) return;
      held.current.delete(key);
      armed.current = true;
      setDown(new Set(held.current));
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    window.addEventListener("blur", release);
    document.addEventListener("visibilitychange", release);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("blur", release);
      document.removeEventListener("visibilitychange", release);
    };
  }, [disabled, hold, preventDefault, release, signature]);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  return { pressed: wanted.map((key) => down.has(key)), matched, count };
}

export type ShortcutKeysProps = UseShortcutKeysOptions & {
  label: string;
  doneLabel?: string;
  className?: string;
};

export function ShortcutKeys({
  label,
  doneLabel = "Done",
  className = "",
  ...options
}: ShortcutKeysProps) {
  const reduced = useReducedMotion();
  const { pressed, matched } = useShortcutKeys(options);
  const spoken = options.keys.map((key) => NAME[key.toLowerCase()] ?? key.toUpperCase()).join(" ");

  return (
    <span className={`inline-flex items-center gap-3 ${className}`}>
      <span className="relative inline-grid overflow-hidden text-[13px] text-neutral-500 dark:text-neutral-400">
        <span aria-hidden className="invisible col-start-1 row-start-1 whitespace-nowrap">
          {label}
        </span>
        <span aria-hidden className="invisible col-start-1 row-start-1 whitespace-nowrap">
          {doneLabel}
        </span>
        <AnimatePresence initial={false} mode="popLayout">
          <motion.span
            key={matched ? "done" : "rest"}
            aria-hidden
            initial={reduced ? { opacity: 0 } : { opacity: 0, y: "0.6em", filter: "blur(4px)" }}
            animate={{ opacity: 1, y: "0em", filter: "blur(0px)" }}
            exit={
              reduced
                ? { opacity: 0, transition: INSTANT }
                : { opacity: 0, y: "-0.6em", filter: "blur(4px)", transition: LEAVE }
            }
            transition={reduced ? INSTANT : SWAP}
            className={`col-start-1 row-start-1 whitespace-nowrap transition-colors duration-150 ${
              matched ? "font-medium text-[#0B5CD6] dark:text-[#7DB8FF]" : ""
            }`}
          >
            {matched ? doneLabel : label}
          </motion.span>
        </AnimatePresence>
      </span>

      <kbd aria-label={spoken} className="inline-flex gap-1 font-sans">
        {options.keys.map((key, i) => {
          const sunk = pressed[i] || matched;
          const name = key.toLowerCase();
          const icon = ICON[name];
          return (
            <span
              key={`${key}-${i}`}
              aria-hidden
              className="relative inline-block select-none"
              style={{ paddingBottom: DEPTH }}
            >
              <span
                className={`absolute inset-x-0 bottom-0 rounded-[8px] border transition-colors duration-150 ${
                  matched
                    ? "border-[#0A4FBF] bg-[#0A4FBF] dark:border-[#0B3D8F] dark:bg-[#17509E]"
                    : "border-black/[0.16] bg-neutral-300 dark:border-[#050505] dark:bg-[#151514]"
                }`}
                style={{ top: DEPTH, transitionDelay: matched ? `${i * 55}ms` : "0ms" }}
              />
              <motion.span
                initial={false}
                animate={{ y: sunk ? DEPTH - 1 : 0 }}
                transition={reduced ? INSTANT : PRESS}
                style={{ transitionDelay: matched ? `${i * 55}ms` : "0ms" }}
                className={`relative grid h-8 min-w-8 place-items-center rounded-[8px] border px-2 text-[13px] font-medium transition-colors duration-150 ${
                  matched
                    ? "border-[#0A4FBF] bg-[#0F6FFF] bg-[linear-gradient(180deg,rgba(255,255,255,0.3),rgba(255,255,255,0)_58%,rgba(0,0,0,0.12))] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.5)] dark:border-[#0B3D8F] dark:bg-[#2E8BFF]"
                    : "border-black/[0.13] bg-white bg-[linear-gradient(180deg,rgba(255,255,255,0),rgba(0,0,0,0.035))] text-neutral-900 shadow-[inset_0_1px_0_rgba(255,255,255,0.95),inset_0_-1px_0_rgba(0,0,0,0.05)] dark:border-[#050505] dark:bg-[#2E2E2D] dark:bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0))] dark:text-neutral-100 dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.11),inset_0_-1px_0_rgba(0,0,0,0.35)]"
                }`}
              >
                {icon ? (
                  <svg viewBox="0 0 256 256" width="14" height="14" fill="currentColor">
                    <path d={icon} />
                  </svg>
                ) : (
                  (WORD[name] ?? key.toUpperCase())
                )}
              </motion.span>
            </span>
          );
        })}
      </kbd>

      <span className="sr-only" role="status" aria-live="polite">
        {matched ? doneLabel : ""}
      </span>
    </span>
  );
}
