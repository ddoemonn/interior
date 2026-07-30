"use client";

import { useEffect, useRef, useState } from "react";
import { CheckIcon } from "@phosphor-icons/react";

export function CopySource({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  async function copy() {
    try {
      await navigator.clipboard.writeText(code);
    } catch {
      return;
    }
    setCopied(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button
      type="button"
      onClick={copy}
      className="mat-cap press grid h-[22px] items-center rounded-[6px] px-2 text-[10.5px] font-medium text-ink-2 hover:text-ink"
    >
      <span
        className="col-start-1 row-start-1 transition-opacity duration-100"
        style={{ opacity: copied ? 0 : 1 }}
      >
        copy
      </span>
      <span
        aria-hidden
        className="col-start-1 row-start-1 inline-flex items-center gap-1 transition-opacity duration-100"
        style={{ opacity: copied ? 1 : 0, color: "var(--moss)" }}
      >
        <CheckIcon size={10} weight="bold" aria-hidden />
        copied
      </span>
      <span className="sr-only" role="status">
        {copied ? "Copied" : ""}
      </span>
    </button>
  );
}
