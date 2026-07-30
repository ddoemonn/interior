"use client";

import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { motion, useReducedMotion } from "motion/react";

const DISCLOSE = { type: "spring", stiffness: 380, damping: 38, mass: 0.7 } as const;
const CROSSFADE = { type: "spring", stiffness: 260, damping: 34, mass: 0.8 } as const;
const CELL = { type: "spring", stiffness: 520, damping: 34, mass: 0.45 } as const;
const INSTANT = { duration: 0 } as const;

const COLLAPSED = 40;
const TEXT_LEFT = 34;
const CLEAR_SLOT = 35;
const COUNT_SLOT = 38;
const ANNOUNCE_DELAY = 500;

const useIsomorphicLayoutEffect =
  typeof window === "undefined" ? useEffect : useLayoutEffect;

export type UseExpandingSearchOptions = {
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  onSearch?: (value: string) => void;
  onSubmit?: (value: string) => void;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  debounce?: number;
  collapseOnBlur?: boolean;
  disabled?: boolean;
};

export type UseExpandingSearchReturn = {
  open: boolean;
  focused: boolean;
  query: string;
  expand: () => void;
  collapse: (returnFocus?: boolean) => void;
  toggle: () => void;
  clear: () => void;
  inputRef: React.RefObject<HTMLInputElement | null>;
  triggerRef: React.RefObject<HTMLButtonElement | null>;
  rootProps: {
    onFocus: (event: React.FocusEvent<HTMLElement>) => void;
    onBlur: (event: React.FocusEvent<HTMLElement>) => void;
  };
  triggerProps: {
    ref: React.RefObject<HTMLButtonElement | null>;
    type: "button";
    disabled: boolean;
    tabIndex: number;
    "aria-expanded": boolean;
    onClick: () => void;
  };
  inputProps: {
    ref: React.RefObject<HTMLInputElement | null>;
    value: string;
    disabled: boolean;
    tabIndex: number;
    onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    onKeyDown: (event: React.KeyboardEvent<HTMLInputElement>) => void;
    onFocus: () => void;
  };
};

export function useExpandingSearch({
  value,
  defaultValue = "",
  onChange,
  onSearch,
  onSubmit,
  open,
  defaultOpen = false,
  onOpenChange,
  debounce = 220,
  collapseOnBlur = true,
  disabled = false,
}: UseExpandingSearchOptions = {}): UseExpandingSearchReturn {
  const [ownValue, setOwnValue] = useState(defaultValue);
  const [ownOpen, setOwnOpen] = useState(defaultOpen);
  const [focused, setFocused] = useState(false);

  const query = value ?? ownValue;
  const isOpen = open ?? ownOpen;

  const inputRef = useRef<HTMLInputElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const openRef = useRef(isOpen);

  const latest = useRef({ query, onChange, onSearch, onSubmit, onOpenChange });
  latest.current = { query, onChange, onSearch, onSubmit, onOpenChange };

  useEffect(() => {
    openRef.current = isOpen;
  }, [isOpen]);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  const setOpen = useCallback((next: boolean) => {
    if (openRef.current === next) return;
    openRef.current = next;
    setOwnOpen(next);
    latest.current.onOpenChange?.(next);
  }, []);

  const commit = useCallback(
    (next: string) => {
      setOwnValue(next);
      latest.current.onChange?.(next);
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => {
        timer.current = null;
        latest.current.onSearch?.(next);
      }, debounce);
    },
    [debounce],
  );

  const flush = useCallback(() => {
    if (!timer.current) return;
    clearTimeout(timer.current);
    timer.current = null;
    latest.current.onSearch?.(latest.current.query);
  }, []);

  const expand = useCallback(() => {
    if (disabled) return;
    setOpen(true);
    inputRef.current?.focus();
  }, [disabled, setOpen]);

  const collapse = useCallback(
    (returnFocus = false) => {
      setOpen(false);
      if (returnFocus) triggerRef.current?.focus();
    },
    [setOpen],
  );

  const toggle = useCallback(() => {
    if (openRef.current) collapse(true);
    else expand();
  }, [collapse, expand]);

  const clear = useCallback(() => {
    commit("");
    inputRef.current?.focus();
  }, [commit]);

  const onRootFocus = useCallback(() => setFocused(true), []);

  const onRootBlur = useCallback(
    (event: React.FocusEvent<HTMLElement>) => {
      const next = event.relatedTarget as Node | null;
      if (next && event.currentTarget.contains(next)) return;
      setFocused(false);
      if (!collapseOnBlur) return;
      if (!document.hasFocus()) return;
      if (latest.current.query.length > 0) return;
      setOpen(false);
    },
    [collapseOnBlur, setOpen],
  );

  const onInputKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key === "Escape") {
        event.preventDefault();
        event.stopPropagation();
        if (latest.current.query.length > 0) {
          commit("");
          return;
        }
        collapse(true);
        return;
      }
      if (event.key === "Enter") {
        event.preventDefault();
        flush();
        latest.current.onSubmit?.(latest.current.query);
      }
    },
    [collapse, commit, flush],
  );

  const onInputFocus = useCallback(() => setOpen(true), [setOpen]);

  const onInputChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => commit(event.currentTarget.value),
    [commit],
  );

  return {
    open: isOpen,
    focused,
    query,
    expand,
    collapse,
    toggle,
    clear,
    inputRef,
    triggerRef,
    rootProps: { onFocus: onRootFocus, onBlur: onRootBlur },
    triggerProps: {
      ref: triggerRef,
      type: "button",
      disabled,
      tabIndex: isOpen ? -1 : 0,
      "aria-expanded": isOpen,
      onClick: expand,
    },
    inputProps: {
      ref: inputRef,
      value: query,
      disabled,
      tabIndex: isOpen ? 0 : -1,
      onChange: onInputChange,
      onKeyDown: onInputKeyDown,
      onFocus: onInputFocus,
    },
  };
}

