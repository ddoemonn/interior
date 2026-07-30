"use client";

import { Ripple } from "@/components/interior/ripple";

export function RippleDemo() {
  return (
    <div className="flex justify-center">
      <Ripple className="h-11 px-6">Tap anywhere on me</Ripple>
    </div>
  );
}
