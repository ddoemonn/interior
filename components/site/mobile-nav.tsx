"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Sidebar } from "@/components/site/sidebar";

const SHEET = { type: "spring", stiffness: 300, damping: 32, mass: 0.8 } as const;
const LEAVE = { duration: 0.16, ease: [0.4, 0, 1, 1] } as const;
const STILL = { duration: 0 } as const;

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const [host, setHost] = useState<HTMLElement | null>(null);
  const reduced = useReducedMotion() === true;
  const pathname = usePathname();
  const opener = useRef<HTMLButtonElement | null>(null);
  const wasOpen = useRef(false);

  useEffect(() => {
    setHost(document.body);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (open) {
      wasOpen.current = true;
      const previous = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      const onKey = (e: KeyboardEvent) => {
        if (e.key === "Escape") setOpen(false);
      };
      window.addEventListener("keydown", onKey);
      return () => {
        document.body.style.overflow = previous;
        window.removeEventListener("keydown", onKey);
      };
    }
    if (wasOpen.current) {
      wasOpen.current = false;
      opener.current?.focus();
    }
  }, [open]);

  const overlay = (
    <AnimatePresence>
      {open ? (
        <>
          <motion.button
            key="scrim"
            type="button"
            aria-label="Close navigation"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: reduced ? STILL : LEAVE }}
            transition={reduced ? STILL : { duration: 0.2 }}
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-40 bg-stone-900/25 dark:bg-black/55"
          />
          <motion.aside
            key="sheet"
            initial={reduced ? { opacity: 0 } : { x: "-100%" }}
            animate={reduced ? { opacity: 1 } : { x: 0 }}
            exit={
              reduced
                ? { opacity: 0, transition: STILL }
                : { x: "-100%", transition: LEAVE }
            }
            transition={reduced ? STILL : SHEET}
            className="fixed inset-y-0 left-0 z-50 w-[280px] max-w-[85vw] overflow-hidden rounded-r-[20px] p-3 shadow-[0_28px_56px_-24px_rgba(24,22,20,0.45)]"
            style={{ background: "var(--bezel)" }}
          >
            <div className="h-full">
              <Sidebar />
            </div>
          </motion.aside>
        </>
      ) : null}
    </AnimatePresence>
  );

  return (
    <div className="lg:hidden">
      <button
        ref={opener}
        type="button"
        aria-expanded={open}
        aria-label="Browse components"
        onClick={() => setOpen(true)}
        className="mat-cap press flex h-7 items-center gap-1.5 rounded-[6px] px-2 text-[11px] font-medium text-ink-2 transition-colors duration-150 hover:text-ink"
      >
        <svg viewBox="0 0 256 256" width="12" height="12" fill="none" aria-hidden>
          <path
            d="M40 72h176M40 128h176M40 184h176"
            stroke="currentColor"
            strokeWidth="18"
            strokeLinecap="round"
          />
        </svg>
        Components
      </button>

      {host ? createPortal(overlay, host) : null}
    </div>
  );
}
