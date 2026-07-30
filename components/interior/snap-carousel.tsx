"use client";

import {
  Children,
  isValidElement,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import {
  animate,
  motion,
  useIsomorphicLayoutEffect,
  useMotionValue,
  useReducedMotion,
} from "motion/react";

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

const WALL = {
  type: "spring",
  stiffness: 700,
  damping: 30,
  mass: 0.5,
} as const;

const WALL_IMPULSE = 900;

const clamp = (n: number, lo: number, hi: number) =>
  Math.max(lo, Math.min(hi, n));

type DragInfo = {
  offset: { x: number; y: number };
  velocity: { x: number; y: number };
};

export type UseSnapCarouselOptions = {
  count: number;
  index?: number;
  defaultIndex?: number;
  onIndexChange?: (index: number) => void;
  gap?: number;
  momentum?: number;
  maxFlick?: number;
  disabled?: boolean;
};

export function useSnapCarousel({
  count,
  index: controlled,
  defaultIndex = 0,
  onIndexChange,
  gap = 12,
  momentum = 0.14,
  maxFlick = 1,
  disabled = false,
}: UseSnapCarouselOptions) {
  const total = Math.max(1, Math.floor(count));

  const [uncontrolled, setUncontrolled] = useState(() =>
    clamp(defaultIndex, 0, total - 1),
  );
  const [slideWidth, setSlideWidth] = useState(0);
  const [dragging, setDragging] = useState(false);

  const index = clamp(controlled ?? uncontrolled, 0, total - 1);
  const [target, setTarget] = useState(index);
  const step = slideWidth + gap;

  const viewportRef = useRef<HTMLDivElement>(null);
  const anim = useRef<{ stop: () => void } | null>(null);
  const desired = useRef<number | null>(null);
  const lastStep = useRef(0);

  const live = useRef(index);
  live.current = index;
  const metrics = useRef({ step, total, momentum, maxFlick });
  metrics.current = { step, total, momentum, maxFlick };
  const changed = useRef(onIndexChange);
  changed.current = onIndexChange;

  const x = useMotionValue(0);
  const reduced = useReducedMotion();

  const glide = useCallback(
    (to: number, velocity = 0) => {
      desired.current = to;
      anim.current?.stop();
      anim.current = animate(
        x,
        to,
        reduced ? { duration: 0 } : { ...CROSSFADE, velocity },
      );
    },
    [x, reduced],
  );

  const goTo = useCallback(
    (next: number, velocity = 0) => {
      const shelf = metrics.current;
      const to = clamp(Math.round(next), 0, shelf.total - 1);
      setTarget(to);
      if (to !== live.current) {
        live.current = to;
        setUncontrolled(to);
        changed.current?.(to);
      }
      glide(-to * shelf.step, velocity);
    },
    [glide],
  );

  const bounce = useCallback(
    (dir: 1 | -1) => {
      const shelf = metrics.current;
      const to = -live.current * shelf.step;
      desired.current = to;
      anim.current?.stop();
      anim.current = animate(
        x,
        to,
        reduced ? { duration: 0 } : { ...WALL, velocity: -dir * WALL_IMPULSE },
      );
    },
    [x, reduced],
  );

  const move = useCallback(
    (dir: 1 | -1) => {
      const to = live.current + dir;
      if (to < 0 || to > metrics.current.total - 1) bounce(dir);
      else goTo(to);
    },
    [bounce, goTo],
  );

  const next = useCallback(() => move(1), [move]);
  const prev = useCallback(() => move(-1), [move]);

  const pick = useCallback(
    (velocity: number) => {
      const shelf = metrics.current;
      if (shelf.step === 0) return live.current;
      const at = -x.get() / shelf.step;
      const anchor = clamp(Math.round(at), 0, shelf.total - 1);
      const projected = at - (velocity * shelf.momentum) / shelf.step;
      return clamp(
        clamp(
          Math.round(projected),
          anchor - shelf.maxFlick,
          anchor + shelf.maxFlick,
        ),
        0,
        shelf.total - 1,
      );
    },
    [x],
  );

  useIsomorphicLayoutEffect(() => {
    const el = viewportRef.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      const width = entries[0]?.contentRect.width ?? 0;
      setSlideWidth((current) =>
        Math.abs(current - width) < 0.5 ? current : width,
      );
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useIsomorphicLayoutEffect(() => {
    if (step === 0) return;
    const to = -index * step;

    if (lastStep.current !== step) {
      lastStep.current = step;
      desired.current = to;
      anim.current?.stop();
      x.set(to);
      return;
    }
    if (dragging || desired.current === to) return;
    glide(to);
  }, [index, step, dragging, glide, x]);

  useEffect(() => () => anim.current?.stop(), []);

  const onDragStart = useCallback(() => {
    anim.current?.stop();
    setDragging(true);
    setTarget(live.current);
  }, []);

  const onDrag = useCallback(
    (_event: MouseEvent | TouchEvent | PointerEvent, info: DragInfo) => {
      const to = pick(info.velocity.x);
      setTarget((current) => (current === to ? current : to));
    },
    [pick],
  );

  const onDragEnd = useCallback(
    (_event: MouseEvent | TouchEvent | PointerEvent, info: DragInfo) => {
      setDragging(false);
      goTo(pick(info.velocity.x), info.velocity.x);
    },
    [goTo, pick],
  );

  const onKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (event.key === "ArrowRight") {
        event.preventDefault();
        next();
      } else if (event.key === "ArrowLeft") {
        event.preventDefault();
        prev();
      } else if (event.key === "Home") {
        event.preventDefault();
        goTo(0);
      } else if (event.key === "End") {
        event.preventDefault();
        goTo(metrics.current.total - 1);
      }
    },
    [goTo, next, prev],
  );

  const onScroll = useCallback((event: React.UIEvent<HTMLElement>) => {
    event.currentTarget.scrollLeft = 0;
    event.currentTarget.scrollTop = 0;
  }, []);

  const viewportProps = {
    tabIndex: 0,
    role: "group" as const,
    "aria-roledescription": "carousel",
    onKeyDown,
    onScroll,
  };

  const trackProps = {
    drag: (disabled || total < 2 ? false : "x") as false | "x",
    dragDirectionLock: true,
    dragMomentum: false,
    dragElastic: 0.14,
    dragConstraints: { left: -(total - 1) * step, right: 0 },
    onDragStart,
    onDrag,
    onDragEnd,
    style: { x, gap: `${gap}px`, touchAction: "pan-y" as const },
  };

  return {
    index,
    count: total,
    target,
    shown: dragging ? target : index,
    dragging,
    slideWidth,
    step,
    x,
    goTo,
    next,
    prev,
    viewportRef,
    viewportProps,
    trackProps,
  };
}

export type UseSnapCarouselResult = ReturnType<typeof useSnapCarousel>;

const CARET_LEFT = (
  <svg width="14" height="14" viewBox="0 0 256 256" fill="none" aria-hidden="true">
    <polyline
      points="160 208 80 128 160 48"
      stroke="currentColor"
      strokeWidth="16"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const CARET_RIGHT = (
  <svg width="14" height="14" viewBox="0 0 256 256" fill="none" aria-hidden="true">
    <polyline
      points="96 48 176 128 96 208"
      stroke="currentColor"
      strokeWidth="16"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export type SnapCarouselProps = {
  children: React.ReactNode;
  label: string;
  index?: number;
  defaultIndex?: number;
  onIndexChange?: (index: number) => void;
  gap?: number;
  peek?: number;
  momentum?: number;
  maxFlick?: number;
  prevLabel?: string;
  nextLabel?: string;
  className?: string;
};

export function SnapCarousel({
  children,
  label,
  index,
  defaultIndex = 0,
  onIndexChange,
  gap = 12,
  peek = 0,
  momentum = 0.14,
  maxFlick = 1,
  prevLabel = "Previous slide",
  nextLabel = "Next slide",
  className = "",
}: SnapCarouselProps) {
  const slides = Children.toArray(children);
  const hintId = useId();
  const reduced = useReducedMotion();

  const car = useSnapCarousel({
    count: slides.length,
    index,
    defaultIndex,
    onIndexChange,
    gap,
    momentum,
    maxFlick,
  });

  const button =
    "grid size-7 place-items-center rounded-[6px] border border-stone-200 bg-white text-stone-700 shadow-[inset_0_1.5px_0_rgba(255,255,255,0.95),inset_0_-1px_0_rgba(28,25,23,0.06),0_1px_2px_rgba(28,25,23,0.08)] outline-none transition-[background-color,border-color,box-shadow,transform] duration-150 hover:bg-stone-50 active:translate-y-px active:shadow-[inset_0_1px_2px_rgba(28,25,23,0.06)] focus-visible:border-[#4568FF] focus-visible:shadow-[0_1px_2px_rgba(28,25,23,0.08),0_10px_20px_-14px_rgba(69,104,255,0.6)] dark:border-white/[0.16] dark:bg-[#252522] dark:text-stone-200 dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.07),0_1px_2px_rgba(0,0,0,0.4)] dark:hover:bg-[#2A2A27] dark:focus-visible:border-[#93B0FF] dark:focus-visible:shadow-[0_10px_20px_-14px_rgba(147,176,255,0.5)]";

  return (
    <div className={`w-full ${className}`}>
      <div
        ref={car.viewportRef}
        aria-label={label}
        aria-describedby={hintId}
        style={{
          paddingLeft: peek,
          paddingRight: peek,
          ...(peek > 0
            ? {
                WebkitMaskImage: `linear-gradient(to right, transparent 0, black ${peek + 14}px, black calc(100% - ${peek + 14}px), transparent 100%)`,
                maskImage: `linear-gradient(to right, transparent 0, black ${peek + 14}px, black calc(100% - ${peek + 14}px), transparent 100%)`,
              }
            : {}),
        }}
        className="relative overflow-hidden rounded-[14px] py-1.5 outline-none focus-visible:bg-[#4568FF]/[0.06] focus-visible:shadow-[inset_0_0_0_1px_#4568FF] dark:focus-visible:bg-[#93B0FF]/[0.1] dark:focus-visible:shadow-[inset_0_0_0_1px_#93B0FF]"
        {...car.viewportProps}
      >
        <motion.div
          {...car.trackProps}
          className={`flex items-stretch ${
            car.dragging ? "cursor-grabbing" : "cursor-grab"
          }`}
        >
          {slides.map((slide, i) => (
            <motion.div
              key={isValidElement(slide) && slide.key ? slide.key : i}
              role="group"
              aria-roledescription="slide"
              aria-label={`${i + 1} of ${slides.length}`}
              inert={i !== car.index}
              initial={false}
              animate={
                i === car.shown
                  ? { scale: 1, opacity: 1 }
                  : { scale: 0.96, opacity: 0.55 }
              }
              transition={reduced ? { duration: 0 } : CROSSFADE}
              className="w-full shrink-0 select-none"
            >
              {slide}
            </motion.div>
          ))}
        </motion.div>
      </div>
      <div className="mt-3 flex items-center justify-between gap-3">
        <span className="flex items-center gap-[3px]">
          {slides.map((slide, i) => (
            <button
              key={isValidElement(slide) && slide.key ? slide.key : i}
              type="button"
              onClick={() => car.goTo(i)}
              aria-label={`Go to slide ${i + 1}`}
              aria-current={i === car.index ? "true" : undefined}
              className="grid h-[18px] w-[16px] place-items-center rounded-[5px] outline-none focus-visible:bg-[#4568FF]/[0.06] focus-visible:shadow-[inset_0_0_0_1px_#4568FF] dark:focus-visible:bg-[#93B0FF]/[0.1] dark:focus-visible:shadow-[inset_0_0_0_1px_#93B0FF]"
            >
              <motion.span
                initial={false}
                animate={
                  i === car.shown
                    ? { scaleX: 1, opacity: 1 }
                    : { scaleX: 0.36, opacity: 0.26 }
                }
                transition={reduced ? { duration: 0 } : CELL}
                className="block h-[5px] w-[14px] rounded-[1.5px] bg-stone-800 dark:bg-stone-100"
              />
            </button>
          ))}
        </span>
        <span className="flex items-center gap-1.5">
          <button type="button" onClick={car.prev} aria-label={prevLabel} className={button}>
            {CARET_LEFT}
          </button>
          <button type="button" onClick={car.next} aria-label={nextLabel} className={button}>
            {CARET_RIGHT}
          </button>
        </span>
      </div>
      <span id={hintId} className="sr-only">
        Left and right arrow keys move between {slides.length} slides.
      </span>
      <span aria-live="polite" aria-atomic className="sr-only">
        Slide {car.index + 1} of {slides.length}
      </span>
    </div>
  );
}
