"use client";

import { useEffect, useState } from "react";
import { MoonIcon, SunIcon } from "@phosphor-icons/react";

export function ThemeToggle() {
  const [dark, setDark] = useState<boolean | null>(null);

  useEffect(() => {
    setDark(document.documentElement.classList.contains("dark"));
  }, []);

  function set(next: boolean) {
    document.documentElement.classList.toggle("dark", next);
    try {
      localStorage.setItem("interior-theme", next ? "dark" : "light");
    } catch {}
    setDark(next);
  }

  return (
    <div
      className="mat-well relative flex h-[26px] w-[54px] items-center rounded-[8px] p-[3px]"
      role="group"
      aria-label="Theme"
    >
      <span
        aria-hidden
        className="mat-cap absolute left-[3px] top-[3px] h-5 w-6 rounded-[5px] transition-transform duration-[220ms] ease-[cubic-bezier(0.23,1,0.32,1)]"
        style={{
          transform: dark ? "translateX(22px)" : "translateX(0px)",
          opacity: dark === null ? 0 : 1,
        }}
      />
      <button
        type="button"
        onClick={() => set(false)}
        aria-label="Light"
        aria-pressed={dark === false}
        className="relative z-10 grid h-5 w-6 place-items-center rounded-[5px]"
        style={{ color: dark === false ? "var(--ink)" : "var(--ink-3)" }}
      >
        <SunIcon size={13} weight="fill" aria-hidden />
      </button>
      <button
        type="button"
        onClick={() => set(true)}
        aria-label="Dark"
        aria-pressed={dark === true}
        className="relative z-10 grid h-5 w-6 place-items-center rounded-[5px]"
        style={{ color: dark === true ? "var(--ink)" : "var(--ink-3)" }}
      >
        <MoonIcon size={12} weight="fill" aria-hidden />
      </button>
    </div>
  );
}
