"use client";

import { useState } from "react";
import { QuotaRing } from "@/components/interior/quota-ring";

const LEVELS = [12, 46, 78, 96] as const;

export function QuotaRingDemo() {
  const [used, setUsed] = useState(46);

  return (
    <div className="mx-auto flex w-full max-w-[360px] flex-col items-center gap-6">
      <QuotaRing value={used} max={100} label="Storage" unit="GB" />
      <div className="flex gap-1.5">
        {LEVELS.map((level) => (
          <button
            key={level}
            type="button"
            onClick={() => setUsed(level)}
            aria-pressed={used === level}
            className="mat-cap press h-8 rounded-[9px] px-2.5 text-[12.5px] font-medium tabular-nums text-ink-2 transition-colors duration-150 hover:text-ink aria-pressed:text-ink"
          >
            {level} GB
          </button>
        ))}
      </div>
    </div>
  );
}
