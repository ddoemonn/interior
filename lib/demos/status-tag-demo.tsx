"use client";

import { useEffect, useRef, useState } from "react";
import { StatusTag, type TagState } from "@/components/interior/status-tag";

type Step = "queued" | "building" | "live" | "failed";

const STATES: Record<Step, TagState> = {
  queued: { label: "Queued", tone: "neutral", kind: "idle" },
  building: { label: "Building", tone: "blue", kind: "busy" },
  live: { label: "Live", tone: "green", kind: "done" },
  failed: { label: "Failed", tone: "red", kind: "failed" },
};

export function StatusTagDemo() {
  const [step, setStep] = useState<Step>("queued");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  function run(end: Step) {
    if (timer.current) clearTimeout(timer.current);
    setStep("building");
    timer.current = setTimeout(() => setStep(end), 1600);
  }

  return (
    <div className="mx-auto flex w-full max-w-[340px] flex-col items-center gap-6">
      <div className="flex w-full items-center justify-between gap-4">
        <span className="min-w-0">
          <span className="block truncate text-[13.5px] font-medium text-ink">web · main</span>
          <span className="block truncate font-mono text-[12px] text-ink-3">a41f9c2</span>
        </span>
        <StatusTag state={step} states={STATES} />
      </div>
      <div className="flex gap-1.5">
        <button type="button" onClick={() => run("live")} className="mat-cap press h-8 rounded-[9px] px-2.5 text-[12.5px] font-medium tabular-nums text-ink-2 transition-colors duration-150 hover:text-ink">
          Deploy
        </button>
        <button type="button" onClick={() => run("failed")} className="mat-cap press h-8 rounded-[9px] px-2.5 text-[12.5px] font-medium tabular-nums text-ink-2 transition-colors duration-150 hover:text-ink">
          Deploy and fail
        </button>
        <button type="button" onClick={() => setStep("queued")} className="mat-cap press h-8 rounded-[9px] px-2.5 text-[12.5px] font-medium tabular-nums text-ink-2 transition-colors duration-150 hover:text-ink">
          Reset
        </button>
      </div>
    </div>
  );
}
