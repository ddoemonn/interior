"use client";

import { FloatingLabelInput } from "@/components/interior/floating-label";

export function FloatingLabelDemo() {
  return (
    <div className="flex justify-center">
      <div className="w-full max-w-[320px]">
        <FloatingLabelInput
          label="Account reference"
          hint="Printed on the statement header."
          maxLength={16}
        />
      </div>
    </div>
  );
}
