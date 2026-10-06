"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

const EASE = [0.23, 1, 0.32, 1] as const;

const EXIT = [0.4, 0, 1, 1] as const;
const CELL = { type: "spring", stiffness: 520, damping: 34, mass: 0.45 } as const;

const NUDGE = { type: "spring", stiffness: 700, damping: 46, mass: 0.5 } as const;
const NONE = { duration: 0 } as const;

const SLIDE = { type: "spring", stiffness: 700, damping: 46, mass: 0.5 } as const;

const ROW_H = 32;

const OPEN = { type: "spring", stiffness: 620, damping: 38, mass: 0.6 } as const;

export type DropdownItem = {
  value: string;
  label: string;
  hint?: string;
  disabled?: boolean;
};

export type UseDropdownOptions = {
  items: DropdownItem[];
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
  typeaheadDelay?: number;
};

export function useDropdown({
  items,
  value,
  defaultValue,
  onChange,
  disabled = false,
  typeaheadDelay = 600,
}: UseDropdownOptions) {
  const uid = useId();
  const listId = `${uid}-list`;
  const itemId = useCallback((i: number) => `${uid}-opt-${i}`, [uid]);

  const [uncontrolled, setUncontrolled] = useState<string | null>(
    defaultValue ?? null,
  );
  const selectedValue = value !== undefined ? value : uncontrolled;
  const selectedIndex = items.findIndex((it) => it.value === selectedValue);

  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const itemRefs = useRef<(HTMLLIElement | null)[]>([]);
  const viaKey = useRef(false);
  const buffer = useRef("");
  const bufferTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const emit = useRef(onChange);
  emit.current = onChange;

  const step = useCallback(
    (from: number, dir: 1 | -1) => {
      const n = items.length;
      if (n === 0) return -1;
      let i = from;
      for (let k = 0; k < n; k++) {
        i = (i + dir + n) % n;
        if (!items[i].disabled) return i;
      }
      return from;
    },
    [items],
  );

  const edge = useCallback(
    (dir: 1 | -1) => step(dir === 1 ? -1 : items.length, dir),
    [step, items.length],
  );

  const openMenu = useCallback(
    (index?: number) => {
      if (disabled || items.length === 0) return;
      const usable = selectedIndex >= 0 && !items[selectedIndex].disabled;
      viaKey.current = true;
      setActiveIndex(index ?? (usable ? selectedIndex : edge(1)));
      setOpen(true);
    },
    [disabled, items, selectedIndex, edge],
  );

  const close = useCallback((restoreFocus = true) => {
    buffer.current = "";
    setOpen(false);
    setActiveIndex(-1);
    if (restoreFocus) triggerRef.current?.focus();
  }, []);

  const select = useCallback(
    (index: number) => {
      const item = items[index];
      if (!item || item.disabled) return;
      if (value === undefined) setUncontrolled(item.value);
      emit.current?.(item.value);
      close();
    },
    [items, value, close],
  );

  const typeahead = useCallback(
    (char: string) => {
      if (bufferTimer.current) clearTimeout(bufferTimer.current);
      buffer.current += char.toLowerCase();
      bufferTimer.current = setTimeout(() => {
        buffer.current = "";
      }, typeaheadDelay);

      const q = buffer.current;
      const n = items.length;
      const from = activeIndex < 0 ? 0 : activeIndex;
      const start = q.length > 1 ? from : from + 1;
      for (let k = 0; k < n; k++) {
        const i = (start + k) % n;
        const it = items[i];
        if (!it.disabled && it.label.toLowerCase().startsWith(q)) {
          viaKey.current = true;
          setActiveIndex(i);
          return;
        }
      }
    },
    [items, activeIndex, typeaheadDelay],
  );

  useEffect(() => {
    if (open) listRef.current?.focus();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) close(false);
    };
    const onWindowBlur = () => close(false);
    document.addEventListener("pointerdown", onDown, true);
    window.addEventListener("blur", onWindowBlur);
    return () => {
      document.removeEventListener("pointerdown", onDown, true);
      window.removeEventListener("blur", onWindowBlur);
    };
  }, [open, close]);

  useEffect(() => {
    if (!open || activeIndex < 0 || !viaKey.current) return;
    viaKey.current = false;
    itemRefs.current[activeIndex]?.scrollIntoView({ block: "nearest" });
  }, [open, activeIndex]);

  useEffect(
    () => () => {
      if (bufferTimer.current) clearTimeout(bufferTimer.current);
    },
    [],
  );

  const triggerProps = {
    ref: triggerRef,
    type: "button" as const,
    disabled,
    "aria-haspopup": "listbox" as const,
    "aria-expanded": open,
    "aria-controls": open ? listId : undefined,
    onClick: () => (open ? close() : openMenu()),
    onKeyDown: (e: React.KeyboardEvent<HTMLButtonElement>) => {
      if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        openMenu();
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        openMenu(edge(-1));
      }
    },
  };

  const listProps = {
    ref: listRef,
    id: listId,
    role: "listbox" as const,
    tabIndex: -1,
    "aria-activedescendant": activeIndex >= 0 ? itemId(activeIndex) : undefined,
    onKeyDown: (e: React.KeyboardEvent<HTMLUListElement>) => {
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault();
        const dir = e.key === "ArrowDown" ? 1 : -1;
        viaKey.current = true;
        setActiveIndex((i) => step(i, dir));
      } else if (e.key === "Home" || e.key === "End") {
        e.preventDefault();
        viaKey.current = true;
        setActiveIndex(edge(e.key === "Home" ? 1 : -1));
      } else if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        select(activeIndex);
      } else if (e.key === "Escape") {
        e.preventDefault();
        close();
      } else if (e.key === "Tab") {
        e.preventDefault();
        close();
      } else if (
        e.key.length === 1 &&
        !e.metaKey &&
        !e.ctrlKey &&
        !e.altKey
      ) {
        e.preventDefault();
        typeahead(e.key);
      }
    },
  };

  const getItemProps = useCallback(
    (index: number) => ({
      id: itemId(index),
      role: "option" as const,
      "aria-selected": index === selectedIndex,
      "aria-disabled": items[index]?.disabled ? (true as const) : undefined,
      ref: (el: HTMLLIElement | null) => {
        itemRefs.current[index] = el;
      },
      onPointerMove: () => {
        if (items[index]?.disabled) return;
        viaKey.current = false;
        setActiveIndex(index);
      },
      onClick: () => select(index),
    }),
    [itemId, items, selectedIndex, select],
  );

  return {
    open,
    openMenu,
    close,
    select,
    activeIndex,
    selectedIndex,
    selectedItem: selectedIndex >= 0 ? items[selectedIndex] : null,
    itemId,
    rootRef,
    triggerProps,
    listProps,
    getItemProps,
  };
}

