"use client";

import { useState } from "react";
import { InlineValidation } from "@/components/interior/inline-validation";

const checkEmail = (v: string) => {
  if (v.trim() === "") return "A work email is required.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/u.test(v)) {
    return "That is not a complete email address.";
  }
  return null;
};

export function InlineValidationDemo() {
  const [email, setEmail] = useState("");

  return (
    <div className="flex justify-center">
      <div className="w-full max-w-[300px]">
        <InlineValidation
          label="Work email"
          type="email"
          placeholder="you@work.com"
          value={email}
          onChange={setEmail}
          validate={checkEmail}
          hint="Only used to send the invite."
        />
      </div>
    </div>
  );
}
