"use client";

import {
  useCallback,
  useId,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

const CELL = { type: "spring", stiffness: 520, damping: 34, mass: 0.45 } as const;
const MOVE = { type: "spring", stiffness: 260, damping: 34, mass: 0.8 } as const;
const EASE = [0.23, 1, 0.32, 1] as const;
const LEAVE = { duration: 0.14, ease: [0.4, 0, 1, 1] } as const;
const INSTANT = { duration: 0 } as const;

export type FilterDefinition<T> = {
  id: string;
  label: string;
  match: (item: T) => boolean;
};

export type UseFilterGridOptions<T> = {
  items: readonly T[];
  filters: readonly FilterDefinition<T>[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (id: string) => void;
};

export type UseFilterGridResult<T> = {
  active: string;
  activeLabel: string;
  select: (id: string) => void;
  visible: T[];
  counts: Record<string, number>;
  total: number;
};

export function useFilterGrid<T>({
  items,
  filters,
  value,
  defaultValue,
  onValueChange,
}: UseFilterGridOptions<T>): UseFilterGridResult<T> {
  const fallback = filters[0]?.id ?? "";
  const [internal, setInternal] = useState(() => defaultValue ?? fallback);

  const requested = value ?? internal;
  const current = filters.find((f) => f.id === requested) ?? filters[0];
  const active = current?.id ?? fallback;

  const emit = useRef(onValueChange);
  emit.current = onValueChange;

  const counts = useMemo(() => {
    const next: Record<string, number> = {};
    for (const filter of filters) {
      let n = 0;
      for (const item of items) if (filter.match(item)) n += 1;
      next[filter.id] = n;
    }
    return next;
  }, [filters, items]);

  const visible = useMemo(() => {
    const filter = filters.find((f) => f.id === active);
    if (!filter) return [...items];
    return items.filter((item) => filter.match(item));
  }, [filters, items, active]);

  const select = useCallback(
    (id: string) => {
      if (value === undefined) setInternal(id);
      if (id !== active) emit.current?.(id);
    },
    [value, active],
  );

  return {
    active,
    activeLabel: current?.label ?? "",
    select,
    visible,
    counts,
    total: items.length,
  };
}

export type FilterGridProps<T> = {
  items: readonly T[];
  filters: readonly FilterDefinition<T>[];
  getKey: (item: T) => string;
  renderItem: (item: T) => ReactNode;
  label: string;
  value?: string;
  defaultValue?: string;
  onValueChange?: (id: string) => void;
  columns?: number;
  rowHeight?: number;
  maxRows?: number;
  gap?: number;
  emptyLabel?: string;
  className?: string;
};

export function FilterGrid<T>({
  items,
  filters,
  getKey,
  renderItem,
  label,
  value,
  defaultValue,
  onValueChange,
  columns = 3,
  rowHeight = 72,
  maxRows = 4,
  gap = 8,
  emptyLabel = "Nothing matches this filter",
  className = "",
}: FilterGridProps<T>) {
  const uid = useId();
  const gridId = `${uid}-grid`;
  const reduced = useReducedMotion();

  const { active, activeLabel, select, visible, counts, total } = useFilterGrid({
    items,
    filters,
    value,
    defaultValue,
    onValueChange,
  });

  const gridRef = useRef<HTMLUListElement>(null);
  const chips = useRef<(HTMLButtonElement | null)[]>([]);
  const heldFocus = useRef(false);

  const cols = Math.max(1, Math.floor(columns));
  const rows = Math.min(Math.max(1, Math.ceil(total / cols)), Math.max(1, maxRows));
  const box = rows * rowHeight + (rows - 1) * gap;

  const index = Math.max(
    0,
    filters.findIndex((f) => f.id === active),
  );

  const choose = useCallback(
    (id: string) => {
      const grid = gridRef.current;
      heldFocus.current =
        !!grid && grid.contains(document.activeElement) && grid !== document.activeElement;
      select(id);
    },
    [select],
  );

  const settle = useCallback(() => {
    if (!heldFocus.current) return;
    heldFocus.current = false;
    const grid = gridRef.current;
    if (grid && !grid.contains(document.activeElement)) grid.focus();
  }, []);

  const go = useCallback(
    (i: number) => {
      const next = filters[(i + filters.length) % filters.length];
      if (!next) return;
      chips.current[(i + filters.length) % filters.length]?.focus();
      choose(next.id);
    },
    [filters, choose],
  );

  const onKeyDown = (e: KeyboardEvent<HTMLButtonElement>, i: number) => {
    if (e.key === "ArrowRight" || e.key === "ArrowDown") {
      e.preventDefault();
      go(i + 1);
    } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      e.preventDefault();
      go(i - 1);
    } else if (e.key === "Home") {
      e.preventDefault();
      go(0);
    } else if (e.key === "End") {
      e.preventDefault();
      go(filters.length - 1);
    }
  };

  const swap = reduced ? INSTANT : CELL;
  const step = reduced ? INSTANT : { layout: MOVE, duration: 0.2, ease: EASE };
  const leave = reduced ? INSTANT : LEAVE;

  const capped = Math.ceil(total / cols) > Math.max(1, maxRows);

  return (
    <div className={`w-full ${className}`}>
      <div
        role="radiogroup"
        aria-label={label}
        aria-controls={gridId}
        className="flex flex-wrap items-center gap-1.5"
      >
        {filters.map((filter, i) => {
          const on = i === index;
          return (
            <button
              key={filter.id}
              ref={(node) => {
                chips.current[i] = node;
              }}
              type="button"
              role="radio"
              aria-checked={on}
              tabIndex={on ? 0 : -1}
              onClick={() => choose(filter.id)}
              onKeyDown={(e) => onKeyDown(e, i)}
              className="group relative inline-grid h-8 select-none place-items-center rounded-[6px] px-3 outline-none focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-2 focus-visible:outline-[#4568FF]"
              style={{ touchAction: "manipulation" }}
            >
              {on ? (
                <motion.span
                  aria-hidden
                  layoutId={reduced ? undefined : `${uid}-thumb`}
                  transition={CELL}
                  className="absolute inset-0 rounded-[6px] bg-gradient-to-b from-white to-[#f5f5f5] shadow-[inset_0_1px_0_rgba(255,255,255,0.95),0_0_0_1px_rgba(0,0,0,0.15),0_1px_2px_rgba(0,0,0,0.08)] dark:from-[#222222] dark:to-[#151515] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.07),0_0_0_1px_rgba(255,255,255,0.12),0_1px_2px_rgba(0,0,0,0.4)]"
                />
              ) : null}

              <span
                aria-hidden
                className={`pointer-events-none absolute inset-0 rounded-[6px] border ${
                  on
                    ? "border-transparent"
                    : "border-transparent group-hover:bg-black/[0.04] dark:group-hover:bg-white/[0.06]"
                }`}
              />
              <span className="relative col-start-1 row-start-1 inline-grid">
                <motion.span
                  aria-hidden
                  initial={false}
                  animate={{ opacity: on ? 0 : 1 }}
                  transition={swap}
                  className="col-start-1 row-start-1 inline-flex items-center gap-1.5 whitespace-nowrap text-[12.5px] font-medium text-neutral-600 dark:text-neutral-300"
                >
                  {filter.label}
                  <span className="text-[10.5px] tabular-nums text-neutral-500 dark:text-neutral-400">
                    {counts[filter.id]}
                  </span>
                </motion.span>
                <motion.span
                  aria-hidden
                  initial={false}
                  animate={{ opacity: on ? 1 : 0 }}
                  transition={swap}
                  className="col-start-1 row-start-1 inline-flex items-center gap-1.5 whitespace-nowrap text-[12.5px] font-medium text-neutral-900 dark:text-neutral-100"
                >
                  {filter.label}
                  <span className="text-[10.5px] tabular-nums text-neutral-500 dark:text-neutral-400">
                    {counts[filter.id]}
                  </span>
                </motion.span>
                <span className="sr-only">
                  {filter.label}, {counts[filter.id]} of {total}
                </span>
              </span>
            </button>
          );
        })}
      </div>
      <div className="relative mt-2.5">
        <ul
          id={gridId}
          ref={gridRef}
          tabIndex={-1}
          className={`relative overflow-y-auto overscroll-contain outline-none ${
            capped ? "[scrollbar-gutter:stable]" : ""
          }`}
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
            gridAutoRows: `${rowHeight}px`,
            gap: `${gap}px`,
            height: `${box}px`,
          }}
        >
          <AnimatePresence initial={false} mode="popLayout" onExitComplete={settle}>
            {visible.map((item) => (
              <motion.li
                key={getKey(item)}
                layout={reduced ? false : "position"}
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98, transition: leave }}
                transition={step}
                className="min-w-0 overflow-hidden rounded-[11px] border border-black/10 bg-white p-2.5 shadow-[0_1px_2px_rgba(0,0,0,0.05)] dark:border-white/10 dark:bg-[#191919] dark:shadow-[0_1px_2px_rgba(0,0,0,0.4)]"
              >
                {renderItem(item)}
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
        <AnimatePresence initial={false}>
          {visible.length === 0 && (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, transition: leave }}
              transition={reduced ? INSTANT : { duration: 0.2, ease: EASE }}
              className="pointer-events-none absolute inset-0 grid place-items-center"
            >
              <span className="text-[12.5px] text-neutral-500 dark:text-neutral-400">
                {emptyLabel}
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <p aria-live="polite" className="sr-only">
        {activeLabel}: {visible.length} of {total} shown
      </p>
    </div>
  );
}
