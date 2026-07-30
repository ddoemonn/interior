"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  AnimatePresence,
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
  useTransform,
} from "motion/react";

const SURFACE = { type: "spring", stiffness: 400, damping: 44, mass: 0.85 } as const;

const DEPTH = { duration: 0.34, ease: [0.23, 1, 0.32, 1] } as const;

const GLYPH = { type: "spring", stiffness: 700, damping: 46, mass: 0.5 } as const;

const EASE = [0.23, 1, 0.32, 1] as const;

const EASE_OUT = [0.4, 0, 1, 1] as const;
const INSTANT = { duration: 0 } as const;

const PEEK = 10;
const SWIPE = 72;
const FLICK = 460;

export type ToastStatus = "info" | "pending" | "success" | "error";

export type ToastAction = { label: string; onClick: () => void };

export type Toast = {
  id: string;
  title: string;
  description?: string;
  status?: ToastStatus;

  duration?: number;
  action?: ToastAction;
};

export type ToastInput = Omit<Toast, "id"> & { id?: string };
export type ToastPatch = Partial<Omit<Toast, "id">>;

type Told<T> = ToastPatch | string | ((value: T) => ToastPatch | string);

export type ToastPromiseMessages<T> = {
  pending: ToastInput | string;
  success: Told<T>;
  error: Told<unknown>;
};

export type UseToastStackOptions = {
  duration?: number;

  visible?: number;

  max?: number;
};

export type ToastStackHandle = {
  toasts: Toast[];
  push: (toast: ToastInput) => string;
  update: (id: string, patch: ToastPatch) => void;
  dismiss: (id: string) => void;
  clear: () => void;
  pause: () => void;
  resume: () => void;
  promise: <T>(
    work: Promise<T> | (() => Promise<T>),
    messages: ToastPromiseMessages<T>,
  ) => Promise<T | null>;
};

type Timer = {
  handle: ReturnType<typeof setTimeout> | null;
  endsAt: number;
  remaining: number;
};

function asPatch<T>(told: Told<T>, value: T): ToastPatch {
  const resolved = typeof told === "function" ? told(value) : told;
  return typeof resolved === "string" ? { title: resolved } : resolved;
}

