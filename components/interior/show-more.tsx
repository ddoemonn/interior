"use client";

import { useCallback, useId, useRef, useState } from "react";
import {
  motion,
  useIsomorphicLayoutEffect,
  useReducedMotion,
} from "motion/react";

const DISCLOSE = {
  type: "spring",
  stiffness: 190,
  damping: 30,
  mass: 1,
} as const;

const SMALL = {
  type: "spring",
  stiffness: 700,
  damping: 46,
  mass: 0.5,
} as const;

const INSTANT = { duration: 0 } as const;

type Metrics = { line: number; full: number };

export type UseShowMoreOptions = {
  lines?: number;
  maxHeight?: number;
  defaultExpanded?: boolean;
  expanded?: boolean;
  onExpandedChange?: (expanded: boolean) => void;
};

export type UseShowMoreResult = {
  contentRef: React.RefObject<HTMLDivElement | null>;
  expanded: boolean;
  open: boolean;
  toggle: () => void;
  setExpanded: (next: boolean) => void;
  height: number | null;
  collapsedHeight: number | null;
  fullHeight: number | null;
  expandable: boolean;
  capped: boolean;
  scrollable: boolean;
};

export function useShowMore({
  lines = 3,
  maxHeight = 320,
  defaultExpanded = false,
  expanded: expandedProp,
  onExpandedChange,
}: UseShowMoreOptions = {}): UseShowMoreResult {
  const [uncontrolled, setUncontrolled] = useState(defaultExpanded);
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);

  const expanded = expandedProp ?? uncontrolled;

  const notify = useRef(onExpandedChange);
  notify.current = onExpandedChange;

  const setExpanded = useCallback(
    (next: boolean) => {
      if (expandedProp === undefined) setUncontrolled(next);
      notify.current?.(next);
    },
    [expandedProp],
  );

  const toggle = useCallback(
    () => setExpanded(!expanded),
    [setExpanded, expanded],
  );

  useIsomorphicLayoutEffect(() => {
    const el = contentRef.current;
    if (!el) return;

    const read = () => {
      const styles = getComputedStyle(el);
      const parsed = Number.parseFloat(styles.lineHeight);
      const line = Number.isFinite(parsed)
        ? parsed
        : Number.parseFloat(styles.fontSize) * 1.5;
      const full = el.scrollHeight;

      setMetrics((prev) =>
        prev && prev.line === line && prev.full === full
          ? prev
          : { line, full },
      );
    };

    read();

    const observer = new ResizeObserver(read);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const clamped = metrics ? metrics.line * lines : 0;
  const expandable = metrics ? metrics.full - clamped > 1 : true;
  const capped = metrics ? metrics.full > maxHeight : false;
  const collapsedHeight = metrics ? Math.min(clamped, metrics.full) : null;
  const fullHeight = metrics ? Math.min(metrics.full, maxHeight) : null;
  const open = expanded && expandable;

  return {
    contentRef,
    expanded,
    open,
    toggle,
    setExpanded,
    height: open ? fullHeight : collapsedHeight,
    collapsedHeight,
    fullHeight,
    expandable,
    capped,
    scrollable: open && capped,
  };
}

export type ShowMoreProps = UseShowMoreOptions & {
  children: React.ReactNode;
  moreLabel?: string;
  lessLabel?: string;
  label?: string;
  className?: string;
};

export function ShowMore({
  children,
  moreLabel = "Show more",
  lessLabel = "Show less",
  label = "Details",
  lines = 3,
  maxHeight = 320,
  defaultExpanded,
  expanded,
  onExpandedChange,
  className = "",
}: ShowMoreProps) {
  const reduced = useReducedMotion();
  const regionId = useId();
  const regionRef = useRef<HTMLDivElement>(null);

  const { contentRef, open, toggle, height, expandable, capped, scrollable } =
    useShowMore({
      lines,
      maxHeight,
      defaultExpanded,
      expanded,
      onExpandedChange,
    });

  const press = () => {
    if (open) regionRef.current?.scrollTo({ top: 0 });
    toggle();
  };

  const veiled = expandable && (!open || scrollable);

  return (
    <div
      className={`text-[13.5px] leading-relaxed text-neutral-700 dark:text-neutral-200 ${className}`}
    >
      <div className="relative">
        <motion.div
          ref={regionRef}
          id={regionId}
          role={scrollable ? "region" : undefined}
          aria-label={scrollable ? label : undefined}
          tabIndex={scrollable ? 0 : undefined}
          initial={false}
          animate={height === null ? {} : { height }}
          transition={reduced ? INSTANT : DISCLOSE}
          style={{
            maxHeight: height === null ? `${lines}lh` : undefined,
            overflowY: scrollable ? "auto" : "hidden",

            scrollbarGutter: capped ? "stable" : undefined,
          }}
          className="overflow-hidden overscroll-contain rounded-[6px] outline-none focus-visible:bg-[#4568FF]/[0.06] focus-visible:shadow-[inset_0_0_0_1px_#4568FF] dark:focus-visible:bg-[#4568FF]/[0.12]"
        >
          <div ref={contentRef}>{children}</div>
        </motion.div>
        <motion.div
          aria-hidden
          initial={false}
          animate={{ opacity: veiled ? 1 : 0 }}
          transition={reduced ? INSTANT : SMALL}
          className="pointer-events-none absolute inset-x-0 bottom-0 h-9 bg-gradient-to-t from-white to-white/0 dark:from-[#111111] dark:to-[#111111]/0"
        />
      </div>
      <div className="mt-2 flex h-8 items-center">
        {/* eslint-disable-next-line jsx-a11y/control-has-associated-label */}
        <button
          type="button"
          onClick={press}
          aria-expanded={open}
          aria-controls={regionId}
          className={`inline-flex h-8 select-none items-center gap-2 rounded-[8px] bg-gradient-to-b from-white to-[#f5f5f5] px-[11px] text-[12.5px] font-medium text-neutral-700 shadow-[inset_0_1px_0_rgba(255,255,255,0.95),0_0_0_1px_rgba(0,0,0,0.12),0_1px_2px_rgba(0,0,0,0.08)] outline-none transition-[filter] duration-150 hover:brightness-[0.98] focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-2 focus-visible:outline-[#4568FF] dark:from-[#222222] dark:to-[#151515] dark:text-neutral-200 dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.07),0_0_0_1px_rgba(255,255,255,0.12),0_1px_2px_rgba(0,0,0,0.4)] dark:hover:brightness-110 ${
            expandable ? "" : "pointer-events-none invisible"
          }`}
        >
          <span className="grid text-left">
            <motion.span
              aria-hidden={open}
              className="col-start-1 row-start-1"
              initial={false}
              animate={{ opacity: open ? 0 : 1 }}
              transition={reduced ? INSTANT : SMALL}
            >
              {moreLabel}
            </motion.span>
            <motion.span
              aria-hidden={!open}
              className="col-start-1 row-start-1"
              initial={false}
              animate={{ opacity: open ? 1 : 0 }}
              transition={reduced ? INSTANT : SMALL}
            >
              {lessLabel}
            </motion.span>
          </span>
          <motion.svg
            aria-hidden
            width="12"
            height="12"
            viewBox="0 0 256 256"
            fill="none"
            className="text-neutral-500 dark:text-neutral-400"
            initial={false}
            animate={{ rotate: open ? 180 : 0 }}
            transition={reduced ? INSTANT : SMALL}
          >
            <polyline
              points="208 96 128 176 48 96"
              stroke="currentColor"
              strokeWidth="16"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </motion.svg>
        </button>
      </div>
    </div>
  );
}