export type ExpandingSearchProps = UseExpandingSearchOptions & {
  label?: string;
  placeholder?: string;
  resultCount?: number;
  align?: "left" | "right";
  className?: string;
};

export function ExpandingSearch({
  label = "Search",
  placeholder = "Search",
  resultCount,
  align = "right",
  className = "",
  ...options
}: ExpandingSearchProps) {
  const reduced = useReducedMotion();
  const auto = useId();
  const inputId = `${auto}-field`;

  const {
    open,
    focused,
    query,
    clear,
    inputRef,
    rootProps,
    triggerProps,
    inputProps,
  } = useExpandingSearch(options);

  const trackRef = useRef<HTMLDivElement | null>(null);
  const [track, setTrack] = useState(0);

  useIsomorphicLayoutEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    const read = (w: number) =>
      setTrack((prev) => (Math.abs(prev - w) < 0.5 ? prev : w));
    read(el.getBoundingClientRect().width);
    const observer = new ResizeObserver((entries) => {
      const box = entries[0];
      if (box) read(box.contentRect.width);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const [announced, setAnnounced] = useState("");
  useEffect(() => {
    const id = setTimeout(() => {
      if (!open || query.length === 0 || resultCount === undefined) {
        setAnnounced("");
        return;
      }
      setAnnounced(
        `${resultCount} ${resultCount === 1 ? "result" : "results"} for ${query}`,
      );
    }, ANNOUNCE_DELAY);
    return () => clearTimeout(id);
  }, [open, query, resultCount]);

  const expanded = Math.max(COLLAPSED, track);
  const rightInset = CLEAR_SLOT + (resultCount === undefined ? 0 : COUNT_SLOT);
  const inner = Math.max(0, expanded - TEXT_LEFT - rightInset);
  const filled = query.length > 0;
  const shellMotion = reduced ? INSTANT : DISCLOSE;
  const fadeMotion = reduced ? INSTANT : CROSSFADE;
  const cellMotion = reduced ? INSTANT : CELL;

  return (
    <div
      ref={trackRef}
      role="search"
      className={`relative h-10 w-full ${className}`}
      {...rootProps}
    >
      <motion.div
        initial={false}
        animate={{ width: open ? expanded : COLLAPSED }}
        transition={shellMotion}
        onMouseDown={(event) => {
          if (event.target !== event.currentTarget) return;
          event.preventDefault();
          if (open) inputRef.current?.focus();
        }}
        className={`absolute inset-y-0 ${
          align === "right" ? "right-0" : "left-0"
        } overflow-hidden rounded-[10px] border-2 transition-[background-color,border-color,box-shadow] duration-150 ${
          focused
            ? "border-[#4568FF] bg-white dark:border-[#93B0FF] dark:bg-[#252522]"
            : "border-stone-200 bg-stone-100/70 shadow-[inset_0_1px_2px_rgba(28,25,23,0.07)] dark:border-white/[0.08] dark:bg-[#1D1D1A] dark:shadow-[inset_0_1px_2px_rgba(0,0,0,0.45)]"
        }`}
      >
        <motion.input
          {...inputProps}
          id={inputId}
          type="search"
          placeholder={placeholder}
          aria-label={label}
          aria-describedby={`${auto}-live`}
          autoComplete="off"
          spellCheck={false}
          enterKeyHint="search"
          style={{ width: inner, left: TEXT_LEFT }}
          initial={false}
          animate={{ opacity: open ? 1 : 0 }}
          transition={
            reduced ? INSTANT : { ...CROSSFADE, delay: open ? 0.06 : 0 }
          }
          className="absolute inset-y-0 bg-transparent text-[13px] leading-9 text-stone-700 outline-none focus-visible:outline-none placeholder:text-stone-400 dark:text-stone-200 dark:placeholder:text-stone-500 [&::-webkit-search-cancel-button]:appearance-none [&::-webkit-search-decoration]:appearance-none"
        />

        <motion.div
          initial={false}
          animate={{ opacity: open ? 1 : 0 }}
          transition={fadeMotion}
          className="pointer-events-none absolute inset-y-0 right-[7px] flex items-center gap-1.5"
        >
          {resultCount === undefined ? null : (
            <span
              aria-hidden
              className="w-8 truncate text-right font-mono text-[9.5px] tabular-nums text-stone-500 dark:text-stone-400"
            >
              {filled ? resultCount : ""}
            </span>
          )}

          <motion.button
            type="button"
            onClick={clear}
            tabIndex={open && filled ? 0 : -1}
            aria-label="Clear search"
            aria-controls={inputId}
            initial={false}
            animate={{ opacity: filled ? 1 : 0, scale: filled ? 1 : 0.86 }}
            transition={cellMotion}
            className={`grid size-[22px] place-items-center rounded-[6px] text-stone-500 outline-none focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[#4568FF] dark:text-stone-400 dark:focus-visible:outline-[#93B0FF] ${
              open && filled ? "pointer-events-auto" : ""
            }`}
          >
            <svg width="11" height="11" viewBox="0 0 11 11" fill="none" aria-hidden>
              <path
                d="M1.7 1.7 L9.3 9.3 M9.3 1.7 L1.7 9.3"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </motion.button>
        </motion.div>

      </motion.div>

      <motion.button
        {...triggerProps}
        aria-label={label}
        aria-controls={inputId}
        initial={false}
        animate={{
          x: align === "right" && open ? -(expanded - COLLAPSED) : 0,
        }}
        transition={shellMotion}
        className={`absolute inset-y-0 z-10 grid w-10 place-items-center rounded-[8px] text-stone-500 outline-none focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[#4568FF] disabled:opacity-50 dark:text-stone-400 dark:focus-visible:outline-[#93B0FF] ${
          align === "right" ? "right-0" : "left-0"
        } ${open ? "pointer-events-none" : ""}`}
      >
        <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden>
          <circle cx="6.4" cy="6.4" r="4.5" stroke="currentColor" strokeWidth="1.4" />
          <path
            d="M9.8 9.8 L13.2 13.2"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
          />
        </svg>
      </motion.button>

      <span id={`${auto}-live`} aria-live="polite" className="sr-only">
        {announced}
      </span>
    </div>
  );
}
