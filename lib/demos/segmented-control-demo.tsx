"use client";

import { useState } from "react";
import { SegmentedControl } from "@/components/interior/segmented-control";

const RANGES = [
  { value: "day", label: "Day" },
  { value: "week", label: "Week" },
  { value: "month", label: "Month" },
  { value: "quarter", label: "Quarter" },
];

export function SegmentedControlDemo() {
  const [range, setRange] = useState("day");

  return (
    <div className="flex w-full justify-center">
      <SegmentedControl
        label="Report range"
        options={RANGES}
        value={range}
        onValueChange={setRange}
      />
    </div>
  );
}
