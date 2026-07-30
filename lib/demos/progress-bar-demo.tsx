"use client";

import { useEffect, useState } from "react";
import { ProgressBar } from "@/components/interior/progress-bar";

export function ProgressBarDemo() {
  const [value, setValue] = useState<number | null>(null);

  useEffect(() => {
    if (value === null) {
      const id = setTimeout(() => setValue(8), 1300);
      return () => clearTimeout(id);
    }
    if (value < 100) {
      const id = setTimeout(() => setValue(Math.min(100, value + 14)), 520);
      return () => clearTimeout(id);
    }
    const id = setTimeout(() => setValue(null), 1800);
    return () => clearTimeout(id);
  }, [value]);

  return (
    <div className="mx-auto w-full max-w-[360px]">
      <ProgressBar
        value={value}
        label="roadmap.pdf"
        pendingLabel="Sizing"
        completeLabel="Upload complete"
      />
    </div>
  );
}
