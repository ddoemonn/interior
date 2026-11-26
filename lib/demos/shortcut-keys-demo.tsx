"use client";

import { useState } from "react";
import { ShortcutKeys } from "@/components/interior/shortcut-keys";

export function ShortcutKeysDemo() {
  const [saves, setSaves] = useState(0);

  return (
    <div className="mx-auto flex w-full max-w-[340px] flex-col gap-1">
      <div className="flex items-center justify-between py-2">
        <ShortcutKeys keys={["shift", "s"]} label="Save draft" doneLabel="Saved" onTrigger={() => setSaves((n) => n + 1)} />
      </div>
      <div className="flex items-center justify-between py-2">
        <ShortcutKeys keys={["shift", "d"]} label="Duplicate" doneLabel="Duplicated" />
      </div>
      <div className="flex items-center justify-between py-2">
        <ShortcutKeys keys={["g", "h"]} label="Go home" doneLabel="Going" />
      </div>
      <p className="mt-3 text-[12.5px] tabular-nums text-ink-3">
        Press the keys on your keyboard. Saved {saves} {saves === 1 ? "time" : "times"}.
      </p>
    </div>
  );
}
