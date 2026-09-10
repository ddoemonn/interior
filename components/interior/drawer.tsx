"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
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

const FOCUSABLE =
  'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';

type Inertable = HTMLElement & { inert?: boolean };

type DragInfo = {
  offset: { x: number; y: number };
  velocity: { x: number; y: number };
};

export type DrawerSide = "left" | "right";

export type UseDrawerOptions = {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  side?: DrawerSide;
  width?: number;
  dismissRatio?: number;
  modal?: boolean;
};

export function useDrawer({
  open: controlled,
  defaultOpen = false,
  onOpenChange,
  side = "right",
  width = 320,
  dismissRatio = 0.38,
  modal = true,
}: UseDrawerOptions = {}) {
  const [uncontrolled, setUncontrolled] = useState(defaultOpen);
  const [dragging, setDragging] = useState(false);

  const open = controlled ?? uncontrolled;
  const sign = side === "right" ? 1 : -1;
  const away = sign * (width + 24);

  const x = useMotionValue(open ? 0 : away);
  const veil = useTransform(x, (v) => 1 - Math.min(1, Math.abs(v) / width));

  const rootRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const returnTo = useRef<HTMLElement | null>(null);
  const anim = useRef<{ stop: () => void } | null>(null);
  const live = useRef(open);
  live.current = open;

  const changed = useRef(onOpenChange);
  changed.current = onOpenChange;

  const reduced = useReducedMotion();
  const controls = useDragControls();

  const setOpen = useCallback(
    (next: boolean) => {
      if (controlled === undefined) setUncontrolled(next);
      changed.current?.(next);
    },
    [controlled],
  );

  const close = useCallback(() => setOpen(false), [setOpen]);

  const glide = useCallback(
    (to: number) => {
      anim.current?.stop();
      anim.current = animate(x, to, reduced ? { duration: 0 } : DISCLOSE);
    },
    [x, reduced],
  );

  useEffect(() => {
    glide(open ? 0 : away);
    return () => anim.current?.stop();
  }, [open, away, glide]);

  useEffect(() => {
    const panel = panelRef.current as Inertable | null;
    if (!panel) return;
    panel.inert = !open;
    return () => {
      panel.inert = false;
    };
  }, [open]);

  useEffect(() => {
    if (open) {
      const active = document.activeElement;
      returnTo.current = active instanceof HTMLElement ? active : null;
      const panel = panelRef.current;
      if (!panel) return;
      const first = panel.querySelector<HTMLElement>(FOCUSABLE);
      (first ?? panel).focus({ preventScroll: true });
      return;
    }
    const target = returnTo.current;
    returnTo.current = null;
    if (target && target.isConnected) target.focus({ preventScroll: true });
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

  useEffect(() => {
    const shell = rootRef.current;
    if (!modal || !open || !shell) return;
    const muted: Inertable[] = [];

    for (const node of Array.from(document.body.children)) {
      if (!(node instanceof HTMLElement) || node.contains(shell)) continue;
      const el = node as Inertable;
      if (el.inert) continue;
      el.inert = true;
      muted.push(el);
    }

    return () => {
      for (const el of muted) el.inert = false;
    };
  }, [modal, open]);

  const onKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      const panel = panelRef.current;
      if (!panel) return;

      if (event.key === "Escape") {
        event.stopPropagation();
        close();
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
    [close],
  );

  const startDrag = useCallback(
    (event: React.PointerEvent) => {
      if (!live.current) return;
      controls.start(event);
    },
    [controls],
  );

  const onDragStart = useCallback(() => setDragging(true), []);

  const onDragEnd = useCallback(
    (_event: MouseEvent | TouchEvent | PointerEvent, info: DragInfo) => {
      setDragging(false);
      const travel = sign * info.offset.x;
      const speed = sign * info.velocity.x;
      if (travel > width * dismissRatio || speed > 520) {
        close();
        return;
      }
      glide(0);
    },
    [sign, width, dismissRatio, glide, close],
  );

  const panelProps = {
    tabIndex: -1,
    role: "dialog" as const,
    "aria-modal": modal,
    onKeyDown,
    drag: "x" as const,
    dragControls: controls,
    dragListener: false,
    dragMomentum: false,
    dragConstraints: { left: 0, right: 0 },
    dragElastic:
      side === "right"
        ? { top: 0, bottom: 0, left: 0, right: 1 }
        : { top: 0, bottom: 0, left: 1, right: 0 },
    onDragStart,
    onDragEnd,
  };

  return {
    open,
    side,
    width,
    dragging,
    x,
    veil,
    setOpen,
    close,
    rootRef,
    panelRef,
    panelProps,
    gripProps: { onPointerDown: startDrag },
  };
}

export type UseDrawerResult = ReturnType<typeof useDrawer>;

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

export type DrawerProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  titleAlign?: "left" | "center";
  children: React.ReactNode;
  description?: string;
  footer?: React.ReactNode;
  side?: DrawerSide;
  width?: number;
  container?: "viewport" | "parent";
  closeLabel?: string;
  dismissOnScrimClick?: boolean;
  className?: string;
};

export function Drawer({
  open,
  onOpenChange,
  title,
  titleAlign = "left",
  children,
  description,
  footer,
  side = "right",
  width = 320,
  container = "viewport",
  closeLabel = "Close panel",
  dismissOnScrimClick = true,
  className = "",
}: DrawerProps) {
  const titleId = useId();
  const hintId = useId();

  const drawer = useDrawer({
    open,
    onOpenChange,
    side,
    width,
    modal: container === "viewport",
  });

  const edge =
    side === "right"
      ? "right-0 rounded-l-[14px] border-l"
      : "left-0 rounded-r-[14px] border-r";

  const [host, setHost] = useState<HTMLElement | null>(null);
  useEffect(() => {
    setHost(container === "viewport" ? document.body : null);
  }, [container]);

  const tree = (
    <div
      ref={drawer.rootRef}
      className={`${container === "viewport" ? "fixed" : "absolute"} inset-0 z-50 overflow-hidden ${
        open ? "" : "pointer-events-none"
      }`}
    >
      <motion.div
        aria-hidden
        style={{ opacity: drawer.veil }}
        onClick={dismissOnScrimClick ? drawer.close : undefined}
        className="absolute inset-0 bg-stone-900/25 dark:bg-black/55"
      />
      <motion.div
        ref={drawer.panelRef}
        aria-labelledby={titleId}
        aria-describedby={hintId}
        style={{ x: drawer.x, width, maxWidth: "calc(100% - 40px)", touchAction: "pan-y" }}
        className={`absolute inset-y-0 flex flex-col border-stone-200 bg-white shadow-[0_28px_56px_-24px_rgba(24,22,20,0.45)] outline-none dark:border-white/[0.16] dark:bg-[#1D1D1A] ${edge} ${
          drawer.dragging ? "select-none" : ""
        } ${className}`}
        {...drawer.panelProps}
      >
        <header
          onPointerDown={drawer.gripProps.onPointerDown}
          className={`flex select-none items-start gap-3 border-b border-stone-200 px-4 py-3 dark:border-white/[0.16] ${
            drawer.dragging ? "cursor-grabbing" : "cursor-grab"
          }`}
        >
          <div className="min-w-0 flex-1">
            <h2
              id={titleId}
              className={`truncate text-[13px] font-medium text-stone-700 dark:text-stone-200 ${
                titleAlign === "center" ? "pl-9 text-center" : ""
              }`}
            >
              {title}
            </h2>
            {description ? (
              <p className="mt-0.5 truncate text-[12.5px] text-stone-500 dark:text-stone-400">
                {description}
              </p>
            ) : null}
          </div>
          <button
            type="button"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={drawer.close}
            aria-label={closeLabel}
            className="-mr-1 grid size-7 shrink-0 place-items-center rounded-[7px] text-stone-400 outline-none transition-colors duration-150 hover:bg-stone-100 hover:text-stone-700 focus-visible:bg-[#4568FF]/[0.06] focus-visible:text-stone-700 focus-visible:shadow-[inset_0_0_0_1px_#4568FF] dark:text-stone-500 dark:hover:bg-white/10 dark:hover:text-stone-100 dark:focus-visible:bg-[#93B0FF]/[0.1] dark:focus-visible:text-stone-100 dark:focus-visible:shadow-[inset_0_0_0_1px_#93B0FF]"
          >
            {CLOSE_ICON}
          </button>
        </header>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-3">
          {children}
        </div>

        {footer ? (
          <div className="border-t border-stone-200 px-4 py-3 dark:border-white/[0.16]">
            {footer}
          </div>
        ) : null}

        <span id={hintId} className="sr-only">
          Press Escape to close this panel, or drag its handle toward the edge.
        </span>
      </motion.div>
    </div>
  );

  if (container !== "viewport") return tree;
  return host ? createPortal(tree, host) : null;
}
