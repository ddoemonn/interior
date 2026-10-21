"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";

const DISCLOSE = { type: "spring", stiffness: 150, damping: 27, mass: 1 } as const;
const CROSSFADE = { type: "spring", stiffness: 260, damping: 34, mass: 0.8 } as const;

export type UseHideOnScrollOptions = {
  hideAfter?: number;
  revealAfter?: number;
  topGuard?: number;
  pinned?: boolean;
  disabled?: boolean;
};

export type UseHideOnScrollResult<T extends HTMLElement> = {
  ref: React.RefObject<T | null>;
  hidden: boolean;
  atTop: boolean;
};

export function useHideOnScroll<T extends HTMLElement = HTMLDivElement>({
  hideAfter = 14,
  revealAfter = 10,
  topGuard = 24,
  pinned = false,
  disabled = false,
}: UseHideOnScrollOptions = {}): UseHideOnScrollResult<T> {
  const ref = useRef<T | null>(null);
  const frame = useRef(0);
  const last = useRef(0);
  const accum = useRef(0);

  const held = useRef(pinned || disabled);
  held.current = pinned || disabled;

  const [hidden, setHidden] = useState(false);
  const [atTop, setAtTop] = useState(true);

  const down = Math.max(1, hideAfter);
  const up = Math.max(1, revealAfter);
  const guard = Math.max(0, topGuard);

  useEffect(() => {
    if (!pinned && !disabled) return;
    accum.current = 0;
    setHidden(false);
  }, [pinned, disabled]);

  useEffect(() => {
    const el = ref.current;
    const target: EventTarget = el ?? window;

    const readY = () => (el ? el.scrollTop : window.scrollY);
    const readMax = () =>
      el
        ? el.scrollHeight - el.clientHeight
        : document.documentElement.scrollHeight - window.innerHeight;

    const evaluate = () => {
      frame.current = 0;

      const max = readMax();
      const y = readY();

      if (max <= guard) {
        accum.current = 0;
        last.current = y;
        setAtTop((prev) => (prev ? prev : true));
        setHidden((prev) => (prev ? false : prev));
        return;
      }

      if (y < 0 || y > max) return;

      const dy = y - last.current;
      last.current = y;

      const top = y <= guard;
      setAtTop((prev) => (prev === top ? prev : top));

      if (held.current || top) {
        accum.current = 0;
        setHidden((prev) => (prev ? false : prev));
        return;
      }

      if (dy === 0) return;
      if (dy > 0 !== accum.current > 0) accum.current = 0;
      accum.current += dy;

      if (accum.current >= down) {
        accum.current = 0;
        setHidden((prev) => (prev ? prev : true));
      } else if (accum.current <= -up) {
        accum.current = 0;
        setHidden((prev) => (prev ? false : prev));
      }
    };

    const schedule = () => {
      if (frame.current) return;
      frame.current = requestAnimationFrame(evaluate);
    };

    last.current = readY();
    evaluate();

    target.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);

    let observer: ResizeObserver | null = null;
    if (el && typeof ResizeObserver !== "undefined") {
      observer = new ResizeObserver(schedule);
      observer.observe(el);
    }

    return () => {
      target.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      observer?.disconnect();
      if (frame.current) cancelAnimationFrame(frame.current);
      frame.current = 0;
    };
  }, [down, up, guard]);

  return { ref, hidden, atTop };
}

export type HideOnScrollProps = {
  bar: React.ReactNode;
  children: React.ReactNode;
  barHeight?: number;
  hideAfter?: number;
  revealAfter?: number;
  topGuard?: number;
  pinned?: boolean;
  maxHeight?: number;
  label?: string;
  onHiddenChange?: (hidden: boolean) => void;
  className?: string;
};

export function HideOnScroll({
  bar,
  children,
  barHeight = 44,
  hideAfter = 14,
  revealAfter = 10,
  topGuard = 24,
  pinned = false,
  maxHeight = 320,
  label = "Scrollable content",
  onHiddenChange,
  className = "",
}: HideOnScrollProps) {
  const [focusWithin, setFocusWithin] = useState(false);

  const { ref, hidden, atTop } = useHideOnScroll<HTMLDivElement>({
    hideAfter,
    revealAfter,
    topGuard,
    pinned: pinned || focusWithin,
  });

  const reduced = useReducedMotion();
  const slide = reduced ? { duration: 0 } : DISCLOSE;
  const fade = reduced ? { duration: 0 } : CROSSFADE;

  const seen = useRef(hidden);
  useEffect(() => {
    if (seen.current === hidden) return;
    seen.current = hidden;
    onHiddenChange?.(hidden);
  }, [hidden, onHiddenChange]);

  return (
    <div
      className={`relative w-full min-w-0 overflow-hidden rounded-[14px] border border-stone-200 bg-white shadow-[0_1px_2px_rgba(28,25,23,0.06),0_4px_10px_-8px_rgba(28,25,23,0.45)] dark:border-white/[0.16] dark:bg-[#1D1D1A] dark:shadow-[0_1px_6px_rgba(0,0,0,0.45)] ${className}`}
    >
      <motion.div
        data-hidden={hidden ? "true" : "false"}
        onFocus={() => setFocusWithin(true)}
        onBlur={() => setFocusWithin(false)}
        style={{ height: barHeight }}
        initial={false}
        animate={{ y: hidden ? -barHeight : 0 }}
        transition={slide}
        className="absolute inset-x-0 top-0 z-10 flex items-center gap-2 bg-white px-3 dark:bg-[#1D1D1A]"
      >
        {bar}

        <motion.span
          aria-hidden
          initial={false}
          animate={{ opacity: atTop ? 0 : 1 }}
          transition={fade}
          className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-stone-200 dark:bg-white/[0.16]"
        />
      </motion.div>
      <div
        ref={ref}

        // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
        tabIndex={0}
        role="region"
        aria-label={label}
        style={{ maxHeight, scrollPaddingTop: barHeight + 8 }}
        className="overflow-y-auto overscroll-y-contain outline-none [scrollbar-gutter:stable] focus-visible:bg-[#4568FF]/[0.06] focus-visible:shadow-[inset_0_0_0_1px_#4568FF] dark:focus-visible:bg-[#93B0FF]/[0.06] dark:focus-visible:shadow-[inset_0_0_0_1px_#93B0FF]"
      >
        <div aria-hidden style={{ height: barHeight }} />
        <div
          aria-hidden
          className="pointer-events-none sticky top-0 -mb-5 h-5 bg-gradient-to-b from-white to-transparent dark:from-[#1D1D1A]"
        />
        {children}
        <div
          aria-hidden
          className="pointer-events-none sticky bottom-0 -mt-5 h-5 bg-gradient-to-t from-white to-transparent dark:from-[#1D1D1A]"
        />
      </div>
    </div>
  );
}
