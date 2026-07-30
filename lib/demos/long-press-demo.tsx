"use client";

import { useState } from "react";
import { LongPressButton } from "@/components/interior/long-press";

export function LongPressDemo() {
  const [archived, setArchived] = useState(false);

  return (
    <div className="flex justify-center">
      <LongPressButton onLongPress={() => setArchived((v) => !v)}>
        <span className="grid text-left">
          <span
            className={`col-start-1 row-start-1 ${archived ? "invisible" : ""}`}
          >
            Hold to archive
          </span>
          <span
            className={`col-start-1 row-start-1 ${archived ? "" : "invisible"}`}
          >
            Hold to restore
          </span>
        </span>
      </LongPressButton>
    </div>
  );
}
