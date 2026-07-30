"use client";

import { useState } from "react";
import { TextReveal } from "@/components/interior/text-reveal";

const COPY =
  "Nobody is given a week to write these, so they ship at eighty percent and stay there for the life of the product.";

export function TextRevealDemo() {
  const [take, setTake] = useState(0);

  return (
    <div className="mx-auto w-full max-w-[420px]">
      <TextReveal
        key={take}
        text={COPY}
        startOnView={false}
        className="block text-[13.5px] leading-relaxed text-ink-2"
      />

      <button
        type="button"
        onClick={() => setTake((t) => t + 1)}
        className="mat-cap press mt-4 h-8 rounded-[6px] px-3 text-[12.5px] font-medium text-ink"
      >
        Reveal
      </button>
    </div>
  );
}
