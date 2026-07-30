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
        className="block text-[13px] font-medium text-stone-700 dark:text-stone-200"
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
        className="mt-1.5 h-10 w-full rounded-[10px] border-2 border-stone-200 bg-stone-100/70 px-3 text-[13px] text-stone-700 shadow-[inset_0_1px_2px_rgba(28,25,23,0.07)] outline-none transition-[background-color,border-color,box-shadow] duration-150 placeholder:text-stone-400 focus:border-[#4568FF] focus:bg-white focus:shadow-none focus-visible:outline-none dark:border-white/[0.08] dark:bg-[#1D1D1A] dark:text-stone-200 dark:shadow-[inset_0_1px_2px_rgba(0,0,0,0.45)] dark:placeholder:text-stone-500 dark:focus:border-[#93B0FF] dark:focus:bg-[#252522]"
      />

      <PasswordStrength value={value} className="mt-3" />
    </div>
  );
}
