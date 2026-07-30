"use client";

import { useRef } from "react";
import { ScrollSpy } from "@/components/interior/scroll-spy";

const SECTIONS = [
  {
    id: "spy-survey",
    label: "Survey",
    lines: [
      "The house was measured twice in one afternoon and the two sets of numbers never agreed.",
      "A foot short one way, a foot long the other, as though the walls had been shuffled overnight and had settled back almost, but not quite, where they began.",
      "The third drawing was the one that got kept. It showed the stair landing sitting half a step above where the plan said it should, which is a small thing on paper and a very large thing underfoot.",
      "By four o'clock the folding rule had stopped being useful, and the remaining questions were about weight and the way a floor answers a footstep.",
    ],
  },
  {
    id: "spy-materials",
    label: "Materials",
    lines: [
      "Oak on the floors, lime plaster on everything above the rail.",
      "Brass where a hand lands often enough to keep it bright, and iron everywhere a hand should not.",
      "The samples arrived in a crate with no invoice and no sender, which the builder took as a good omen and the accountant did not.",
      "Nothing synthetic anywhere a window can reach — the afternoon sun in that room has opinions about plastic.",
    ],
  },
  {
    id: "spy-light",
    label: "Light",
    lines: [
      "In the front room the light comes in low and stays low all afternoon.",
      "It slides across the boards without ever reaching the far wall, which is the kind of thing nobody notices on a plan and everybody notices in a chair.",
      "A room that never fills is a room somebody keeps leaving.",
      "The answer was not a bigger window. The answer was a paler floor, and it took eleven samples to admit it.",
    ],
  },
  {
    id: "spy-schedule",
    label: "Schedule",
    lines: [
      "Eleven weeks, assuming the stair landing is the only thing sitting half a step out.",
      "It is not.",
      "The plaster wants three dry days in a row, and the forecast is offering them one at a time.",
      "The number everyone finally agreed on was longer than anyone had asked for and shorter than the house deserved.",
    ],
  },
  {
    id: "spy-notes",
    label: "Notes",
    lines: [
      "Keys are under the third brick. The brick is under the mat.",
      "Short section, bottom of the page — the one every hand-rolled spy forgets to light.",
    ],
  },
];

export function ScrollSpyDemo() {
  const box = useRef<HTMLDivElement>(null);

  return (
    <div className="mx-auto w-full max-w-[440px]">
      <ScrollSpy sections={SECTIONS} root={box} offset={14} className="mb-3" />

      <div
        ref={box}
        role="region"
        aria-label="Article body"
        className="mat-well no-bar h-[220px] overflow-y-auto overscroll-contain rounded-[11px] px-3.5 py-3"
      >
        {SECTIONS.map((section) => (
          <section key={section.id} className="pb-5 last:pb-0">
            <h3
              id={section.id}
              className="text-[13px] font-medium text-ink outline-none"
            >
              {section.label}
            </h3>
            {section.lines.map((line) => (
              <p key={line} className="mt-1.5 text-[12.5px] text-ink-3">
                {line}
              </p>
            ))}
          </section>
        ))}
      </div>
    </div>
  );
}
