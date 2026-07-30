"use client";

import { useRef } from "react";
import { ReadingProgress } from "@/components/interior/reading-progress";

const PARAGRAPHS = [
  "The house had been empty for eleven years before anyone thought to measure it. The surveyor arrived on a Tuesday with a folding rule and a notebook, and left in the dark with neither of them full.",
  "What he found first was that none of the rooms agreed with the plan. The kitchen was a foot short in one direction and a foot long in the other, as though the walls had been shuffled overnight and had settled back almost, but not quite, where they began.",
  "He drew the discrepancy twice, then a third time, and the third drawing was the one he kept. It showed the stair landing sitting half a step above where the drawing said it should, which is a small thing on paper and a very large thing underfoot.",
  "In the front room the light came in low and stayed low, sliding across the boards all afternoon without ever reaching the far wall. He wrote that down too, because a room that never fills is a room somebody will keep leaving.",
  "By four o'clock the rule had stopped being useful. The remaining questions were about height and weight and the way a floor answers a footstep, and none of those are questions a rule can be pointed at.",
  "He locked the door behind him and stood on the path for a while, working out how long it would take to put right. The number he arrived at was longer than anyone had asked for and shorter than the house deserved.",
];

const WORDS = PARAGRAPHS.join(" ").split(/\s+/).length;

export function ReadingProgressDemo() {
  const scroller = useRef<HTMLDivElement>(null);

  return (
    <div className="mx-auto w-full max-w-[420px]">
      <div className="mat-panel rounded-[14px] p-[5px]">
        <div className="px-2 pb-2.5 pt-2">
          <ReadingProgress scroller={scroller} words={WORDS} />
        </div>
        <div className="mat-well rounded-[9px]">
          <div
            ref={scroller}
            role="region"
            aria-label="Article body"
            className="fade-y no-bar max-h-[184px] space-y-3 overflow-y-auto overscroll-contain rounded-[9px] p-3 text-[12.5px] leading-relaxed text-ink-2"
          >
            {PARAGRAPHS.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
