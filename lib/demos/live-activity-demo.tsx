"use client";

import { useEffect, useRef } from "react";
import { LiveActivity, useLiveActivity } from "@/components/interior/live-activity";

const STEPS = 24;
const TICK = 140;

const LINES = ["w-[88%]", "w-[64%]", "w-[76%]", "w-[52%]", "w-[70%]"];

export function LiveActivityDemo() {
  const pod = useLiveActivity();
  const runs = useRef(0);
  const ticker = useRef<ReturnType<typeof setInterval> | null>(null);

  const stop = () => {
    if (ticker.current) clearInterval(ticker.current);
    ticker.current = null;
  };

  const deploy = () => {
    stop();
    runs.current += 1;
    const failing = runs.current % 3 === 0;
    pod.start({ title: "Deploying site", detail: "interior-dev · production", progress: 0 });
    let step = 0;
    ticker.current = setInterval(() => {
      step += 1;
      if (failing && step >= Math.round(STEPS * 0.6)) {
        stop();
        pod.fail(
          { detail: "Build failed at step 14 of 24" },
          { label: "Retry", onClick: deploy },
        );
        return;
      }
      if (step >= STEPS) {
        stop();
        pod.succeed({ detail: "Live at interior-dev.vercel.app" });
        return;
      }
      pod.update({ progress: step / STEPS });
    }, TICK);
  };

  useEffect(() => stop, []);

  return (
    <div className="relative h-full min-h-[280px] w-full">
      <div className="pointer-events-none absolute inset-x-0 top-4 z-10">
        <LiveActivity activity={pod.activity} onDismiss={pod.dismiss} />
      </div>

      <div aria-hidden className="space-y-4 px-6 pt-20">
        {LINES.map((width) => (
          <div
            key={width}
            className={`h-2.5 rounded-[2px] bg-neutral-800/[0.06] dark:bg-white/[0.05] ${width}`}
          />
        ))}
      </div>

      <div className="absolute bottom-4 right-4">
        <button
          type="button"
          onClick={deploy}
          className="inline-flex h-8 select-none items-center rounded-[8px] bg-gradient-to-b from-[#5878ff] to-[#4568ff] px-3 text-[12.5px] font-medium text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.38),0_0_0_1px_#3655dc,0_2px_3px_rgba(42,68,184,0.16)] outline-none transition-[filter] duration-150 hover:brightness-105 focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-2 focus-visible:outline-[#4568FF] active:translate-y-px dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.3),0_0_0_1px_#3655dc,0_2px_3px_rgba(0,0,0,0.25)]"
        >
          Deploy
        </button>
      </div>
    </div>
  );
}
