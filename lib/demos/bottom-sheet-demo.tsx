"use client";

import { useState } from "react";
import { BottomSheet } from "@/components/interior/bottom-sheet";

const STOPS = [
  ["Fulton & Ashby", "2 min"],
  ["Marlowe Park", "5 min"],
  ["Cedar Row", "9 min"],
  ["Halsey Bridge", "13 min"],
  ["Ninth & Pike", "17 min"],
  ["Orchard Yard", "22 min"],
  ["Beckett Lane", "26 min"],
  ["Quarry Gate", "31 min"],
  ["Winterby Dock", "35 min"],
  ["Ellis Terminal", "40 min"],
];

export function BottomSheetDemo() {
  const [open, setOpen] = useState(false);

  return (
    <div className="grid w-full place-items-center">
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mat-cap press h-9 rounded-[9px] px-3.5 text-[13px] font-medium text-ink"
      >
        Nearby stops
      </button>

      <BottomSheet
        open={open}
        onOpenChange={setOpen}
        title="Nearby stops"
        description="Route 14 · northbound"
      >
        <ul className="space-y-0.5">
          {STOPS.map(([name, eta]) => (
            <li
              key={name}
              className="flex items-baseline justify-between gap-3 py-1.5"
            >
              <span className="truncate text-[12.5px] text-stone-600 dark:text-stone-300">
                {name}
              </span>
              <span className="shrink-0 font-mono text-[10.5px] tabular-nums text-stone-400 dark:text-stone-500">
                {eta}
              </span>
            </li>
          ))}
        </ul>
      </BottomSheet>
    </div>
  );
}
