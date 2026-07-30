"use client";

import { useCallback, useId, useRef, useState } from "react";
import { Reorder, useReducedMotion } from "motion/react";

const CELL = { type: "spring", stiffness: 520, damping: 34, mass: 0.45 } as const;
const INSTANT = { duration: 0 } as const;

const moveItem = <T,>(list: readonly T[], from: number, to: number): T[] => {
  const next = [...list];
  const [taken] = next.splice(from, 1);
  next.splice(to, 0, taken);
  return next;
};

export type UseReorderListOptions<T> = {
  items: readonly T[];
  getId: (item: T) => string;
  getLabel: (item: T) => string;
  onReorder: (next: T[]) => void;
  onCommit?: (next: T[]) => void;
  disabled?: boolean;
};

export function useReorderList<T>({
  items,
  getId,
  getLabel,
  onReorder,
  onCommit,
  disabled = false,
}: UseReorderListOptions<T>) {
  const [grabbed, setGrabbed] = useState<string | null>(null);
  const [dragging, setDragging] = useState<string | null>(null);
  const [spoken, setSpoken] = useState("");

  const emit = useRef(onReorder);
  emit.current = onReorder;
  const settle = useRef(onCommit);
  settle.current = onCommit;
  const live = useRef(items);
  live.current = items;
  const snapshot = useRef<readonly T[] | null>(null);

  const indexOf = useCallback(
    (id: string) => live.current.findIndex((item) => getId(item) === id),
    [getId],
  );

  const grab = useCallback(
    (id: string) => {
      snapshot.current = live.current;
      setGrabbed(id);
      const at = indexOf(id);
      const item = live.current[at];
      setSpoken(
        `${getLabel(item)} grabbed, position ${at + 1} of ${live.current.length}.`,
      );
    },
    [getLabel, indexOf],
  );

  const drop = useCallback(
    (id: string) => {
      snapshot.current = null;
      setGrabbed(null);
      const at = indexOf(id);
      const item = live.current[at];
      setSpoken(`${getLabel(item)} dropped at position ${at + 1}.`);
      settle.current?.([...live.current]);
    },
    [getLabel, indexOf],
  );

  const cancel = useCallback(() => {
    if (snapshot.current) emit.current([...snapshot.current]);
    snapshot.current = null;
    setGrabbed(null);
    setSpoken("Reorder cancelled, original order restored.");
  }, []);

  const step = useCallback(
    (id: string, delta: -1 | 1) => {
      const from = indexOf(id);
      const to = from + delta;
      if (from < 0 || to < 0 || to >= live.current.length) return;
      const next = moveItem(live.current, from, to);
      emit.current(next);
      const item = next[to];
      setSpoken(
        `${getLabel(item)}, position ${to + 1} of ${next.length}.`,
      );
      if (snapshot.current === null) settle.current?.(next);
    },
    [getLabel, indexOf],
  );

  const rowKeyDown = useCallback(
    (id: string) => (event: React.KeyboardEvent<HTMLElement>) => {
      if (disabled || event.target !== event.currentTarget) return;
      const held = grabbed === id;
      if (event.key === " " || event.key === "Enter") {
        event.preventDefault();
        if (held) drop(id);
        else grab(id);
        return;
      }
      if ((event.key === "ArrowUp" || event.key === "ArrowDown") && held) {
        event.preventDefault();
        step(id, event.key === "ArrowUp" ? -1 : 1);
        return;
      }
      if (event.key === "Escape" && held) {
        event.preventDefault();
        cancel();
      }
    },
    [disabled, grabbed, grab, drop, step, cancel],
  );

  const onDragStart = useCallback(
    (id: string) => {
      snapshot.current = live.current;
      setDragging(id);
    },
    [],
  );

  const onDragEnd = useCallback(
    (id: string) => {
      snapshot.current = null;
      setDragging(null);
      const at = indexOf(id);
      const item = live.current[at];
      setSpoken(`${getLabel(item)} dropped at position ${at + 1}.`);
      settle.current?.([...live.current]);
    },
    [getLabel, indexOf],
  );

  return {
    grabbed,
    dragging,
    spoken,
    grab,
    drop,
    cancel,
    step,
    rowKeyDown,
    onDragStart,
    onDragEnd,
  };
}

