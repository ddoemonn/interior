"use client";

import { HeatCells } from "@/components/interior/heat-cells";

const START = Date.UTC(2026, 6, 6);
const DAY = 86_400_000;

const DATA = Array.from({ length: 119 }, (_, i) => {
  const date = new Date(START + i * DAY);
  const weekend = date.getUTCDay() === 0 || date.getUTCDay() === 6;
  const wave = Math.sin(i * 0.31) + Math.sin(i * 0.083 + 1.4);
  const noise = ((i * 7919) % 13) / 13;
  const raw = (weekend ? 0.25 : 1) * (wave + 1.6) * 3.4 + noise * 4 - 2.2;
  return {
    label: date.toLocaleDateString("en-US", {
      weekday: "short",
      day: "numeric",
      month: "short",
      timeZone: "UTC",
    }),
    value: Math.max(0, Math.round(raw)),
  };
});

export function HeatCellsDemo() {
  return (
    <div className="flex justify-center">
      <HeatCells data={DATA} label="Commits, last 17 weeks" unit="commits" tone="green" />
    </div>
  );
}
