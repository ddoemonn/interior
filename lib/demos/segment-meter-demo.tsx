"use client";

import { useState } from "react";
import { SegmentMeter } from "@/components/interior/segment-meter";

const LEVELS = [180, 520, 760, 940] as const;

export function SegmentMeterDemo() {
  const [value, setValue] = useState(520);

  return (
    <div className="mx-auto flex w-full max-w-[360px] flex-col gap-5">
      <SegmentMeter value={value} max={1000} label="Build minutes" unit="min" />
      <div className="flex justify-center gap-1.5">
        {LEVELS.map((level) => (
          <button
            key={level}
            type="button"
            onClick={() => setValue(level)}
            aria-pressed={value === level}
            className="mat-cap press h-8 rounded-[9px] px-2.5 text-[12.5px] font-medium tabular-nums text-ink-2 transition-colors duration-150 hover:text-ink aria-pressed:text-ink"
          >
            {level}
          </button>
        ))}
      </div>
    </div>
  );
}
