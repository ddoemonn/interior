"use client";

import { SparkBars } from "@/components/interior/spark-bars";

const HOURS = [
  312, 268, 240, 221, 256, 340, 512, 780, 1040, 1180, 1262, 1204, 1320, 1410, 1288, 1196, 1352,
  1488, 1270, 1012, 866, 720, 544, 420,
];

const DATA = HOURS.map((value, hour) => ({
  label: `${String(hour).padStart(2, "0")}:00`,
  value,
}));

export function SparkBarsDemo() {
  return (
    <div className="mx-auto w-full max-w-[380px]">
      <SparkBars data={DATA} label="Requests today" unit="requests" mark="bar = 1 hour" />
    </div>
  );
}