export function useToastStack({
  duration = 4000,
  visible = 3,
  max = 8,
}: UseToastStackOptions = {}): ToastStackHandle {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const seq = useRef(0);
  const paused = useRef(0);
  const timers = useRef<Map<string, Timer>>(new Map());

  const dismiss = useCallback((id: string) => {
    setToasts((prev) =>
      prev.some((t) => t.id === id) ? prev.filter((t) => t.id !== id) : prev,
    );
  }, []);

  const dismissRef = useRef(dismiss);
  dismissRef.current = dismiss;

  const start = useCallback((id: string, entry: Timer) => {
    entry.endsAt = performance.now() + entry.remaining;
    entry.handle = setTimeout(() => dismissRef.current(id), entry.remaining);
  }, []);

  const push = useCallback(
    (toast: ToastInput) => {
      seq.current += 1;
      const id = toast.id ?? `toast-${seq.current}`;
      const next: Toast = { ...toast, id };
      setToasts((prev) =>
        [next, ...prev.filter((t) => t.id !== id)].slice(0, Math.max(1, max)),
      );
      return id;
    },
    [max],
  );

  const update = useCallback((id: string, patch: ToastPatch) => {
    setToasts((prev) => {
      const at = prev.findIndex((t) => t.id === id);
      if (at < 0) return prev;
      const next = prev.slice();
      next[at] = { ...next[at], ...patch };
      return next;
    });
  }, []);

  const clear = useCallback(() => setToasts([]), []);

  const pause = useCallback(() => {
    paused.current += 1;
    if (paused.current > 1) return;
    const now = performance.now();
    timers.current.forEach((entry) => {
      if (entry.handle === null) return;
      clearTimeout(entry.handle);
      entry.handle = null;
      entry.remaining = Math.max(0, entry.endsAt - now);
    });
  }, []);

  const resume = useCallback(() => {
    paused.current = Math.max(0, paused.current - 1);
    if (paused.current > 0) return;
    timers.current.forEach((entry, id) => {
      if (entry.handle === null) start(id, entry);
    });
  }, [start]);

  const promise = useCallback(
    <T,>(
      work: Promise<T> | (() => Promise<T>),
      messages: ToastPromiseMessages<T>,
    ): Promise<T | null> => {
      const opening =
        typeof messages.pending === "string"
          ? { title: messages.pending }
          : messages.pending;
      const id = push({ ...opening, status: "pending" });
      const running = typeof work === "function" ? work() : work;

      return running.then(
        (value) => {
          update(id, { status: "success", ...asPatch(messages.success, value) });
          return value;
        },
        (reason: unknown) => {
          update(id, { status: "error", ...asPatch(messages.error, reason) });
          return null;
        },
      );
    },
    [push, update],
  );

  useEffect(() => {
    const live = toasts.slice(0, Math.max(1, visible));
    const alive = new Set(live.map((t) => t.id));

    timers.current.forEach((entry, id) => {
      if (alive.has(id)) return;
      if (entry.handle !== null) clearTimeout(entry.handle);
      timers.current.delete(id);
    });

    for (const toast of live) {
      const ms = toast.duration ?? duration;
      const holds = toast.status === "pending" || ms <= 0;
      const entry = timers.current.get(toast.id);

      if (holds) {
        if (entry) {
          if (entry.handle !== null) clearTimeout(entry.handle);
          timers.current.delete(toast.id);
        }
        continue;
      }

      if (entry) continue;
      const fresh: Timer = { handle: null, endsAt: 0, remaining: ms };
      timers.current.set(toast.id, fresh);
      if (paused.current === 0) start(toast.id, fresh);
    }

    if (toasts.length > live.length && live.every((t) => !timers.current.has(t.id))) {
      for (let i = live.length - 1; i >= 0; i -= 1) {
        if (live[i].status === "pending") continue;
        dismissRef.current(live[i].id);
        break;
      }
    }
  }, [toasts, visible, duration, start]);

  useEffect(() => {
    const onVisibility = () => (document.hidden ? pause() : resume());
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, [pause, resume]);

  useEffect(() => {
    const pending = timers.current;
    return () => {
      pending.forEach((entry) => {
        if (entry.handle !== null) clearTimeout(entry.handle);
      });
      pending.clear();
    };
  }, []);

  return useMemo(
    () => ({ toasts, push, update, dismiss, clear, pause, resume, promise }),
    [toasts, push, update, dismiss, clear, pause, resume, promise],
  );
}

export type ToastStackProps = {
  toasts: Toast[];
  onDismiss: (id: string) => void;
  onExpandedChange?: (expanded: boolean) => void;
  visible?: number;
  itemHeight?: number;
  gap?: number;
  label?: string;
  className?: string;
};

export function ToastStack({
  toasts,
  onDismiss,
  onExpandedChange,
  visible = 3,
  itemHeight = 62,
  gap = 8,
  label = "Notifications",
  className = "",
}: ToastStackProps) {
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [tapped, setTapped] = useState(false);
  const [announced, setAnnounced] = useState("");

  const regionRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLOListElement>(null);
  const spoken = useRef<Set<string>>(new Set());
  const exitCause = useRef<ToastExitCause>("dismissed");
  const prevShown = useRef<Toast[]>([]);
  const notify = useRef(onExpandedChange);
  notify.current = onExpandedChange;

  const reduced = useReducedMotion();
  const room = Math.max(1, visible);
  const shown = toasts.slice(0, room);
  const queued = Math.max(0, toasts.length - shown.length);
  const open = hovered || focused || tapped;
  const expanded = open && shown.length > 0;

  const top =
    shown.length === 0
      ? 0
      : (shown.length - 1) * (expanded ? itemHeight + gap : PEEK);
  const natural =
    shown.length === 0 ? 0 : top + itemHeight + (queued > 0 ? 20 : 0);
  const reserved =
    toasts.length === 0 ? 0 : (room - 1) * PEEK + itemHeight + 20;

  const floor = useRef(0);
  const height = expanded
    ? Math.max(natural, floor.current, reserved)
    : reserved;

  useEffect(() => {
    floor.current = expanded ? Math.max(floor.current, natural) : reserved;
  }, [expanded, natural, reserved]);

  useEffect(() => {
    if (toasts.length > 0) return;
    setHovered(false);
    setFocused(false);
    setTapped(false);
  }, [toasts.length]);

  useEffect(() => {
    const node = regionRef.current;
    if (!node) return;
    if (!node.matches(":hover")) setHovered(false);
  }, [toasts.length]);

  useEffect(() => {
    if (!hovered) return;
    const watch = (event: PointerEvent) => {
      const node = regionRef.current;
      if (!node) return;
      const box = node.getBoundingClientRect();
      const inside =
        event.clientX >= box.left &&
        event.clientX <= box.right &&
        event.clientY >= box.top &&
        event.clientY <= box.bottom;
      if (!inside) setHovered(false);
    };
    document.addEventListener("pointermove", watch, { passive: true });
    return () => document.removeEventListener("pointermove", watch);
  }, [hovered]);

  useEffect(() => {
    if (!tapped) return;
    const close = (e: PointerEvent) => {
      if (regionRef.current?.contains(e.target as Node | null)) return;
      setTapped(false);
    };
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, [tapped]);

  useEffect(() => {
    if (!expanded) return;
    notify.current?.(true);
    return () => notify.current?.(false);
  }, [expanded]);

  useEffect(() => {
    const head = toasts[0];
    if (!head) return;
    const key = `${head.id}:${head.status ?? "info"}`;
    if (spoken.current.has(key)) return;
    if (spoken.current.size > 64) spoken.current.clear();
    spoken.current.add(key);
    setAnnounced(head.description ? `${head.title}. ${head.description}` : head.title);
  }, [toasts]);

  const remove = useCallback(
    (id: string, cause: ToastExitCause = "dismissed") => {
      exitCause.current = cause;
      const nodes = Array.from(
        listRef.current?.querySelectorAll<HTMLButtonElement>("[data-toast-dismiss]") ?? [],
      );
      const at = nodes.findIndex((n) => n.dataset.toastDismiss === id);
      if (at >= 0 && nodes[at] === document.activeElement) {
        (nodes[at + 1] ?? nodes[at - 1])?.focus();
      }
      onDismiss(id);
    },
    [onDismiss],
  );

  const shownIds = new Set(shown.map((t) => t.id));
  const allIds = new Set(toasts.map((t) => t.id));
  if (
    prevShown.current.some((t) => !shownIds.has(t.id) && allIds.has(t.id))
  ) {
    exitCause.current = "buried";
  }
  useEffect(() => {
    prevShown.current = shown;
  });

  return (
    <motion.div
      ref={regionRef}
      role="region"
      aria-label={label}
      className={`pointer-events-none relative w-full max-w-[352px] ${className}`}
      initial={false}
      animate={{ height }}
      transition={reduced ? INSTANT : SURFACE}
      onPointerEnter={(e) => {
        if (e.pointerType !== "touch") setHovered(true);
      }}
      onPointerLeave={() => setHovered(false)}
      onPointerDown={(e) => {
        if (e.pointerType === "touch") setTapped(true);
      }}
      onFocusCapture={() => setFocused(true)}
      onBlurCapture={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setFocused(false);
      }}
    >
      <p aria-live="polite" aria-atomic="true" className="sr-only">
        {announced}
      </p>
      <motion.p
        aria-hidden
        className="pointer-events-none absolute bottom-0 right-1 text-[10.5px] tabular-nums text-stone-400 dark:text-stone-500"
        initial={false}
        animate={{ opacity: queued > 0 ? 1 : 0, y: -(top + itemHeight + 4) }}
        transition={reduced ? INSTANT : SURFACE}
      >
        {queued} waiting
      </motion.p>
      <ol ref={listRef} className="absolute inset-0 m-0 list-none p-0">
        <AnimatePresence initial={false} custom={exitCause}>
          {shown.map((toast, index) => (
            <ToastCard
              key={toast.id}
              toast={toast}
              index={index}
              count={shown.length}
              expanded={expanded}
              itemHeight={itemHeight}
              gap={gap}
              reduced={Boolean(reduced)}
              onRemove={remove}
            />
          ))}
        </AnimatePresence>
      </ol>
    </motion.div>
  );
}

export type ToastExitCause = "dismissed" | "swiped" | "buried";

type ToastCardProps = {
  toast: Toast;
  index: number;
  count: number;
  expanded: boolean;
  itemHeight: number;
  gap: number;
  reduced: boolean;
  onRemove: (id: string, cause?: ToastExitCause) => void;
};

function ToastCard({
  toast,
  index,
  count,
  expanded,
  itemHeight,
  gap,
  reduced,
  onRemove,
}: ToastCardProps) {
  const x = useMotionValue(0);
  const fade = useTransform(x, [-190, -48, 0, 48, 190], [0, 1, 1, 1, 0]);

  const prevIndex = useRef(index);
  const promoted = prevIndex.current > index;
  useEffect(() => {
    prevIndex.current = index;
  });

  const status = toast.status ?? "info";
  const buried = !expanded && index > 0;
  const draggable = index === 0 || expanded;

  const y = expanded ? -index * (itemHeight + gap) : -index * PEEK;
  const scale = expanded ? 1 : 1 - index * 0.03;

  return (
    <motion.li
      data-toast-id={toast.id}
      className="pointer-events-auto absolute inset-x-0 bottom-0 origin-bottom"
      style={{ height: itemHeight, zIndex: count - index }}
      initial={
        reduced
          ? false
          : { opacity: 0, y: y + 14, scale: scale - 0.03, filter: "blur(4px)" }
      }
      animate={{ opacity: 1, y, scale, filter: "blur(0px)" }}
      variants={{
        exit: (cause: { current: ToastExitCause } | undefined) => {
          if (reduced) return { opacity: 0, transition: INSTANT };
          const mode = cause?.current ?? "dismissed";
          if (mode === "swiped") {
            return {
              opacity: 0,
              transition: { duration: 0.12, ease: "linear" },
            };
          }
          if (mode === "buried") {
            return {
              opacity: 0,
              y: y - 6,
              scale: scale - 0.05,
              filter: "blur(2px)",
              transition: {
                duration: 0.15,
                ease: EASE_OUT,
                opacity: { duration: 0.12, ease: "linear" },
              },
            };
          }
          return {
            opacity: 0,
            y: y + 24,
            scale: scale - 0.04,
            filter: "blur(3px)",
            transition: {
              duration: 0.18,
              ease: EASE_OUT,
              opacity: { duration: 0.14, ease: "linear" },
            },
          };
        },
      }}
      exit="exit"
      transition={
        reduced
          ? INSTANT
          : {
              ...SURFACE,
              delay: promoted ? 0.08 : 0,
              scale: { ...DEPTH, delay: promoted ? 0.08 : 0 },
              opacity: { duration: 0.18, ease: EASE },
              filter: { duration: 0.18, ease: EASE },
            }
      }
    >
      <motion.div
        drag={draggable ? "x" : false}
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.35}
        dragMomentum={false}
        onDragEnd={(_, info) => {
          const far = Math.abs(info.offset.x) > SWIPE;
          const flicked =
            Math.abs(info.velocity.x) > FLICK && Math.abs(info.offset.x) > 20;
          if (!far && !flicked) return;
          if (!reduced) {
            animate(x, info.offset.x < 0 ? -300 : 300, {
              duration: 0.14,
              ease: EASE_OUT,
            });
          }
          onRemove(toast.id, "swiped");
        }}
        onKeyDown={(e) => {
          if (e.key !== "Delete" && e.key !== "Backspace") return;
          e.preventDefault();
          onRemove(toast.id);
        }}
        style={{ x, opacity: fade, height: itemHeight, touchAction: "pan-y" }}
        className="flex w-full items-center gap-2.5 rounded-[11px] border border-stone-200/90 bg-white px-2.5 shadow-[0_1px_2px_rgba(28,25,23,0.07)] dark:border-white/[0.16] dark:bg-[#1D1D1A] dark:shadow-[0_1px_2px_rgba(0,0,0,0.5)]"
      >
        <StatusMark status={status} reduced={reduced} />
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[12.5px] font-medium leading-[17px] text-stone-700 dark:text-stone-100">
            {toast.title}
          </span>
          {toast.description ? (
            <span className="mt-px block truncate text-[11px] leading-[15px] text-stone-500 dark:text-stone-400">
              {toast.description}
            </span>
          ) : null}
        </span>

        {toast.action ? (
          <button
            type="button"
            tabIndex={buried ? -1 : 0}
            onClick={() => {
              toast.action?.onClick();
              onRemove(toast.id);
            }}
            className="h-[26px] shrink-0 whitespace-nowrap rounded-[7px] border border-stone-200 bg-stone-50 px-2 text-[11.5px] font-medium text-stone-700 transition-colors duration-150 hover:bg-stone-100 focus-visible:outline-none focus-visible:bg-[#4568FF]/[0.06] focus-visible:shadow-[inset_0_0_0_1px_#4568FF] dark:border-white/[0.16] dark:bg-white/[0.06] dark:text-stone-100 dark:hover:bg-white/10 dark:focus-visible:bg-[#93B0FF]/[0.1] dark:focus-visible:shadow-[inset_0_0_0_1px_#93B0FF]"
          >
            {toast.action.label}
          </button>
        ) : null}

        <button
          type="button"
          data-toast-dismiss={toast.id}
          aria-label={`Dismiss ${toast.title}`}
          tabIndex={buried ? -1 : 0}
          onClick={() => onRemove(toast.id)}
          className="grid size-[26px] shrink-0 place-items-center rounded-[7px] text-stone-400 transition-colors duration-150 hover:bg-stone-100 hover:text-stone-700 focus-visible:outline-none focus-visible:bg-[#4568FF]/[0.06] focus-visible:shadow-[inset_0_0_0_1px_#4568FF] dark:text-stone-500 dark:hover:bg-white/10 dark:hover:text-stone-100 dark:focus-visible:bg-[#93B0FF]/[0.1] dark:focus-visible:shadow-[inset_0_0_0_1px_#93B0FF]"
        >
          <svg width="11" height="11" viewBox="0 0 16 16" fill="none" aria-hidden>
            <path
              d="M4 4l8 8M12 4l-8 8"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </motion.div>
    </motion.li>
  );
}

