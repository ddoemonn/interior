"use client";

import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import {
  animate,
  motion,
  useDragControls,
  useMotionValue,
  useReducedMotion,
  useTransform,
} from "motion/react";

const DISCLOSE = {
  type: "spring",
  stiffness: 150,
  damping: 27,
  mass: 1,
} as const;

const CELL = {
  type: "spring",
  stiffness: 520,
  damping: 34,
  mass: 0.45,
} as const;

const CROSSFADE = {
  type: "spring",
  stiffness: 260,
  damping: 34,
  mass: 0.8,
} as const;

const HIDDEN = 4096;

const FOCUSABLE =
  'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';

const useIsoEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

const clamp = (n: number, lo: number, hi: number) =>
  Math.max(lo, Math.min(hi, n));

type Inertable = HTMLElement & { inert?: boolean };

type DragInfo = {
  offset: { x: number; y: number };
  velocity: { x: number; y: number };
};

export type BottomSheetDetent = {
  id: string;
  label: string;
  fraction: number;
};

const DEFAULT_DETENTS: BottomSheetDetent[] = [
  { id: "peek", label: "Peek", fraction: 0.28 },
  { id: "half", label: "Half", fraction: 0.6 },
  { id: "full", label: "Full", fraction: 0.94 },
];

export type UseBottomSheetOptions = {
  detents?: BottomSheetDetent[];
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  defaultDetent?: number;
  onDetentChange?: (index: number, detent: BottomSheetDetent) => void;
  dismissible?: boolean;
  momentum?: number;
  modal?: boolean;
};

