"use client";

import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent as ReactKeyboardEvent,
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

const EASE = [0.23, 1, 0.32, 1] as const;

const EXIT = [0.4, 0, 1, 1] as const;

const ITEM_H = 32;
const SEP_H = 9;
const PAD = 5;
const BORDER = 1;

export type ContextMenuItem =
  | { id: string; type: "separator" }
  | {
      id: string;
      type?: "item";
      label: string;
      shortcut?: string;
      icon?: ReactNode;
      disabled?: boolean;
      onSelect?: (id: string) => void;
    };

export type ContextMenuPlacement = {
  left: number;
  top: number;
  width: number;
  maxHeight: number;
  transformOrigin: string;
};

export type UseContextMenuOptions = {
  items: ContextMenuItem[];
  onSelect?: (id: string) => void;
  width?: number;
  margin?: number;
  holdDuration?: number;
  moveTolerance?: number;
  disabled?: boolean;
};

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), Math.max(min, max));
}

function measure(items: ContextMenuItem[]) {
  let height = PAD * 2 + BORDER * 2;
  for (const item of items) height += item.type === "separator" ? SEP_H : ITEM_H;
  return height;
}

export function useContextMenu({
  items,
  onSelect,
  width = 224,
  margin = 8,
  holdDuration = 460,
  moveTolerance = 8,
  disabled = false,
}: UseContextMenuOptions) {
  const [placement, setPlacement] = useState<ContextMenuPlacement | null>(null);
  const [active, setActive] = useState(-1);

  const triggerRef = useRef<HTMLDivElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const opened = useRef(false);
  const activeRef = useRef(-1);
  const hold = useRef<ReturnType<typeof setTimeout> | null>(null);
  const holdFrom = useRef<{ x: number; y: number } | null>(null);
  const swallowClick = useRef(false);
  const pressed = useRef(-1);
  const query = useRef("");
  const queryTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  activeRef.current = active;

  const list = useRef(items);
  list.current = items;
  const emit = useRef(onSelect);
  emit.current = onSelect;

  const height = useMemo(() => measure(items), [items]);

  const steps = useMemo(
    () =>
      items.reduce<number[]>((acc, item, index) => {
        if (item.type !== "separator" && !item.disabled) acc.push(index);
        return acc;
      }, []),
    [items],
  );
  const stepsRef = useRef(steps);
  stepsRef.current = steps;

  const clearHold = useCallback(() => {
    if (hold.current !== null) clearTimeout(hold.current);
    hold.current = null;
    holdFrom.current = null;
  }, []);

  const close = useCallback(
    (restoreFocus = false) => {
      clearHold();
      if (!opened.current) return;
      opened.current = false;
      setPlacement(null);
      setActive(-1);
      if (restoreFocus) triggerRef.current?.focus({ preventScroll: true });
    },
    [clearHold],
  );

  const openAt = useCallback(
    (x: number, y: number, source: "pointer" | "keyboard" = "pointer") => {
      if (disabled || list.current.length === 0) return;

      const vw = document.documentElement.clientWidth;
      const vh = document.documentElement.clientHeight;
      const w = Math.min(width, Math.max(160, vw - margin * 2));
      const cap = Math.max(ITEM_H + PAD * 2, vh - margin * 2);
      const h = Math.min(height, cap);

      const left = clamp(x + w + margin <= vw ? x : x - w, margin, vw - w - margin);
      const top = clamp(y + h + margin <= vh ? y : y - h, margin, vh - h - margin);

      opened.current = true;
      pressed.current = -1;
      setPlacement({
        left,
        top,
        width: w,
        maxHeight: cap,
        transformOrigin: `${clamp(x - left, 0, w)}px ${clamp(y - top, 0, h)}px`,
      });
      setActive(source === "keyboard" ? (stepsRef.current[0] ?? -1) : -1);
    },
    [disabled, height, margin, width],
  );

  const choose = useCallback(
    (index: number) => {
      const item = list.current[index];
      if (!item || item.type === "separator" || item.disabled) return;
      close(true);
      item.onSelect?.(item.id);
      emit.current?.(item.id);
    },
    [close],
  );

  const step = useCallback((dir: 1 | -1) => {
    const order = stepsRef.current;
    if (order.length === 0) return;
    const at = order.indexOf(activeRef.current);
    setActive(
      at === -1
        ? (dir === 1 ? order[0] : order[order.length - 1])
        : order[(at + dir + order.length) % order.length],
    );
  }, []);

  const edge = useCallback((which: "first" | "last") => {
    const order = stepsRef.current;
    if (order.length === 0) return;
    setActive(which === "first" ? order[0] : order[order.length - 1]);
  }, []);

  const typeahead = useCallback((char: string) => {
    query.current += char.toLowerCase();
    if (queryTimer.current !== null) clearTimeout(queryTimer.current);
    queryTimer.current = setTimeout(() => {
      query.current = "";
    }, 600);

    const order = stepsRef.current;
    const from = order.indexOf(activeRef.current) + 1;
    for (let k = 0; k < order.length; k += 1) {
      const index = order[(from + k) % order.length];
      const item = list.current[index];
      if (item.type !== "separator" && item.label.toLowerCase().startsWith(query.current)) {
        setActive(index);
        return;
      }
    }
  }, []);

  const isOpen = placement !== null;

  useEffect(() => {
    if (!isOpen) return;
    const node = activeRef.current >= 0 ? itemRefs.current[activeRef.current] : menuRef.current;
    node?.focus({ preventScroll: true });
    if (activeRef.current >= 0) node?.scrollIntoView({ block: "nearest" });
  }, [isOpen, active]);

  useEffect(() => {
    if (!isOpen) return;

    const inside = (target: EventTarget | null) =>
      menuRef.current?.contains(target as Node) ?? false;

    const onDown = (event: PointerEvent) => {
      if (inside(event.target)) return;
      if (event.button === 2 && triggerRef.current?.contains(event.target as Node)) return;
      close(false);
    };
    const onScroll = (event: Event) => {
      if (inside(event.target)) return;
      close(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      event.stopPropagation();
      close(true);
    };
    const bail = () => close(false);

    document.addEventListener("pointerdown", onDown, true);
    document.addEventListener("scroll", onScroll, { capture: true, passive: true });
    document.addEventListener("keydown", onKey, true);
    window.addEventListener("resize", bail);
    window.addEventListener("blur", bail);

    return () => {
      document.removeEventListener("pointerdown", onDown, true);
      document.removeEventListener("scroll", onScroll, { capture: true });
      document.removeEventListener("keydown", onKey, true);
      window.removeEventListener("resize", bail);
      window.removeEventListener("blur", bail);
    };
  }, [isOpen, close]);

  useEffect(
    () => () => {
      if (hold.current !== null) clearTimeout(hold.current);
      if (queryTimer.current !== null) clearTimeout(queryTimer.current);
    },
    [],
  );

  const triggerProps = {
    tabIndex: disabled ? -1 : 0,
    "aria-haspopup": "menu" as const,
    "aria-expanded": isOpen,
    style: { touchAction: "manipulation", WebkitTouchCallout: "none" } as CSSProperties,
    onContextMenu: (event: ReactMouseEvent<HTMLElement>) => {
      if (disabled) return;
      event.preventDefault();
      event.stopPropagation();
      clearHold();
      triggerRef.current = event.currentTarget as HTMLDivElement;
      openAt(event.clientX, event.clientY, "pointer");
    },
    onKeyDown: (event: ReactKeyboardEvent<HTMLElement>) => {
      if (disabled || opened.current) return;
      const wants =
        event.key === "ContextMenu" ||
        (event.shiftKey && event.key === "F10") ||
        (event.key === "Enter" && event.target === event.currentTarget);
      if (!wants) return;
      event.preventDefault();
      const rect = event.currentTarget.getBoundingClientRect();
      openAt(Math.round(rect.left + 14), Math.round(rect.top + 14), "keyboard");
    },
    onPointerDown: (event: ReactPointerEvent<HTMLElement>) => {
      if (disabled || event.pointerType === "mouse" || opened.current) return;
      const x = event.clientX;
      const y = event.clientY;
      triggerRef.current = event.currentTarget as HTMLDivElement;
      holdFrom.current = { x, y };
      hold.current = setTimeout(() => {
        hold.current = null;
        swallowClick.current = true;
        navigator.vibrate?.(10);
        openAt(x, y, "pointer");
      }, holdDuration);
    },
    onPointerMove: (event: ReactPointerEvent<HTMLElement>) => {
      const from = holdFrom.current;
      if (hold.current === null || !from) return;
      if (Math.hypot(event.clientX - from.x, event.clientY - from.y) > moveTolerance) clearHold();
    },
    onPointerUp: clearHold,
    onPointerCancel: clearHold,
    onPointerLeave: clearHold,
    onClick: (event: ReactMouseEvent<HTMLElement>) => {
      if (!swallowClick.current) return;
      swallowClick.current = false;
      event.preventDefault();
      event.stopPropagation();
    },
  };

  const menuProps = {
    role: "menu" as const,
    tabIndex: -1,
    "aria-orientation": "vertical" as const,
    onContextMenu: (event: ReactMouseEvent) => event.preventDefault(),
    onKeyDown: (event: ReactKeyboardEvent) => {
      if (event.key === "ArrowDown" || event.key === "ArrowUp") {
        event.preventDefault();
        step(event.key === "ArrowDown" ? 1 : -1);
        return;
      }
      if (event.key === "Home" || event.key === "End") {
        event.preventDefault();
        edge(event.key === "Home" ? "first" : "last");
        return;
      }
      if (event.key === "Tab") {
        event.preventDefault();
        close(true);
        return;
      }
      if (
        event.key.length === 1 &&
        event.key !== " " &&
        !event.metaKey &&
        !event.ctrlKey &&
        !event.altKey
      ) {
        typeahead(event.key);
      }
    },
  };

  const getItemProps = (index: number) => ({
    ref: (node: HTMLButtonElement | null) => {
      itemRefs.current[index] = node;
    },
    role: "menuitem" as const,
    tabIndex: -1,
    onPointerMove: () => {
      const item = list.current[index];
      if (activeRef.current === index || item.type === "separator" || item.disabled) return;
      setActive(index);
    },
    onPointerDown: () => {
      pressed.current = index;
    },
    onClick: (event: ReactMouseEvent) => {
      if (event.detail !== 0 && pressed.current !== index) return;
      pressed.current = -1;
      choose(index);
    },
  });

  return {
    isOpen,
    active,
    placement,
    openAt,
    close,
    triggerRef,
    triggerProps,
    menuRef,
    menuProps,
    getItemProps,
  };
}

export type ContextMenuProps = {
  items: ContextMenuItem[];
  children: ReactNode;
  onSelect?: (id: string) => void;
  label?: string;
  width?: number;
  disabled?: boolean;
  className?: string;
};

export function ContextMenu({
  items,
  children,
  onSelect,
  label = "Context menu",
  width = 224,
  disabled = false,
  className = "",
}: ContextMenuProps) {
  const uid = useId();
  const reduced = useReducedMotion();

  const [host, setHost] = useState<HTMLElement | null>(null);
  useEffect(() => setHost(document.body), []);

  const {
    isOpen,
    active,
    placement,
    triggerRef,
    triggerProps,
    menuRef,
    menuProps,
    getItemProps,
  } = useContextMenu({ items, onSelect, width, disabled });

  const hasIcons = items.some((item) => item.type !== "separator" && item.icon);

  const menuId = `${uid}-menu`;

  return (
    <>
      <div
        ref={triggerRef}
        {...triggerProps}
        aria-controls={isOpen ? menuId : undefined}
        aria-describedby={`${uid}-hint`}
        className={`outline-none focus-visible:bg-[#4568FF]/[0.06] focus-visible:shadow-[inset_0_0_0_1px_#4568FF] dark:focus-visible:bg-[#93B0FF]/[0.08] dark:focus-visible:shadow-[inset_0_0_0_1px_#93B0FF] ${className}`}
      >
        {children}
        <span id={`${uid}-hint`} className="sr-only">
          Right-click, or press Shift plus F10, for options
        </span>
      </div>
      <Portal host={host}>
      <AnimatePresence>
        {placement ? (
          <motion.div
            key={menuId}
            ref={menuRef}
            id={menuId}
            {...menuProps}
            aria-label={label}
            initial={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={
              reduced
                ? { opacity: 0, transition: { duration: 0 } }
                : { opacity: 0, scale: 0.98, transition: { duration: 0.14, ease: EXIT } }
            }
            transition={reduced ? { duration: 0 } : { duration: 0.2, ease: EASE }}
            style={{
              position: "fixed",
              left: placement.left,
              top: placement.top,
              width: placement.width,
              maxHeight: placement.maxHeight,
              transformOrigin: placement.transformOrigin,
              zIndex: 60,
            }}
            className="overflow-y-auto overscroll-contain rounded-[14px] border border-stone-200 bg-white p-[5px] shadow-[0_1px_2px_rgba(28,25,23,0.06),0_16px_36px_-18px_rgba(28,25,23,0.5)] outline-none dark:border-white/[0.16] dark:bg-[#1D1D1A] dark:shadow-[0_2px_12px_rgba(0,0,0,0.6)]"
          >
            {items.map((item, index) =>
              item.type === "separator" ? (
                <div key={item.id} className="px-1 py-1">
                  <hr className="h-px border-0 bg-stone-200 dark:bg-white/10" />
                </div>
              ) : (
                <button
                  key={item.id}
                  type="button"
                  aria-disabled={item.disabled || undefined}
                  {...getItemProps(index)}
                  className={`flex h-[32px] w-full cursor-default select-none items-center gap-2 rounded-[7px] px-2.5 text-left text-[13px] outline-none ${
                    item.disabled
                      ? "text-stone-400 dark:text-stone-500"
                      : "text-stone-700 dark:text-stone-200"
                  } ${active === index ? "bg-stone-100 dark:bg-white/10" : ""}`}
                >
                  {hasIcons ? (
                    <span
                      aria-hidden
                      className="grid size-4 shrink-0 place-items-center text-stone-500 dark:text-stone-400"
                    >
                      {item.icon}
                    </span>
                  ) : null}

                  <span className="min-w-0 flex-1 truncate">{item.label}</span>
                  {item.shortcut ? (
                    <span
                      aria-hidden
                      className="shrink-0 font-mono text-[10.5px] tabular-nums text-stone-500 dark:text-stone-400"
                    >
                      {item.shortcut}
                    </span>
                  ) : null}
                </button>
              ),
            )}
          </motion.div>
        ) : null}
      </AnimatePresence>
      </Portal>
    </>
  );
}

function Portal({
  host,
  children,
}: {
  host: HTMLElement | null;
  children: ReactNode;
}) {
  if (!host) return null;
  return createPortal(children, host);
}