export type DropdownProps = {
  items: DropdownItem[];
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  emptyLabel?: string;
  className?: string;
};

export function Dropdown({
  items,
  value,
  defaultValue,
  onChange,
  label = "Options",
  placeholder = "Select an option",
  disabled = false,
  emptyLabel = "Nothing to choose",
  className = "",
}: DropdownProps) {
  const reduced = useReducedMotion();
  const {
    open,
    activeIndex,
    selectedIndex,
    selectedItem,
    rootRef,
    triggerProps,
    listProps,
    getItemProps,
  } = useDropdown({ items, value, defaultValue, onChange, disabled });

  const cell = reduced ? NONE : CELL;

  return (
    <div ref={rootRef} className={`relative inline-block text-left ${className}`}>
      <button
        {...triggerProps}
        className={`flex h-9 select-none items-center gap-2 whitespace-nowrap rounded-[9px] bg-gradient-to-b px-3 text-[13px] font-medium text-neutral-700 outline-none transition-[box-shadow,filter] duration-150 focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4568FF] disabled:opacity-50 dark:text-neutral-200 ${
          open
            ? "from-[#fafafa] to-[#fafafa] shadow-[inset_0_1px_2px_rgba(0,0,0,0.06),0_0_0_1px_rgba(0,0,0,0.12)] dark:from-[#151515] dark:to-[#151515] dark:shadow-[inset_0_1px_2px_rgba(0,0,0,0.4),0_0_0_1px_rgba(255,255,255,0.12)]"
            : "from-white to-[#f5f5f5] shadow-[inset_0_1px_0_rgba(255,255,255,0.95),0_1px_2px_rgba(0,0,0,0.08),0_0_0_1px_rgba(0,0,0,0.12)] hover:brightness-[0.98] dark:from-[#222222] dark:to-[#151515] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.07),0_1px_2px_rgba(0,0,0,0.4),0_0_0_1px_rgba(255,255,255,0.12)] dark:hover:brightness-110"
        }`}
      >
        <span className="sr-only">
          {label}: {selectedItem ? selectedItem.label : placeholder}
        </span>
        <span aria-hidden>{label}</span>
        <motion.svg
          aria-hidden
          viewBox="0 0 12 12"
          className="size-3 shrink-0 text-neutral-500 dark:text-neutral-400"
          initial={false}
          animate={{ rotate: open ? 180 : 0 }}
          transition={reduced ? NONE : NUDGE}
        >
          <path
            d="M3 4.75 6 7.75 9 4.75"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </motion.svg>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.94, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{
              opacity: 0,
              scale: 0.97,
              y: -6,
              transition: reduced ? NONE : { duration: 0.12, ease: EXIT },
            }}
            transition={
              reduced
                ? NONE
                : { ...OPEN, opacity: { duration: 0.12, ease: EASE } }
            }
            style={{ transformOrigin: "top left" }}
            className="absolute left-0 top-[calc(100%+6px)] z-50 min-w-[224px] whitespace-nowrap rounded-[11px] border border-black/[0.12] bg-white p-[5px] shadow-[0_2px_4px_rgba(0,0,0,0.06),0_12px_32px_-8px_rgba(0,0,0,0.14)] dark:border-white/10 dark:bg-[#111111] dark:shadow-[0_28px_56px_-22px_rgba(0,0,0,0.7)]"
          >
            <ul
              {...listProps}
              aria-label={label}
              className="relative max-h-[216px] overflow-y-auto outline-none [scrollbar-gutter:stable]"
            >
              <motion.span
                aria-hidden
                className="pointer-events-none absolute inset-x-0 top-0 h-8 rounded-[7px] bg-neutral-100 dark:bg-[#222222]"
                initial={false}
                animate={{
                  y: activeIndex < 0 ? 0 : activeIndex * ROW_H,
                  opacity: activeIndex < 0 ? 0 : 1,
                }}
                transition={
                  reduced
                    ? NONE
                    : { ...SLIDE, opacity: { duration: 0.1, ease: EASE } }
                }
              />
              {items.map((item, i) => {
                const active = i === activeIndex && !item.disabled;
                const picked = i === selectedIndex;
                return (
                  <li
                    key={item.value}
                    {...getItemProps(i)}
                    className={`relative flex h-8 cursor-default select-none items-center rounded-[7px] px-2.5 text-[13px] ${
                      item.disabled
                        ? "text-neutral-400 dark:text-neutral-600"
                        : active
                          ? "text-neutral-900 dark:text-neutral-100"
                          : "text-neutral-700 dark:text-neutral-300"
                    }`}
                  >
                    <span className="relative flex min-w-0 flex-1 items-center gap-3">
                      <span className="truncate">{item.label}</span>
                      {item.hint ? (
                        <span className="ml-auto shrink-0 font-mono text-[10.5px] text-neutral-500 dark:text-neutral-400">
                          {item.hint}
                        </span>
                      ) : null}
                    </span>
                    <motion.span
                      aria-hidden
                      initial={false}
                      animate={{ opacity: picked ? 1 : 0, scale: picked ? 1 : 0.7 }}
                      transition={cell}
                      className="relative ml-2 flex size-[14px] shrink-0 items-center justify-center text-[#4568FF]"
                    >
                      <svg viewBox="0 0 14 14" className="size-[14px]">
                        <path
                          d="M3 7.4 5.8 10.2 11 4.4"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </motion.span>
                  </li>
                );
              })}

              {items.length === 0 && (
                <li
                  role="presentation"
                  className="flex h-8 items-center px-2.5 text-[13px] text-neutral-500 dark:text-neutral-400"
                >
                  {emptyLabel}
                </li>
              )}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
