"use client";

import { StreamingText } from "@/components/interior/streaming-text";

const ANSWER =
  "The invoice failed because the card on file expired on the third, so the retry schedule kept charging a dead account.\n\nI paused it. Update the card and the charge re-runs tonight.";

export function StreamingTextDemo() {
  return (
    <div className="mx-auto w-full max-w-[440px]">
      <StreamingText text={ANSWER} tokensPerSecond={9} />
    </div>
  );
}
