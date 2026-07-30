"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { CaretDownIcon } from "@phosphor-icons/react";

const COLLAPSED = 288;
const EXPANDED_MAX = 620;

const OPEN = { type: "spring", stiffness: 150, damping: 27, mass: 1 } as const;
const FADE = { type: "spring", stiffness: 260, damping: 34, mass: 0.8 } as const;

export function CodeSurface({ html, lines }: { html: string; lines: number }) {
  const wrap = useRef<HTMLDivElement>(null);
  const inner = useRef<HTMLDivElement>(null);
  const [full, setFull] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const [settled, setSettled] = useState(false);
  const reduce = useReducedMotion();

  useEffect(() => {
    const el = inner.current;
    if (!el) return;
    const measure = () =>
      setFull((prev) => (prev === el.scrollHeight ? prev : el.scrollHeight));
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [html]);

  const overflows = full > COLLAPSED + 40;
  const open = expanded || !overflows;
  const target = open ? Math.min(full, EXPANDED_MAX) : COLLAPSED;
  const capped = open && full > EXPANDED_MAX;

  function toggle() {
    setSettled(false);
    if (!expanded) {
      setExpanded(true);
      return;
    }
    setExpanded(false);
    const el = wrap.current;
    if (!el) return;
    requestAnimationFrame(() => {
      if (el.getBoundingClientRect().top < 72) {
        el.scrollIntoView({
          block: "start",
          behavior: reduce ? "auto" : "smooth",
        });
      }
    });
  }

  return (
    <div ref={wrap} className="relative scroll-mt-24">
      <motion.div
        className={`mat-well relative rounded-[10px] ${
          settled && capped ? "overflow-y-auto" : "overflow-hidden"
        }`}
        initial={false}
        animate={full ? { height: target } : {}}
        transition={reduce ? { duration: 0 } : OPEN}
        onAnimationComplete={() => setSettled(true)}
        style={{ overflowAnchor: "none", contain: "paint" }}
      >
        <div
          ref={inner}
          className="overflow-x-auto py-3.5 text-[12.5px] leading-[1.7]"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </motion.div>

      {overflows && (
        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 h-[104px] rounded-b-[10px]"
          style={{
            background:
              "linear-gradient(to bottom, transparent, var(--well) 78%)",
          }}
          initial={false}
          animate={{ opacity: expanded ? 0 : 1 }}
          transition={reduce ? { duration: 0 } : FADE}
        />
      )}

      {overflows && (
        <motion.div
          className="pointer-events-none absolute inset-x-0 bottom-3 flex justify-center"
          initial={false}
          animate={{ y: expanded ? 24 : 0 }}
          transition={reduce ? { duration: 0 } : OPEN}
        >
          <button
            type="button"
            onClick={toggle}
            className="mat-cap press pointer-events-auto inline-flex h-[26px] items-center gap-1.5 rounded-[7px] pl-2.5 pr-2 text-[11.5px] font-medium text-ink-2 hover:text-ink"
          >
            {expanded ? "Collapse" : `Show all ${lines} lines`}
            <motion.span
              className="flex items-center"
              initial={false}
              animate={{ rotate: expanded ? 180 : 0 }}
              transition={reduce ? { duration: 0 } : FADE}
            >
              <CaretDownIcon size={10} weight="bold" />
            </motion.span>
          </button>
        </motion.div>
      )}
    </div>
  );
}
