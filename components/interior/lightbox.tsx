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
  AnimatePresence,
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
} from "motion/react";

const CELL = {
  type: "spring",
  stiffness: 520,
  damping: 34,
  mass: 0.45,
} as const;

const HOME = {
  type: "spring",
  stiffness: 150,
  damping: 27,
  mass: 1,
} as const;

const VEIL = {
  type: "spring",
  stiffness: 260,
  damping: 34,
  mass: 0.8,
} as const;

const EXIT = { duration: 0.2, ease: [0.4, 0, 1, 1] } as const;

const GLYPH = {
  type: "spring",
  stiffness: 700,
  damping: 46,
  mass: 0.5,
} as const;

const TOGGLE = 2.5;
const KEY_ZOOM = 1.6;
const KEY_PAN = 56;
const WHEEL_RATE = 140;
const SLOP = 8;
const NEAR_HOME = 1.02;
const SNAP_HOME = 1.05;

const CHROME_BUTTON =
  "grid size-8 place-items-center rounded-[9px] border border-stone-200 bg-white text-stone-500 outline-none transition-[border-color,color,box-shadow] duration-150 hover:border-stone-300 hover:text-stone-700 focus-visible:border-[#4568FF] focus-visible:shadow-[0_1px_2px_rgba(28,25,23,0.08),0_10px_20px_-14px_rgba(69,104,255,0.6)] dark:border-white/[0.16] dark:bg-[#1D1D1A] dark:text-stone-400 dark:hover:border-white/20 dark:hover:text-stone-200 dark:focus-visible:border-[#93B0FF] dark:focus-visible:shadow-[0_10px_20px_-14px_rgba(147,176,255,0.5)]";

type Spring = {
  type: "spring";
  stiffness: number;
  damping: number;
  mass: number;
};

const clamp = (v: number, lo: number, hi: number) =>
  Math.min(hi, Math.max(lo, v));

type Drag = {
  id: number;
  from: { x: number; y: number };
  x: number;
  y: number;
};

export type UseLightboxOptions = {
  maxScale?: number;
  steps?: number;
  disabled?: boolean;
  onDismiss?: () => void;
};

export function useLightbox<
  Frame extends HTMLElement = HTMLDivElement,
  Content extends HTMLElement = HTMLImageElement,
