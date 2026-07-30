"use client";

import { useState } from "react";
import { Tabs } from "@/components/interior/tabs";

const items = [
  { value: "overview", label: "Overview" },
  { value: "activity", label: "Activity" },
  { value: "members", label: "Members" },
];

const panels: Record<string, { title: string; lines: string[] }> = {
  overview: {
    title: "Acme workspace",
    lines: ["4 projects, 2 archived", "Created 14 March"],
  },
  activity: {
    title: "Last 24 hours",
    lines: ["Dana deployed api-gateway", "Rui closed 3 issues"],
  },
  members: {
    title: "6 people",
    lines: ["2 admins, 4 editors", "1 invite pending"],
  },
};

export function TabsDemo() {
  const [tab, setTab] = useState("overview");

  return (
    <div className="mx-auto w-full max-w-[440px]">
      <Tabs
        items={items}
        value={tab}
        onValueChange={setTab}
        label="Workspace sections"
        panelClassName="mt-3"
        renderPanel={(value) => (
          <div className="flex h-[86px] flex-col justify-center rounded-[11px] bg-sub px-3.5">
            <p className="text-[13px] font-medium text-ink">{panels[value].title}</p>
            {panels[value].lines.map((line) => (
              <p key={line} className="mt-1 text-[12.5px] text-ink-2">
                {line}
              </p>
            ))}
          </div>
        )}
      />
    </div>
  );
}
