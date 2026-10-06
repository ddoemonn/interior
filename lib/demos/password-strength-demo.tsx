"use client";

import { useId, useState } from "react";
import { PasswordStrength } from "@/components/interior/password-strength";

export function PasswordStrengthDemo() {
  const id = useId();
  const [value, setValue] = useState("");

  return (
    <div className="mx-auto w-full max-w-[320px]">
      <label
        htmlFor={id}
        className="block text-[13px] font-medium text-neutral-700 dark:text-neutral-200"
      >
        New password
      </label>

      <input
        id={id}
        type="password"
        value={value}
        autoComplete="new-password"
        spellCheck={false}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Type a password"
        className="mt-1.5 h-10 w-full rounded-[10px] bg-white px-3 text-[13px] text-neutral-900 shadow-[0_1px_2px_rgba(0,0,0,0.10),0_0_0_1px_rgba(0,0,0,0.17)] outline-none transition-[background-color,border-color,box-shadow] duration-150 placeholder:text-neutral-400 focus:shadow-[0_1px_2px_rgba(0,0,0,0.10),0_0_0_2px_#4568FF] focus-visible:outline-none dark:bg-[#111111] dark:text-neutral-100 dark:shadow-[0_1px_2px_rgba(0,0,0,0.4),0_0_0_1px_rgba(255,255,255,0.12)] dark:placeholder:text-neutral-500 dark:focus:shadow-[0_1px_2px_rgba(0,0,0,0.4),0_0_0_2px_#4568FF]"
      />

      <PasswordStrength value={value} className="mt-3" />
    </div>
  );
}
