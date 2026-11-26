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
        className="block text-[13px] font-medium text-neutral-900 dark:text-neutral-100"
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
        className="mt-1.5 h-10 w-full rounded-[10px] border-2 border-transparent bg-neutral-100/70 px-3 text-[13px] text-neutral-900 shadow-[inset_0_1px_2px_rgba(0,0,0,0.09),inset_0_0_0_1px_rgba(0,0,0,0.07),0_1px_0_rgba(255,255,255,0.95)] outline-none transition-[background-color,border-color,box-shadow] duration-150 placeholder:text-neutral-400 focus:border-[#0F6FFF] focus:bg-white focus:shadow-none focus-visible:outline-none dark:border-transparent dark:bg-[#121211] dark:text-neutral-100 dark:shadow-[inset_0_1px_2px_rgba(0,0,0,0.6),inset_0_0_0_1px_rgba(0,0,0,0.5),0_1px_0_rgba(255,255,255,0.055)] dark:placeholder:text-neutral-500 dark:focus:border-[#2E8BFF] dark:focus:bg-[#242424]"
      />

      <PasswordStrength value={value} className="mt-3" />
    </div>
  );
}
