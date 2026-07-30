"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { LoadMore } from "@/components/interior/load-more";

const TOTAL = 40;
const PAGE = 8;
const EASE = [0.23, 1, 0.32, 1] as const;

export function LoadMoreDemo() {
  const [count, setCount] = useState(PAGE);
  const scroller = useRef<HTMLDivElement>(null);
  const loaded = useRef(PAGE);
  const timers = useRef(new Set<ReturnType<typeof setTimeout>>());

  useEffect(() => {
    const running = timers.current;
    return () => {
      running.forEach(clearTimeout);
      running.clear();
    };
  }, []);

  const load = () =>
    new Promise<boolean>((resolve) => {
      const next = Math.min(TOTAL, loaded.current + PAGE);
      const id = setTimeout(() => {
        timers.current.delete(id);
        loaded.current = next;
        setCount(next);
        resolve(next < TOTAL);
      }, 700);
      timers.current.add(id);
    });

  return (
    <div
      ref={scroller}
      className="h-full w-full overflow-y-auto overscroll-contain p-3"
    >
      <ul className="space-y-1">
        {Array.from({ length: count }, (_, i) => (
          <motion.li
            key={i}
            initial={i < PAGE ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.26,
              ease: EASE,
              delay: (i % PAGE) * 0.03,
            }}
            className="mat-panel rounded-[9px] px-3 py-2.5 text-[12.5px] text-ink"
          >
            Item {String(i + 1).padStart(2, "0")}
          </motion.li>
        ))}
      </ul>

      <div className="pt-3">
        <LoadMore
          onLoad={load}
          hasMore={count < TOTAL}
          rootRef={scroller}
          rootMargin="120px 0px"
          maxAutoLoads={2}
        />
      </div>
    </div>
  );
}
