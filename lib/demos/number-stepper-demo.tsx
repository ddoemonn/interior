"use client";

import { useState } from "react";
import { NumberStepper } from "@/components/interior/number-stepper";

export function NumberStepperDemo() {
  const [seats, setSeats] = useState(4);

  return (
    <div className="mx-auto flex w-full max-w-[320px] items-center justify-between gap-4">
      <span className="min-w-0">
        <span className="block text-[13.5px] font-medium text-ink">Seats</span>
        <span className="block text-[12.5px] tabular-nums text-ink-3">
          ${(seats * 12).toLocaleString("en-US")} a month · 1 to 12
        </span>
      </span>
      <NumberStepper label="Seats" value={seats} onValueChange={setSeats} min={1} max={12} />
    </div>
  );
}
