"use client";

import { HoldToConfirm } from "@/components/interior/hold-to-confirm";

export function HoldToConfirmDemo() {
  return (
    <div className="flex justify-center">
      <HoldToConfirm
        onConfirm={() => {}}
        confirmLabel="Workspace deleted"
      >
        Hold to delete workspace
      </HoldToConfirm>
    </div>
  );
}
