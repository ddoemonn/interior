"use client";

import { useEffect, useRef, useState } from "react";
import { Ring } from "@/components/site/ring";

const ROOM = 205;

/** The ring at the foot of the index. It is only there while the list leaves it room: when the list grows down into it the ring fades out, and it fades back in when the space opens again. */
export function SideRing() {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(true);

  useEffect(() => {
    const side = ref.current?.parentElement;
    const list = side?.querySelector<HTMLElement>(".docs-nav-scroll");
    if (!side || !list) return;
    const measure = () => {
      setShown(side.getBoundingClientRect().bottom - list.getBoundingClientRect().bottom >= ROOM);
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(list);
    observer.observe(side);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden
      className="pointer-events-none absolute inset-0 transition-[opacity,transform] duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-none"
      style={{ opacity: shown ? 1 : 0, transform: shown ? "translateY(0)" : "translateY(28px)" }}
    >
      <Ring size={430} className="docs-ring absolute -bottom-[170px] -left-[130px] text-ink" />
    </div>
  );
}
