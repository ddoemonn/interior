"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";

const EASE = [0.23, 1, 0.32, 1] as const;
const BLOOM = { duration: 0.5, ease: "linear" } as const;
const BASE = 40;

export type RippleSpec = {
  id: number;
  x: number;
  y: number;
  scale: number;
  released: boolean;
};

export type UseRippleOptions = {
  disabled?: boolean;
  max?: number;
  minVisible?: number;
  fade?: number;
};

export function useRipple({
  disabled = false,
  max = 4,
  minVisible = 220,
  fade = 320,
}: UseRippleOptions = {}) {
  const [ripples, setRipples] = useState<RippleSpec[]>([]);

  const list = useRef<RippleSpec[]>([]);
  const seq = useRef(0);
  const born = useRef(new Map<number, number>());
  const timers = useRef(new Map<number, ReturnType<typeof setTimeout>[]>());
  const pointers = useRef(new Map<number, number>());
  const keyed = useRef<number | null>(null);

  const commit = useCallback((next: RippleSpec[]) => {
    list.current = next;
    setRipples(next);
  }, []);

  const forget = useCallback((id: number) => {
    timers.current.get(id)?.forEach(clearTimeout);
    timers.current.delete(id);
    born.current.delete(id);
  }, []);

  const spawn = useCallback(
    (el: HTMLElement, clientX?: number, clientY?: number) => {
      const rect = el.getBoundingClientRect();
      const x = Math.round(
        clientX === undefined ? rect.width / 2 : clientX - rect.left,
      );
      const y = Math.round(
        clientY === undefined ? rect.height / 2 : clientY - rect.top,
      );
      const reach = Math.max(
        Math.hypot(x, y),
        Math.hypot(rect.width - x, y),
        Math.hypot(x, rect.height - y),
        Math.hypot(rect.width - x, rect.height - y),
      );

      let next = list.current;
      while (next.length >= max) {
        forget(next[0].id);
        next = next.slice(1);
      }

      const id = (seq.current += 1);
      born.current.set(id, performance.now());
      commit([
        ...next,
        {
          id,
          x,
          y,
          scale: Math.round((reach * 200) / BASE) / 100,
          released: false,
        },
      ]);
      return id;
    },
    [commit, forget, max],
  );

  const release = useCallback(
    (id: number) => {
      if (timers.current.has(id)) return;
      if (!list.current.some((r) => r.id === id)) return;

      const wait = Math.max(
        0,
        minVisible - (performance.now() - (born.current.get(id) ?? 0)),
      );

      const start = setTimeout(() => {
        commit(
          list.current.map((r) => (r.id === id ? { ...r, released: true } : r)),
        );
      }, wait);

      const drop = setTimeout(() => {
        forget(id);
        commit(list.current.filter((r) => r.id !== id));
      }, wait + fade);

      timers.current.set(id, [start, drop]);
    },
    [commit, fade, forget, minVisible],
  );

  const releaseAll = useCallback(() => {
    pointers.current.forEach((id) => release(id));
    pointers.current.clear();
    if (keyed.current !== null) {
      release(keyed.current);
      keyed.current = null;
    }
  }, [release]);

  const endPointer = useCallback(
    (pointerId: number) => {
      const id = pointers.current.get(pointerId);
      if (id === undefined) return;
      pointers.current.delete(pointerId);
      release(id);
    },
    [release],
  );

  useEffect(() => {
    const bail = () => releaseAll();
    const onVisibility = () => document.hidden && releaseAll();
    window.addEventListener("blur", bail);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.removeEventListener("blur", bail);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [releaseAll]);

  useEffect(() => {
    const pending = timers.current;
    return () => {
      pending.forEach((set) => set.forEach(clearTimeout));
      pending.clear();
    };
  }, []);

  const bind = {
    onPointerDown: (e: React.PointerEvent<HTMLElement>) => {
      if (disabled) return;
      if (e.pointerType === "mouse" && e.button !== 0) return;
      if (pointers.current.has(e.pointerId)) return;
      e.currentTarget.setPointerCapture?.(e.pointerId);
      pointers.current.set(
        e.pointerId,
        spawn(e.currentTarget, e.clientX, e.clientY),
      );
    },
    onPointerUp: (e: React.PointerEvent<HTMLElement>) => endPointer(e.pointerId),
    onPointerCancel: (e: React.PointerEvent<HTMLElement>) =>
      endPointer(e.pointerId),
    onLostPointerCapture: (e: React.PointerEvent<HTMLElement>) =>
      endPointer(e.pointerId),
    onKeyDown: (e: React.KeyboardEvent<HTMLElement>) => {
      if (disabled || e.repeat || keyed.current !== null) return;
      if (e.key !== " " && e.key !== "Enter") return;
      keyed.current = spawn(e.currentTarget);
    },
    onKeyUp: (e: React.KeyboardEvent<HTMLElement>) => {
      if (keyed.current === null) return;
      if (e.key !== " " && e.key !== "Enter" && e.key !== "Escape") return;
      release(keyed.current);
      keyed.current = null;
    },
    onBlur: () => releaseAll(),
  };

  return { bind, ripples, fadeDuration: fade / 1000 };
}

export type RippleProps = {
  children: React.ReactNode;
  onPress?: () => void;
  disabled?: boolean;
  max?: number;
  tintClassName?: string;
  className?: string;
};

export function Ripple({
  children,
  onPress,
  disabled = false,
  max = 4,
  tintClassName = "bg-neutral-800/15 dark:bg-white/20",
  className = "",
}: RippleProps) {
  const { bind, ripples, fadeDuration } = useRipple({ disabled, max });
  const reduced = useReducedMotion();

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onPress}
      style={{ touchAction: "manipulation", WebkitTapHighlightColor: "transparent" }}
      className={`relative isolate inline-flex select-none items-center justify-center gap-2 rounded-[9px] bg-gradient-to-b from-white to-[#f5f5f5] px-[15px] py-[9px] text-[13px] font-medium text-neutral-700 shadow-[inset_0_1px_0_rgba(255,255,255,0.95),0_0_0_1px_rgba(0,0,0,0.15),0_2px_3px_rgba(0,0,0,0.09)] outline-none focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-2 focus-visible:outline-[#4568FF] disabled:opacity-50 dark:from-[#303030] dark:to-[#282828] dark:text-neutral-200 dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.14),0_0_0_1px_#202020,0_2px_3px_rgba(0,0,0,0.25)] ${className}`}
      {...bind}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit]"
      >
        {ripples.map((r) => (
          <motion.span
            key={r.id}
            className={`absolute block rounded-full ${tintClassName}`}
            style={{
              left: r.x - BASE / 2,
              top: r.y - BASE / 2,
              width: BASE,
              height: BASE,
              willChange: "transform, opacity",
            }}
            initial={{ scale: reduced ? r.scale : 0, opacity: 0 }}
            animate={{ scale: r.scale, opacity: r.released ? 0 : 1 }}
            transition={{
              scale: reduced ? { duration: 0 } : BLOOM,
              opacity: {
                duration: r.released ? fadeDuration : 0.07,
                ease: r.released ? EASE : "linear",
              },
            }}
          />
        ))}
      </span>

      <span className="relative">{children}</span>
    </button>
  );
}
