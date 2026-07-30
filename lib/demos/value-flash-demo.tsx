"use client";

import { useState } from "react";
import { ValueFlash } from "@/components/interior/value-flash";

const STEPS = [-120, -17, +25, +140] as const;

const label = (step: number) =>
  `${step > 0 ? "+" : "−"}${Math.abs(step).toLocaleString("en-US")}`;

export function ValueFlashDemo() {
  const [value, setValue] = useState(1284);

  return (
    <div className="mx-auto flex w-full max-w-[440px] flex-col items-center gap-5">
      <ValueFlash
        value={value}
        format={(n) => n.toLocaleString("en-US")}
        label="Requests per second"
        className="text-[24px]"
      />
      <div className="flex gap-1.5">
        {STEPS.map((step) => (
          <button
            key={step}
            type="button"
            onClick={() =>
              setValue((v) => Math.min(9600, Math.max(1002, v + step)))
            }
            className="mat-cap press h-8 rounded-[6px] px-2.5 text-[12px] font-medium tabular-nums text-ink-2 transition-colors duration-150 hover:text-ink"
          >
            {label(step)}
          </button>
        ))}
      </div>
    </div>
  );
}
