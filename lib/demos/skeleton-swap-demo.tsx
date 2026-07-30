"use client";

import { useEffect, useState } from "react";
import { SkeletonSwap } from "@/components/interior/skeleton-swap";

const BIO =
  "Ships the last twenty percent. Writes about the half-second after a click, and about the three things that always go missing before a component is actually done.";

export function SkeletonSwapDemo() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setReady(true), 900);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="flex justify-center">
      <SkeletonSwap
        ready={ready}
        lines={3}
        lineHeight={21}
        label="Profile"
        className="w-full max-w-[400px]"
      >
        {ready ? (
          <p className="text-[13.5px] leading-[21px] text-ink-2">{BIO}</p>
        ) : null}
      </SkeletonSwap>
    </div>
  );
}
