"use client";

import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

const EASE = [0.23, 1, 0.32, 1] as const;
const CROSSFADE = { type: "spring", stiffness: 260, damping: 34, mass: 0.8 } as const;
const RADIUS = 11;
const MIN_W = 160;
const MIN_H = 88;

const useIsoLayoutEffect = typeof document === "undefined" ? useEffect : useLayoutEffect;

export type PopoverSide = "top" | "right" | "bottom" | "left";
export type PopoverAlign = "start" | "center" | "end";

const FLIP: Record<PopoverSide, PopoverSide> = {
  top: "bottom",
  bottom: "top",
  left: "right",
  right: "left",
};

const ARROW_EDGE: Record<PopoverSide, string> = {
  bottom: "border-t border-l",
  top: "border-b border-r",
  right: "border-b border-l",
  left: "border-t border-r",
};

const FROM: Record<PopoverSide, { x?: number; y?: number }> = {
  top: { y: 6 },
  bottom: { y: -6 },
  left: { x: 6 },
  right: { x: -6 },
};

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), Math.max(min, max));
}

export type UsePopoverOptions = {
  open: boolean;
  side?: PopoverSide;
  align?: PopoverAlign;
  offset?: number;
  padding?: number;
  arrowSize?: number;
  boundary?: React.RefObject<HTMLElement | null>;
};

export type UsePopoverResult<A extends HTMLElement = HTMLElement> = {
  anchorRef: React.RefObject<A | null>;
  floatingRef: React.RefObject<HTMLDivElement | null>;
  panelRef: React.RefObject<HTMLDivElement | null>;
  contentRef: React.RefObject<HTMLDivElement | null>;
  arrowRef: React.RefObject<HTMLSpanElement | null>;
  side: PopoverSide;
  update: () => void;
};

export function usePopover<A extends HTMLElement = HTMLElement>({
  open,
  side = "bottom",
  align = "center",
  offset = 10,
  padding = 8,
  arrowSize = 9,
  boundary,
}: UsePopoverOptions): UsePopoverResult<A> {
  const anchorRef = useRef<A>(null);
  const floatingRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const arrowRef = useRef<HTMLSpanElement>(null);

  const [resolved, setResolved] = useState<PopoverSide>(side);

  const update = useCallback(() => {
    const anchor = anchorRef.current;
    const wrap = floatingRef.current;
    const panel = panelRef.current;
    if (!anchor || !wrap || !panel) return;

    const content = contentRef.current;
    panel.style.maxWidth = "";
    if (content) content.style.maxHeight = "";

    const a = anchor.getBoundingClientRect();
    const b = boundary?.current?.getBoundingClientRect() ?? null;
    const vw = document.documentElement.clientWidth;
    const vh = document.documentElement.clientHeight;

    const left = b ? Math.max(padding, b.left + padding) : padding;
    const top = b ? Math.max(padding, b.top + padding) : padding;
    const right = b ? Math.min(vw - padding, b.right - padding) : vw - padding;
    const bottom = b ? Math.min(vh - padding, b.bottom - padding) : vh - padding;

    panel.style.maxWidth = `${Math.max(MIN_W, right - left)}px`;

    const room: Record<PopoverSide, number> = {
      top: a.top - top - offset,
      bottom: bottom - a.bottom - offset,
      left: a.left - left - offset,
      right: right - a.right - offset,
    };

    let next = side;
    const wanted =
      next === "top" || next === "bottom" ? panel.offsetHeight : panel.offsetWidth;
    if (room[next] < wanted && room[FLIP[next]] > room[next]) next = FLIP[next];

    const horizontal = next === "top" || next === "bottom";
    if (!horizontal) {
      panel.style.maxWidth = `${Math.max(MIN_W, Math.min(right - left, room[next]))}px`;
    }
    if (content) {
      const chrome = panel.offsetHeight - content.offsetHeight;
      const allowed = horizontal ? room[next] : bottom - top;
      content.style.maxHeight = `${Math.max(MIN_H, allowed - chrome)}px`;
    }

    const w = panel.offsetWidth;
    const h = panel.offsetHeight;

    let x: number;
    let y: number;
    if (horizontal) {
      y = next === "top" ? a.top - offset - h : a.bottom + offset;
      x =
        align === "start"
          ? a.left
          : align === "end"
            ? a.right - w
            : a.left + (a.width - w) / 2;
    } else {
      x = next === "left" ? a.left - offset - w : a.right + offset;
      y =
        align === "start"
          ? a.top
          : align === "end"
            ? a.bottom - h
            : a.top + (a.height - h) / 2;
    }
    x = clamp(x, left, right - w);
    y = clamp(y, top, bottom - h);

    const base = wrap.getBoundingClientRect();
    const originX = base.left - (parseFloat(wrap.style.left) || 0);
    const originY = base.top - (parseFloat(wrap.style.top) || 0);
    wrap.style.left = `${Math.round(x - originX)}px`;
    wrap.style.top = `${Math.round(y - originY)}px`;

    const half = arrowSize / 2;
    const point = horizontal
      ? clamp(a.left + a.width / 2 - x, RADIUS + half, w - RADIUS - half)
      : clamp(a.top + a.height / 2 - y, RADIUS + half, h - RADIUS - half);

    panel.style.transformOrigin = horizontal
      ? `${Math.round(point)}px ${next === "top" ? h : 0}px`
      : `${next === "left" ? w : 0}px ${Math.round(point)}px`;

    const arrow = arrowRef.current;
    if (arrow) {
      if (horizontal) {
        arrow.style.left = `${Math.round(point - half)}px`;
        arrow.style.top = `${Math.round(next === "top" ? h - half : -half)}px`;
      } else {
        arrow.style.top = `${Math.round(point - half)}px`;
        arrow.style.left = `${Math.round(next === "left" ? w - half : -half)}px`;
      }
    }

    setResolved((prev) => (prev === next ? prev : next));
  }, [side, align, offset, padding, arrowSize, boundary]);

  useIsoLayoutEffect(() => {
    if (!open) return;
    update();
  }, [open, update]);

  useEffect(() => {
    if (!open) return;

    let frame = 0;
    const schedule = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        update();
      });
    };

    const observer = new ResizeObserver(schedule);
    if (anchorRef.current) observer.observe(anchorRef.current);
    if (contentRef.current) observer.observe(contentRef.current);
    window.addEventListener("scroll", schedule, true);
    window.addEventListener("resize", schedule);

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("scroll", schedule, true);
      window.removeEventListener("resize", schedule);
    };
  }, [open, update]);

  return { anchorRef, floatingRef, panelRef, contentRef, arrowRef, side: resolved, update };
}

