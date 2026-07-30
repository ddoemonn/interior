"use client";

import { useState } from "react";
import { PollResults, type PollOption } from "@/components/interior/poll-results";

const SEED: PollOption[] = [
  { id: "oak", label: "Oak, oiled", votes: 54 },
  { id: "travertine", label: "Travertine", votes: 41 },
  { id: "brick", label: "Painted brick", votes: 17 },
  { id: "concrete", label: "Concrete, sealed", votes: 9 },
];

export function PollResultsDemo() {
  const [options, setOptions] = useState(SEED);

  return (
    <div className="mx-auto w-full max-w-[340px]">
      <PollResults
        label="Floor for the front room?"
        options={options}
        onVote={(id) =>
          setOptions((prev) =>
            prev.map((o) => (o.id === id ? { ...o, votes: o.votes + 1 } : o)),
          )
        }
      />
    </div>
  );
}
