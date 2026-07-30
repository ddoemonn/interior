"use client";

import { useState } from "react";
import { Dropdown } from "@/components/interior/dropdown";

const VISIBILITY = [
  { value: "private", label: "Only me", hint: "default" },
  { value: "team", label: "Anyone at Acme" },
  { value: "link", label: "Anyone with the link" },
  { value: "public", label: "Public on the web" },
];

export function DropdownDemo() {
  const [visibility, setVisibility] = useState("private");

  return (
    <div className="grid w-full place-items-center pb-[96px]">
      <Dropdown
        label="Visibility"
        items={VISIBILITY}
        value={visibility}
        onChange={setVisibility}
      />
    </div>
  );
}
