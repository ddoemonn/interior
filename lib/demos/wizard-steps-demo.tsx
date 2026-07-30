"use client";

import { useState } from "react";
import { WizardSteps } from "@/components/interior/wizard-steps";

const row =
  "flex items-center justify-between gap-3 rounded-[9px] bg-sub px-3 py-2 text-[12.5px]";

const steps = [
  {
    id: "plan",
    label: "Choose a plan",
    content: (
      <ul className="space-y-1">
        {[
          ["Starter", "3 seats"],
          ["Team", "12 seats"],
          ["Scale", "unlimited"],
        ].map(([name, seats]) => (
          <li key={name} className={row}>
            <span className="text-ink">{name}</span>
            <span className="text-ink-3">{seats}</span>
          </li>
        ))}
      </ul>
    ),
  },
  {
    id: "billing",
    label: "Billing details",
    content: (
      <ul className="space-y-1">
        {[
          ["Card", "•••• 4242"],
          ["Invoice email", "billing@acme.co"],
          ["VAT number", "Not set"],
        ].map(([field, value]) => (
          <li key={field} className={row}>
            <span className="text-ink">{field}</span>
            <span className="text-ink-3">{value}</span>
          </li>
        ))}
      </ul>
    ),
  },
  {
    id: "review",
    label: "Review",
    content: (
      <ul className="space-y-1">
        {[
          ["Team", "12 seats"],
          ["Billed", "yearly"],
          ["Charged to", "•••• 4242"],
        ].map(([field, value]) => (
          <li key={field} className={row}>
            <span className="text-ink">{field}</span>
            <span className="text-ink-3">{value}</span>
          </li>
        ))}
      </ul>
    ),
  },
];

export function WizardStepsDemo() {
  const [index, setIndex] = useState(0);
  const [done, setDone] = useState(false);

  return (
    <div className="mx-auto w-full max-w-[420px]">
      <WizardSteps
        steps={steps}
        index={index}
        complete={done}
        onIndexChange={(next) => {
          setDone(false);
          setIndex(next);
        }}
        onComplete={() => setDone(true)}
      />
    </div>
  );
}
