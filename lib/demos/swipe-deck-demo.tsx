"use client";

import { SwipeDeck } from "@/components/interior/swipe-deck";

type Lead = { id: string; name: string; role: string; note: string };

const QUEUE: Lead[] = [
  {
    id: "a",
    name: "Nadia Roussel",
    role: "Design engineer",
    note: "Shipped a design system for a 40-person team.",
  },
  {
    id: "b",
    name: "Tobias Lund",
    role: "Design engineer",
    note: "Six years of motion work, no production React.",
  },
  {
    id: "c",
    name: "Priya Menon",
    role: "Frontend",
    note: "Rewrote checkout; 12 percent fewer drop-offs.",
  },
  {
    id: "d",
    name: "Elias Kern",
    role: "Frontend",
    note: "Portfolio is three unfinished dashboards.",
  },
];

export function SwipeDeckDemo() {
  return (
    <div className="grid w-full place-items-center">
      <div className="w-full max-w-[360px]">
        <SwipeDeck
          items={QUEUE}
          itemKey={(lead) => lead.id}
          itemLabel={(lead) => `${lead.name}, ${lead.role}`}
          label="Applicant queue"
          leftLabel="Pass"
          rightLabel="Shortlist"
          emptyLabel="Queue cleared"
          height={152}
        >
          {(lead) => (
            <div className="flex h-full flex-col justify-end gap-1 p-3.5">
              <p className="text-[13px] font-medium text-ink">{lead.name}</p>
              <p className="text-[12px] leading-relaxed text-ink-2">
                {lead.note}
              </p>
              <p className="text-[11.5px] text-ink-3">{lead.role}</p>
            </div>
          )}
        </SwipeDeck>
      </div>
    </div>
  );
}
