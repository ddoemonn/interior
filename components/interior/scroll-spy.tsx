"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";

const CELL = { type: "spring", stiffness: 520, damping: 34, mass: 0.45 } as const;
const SETTLE = 420;
const RELEASE = 900;

export type ScrollSpySection = {
  id: string;
  label: string;
};

export type UseScrollSpyOptions = {
  sections: ScrollSpySection[];
  offset?: number;
  root?: React.RefObject<HTMLElement | null>;
  onChange?: (id: string) => void;
};

export function useScrollSpy({
  sections,
  offset = 96,
  root,
  onChange,
}: UseScrollSpyOptions) {
  const reduced = useReducedMotion();

  const [activeId, setActiveId] = useState(() => sections[0]?.id ?? "");
  const [announce, setAnnounce] = useState("");

  const list = useRef(sections);
  list.current = sections;
  const emit = useRef(onChange);
  emit.current = onChange;

  const frame = useRef(0);
  const lock = useRef<string | null>(null);
  const lockTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const settleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const started = useRef(false);

  const key = sections.map((s) => s.id).join("|");

  const measure = useCallback(() => {
    const items = list.current;
    if (items.length === 0) return "";

    const container = root?.current ?? null;

    const viewport = container ? container.clientHeight : window.innerHeight;
    const top = container ? container.scrollTop : window.scrollY;
    const max = container
      ? container.scrollHeight - container.clientHeight
      : document.documentElement.scrollHeight - window.innerHeight;
    const ratio = max > 0 ? Math.min(1, Math.max(0, top / max)) : 1;

    const line =
      (container ? container.getBoundingClientRect().top : 0) +
      offset +
      ratio * Math.max(0, viewport - offset - 1);

    let current = "";
    let last = "";

    for (const item of items) {
      const node = document.getElementById(item.id);
      if (!node) continue;
      last = item.id;
      if (!current) current = item.id;
      if (node.getBoundingClientRect().top <= line + 1) current = item.id;
    }

    const atEnd = container
      ? container.scrollTop + container.clientHeight >= container.scrollHeight - 2
      : window.scrollY + window.innerHeight >=
        document.documentElement.scrollHeight - 2;

    return atEnd && last ? last : current;
  }, [offset, root]);

  const release = useCallback(() => {
    lock.current = null;
    if (lockTimer.current) {
      clearTimeout(lockTimer.current);
      lockTimer.current = null;
    }
  }, []);

  const sync = useCallback(() => {
    if (frame.current) return;
    frame.current = requestAnimationFrame(() => {
      frame.current = 0;
      const next = measure();
      if (!next) return;
      if (lock.current) {
        if (lock.current === next) release();
        return;
      }
      setActiveId((prev) => (prev === next ? prev : next));
    });
  }, [measure, release]);

  useEffect(() => {
    const container = root?.current ?? null;
    const scroller: EventTarget = container ?? window;
    const abandon = () => {
      if (lock.current) release();
    };

    scroller.addEventListener("scroll", sync, { passive: true });
    window.addEventListener("resize", sync);
    window.addEventListener("wheel", abandon, { passive: true });
    window.addEventListener("touchstart", abandon, { passive: true });

    const observer = new ResizeObserver(sync);
    observer.observe(container ?? document.documentElement);
    for (const id of key ? key.split("|") : []) {
      const node = document.getElementById(id);
      if (node) observer.observe(node);
    }

    sync();

    return () => {
      scroller.removeEventListener("scroll", sync);
      window.removeEventListener("resize", sync);
      window.removeEventListener("wheel", abandon);
      window.removeEventListener("touchstart", abandon);
      observer.disconnect();
      cancelAnimationFrame(frame.current);
      frame.current = 0;
      if (lockTimer.current) clearTimeout(lockTimer.current);
    };
  }, [sync, release, key, root]);

  useEffect(() => {
    if (!activeId) return;
    emit.current?.(activeId);

    if (!started.current) {
      started.current = true;
      return;
    }

    settleTimer.current = setTimeout(() => {
      const item = list.current.find((s) => s.id === activeId);
      setAnnounce(item ? item.label : "");
    }, SETTLE);

    return () => {
      if (settleTimer.current) clearTimeout(settleTimer.current);
    };
  }, [activeId]);

  const scrollTo = useCallback(
    (id: string) => {
      const node = document.getElementById(id);
      if (!node) return;

      lock.current = id;
      setActiveId(id);

      const container = root?.current ?? null;
      const behavior: ScrollBehavior = reduced ? "auto" : "smooth";
      const rect = node.getBoundingClientRect();

      const viewport = container ? container.clientHeight : window.innerHeight;
      const max = container
        ? Math.max(0, container.scrollHeight - container.clientHeight)
        : Math.max(
            0,
            document.documentElement.scrollHeight - window.innerHeight,
          );
      const H = container
        ? rect.top -
          container.getBoundingClientRect().top +
          container.scrollTop
        : rect.top + window.scrollY;
      const usable = Math.max(0, viewport - offset - 1);
      const top =
        max > 0
          ? Math.min(max, Math.max(0, (H - offset) / (1 + usable / max)))
          : 0;

      if (container) container.scrollTo({ top, behavior });
      else window.scrollTo({ top, behavior });

      if (!node.hasAttribute("tabindex")) node.setAttribute("tabindex", "-1");
      node.focus({ preventScroll: true });

      if (lockTimer.current) clearTimeout(lockTimer.current);
      lockTimer.current = setTimeout(() => {
        lock.current = null;
        lockTimer.current = null;
        sync();
      }, RELEASE);
    },
    [offset, reduced, root, sync],
  );

  const getLinkProps = useCallback(
    (id: string) => ({
      href: `#${id}`,
      "aria-current": id === activeId ? ("location" as const) : undefined,
      onClick: (e: React.MouseEvent<HTMLAnchorElement>) => {
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
        e.preventDefault();
        scrollTo(id);
      },
    }),
    [activeId, scrollTo],
  );

  const activeIndex = sections.findIndex((s) => s.id === activeId);

  return { activeId, activeIndex, scrollTo, getLinkProps, announce };
}

