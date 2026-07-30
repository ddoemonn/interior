"use client";

import { TagInput } from "@/components/interior/tag-input";

const START = ["motion", "focus order"];

export function TagInputDemo() {
  return (
    <div className="mx-auto h-[150px] w-full max-w-[420px]">
      <TagInput defaultValue={START} max={6} placeholder="Add a topic" />
    </div>
  );
}