export type PopoverProps = {
  trigger: React.ReactNode;
  children: React.ReactNode;
  label: string;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  side?: PopoverSide;
  align?: PopoverAlign;
  offset?: number;
  padding?: number;
  arrowSize?: number;
  boundary?: React.RefObject<HTMLElement | null>;
  triggerClassName?: string;
  className?: string;
};

export function Popover({
  trigger,
  children,
  label,
  open: controlled,
  defaultOpen = false,
  onOpenChange,
  side = "bottom",
  align = "center",
  offset = 10,
  padding = 8,
  arrowSize = 9,
  boundary,
  triggerClassName = "",
  className = "",
}: PopoverProps) {
  const [uncontrolled, setUncontrolled] = useState(defaultOpen);
  const open = controlled ?? uncontrolled;

  const id = useId();
  const reduced = useReducedMotion();

  const notify = useRef(onOpenChange);
  notify.current = onOpenChange;

  const { anchorRef, floatingRef, panelRef, contentRef, arrowRef, side: at } =
    usePopover<HTMLButtonElement>({
      open,
      side,
      align,
      offset,
      padding,
      arrowSize,
      boundary,
    });

  const setOpen = useCallback(
    (next: boolean) => {
      if (controlled === undefined) setUncontrolled(next);
      notify.current?.(next);
    },
    [controlled],
  );

  useEffect(() => {
    if (!open) return;
    panelRef.current?.focus({ preventScroll: true });
  }, [open, panelRef]);

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node | null;
      if (!target) return;
      if (panelRef.current?.contains(target) || anchorRef.current?.contains(target)) return;
      setOpen(false);
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.stopPropagation();
      anchorRef.current?.focus({ preventScroll: true });
      setOpen(false);
    };

    document.addEventListener("pointerdown", onPointerDown, true);
    document.addEventListener("keydown", onKeyDown, true);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown, true);
      document.removeEventListener("keydown", onKeyDown, true);
    };
  }, [open, setOpen, anchorRef, panelRef]);

  return (
    <>
      <button
        ref={anchorRef}
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={open ? id : undefined}
        onClick={() => setOpen(!open)}
        className={`inline-flex h-9 select-none items-center gap-2 rounded-[9px] border border-stone-200 bg-white px-3 text-[13px] font-medium text-stone-700 outline-none transition-[border-color,box-shadow] duration-150 hover:border-stone-300 focus-visible:border-[#4568FF] focus-visible:shadow-[0_1px_2px_rgba(28,25,23,0.08),0_10px_20px_-14px_rgba(69,104,255,0.6)] dark:border-white/[0.16] dark:bg-[#1D1D1A] dark:text-stone-200 dark:hover:border-white/20 dark:focus-visible:border-[#93B0FF] dark:focus-visible:shadow-[0_10px_20px_-14px_rgba(147,176,255,0.5)] ${triggerClassName}`}
      >
        {trigger}
      </button>
      <AnimatePresence>
        {open ? (
          <div
            key="popover"
            ref={floatingRef}
            className="fixed left-0 top-0 z-50"
            onBlurCapture={(event) => {
              const next = event.relatedTarget as Node | null;
              if (!next) return;
              if (panelRef.current?.contains(next) || anchorRef.current?.contains(next)) return;
              setOpen(false);
            }}
          >
            <motion.div
              ref={panelRef}
              id={id}
              role="dialog"
              aria-label={label}
              tabIndex={-1}
              initial={
                reduced ? { opacity: 0 } : { opacity: 0, scale: 0.95, ...FROM[at] }
              }
              animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}
              exit={
                reduced
                  ? { opacity: 0, transition: { duration: 0.1 } }
                  : {
                      opacity: 0,
                      scale: 0.97,
                      transition: { duration: 0.13, ease: EASE },
                    }
              }
              transition={
                reduced
                  ? { duration: 0 }
                  : { ...CROSSFADE, opacity: { duration: 0.14, ease: EASE } }
              }
              className={`relative rounded-[11px] border border-stone-200 bg-white p-3 shadow-[0_18px_40px_-24px_rgba(28,25,23,0.5)] focus-visible:outline-none dark:border-white/[0.16] dark:bg-[#1D1D1A] dark:shadow-[0_18px_40px_-24px_rgba(0,0,0,0.9)] ${className}`}
            >
              <span
                ref={arrowRef}
                aria-hidden
                style={{ width: arrowSize, height: arrowSize, transform: "rotate(45deg)" }}
                className={`absolute block bg-white dark:bg-[#1D1D1A] border-stone-200 dark:border-white/[0.16] ${ARROW_EDGE[at]}`}
              />
              <div ref={contentRef} className="relative overflow-y-auto overscroll-contain">
                {children}
              </div>
            </motion.div>
          </div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