export type ScrollSpyProps = {
  sections: ScrollSpySection[];
  offset?: number;
  root?: React.RefObject<HTMLElement | null>;
  onChange?: (id: string) => void;
  label?: string;
  className?: string;
};

export function ScrollSpy({
  sections,
  offset = 96,
  root,
  onChange,
  label = "On this page",
  className = "",
}: ScrollSpyProps) {
  const { activeId, getLinkProps, announce } = useScrollSpy({
    sections,
    offset,
    root,
    onChange,
  });
  const reduced = useReducedMotion();
  const thumbId = useId();
  const chips = useRef(new Map<string, HTMLElement>());

  useEffect(() => {
    chips.current.get(activeId)?.scrollIntoView({
      behavior: reduced ? "auto" : "smooth",
      block: "nearest",
      inline: "nearest",
    });
  }, [activeId, reduced]);

  return (
    <nav aria-label={label} className={`w-full ${className}`}>
      <div className="rounded-[10px] bg-stone-100/80 p-1 shadow-[inset_0_1px_2px_rgba(28,25,23,0.07)] dark:bg-[#1D1D1A] dark:shadow-[inset_0_1px_2px_rgba(0,0,0,0.45)]">
        <ol className="flex gap-1 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {sections.map((section) => {
            const active = section.id === activeId;
            return (
              <li
                key={section.id}
                ref={(el) => {
                  if (el) chips.current.set(section.id, el);
                  else chips.current.delete(section.id);
                }}
                className="relative flex-[1_0_auto]"
              >
                {active ? (
                  <motion.span
                    layoutId={reduced ? undefined : thumbId}
                    aria-hidden
                    transition={CELL}
                    className="absolute inset-0 rounded-[6px] bg-stone-800 dark:bg-stone-100"
                  />
                ) : null}

                <a
                  {...getLinkProps(section.id)}
                  className="group relative flex h-7 w-full items-center justify-center rounded-[6px] px-2.5 text-[12.5px] outline-none after:pointer-events-none after:absolute after:inset-0 after:rounded-[6px] focus-visible:after:bg-[#4568FF]/[0.06] focus-visible:after:shadow-[inset_0_0_0_1px_#4568FF] dark:focus-visible:after:bg-[#93B0FF]/[0.1] dark:focus-visible:after:shadow-[inset_0_0_0_1px_#93B0FF]"
                >
                  <span className="relative grid">
                    <span
                      aria-hidden
                      className="invisible col-start-1 row-start-1 whitespace-nowrap font-medium"
                    >
                      {section.label}
                    </span>
                    <span
                      className={`col-start-1 row-start-1 whitespace-nowrap transition-colors duration-150 ${
                        active
                          ? "font-medium text-white dark:text-stone-900"
                          : "text-stone-500 group-hover:text-stone-700 dark:text-stone-400 dark:group-hover:text-stone-200"
                      }`}
                    >
                      {section.label}
                    </span>
                  </span>
                </a>
              </li>
            );
          })}
        </ol>
      </div>
      <p aria-live="polite" className="sr-only">
        {announce}
      </p>
    </nav>
  );
}
