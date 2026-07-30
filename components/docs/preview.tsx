"use client";

import { useState, type ReactNode } from "react";
import { ArrowClockwiseIcon } from "@phosphor-icons/react";

export function Preview({
  children,
  label = "preview",
  bleed = false,
}: {
  children: ReactNode;
  label?: string;
  bleed?: boolean;
}) {
  const [take, setTake] = useState(0);

  return (
    <div className="mat-panel rounded-[16px] p-[5px]">
      <div
        className={
          bleed
            ? "mat-well relative h-[340px] overflow-hidden rounded-[11px]"
            : "mat-well grid min-h-[264px] place-items-center rounded-[11px] px-6 py-14"
        }
      >
        <div key={take} className={bleed ? "h-full" : "w-full min-w-0"}>
          {children}
        </div>
      </div>
      <div className="flex h-9 items-center justify-between px-2.5">
        <span className="meta text-ink-3">{label}</span>
        <button
          type="button"
          onClick={() => setTake((t) => t + 1)}
          className="mat-cap press inline-flex h-[22px] items-center gap-1.5 rounded-[6px] pl-1.5 pr-2 text-[10.5px] font-medium text-ink-2 hover:text-ink"
        >
          <ArrowClockwiseIcon
            size={11}
            weight="bold"
            aria-hidden
            className="transition-transform duration-[420ms] ease-[cubic-bezier(0.23,1,0.32,1)]"
            style={{ transform: `rotate(${take * 360}deg)` }}
          />
          replay
        </button>
      </div>
    </div>
  );
}