>({
  maxScale = 4,
  steps = 8,
  disabled = false,
  onDismiss,
}: UseLightboxOptions = {}) {
  const cells = Math.max(1, Math.round(steps));
  const top = Math.max(1.1, maxScale);

  const frameRef = useRef<Frame>(null);
  const contentRef = useRef<Content>(null);

  const scale = useMotionValue(1);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const [step, setStep] = useState(0);
  const [settled, setSettled] = useState(0);

  const stepRef = useRef(0);
  const settledRef = useRef(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const drag = useRef<Drag | null>(null);
  const onContent = useRef(false);

  const reduced = useReducedMotion();
  const dismiss = useRef(onDismiss);
  dismiss.current = onDismiss;

  const toStep = useCallback(
    (s: number) => clamp(Math.round(((s - 1) / (top - 1)) * cells), 0, cells),
    [cells, top],
  );

  const mark = useCallback(
    (s: number) => {
      const next = toStep(s);
      if (stepRef.current === next) return;
      stepRef.current = next;
      setStep(next);
    },
    [toStep],
  );

  const settle = useCallback(
    (s: number) => {
      if (timer.current) {
        clearTimeout(timer.current);
        timer.current = null;
      }
      const next = toStep(s);
      if (settledRef.current === next) return;
      settledRef.current = next;
      setSettled(next);
    },
    [toStep],
  );

  const settleSoon = useCallback(
    (s: number) => {
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => {
        timer.current = null;
        settle(s);
      }, 220);
    },
    [settle],
  );

  const limit = useCallback((s: number) => {
    const frame = frameRef.current;
    const content = contentRef.current;
    if (!frame || !content) return { mx: 0, my: 0 };
    return {
      mx: Math.max(0, (content.offsetWidth * s - frame.clientWidth) / 2),
      my: Math.max(0, (content.offsetHeight * s - frame.clientHeight) / 2),
    };
  }, []);

  const place = useCallback(
    (s: number, nx: number, ny: number) => {
      const { mx, my } = limit(s);
      scale.set(s);
      x.set(clamp(nx, -mx, mx));
      y.set(clamp(ny, -my, my));
      mark(s);
    },
    [limit, mark, scale, x, y],
  );

  const glide = useCallback(
    (s: number, nx: number, ny: number, spring: Spring = CELL) => {
      const { mx, my } = limit(s);
      const tx = clamp(nx, -mx, mx);
      const ty = clamp(ny, -my, my);
      if (reduced) {
        scale.set(s);
        x.set(tx);
        y.set(ty);
      } else {
        animate(scale, s, spring);
        animate(x, tx, spring);
        animate(y, ty, spring);
      }
      mark(s);
      settle(s);
    },
    [limit, mark, reduced, scale, settle, x, y],
  );

  const reset = useCallback(() => {
    glide(1, 0, 0, HOME);
  }, [glide]);

  const zoomAt = useCallback(
    (next: number, cx: number, cy: number, animated: boolean) => {
      const frame = frameRef.current;
      if (!frame) return;
      const r = frame.getBoundingClientRect();
      const px = cx - (r.left + r.width / 2);
      const py = cy - (r.top + r.height / 2);
      const s0 = scale.get();
      const ax = (px - x.get()) / s0;
      const ay = (py - y.get()) / s0;
      const s = clamp(next, 1, top);
      const nx = px - ax * s;
      const ny = py - ay * s;
      if (animated) {
        glide(s, nx, ny, s <= 1 ? HOME : CELL);
        return;
      }
      place(s, nx, ny);
      settleSoon(s);
    },
    [glide, place, scale, settleSoon, top, x, y],
  );

  const finish = useCallback(() => {
    const s0 = scale.get();
    if (s0 < SNAP_HOME) reset();
    else settle(s0);
  }, [reset, scale, settle]);

  const release = (e: React.PointerEvent) => {
    const held = drag.current;
    if (!held || held.id !== e.pointerId) return;
    drag.current = null;
    const moved = Math.hypot(e.clientX - held.from.x, e.clientY - held.from.y);
    if (moved < SLOP && !onContent.current && scale.get() <= NEAR_HOME) {
      dismiss.current?.();
      return;
    }
    finish();
  };

  const cancel = (e: React.PointerEvent) => {
    const held = drag.current;
    if (!held || held.id !== e.pointerId) return;
    drag.current = null;
    finish();
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    const frame = frameRef.current;
    if (!frame || disabled) return;
    const r = frame.getBoundingClientRect();
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height / 2;
    const s0 = scale.get();

    if (e.key === "+" || e.key === "=") {
      e.preventDefault();
      zoomAt(s0 * KEY_ZOOM, cx, cy, true);
      return;
    }
    if (e.key === "-" || e.key === "_") {
      e.preventDefault();
      zoomAt(s0 / KEY_ZOOM, cx, cy, true);
      return;
    }
    if (e.key === "0") {
      e.preventDefault();
      reset();
      return;
    }
    if (e.key === "Escape" && s0 > NEAR_HOME) {
      e.preventDefault();
      e.stopPropagation();
      reset();
      return;
    }
    if (s0 > NEAR_HOME && e.key.startsWith("Arrow")) {
      e.preventDefault();
      const dx =
        e.key === "ArrowLeft" ? KEY_PAN : e.key === "ArrowRight" ? -KEY_PAN : 0;
      const dy =
        e.key === "ArrowUp" ? KEY_PAN : e.key === "ArrowDown" ? -KEY_PAN : 0;
      glide(s0, x.get() + dx, y.get() + dy);
    }
  };

  const bind = {
    onPointerDown: (e: React.PointerEvent) => {
      if (disabled) return;
      if (e.pointerType === "mouse" && e.button !== 0) return;
      const content = contentRef.current;
      onContent.current = content ? content.contains(e.target as Node) : false;
      e.currentTarget.setPointerCapture?.(e.pointerId);
      drag.current = {
        id: e.pointerId,
        from: { x: e.clientX, y: e.clientY },
        x: x.get(),
        y: y.get(),
      };
    },
    onPointerMove: (e: React.PointerEvent) => {
      const held = drag.current;
      if (!held || held.id !== e.pointerId) return;
      if (scale.get() <= 1) return;
      place(
        scale.get(),
        held.x + (e.clientX - held.from.x),
        held.y + (e.clientY - held.from.y),
      );
    },
    onPointerUp: release,
    onPointerCancel: cancel,
    onLostPointerCapture: cancel,
    onDoubleClick: (e: React.MouseEvent) => {
      if (disabled) return;
      zoomAt(
        scale.get() > SNAP_HOME ? 1 : Math.min(TOGGLE, top),
        e.clientX,
        e.clientY,
        true,
      );
    },
    onKeyDown,
  };

  useEffect(() => {
    const frame = frameRef.current;
    if (!frame) return;
    const onWheel = (e: WheelEvent) => {
      if (disabled) return;
      e.preventDefault();
      zoomAt(
        scale.get() * Math.exp(-e.deltaY / WHEEL_RATE),
        e.clientX,
        e.clientY,
        false,
      );
    };
    frame.addEventListener("wheel", onWheel, { passive: false });
    return () => frame.removeEventListener("wheel", onWheel);
  }, [disabled, scale, zoomAt]);

  useEffect(() => {
    const bail = () => {
      drag.current = null;
    };
    window.addEventListener("blur", bail);
    return () => {
      window.removeEventListener("blur", bail);
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  return {
    frameRef,
    contentRef,
    bind,
    scale,
    x,
    y,
    step,
    steps: cells,
    zoom: 1 + (step / cells) * (top - 1),
    settledZoom: 1 + (settled / cells) * (top - 1),
    zoomed: step > 0,
    reset,
    zoomAt,
  };
}

export type LightboxProps = {
  open: boolean;
  onClose: () => void;
  src: string;
  alt: string;
  originRef?: React.RefObject<HTMLElement | null>;
  caption?: string;
  width?: number;
  height?: number;
  maxScale?: number;
  className?: string;
};

type Landing = { dx: number; dy: number; s: number; o: number };

function Stage({
  onClose,
  src,
  alt,
  originRef,
  caption,
  width,
  height,
  maxScale = 4,
  className = "",
}: LightboxProps) {
  const reduced = useReducedMotion();
  const titleId = useId();
  const hintId = useId();

  const fx = useMotionValue(0);
  const fy = useMotionValue(0);
  const fs = useMotionValue(1);
  const fo = useMotionValue(0);

  const {
    frameRef,
    contentRef,
    bind,
    scale,
    x,
    y,
    zoomed,
    settledZoom,
    reset,
    zoomAt,
  } = useLightbox({ maxScale, onDismiss: onClose });

  const shellRef = useRef<HTMLDivElement>(null);

  const toggleZoom = useCallback(() => {
    const frame = frameRef.current;
    if (!frame) return;
    if (zoomed) {
      reset();
      return;
    }
    const r = frame.getBoundingClientRect();
    zoomAt(
      Math.min(TOGGLE, Math.max(1.1, maxScale)),
      r.left + r.width / 2,
      r.top + r.height / 2,
      true,
    );
  }, [frameRef, maxScale, reset, zoomAt, zoomed]);

  const landing = useCallback((): Landing => {
    const frame = frameRef.current;
    const content = contentRef.current;
    const origin = originRef?.current;
    if (frame && content && origin && content.offsetWidth > 0) {
      const r = frame.getBoundingClientRect();
      const o = origin.getBoundingClientRect();
      if (o.width > 0) {
        return {
          dx: o.left + o.width / 2 - (r.left + r.width / 2),
          dy: o.top + o.height / 2 - (r.top + r.height / 2),
          s: o.width / content.offsetWidth,
          o: 1,
        };
      }
    }
    return { dx: 0, dy: 10, s: 0.97, o: 0 };
  }, [contentRef, frameRef, originRef]);

  useLayoutEffect(() => {
    if (reduced) {
      fx.set(0);
      fy.set(0);
      fs.set(1);
      fo.set(1);
      return;
    }
    const d = landing();
    fx.set(d.dx);
    fy.set(d.dy);
    fs.set(d.s);
    fo.set(d.o);

    const runs = [
      animate(fx, 0, HOME),
      animate(fy, 0, HOME),
      animate(fs, 1, HOME),
      animate(fo, 1, HOME),
    ];
    return () => runs.forEach((r) => r.stop());
  }, [fo, fs, fx, fy, landing, reduced]);

  const away = useCallback(() => {
    if (reduced) return { opacity: 0, transition: { duration: 0.12 } };
    const d = landing();
    return { x: d.dx, y: d.dy, scale: d.s, opacity: d.o, transition: HOME };
  }, [landing, reduced]);

  const unwind = useCallback(
    () => ({
      x: 0,
      y: 0,
      scale: 1,
      transition: reduced ? { duration: 0 } : HOME,
    }),
    [reduced],
  );

  useEffect(() => {
    const frame = frameRef.current;
    const previous =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    const body = document.body;
    const overflow = body.style.overflow;
    const padding = body.style.paddingRight;
    const gap = window.innerWidth - document.documentElement.clientWidth;
    const base = Number.parseFloat(getComputedStyle(body).paddingRight) || 0;
    body.style.overflow = "hidden";
    if (gap > 0) body.style.paddingRight = `${base + gap}px`;
    frame?.focus({ preventScroll: true });
    return () => {
      body.style.overflow = overflow;
      body.style.paddingRight = padding;
      if (previous?.isConnected) previous.focus({ preventScroll: true });
    };
  }, [frameRef]);

  useEffect(() => {
    const shell = shellRef.current;
    if (!shell) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (zoomed) return;
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key !== "Tab") return;
      const nodes = Array.from(
        shell.querySelectorAll<HTMLElement>('[data-lightbox-focus="1"]'),
      );
      if (nodes.length === 0) return;
      e.preventDefault();
      const here =
        document.activeElement instanceof HTMLElement
          ? nodes.indexOf(document.activeElement)
          : -1;
      const next = e.shiftKey
        ? here <= 0
          ? nodes.length - 1
          : here - 1
        : here === -1 || here === nodes.length - 1
          ? 0
          : here + 1;
      nodes[next]?.focus();
    };

    shell.addEventListener("keydown", onKeyDown);
    return () => shell.removeEventListener("keydown", onKeyDown);
  }, [onClose, zoomed]);

  return (
    <div
      ref={shellRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      className={`fixed inset-0 z-50 ${className}`}
    >
      <motion.div
        aria-hidden
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0, transition: reduced ? { duration: 0 } : EXIT }}
        transition={reduced ? { duration: 0 } : VEIL}
        className="absolute inset-0 bg-stone-950/80"
      />
      <div
        ref={frameRef}
        data-lightbox-focus="1"
        tabIndex={-1}
        role="group"
        aria-labelledby={titleId}
        aria-describedby={hintId}
        style={{ touchAction: "none", WebkitTouchCallout: "none" }}
        className={`absolute inset-0 overflow-hidden outline-none select-none focus-visible:shadow-[inset_0_0_0_1px_#93B0FF] ${
          zoomed ? "cursor-grab active:cursor-grabbing" : "cursor-zoom-in"
        }`}
        {...bind}
      >
        <motion.div
          style={{ x: fx, y: fy, scale: fs, opacity: fo }}
          variants={{ away }}
          exit="away"
          className="absolute inset-0 flex items-center justify-center p-4 sm:p-14"
        >
          <motion.img
            ref={contentRef}
            src={src}
            alt={alt}
            width={width}
            height={height}
            draggable={false}
            style={{ x, y, scale }}
            variants={{ away: unwind }}
            exit="away"
            className="max-h-full max-w-full rounded-[14px] object-contain"
          />
        </motion.div>
      </div>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0, transition: reduced ? { duration: 0 } : EXIT }}
        transition={reduced ? { duration: 0 } : VEIL}
        className="pointer-events-none absolute inset-0 flex items-start justify-between gap-3 p-3 sm:p-4"
      >
        <p
          id={titleId}
          className="pointer-events-auto max-w-[65%] truncate rounded-[9px] border border-stone-200 bg-white px-2.5 py-1.5 text-[12.5px] text-stone-700 dark:border-white/[0.16] dark:bg-[#1D1D1A] dark:text-stone-200"
        >
          {caption ?? alt}
        </p>
        <div className="pointer-events-auto flex items-center gap-2">
          <button
            data-lightbox-focus="1"
            type="button"
            onClick={toggleZoom}
            aria-label={zoomed ? "Zoom out" : "Zoom in"}
            className={CHROME_BUTTON}
          >
            <svg
              viewBox="0 0 256 256"
              className="size-[15px]"
              fill="none"
              stroke="currentColor"
              strokeWidth={16}
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <circle cx="116" cy="116" r="84" />
              <path d="M175.4 175.4 224 224M84 116h64" />
              <motion.path
                d="M116 84v64"
                initial={false}
                animate={{ opacity: zoomed ? 0 : 1 }}
                transition={reduced ? { duration: 0 } : GLYPH}
              />
            </svg>
          </button>
          <button
            data-lightbox-focus="1"
            type="button"
            onClick={onClose}
            aria-label="Close"
            className={CHROME_BUTTON}
          >
            <svg
              viewBox="0 0 256 256"
              className="size-[15px]"
              fill="none"
              stroke="currentColor"
              strokeWidth={16}
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <path d="M200 56 56 200M200 200 56 56" />
            </svg>
          </button>
        </div>
      </motion.div>
      <p id={hintId} className="sr-only">
        Scroll to zoom toward the pointer, or press plus and minus. Drag or use
        the arrow keys to pan, and double-click to switch between fit and
        close-up. Press zero to return to the starting frame; Escape returns
        home first, then closes.
      </p>
      <p role="status" className="sr-only">
        Zoom {settledZoom.toFixed(1)} times
      </p>
    </div>
  );
}

export function Lightbox(props: LightboxProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {props.open ? <Stage key="lightbox" {...props} /> : null}
    </AnimatePresence>,
    document.body,
  );
}