export function useBottomSheet({
  detents = DEFAULT_DETENTS,
  open: controlled,
  defaultOpen = false,
  onOpenChange,
  defaultDetent = 0,
  onDetentChange,
  dismissible = true,
  momentum = 0.3,
  modal = true,
}: UseBottomSheetOptions = {}) {
  const [uncontrolled, setUncontrolled] = useState(defaultOpen);
  const [index, setIndex] = useState(() =>
    clamp(defaultDetent, 0, detents.length - 1),
  );
  const [target, setTarget] = useState(index);
  const [size, setSize] = useState(0);
  const [dragging, setDragging] = useState(false);

  const open = controlled ?? uncontrolled;

  const span = detents[detents.length - 1].fraction;
  const sheetHeight = size * span;
  const offsets = detents.map((d) => sheetHeight - size * d.fraction);

  const rootRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const returnTo = useRef<HTMLElement | null>(null);
  const anim = useRef<{ stop: () => void } | null>(null);
  const desired = useRef<number | null>(null);
  const lastSize = useRef(0);
  const started = useRef(false);
  const mounted = useRef(false);

  const list = useRef(detents);
  list.current = detents;
  const metrics = useRef({ sheetHeight, offsets });
  metrics.current = { sheetHeight, offsets };

  const liveOpen = useRef(open);
  liveOpen.current = open;
  const liveIndex = useRef(index);
  liveIndex.current = index;

  const openChanged = useRef(onOpenChange);
  openChanged.current = onOpenChange;
  const detentChanged = useRef(onDetentChange);
  detentChanged.current = onDetentChange;

  const shape = detents.map((d) => d.fraction).join("/");

  const y = useMotionValue(HIDDEN);
  const reduced = useReducedMotion();
  const controls = useDragControls();

  const veil = useTransform(y, (v) => {
    const h = metrics.current.sheetHeight;
    return h > 0 ? clamp(1 - v / h, 0, 1) : 0;
  });

  const setOpen = useCallback((next: boolean) => {
    if (liveOpen.current === next) return;
    setUncontrolled(next);
    openChanged.current?.(next);
  }, []);

  const close = useCallback(() => setOpen(false), [setOpen]);

  const commit = useCallback((next: number) => {
    const items = list.current;
    const n = clamp(next, 0, items.length - 1);
    if (n === liveIndex.current) return;
    setIndex(n);
    detentChanged.current?.(n, items[n]);
  }, []);

  const glide = useCallback(
    (to: number, velocity = 0) => {
      desired.current = to;
      anim.current?.stop();
      anim.current = animate(
        y,
        to,
        reduced ? { duration: 0 } : { ...DISCLOSE, velocity },
      );
    },
    [y, reduced],
  );

  const pick = useCallback(
    (projected: number) => {
      const shelf = metrics.current;
      let best = 0;
      let gap = Infinity;
      shelf.offsets.forEach((o, i) => {
        const d = Math.abs(o - projected);
        if (d < gap) {
          gap = d;
          best = i;
        }
      });
      if (dismissible && Math.abs(shelf.sheetHeight - projected) < gap) {
        return -1;
      }
      return best;
    },
    [dismissible],
  );

  useIsoEffect(() => {
    if (modal) {
      const read = () =>
        setSize((prev) =>
          prev === window.innerHeight ? prev : window.innerHeight,
        );
      read();
      window.addEventListener("resize", read);
      return () => window.removeEventListener("resize", read);
    }

    const el = rootRef.current;
    if (!el) return;
    const read = () =>
      setSize((prev) => (prev === el.clientHeight ? prev : el.clientHeight));
    read();
    const observer = new ResizeObserver(read);
    observer.observe(el);
    return () => observer.disconnect();
  }, [modal]);

  useIsoEffect(() => {
    if (size === 0) return;
    const items = list.current;
    const full = size * items[items.length - 1].fraction;
    const safe = items[clamp(index, 0, items.length - 1)].fraction;
    const to = open ? full - size * safe : full;
    const resized = lastSize.current !== size;
    lastSize.current = size;

    if (!started.current || resized) {
      started.current = true;
      desired.current = to;
      anim.current?.stop();
      y.set(to);
      return;
    }
    if (desired.current === to) return;
    glide(to);
  }, [open, index, size, shape, glide, y]);

  useEffect(() => () => anim.current?.stop(), []);

  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      return;
    }
    if (open) {
      const active = document.activeElement;
      returnTo.current = active instanceof HTMLElement ? active : null;
      const panel = panelRef.current;
      if (panel) panel.focus({ preventScroll: true });
      return;
    }
    const back = returnTo.current;
    returnTo.current = null;
    if (back && back.isConnected) back.focus({ preventScroll: true });
  }, [open]);

  useEffect(() => {
    const panel = panelRef.current as Inertable | null;
    if (!panel) return;
    panel.inert = !open;
    return () => {
      panel.inert = false;
    };
  }, [open]);

  useEffect(() => {
    if (!modal || !open) return;
    const root = document.documentElement;
    const overflow = root.style.overflow;
    const padding = root.style.paddingRight;
    const gutter = window.innerWidth - root.clientWidth;

    root.style.overflow = "hidden";
    if (gutter > 0) root.style.paddingRight = `${gutter}px`;

    return () => {
      root.style.overflow = overflow;
      root.style.paddingRight = padding;
    };
  }, [modal, open]);

  const onKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      const panel = panelRef.current;
      if (!panel) return;
      const top = list.current.length - 1;

      if (event.key === "Escape" && dismissible) {
        event.stopPropagation();
        close();
        return;
      }
      if (event.key === "ArrowUp" || event.key === "PageUp") {
        event.preventDefault();
        commit(liveIndex.current + 1);
        return;
      }
      if (event.key === "ArrowDown" || event.key === "PageDown") {
        event.preventDefault();
        if (liveIndex.current === 0 && dismissible) close();
        else commit(liveIndex.current - 1);
        return;
      }
      if (event.key === "Home") {
        event.preventDefault();
        commit(top);
        return;
      }
      if (event.key === "End") {
        event.preventDefault();
        commit(0);
        return;
      }
      if (event.key !== "Tab") return;

      const nodes = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE));
      if (nodes.length === 0) {
        event.preventDefault();
        panel.focus({ preventScroll: true });
        return;
      }
      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      const active = document.activeElement;

      if (event.shiftKey && (active === first || active === panel)) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    },
    [close, commit, dismissible],
  );

  const startDrag = useCallback(
    (event: React.PointerEvent) => {
      if (!liveOpen.current) return;
      controls.start(event);
    },
    [controls],
  );

  const onDragStart = useCallback(() => {
    anim.current?.stop();
    setDragging(true);
    setTarget(liveIndex.current);
  }, []);

  const onDrag = useCallback(
    (_event: MouseEvent | TouchEvent | PointerEvent, info: DragInfo) => {
      const next = pick(y.get() + info.velocity.y * momentum);
      setTarget((prev) => (prev === next ? prev : next));
    },
    [pick, momentum, y],
  );

  const onDragEnd = useCallback(
    (_event: MouseEvent | TouchEvent | PointerEvent, info: DragInfo) => {
      setDragging(false);
      const speed = info.velocity.y;
      const next = pick(y.get() + speed * momentum);
      const shelf = metrics.current;

      if (next === -1) {
        setTarget(liveIndex.current);
        glide(shelf.sheetHeight, speed);
        close();
        return;
      }
      setTarget(next);
      glide(shelf.offsets[next], speed);
      commit(next);
    },
    [pick, momentum, y, glide, close, commit],
  );

  const panelProps = {
    tabIndex: -1,
    role: "dialog" as const,
    "aria-modal": modal,
    onKeyDown,
    drag: "y" as const,
    dragControls: controls,
    dragListener: false,
    dragMomentum: false,
    dragConstraints: {
      top: 0,
      bottom: dismissible ? sheetHeight : offsets[0],
    },
    dragElastic: { top: 0.05, bottom: 0.08, left: 0, right: 0 },
    onDragStart,
    onDrag,
    onDragEnd,
  };

  return {
    open,
    detents,
    index,
    target,
    shown: dragging ? target : index,
    dragging,
    span,
    sheetHeight,
    offsets,
    y,
    veil,
    setOpen,
    close,
    commit,
    rootRef,
    panelRef,
    panelProps,
    gripProps: { onPointerDown: startDrag },
  };
}

