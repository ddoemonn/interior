"use client";

import { useState } from "react";
import { SpringSwitch } from "@/components/interior/spring-switch";

const ROWS = [
  { id: "deploys", name: "Deploy previews", note: "A URL for every pull request" },
  { id: "alerts", name: "Spend alerts", note: "Email at 80% of the budget" },
  { id: "digest", name: "Weekly digest", note: "Mondays, 9:00" },
] as const;

export function SpringSwitchDemo() {
  const [on, setOn] = useState<Record<string, boolean>>({ deploys: true, alerts: false, digest: true });

  return (
    <ul className="mx-auto w-full max-w-[340px] divide-y divide-hairline">
      {ROWS.map((row) => (
        <li key={row.id} className="flex items-center justify-between gap-4 py-3">
          <span className="min-w-0">
            <span className="block text-[13.5px] font-medium text-ink">{row.name}</span>
            <span className="block text-[12.5px] text-ink-3">{row.note}</span>
          </span>
          <SpringSwitch
            label={row.name}
            checked={on[row.id]}
            onCheckedChange={(next) => setOn((prev) => ({ ...prev, [row.id]: next }))}
          />
        </li>
      ))}
    </ul>
  );
}
