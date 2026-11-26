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
    <div className="mat-panel rounded-[20px] p-2">
      <div className="flex h-11 items-center gap-2 px-2.5 pb-1">
        <span className="text-[13.5px] font-medium text-ink">Preview</span>
        <span className="truncate text-[12.5px] text-ink-3">{label}</span>
        <span className="flex-1" />
        <button
          type="button"
          onClick={() => setTake((t) => t + 1)}
          className="mat-cap press inline-flex h-7 items-center gap-1.5 rounded-[9px] pl-2 pr-2.5 text-[12.5px] font-medium text-ink-2 hover:text-ink"
        >
          <ArrowClockwiseIcon
            size={12}
            weight="bold"
            aria-hidden
            className="transition-transform duration-[420ms] ease-[cubic-bezier(0.23,1,0.32,1)]"
            style={{ transform: `rotate(${take * 360}deg)` }}
          />
          Replay
        </button>
      </div>
      <div
        data-stage
        className={
          bleed
            ? "stage-room relative mt-2 h-[340px] overflow-hidden rounded-[14px]"
            : "stage-room relative mt-2 grid min-h-[264px] place-items-center rounded-[14px] px-6 py-14"
        }
      >
        {bleed ? null : <span aria-hidden className="stage-floor" />}
        <div key={take} className={bleed ? "h-full" : "relative z-[1] w-full min-w-0"}>
          {children}
        </div>
      </div>
    </div>
  );
}