export type ReorderListProps<T> = UseReorderListOptions<T> & {
  children: (item: T) => React.ReactNode;
  label: string;
  className?: string;
};

const GRIP = (
  <svg width="10" height="14" viewBox="0 0 10 14" fill="currentColor" aria-hidden>
    <circle cx="2.5" cy="2.5" r="1.2" />
    <circle cx="7.5" cy="2.5" r="1.2" />
    <circle cx="2.5" cy="7" r="1.2" />
    <circle cx="7.5" cy="7" r="1.2" />
    <circle cx="2.5" cy="11.5" r="1.2" />
    <circle cx="7.5" cy="11.5" r="1.2" />
  </svg>
);

export function ReorderList<T>({
  children,
  label,
  className = "",
  ...options
}: ReorderListProps<T>) {
  const { items, getId, getLabel, onReorder, disabled = false } = options;
  const list = useReorderList(options);
  const reduced = useReducedMotion() === true;
  const hintId = useId();

  return (
    <div className={`w-full ${className}`}>
      <Reorder.Group
        axis="y"
        values={items as T[]}
        onReorder={onReorder}
        aria-label={label}
        className="m-0 list-none space-y-1.5 p-0"
      >
        {items.map((item) => {
          const id = getId(item);
          const held = list.grabbed === id;
          const lifted = held || list.dragging === id;
          return (
            <Reorder.Item
              key={id}
              value={item}
              drag={disabled ? false : "y"}
              dragListener={!disabled}
              tabIndex={disabled ? -1 : 0}
              aria-describedby={hintId}
              aria-pressed={held}
              role="button"
              onKeyDown={list.rowKeyDown(id)}
              onDragStart={() => list.onDragStart(id)}
              onDragEnd={() => list.onDragEnd(id)}
              onBlur={() => held && list.cancel()}
              transition={reduced ? INSTANT : CELL}
              whileDrag={reduced ? undefined : { scale: 1.02 }}
              style={{ touchAction: "pan-x" }}
              className={`relative flex items-center gap-2.5 rounded-[9px] border bg-white px-3 py-2.5 outline-none transition-[border-color,box-shadow,background-color] duration-150 focus-visible:outline-none dark:bg-[#1D1D1A] ${
                lifted
                  ? "z-10 cursor-grabbing border-stone-200 shadow-[0_1px_2px_rgba(28,25,23,0.08),0_14px_28px_-16px_rgba(28,25,23,0.5)] dark:border-white/[0.16] dark:shadow-[0_2px_14px_rgba(0,0,0,0.55)]"
                  : "cursor-grab border-stone-200 shadow-[0_1px_2px_rgba(28,25,23,0.06)] dark:border-white/[0.16] dark:shadow-[0_1px_6px_rgba(0,0,0,0.45)]"
              } ${
                held
                  ? "border-[#4568FF] bg-[#4568FF]/[0.04] dark:border-[#93B0FF] dark:bg-[#93B0FF]/[0.08]"
                  : "focus-visible:bg-[#4568FF]/[0.06] focus-visible:shadow-[inset_0_0_0_1px_#4568FF] dark:focus-visible:bg-[#93B0FF]/[0.1] dark:focus-visible:shadow-[inset_0_0_0_1px_#93B0FF]"
              }`}
            >
              <span
                aria-hidden
                className={`shrink-0 transition-colors duration-150 ${
                  lifted
                    ? "text-stone-500 dark:text-stone-300"
                    : "text-stone-300 dark:text-stone-600"
                }`}
              >
                {GRIP}
              </span>
              <span className="sr-only">{getLabel(item)}</span>
              <div aria-hidden className="min-w-0 flex-1">
                {children(item)}
              </div>
            </Reorder.Item>
          );
        })}
      </Reorder.Group>
      <span id={hintId} className="sr-only">
        Drag to reorder. With the keyboard, Space grabs the row, the arrow keys
        move it, Space drops it, and Escape puts everything back.
      </span>
      <span role="status" aria-live="polite" className="sr-only">
        {list.spoken}
      </span>
    </div>
  );
}
