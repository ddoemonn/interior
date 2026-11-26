"use client";

import { CopyButton } from "@/components/interior/copy-button";

export function CopyButtonDemo() {
  return (
    <div className="flex justify-center">
      <CopyButton value="npx shadcn@latest add @interior/copy-button" />
    </div>
  );
}
