"use client";

import { useState } from "react";
import { SliderDetents } from "@/components/interior/slider-detents";

const PRESETS = [
  { value: 0.5, label: "0.5×" },
  { value: 1, label: "Normal" },
  { value: 1.5, label: "1.5×" },
  { value: 2, label: "2×" },
];

const speed = (v: number) => `${v.toFixed(2)}×`;

export function SliderDetentsDemo() {
  const [value, setValue] = useState(1.35);

  return (
    <div className="grid w-full place-items-center">
      <div className="w-full max-w-[340px]">
        <SliderDetents
          label="Playback speed"
          value={value}
          onValueChange={setValue}
          min={0.25}
          max={2}
          step={0.05}
          detents={PRESETS}
          format={speed}
        />
      </div>
    </div>
  );
}