export type UseBottomSheetResult = ReturnType<typeof useBottomSheet>;

const CLOSE_ICON = (
  <svg width="13" height="13" viewBox="0 0 256 256" fill="none" aria-hidden="true">
    <line
      x1="200"
      y1="56"
      x2="56"
      y2="200"
      stroke="currentColor"
      strokeWidth="16"
      strokeLinecap="round"
    />
    <line
      x1="200"
      y1="200"
      x2="56"
      y2="56"
      stroke="currentColor"
      strokeWidth="16"
      strokeLinecap="round"
    />
  </svg>
);

export type BottomSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  children: React.ReactNode;
  description?: string;
  detents?: BottomSheetDetent[];
  defaultDetent?: number;
  onDetentChange?: (index: number, detent: BottomSheetDetent) => void;
  dismissible?: boolean;
  momentum?: number;
  container?: "viewport" | "parent";
  closeLabel?: string;
  dismissOnScrimClick?: boolean;
  className?: string;
};

export function BottomSheet({
  open,
  onOpenChange,
  title,
  children,
  description,
  detents = DEFAULT_DETENTS,
  defaultDetent = 0,
  onDetentChange,
  dismissible = true,
  momentum = 0.3,
  container = "viewport",
  closeLabel = "Close sheet",
  dismissOnScrimClick = true,
  className = "",
}: BottomSheetProps) {
  const titleId = useId();
  const hintId = useId();

  const sheet = useBottomSheet({
    detents,
    open,
    onOpenChange,
    defaultDetent,
    onDetentChange,
    dismissible,
    momentum,
    modal: container === "viewport",
  });

  const reduced = useReducedMotion();
  const shown = sheet.shown;
  const settled = sheet.detents[sheet.index] ?? sheet.detents[0];

  const [host, setHost] = useState<HTMLElement | null>(null);
  useEffect(() => {
    setHost(container === "viewport" ? document.body : null);
  }, [container]);

  const tree = (
    <div
      ref={sheet.rootRef}
      className={`${container === "viewport" ? "fixed" : "absolute"} inset-0 z-50 overflow-hidden ${
        open ? "" : "pointer-events-none"
      }`}
    >
      <motion.div
        aria-hidden
        style={{ opacity: sheet.veil }}
        onClick={dismissOnScrimClick && dismissible ? sheet.close : undefined}
        className="absolute inset-0 bg-stone-900/25 dark:bg-black/55"
      />
      <motion.div
        ref={sheet.panelRef}
        aria-labelledby={titleId}
        aria-describedby={hintId}
        style={{
          y: sheet.y,
          height: `${sheet.span * 100}%`,
          touchAction: "pan-y",
        }}
        className={`absolute inset-x-0 bottom-0 flex flex-col rounded-t-[14px] border-x border-t border-stone-200 bg-white shadow-[0_28px_56px_-24px_rgba(24,22,20,0.45)] outline-none dark:border-white/[0.16] dark:bg-[#1D1D1A] ${className}`}
        {...sheet.panelProps}
      >
        <div
          onPointerDown={sheet.gripProps.onPointerDown}
          style={{ touchAction: "none" }}
          className={`shrink-0 select-none border-b border-stone-200 dark:border-white/[0.16] ${
            sheet.dragging ? "cursor-grabbing" : "cursor-grab"
          }`}
        >
          <div className="flex justify-center pb-1.5 pt-2.5">
            <motion.span
              aria-hidden
              initial={false}
              animate={{ scaleX: sheet.dragging ? 1.18 : 1 }}
              transition={reduced ? { duration: 0 } : CELL}
              className="block h-[4px] w-[38px] rounded-[2px] bg-stone-300 dark:bg-white/25"
            />
          </div>
          <div className="flex items-center gap-3 px-4 pb-3">
            <div className="min-w-0 flex-1">
              <h2
                id={titleId}
                className="truncate text-[13px] font-medium text-stone-700 dark:text-stone-200"
              >
                {title}
              </h2>
              {description ? (
                <p className="mt-0.5 truncate text-[12.5px] text-stone-500 dark:text-stone-400">
                  {description}
                </p>
              ) : null}
            </div>
            <span
              aria-hidden
              className="grid justify-items-end text-[10.5px] font-medium uppercase tracking-[0.08em] text-stone-500 dark:text-stone-400"
            >
              {sheet.detents.map((d, i) => (
                <motion.span
                  key={d.id}
                  initial={false}
                  animate={{ opacity: shown === i ? 1 : 0 }}
                  transition={reduced ? { duration: 0 } : CROSSFADE}
                  className="col-start-1 row-start-1"
                >
                  {d.label}
                </motion.span>
              ))}
              {dismissible ? (
                <motion.span
                  initial={false}
                  animate={{ opacity: shown === -1 ? 1 : 0 }}
                  transition={reduced ? { duration: 0 } : CROSSFADE}
                  className="col-start-1 row-start-1"
                >
                  Close
                </motion.span>
              ) : null}
            </span>

            {dismissible ? (
              <button
                type="button"
                onPointerDown={(e) => e.stopPropagation()}
                onClick={sheet.close}
                aria-label={closeLabel}
                className="-mr-1 grid size-7 shrink-0 place-items-center rounded-[7px] text-stone-400 outline-none transition-colors duration-150 hover:bg-stone-100 hover:text-stone-700 focus-visible:bg-[#4568FF]/[0.06] focus-visible:text-stone-700 focus-visible:shadow-[inset_0_0_0_1px_#4568FF] dark:text-stone-500 dark:hover:bg-white/10 dark:hover:text-stone-100 dark:focus-visible:bg-[#93B0FF]/[0.1] dark:focus-visible:text-stone-100 dark:focus-visible:shadow-[inset_0_0_0_1px_#93B0FF]"
              >
                {CLOSE_ICON}
              </button>
            ) : null}
          </div>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-3">
          {children}
        </div>
        <span id={hintId} className="sr-only">
          Arrow up and arrow down move between {sheet.detents.length} heights.
          {dismissible ? " Escape closes the sheet." : ""}
        </span>
        <span aria-live="polite" aria-atomic className="sr-only">
          {open ? `${settled.label} height` : "Sheet closed"}
        </span>
      </motion.div>
    </div>
  );

  if (container !== "viewport") return tree;
  return host ? createPortal(tree, host) : null;
}