const MARK_TINT: Record<ToastStatus, string> = {
  info: "bg-stone-100 text-stone-500 dark:bg-white/10 dark:text-stone-300",
  pending: "bg-[#4568FF]/10 text-[#4568FF] dark:bg-[#93B0FF]/15 dark:text-[#93B0FF]",
  success: "bg-emerald-500/10 text-emerald-600 dark:bg-emerald-400/15 dark:text-emerald-400",
  error: "bg-red-500/10 text-red-600 dark:bg-red-400/15 dark:text-red-400",
};

const RESOLVED: ToastStatus[] = ["info", "success", "error"];

function StatusMark({ status, reduced }: { status: ToastStatus; reduced: boolean }) {
  const stroke = {
    stroke: "currentColor",
    strokeWidth: 1.7,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    fill: "none",
  };

  return (
    <span
      aria-hidden
      className={`grid size-[26px] shrink-0 place-items-center rounded-[7px] transition-colors duration-200 ${MARK_TINT[status]}`}
    >
      {RESOLVED.map((each) => (
        <motion.span
          key={each}
          className="col-start-1 row-start-1 flex"
          initial={false}
          animate={{
            opacity: status === each ? 1 : 0,
            scale: reduced ? 1 : status === each ? 1 : 0.72,
          }}
          transition={reduced ? INSTANT : GLYPH}
        >
          <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden>
            {each === "success" ? <path d="M3.8 8.3l2.9 2.9 5.7-6.4" {...stroke} /> : null}
            {each === "error" ? (
              <>
                <path d="M8 4.3v4.4" {...stroke} />
                <path d="M8 11.4h.01" {...stroke} />
              </>
            ) : null}
            {each === "info" ? (
              <>
                <path d="M8 7.4v4.2" {...stroke} />
                <path d="M8 4.6h.01" {...stroke} />
              </>
            ) : null}
          </svg>
        </motion.span>
      ))}

      <AnimatePresence initial={false}>
        {status === "pending" ? (
          <motion.span
            key="pending"
            className="col-start-1 row-start-1 flex"
            initial={reduced ? false : { opacity: 0, scale: 0.72 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.72 }}
            transition={reduced ? INSTANT : GLYPH}
          >
            <Spinner reduced={reduced} />
          </motion.span>
        ) : null}
      </AnimatePresence>
    </span>
  );
}

function Spinner({ reduced }: { reduced: boolean }) {
  if (reduced) {
    return (
      <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden>
        <circle cx="8" cy="8" r="5.4" stroke="currentColor" strokeWidth="1.7" fill="none" opacity="0.3" />
      </svg>
    );
  }

  return (
    <motion.span
      className="flex"
      animate={{ rotate: 360 }}
      transition={{ duration: 0.75, ease: "linear", repeat: Infinity }}
    >
      <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden>
        <circle
          cx="8"
          cy="8"
          r="5.4"
          stroke="currentColor"
          strokeWidth="1.7"
          fill="none"
          opacity="0.25"
        />
        <path
          d="M8 2.6a5.4 5.4 0 0 1 5.4 5.4"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
          fill="none"
        />
      </svg>
    </motion.span>
  );
}
