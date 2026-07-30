"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CommandPalette,
  type CommandItem,
} from "@/components/interior/command-palette";
import { categories } from "@/lib/registry";

export const LAUNCH = "interior:launch";

export function LauncherButton() {
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new Event(LAUNCH))}
      aria-label="Search components"
      className="mat-cap press flex h-7 items-center gap-2 rounded-[7px] pl-2.5 pr-1.5 text-[11.5px] text-ink-3 hover:text-ink-2"
    >
      Search
      <span className="flex items-center gap-1">
        <kbd className="mat-well grid h-[16px] min-w-[16px] place-items-center rounded-[4px] px-1 font-mono text-[9px] text-ink-3">
          ⌘
        </kbd>
        <kbd className="mat-well grid h-[16px] min-w-[16px] place-items-center rounded-[4px] px-1 font-mono text-[9px] text-ink-3">
          K
        </kbd>
      </span>
    </button>
  );
}

export function Launcher() {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const items = useMemo<CommandItem[]>(() => {
    const rows: CommandItem[] = [
      { id: "/docs", label: "Overview", hint: "Docs", keywords: "home start why" },
      { id: "/", label: "Landing", hint: "Site", keywords: "home index" },
    ];

    for (const category of categories) {
      for (const entry of category.entries) {
        rows.push({
          id: `/docs/${entry.slug}`,
          label: entry.name,
          hint: category.name,
          keywords: `${entry.slug} ${entry.blurb}`,
        });
      }
    }

    return rows;
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "k" || !(event.metaKey || event.ctrlKey)) return;
      event.preventDefault();
      setOpen((prev) => !prev);
    };

    const onAsk = () => setOpen(true);

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener(LAUNCH, onAsk);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener(LAUNCH, onAsk);
    };
  }, []);

  return (
    <CommandPalette
      open={open}
      items={items}
      autoFocus={open}
      maxRows={7}
      label="Search interior.dev"
      placeholder="Search components"
      emptyLabel="Nothing here by that name"
      onDismiss={() => setOpen(false)}
      onSelect={(item) => {
        setOpen(false);
        router.push(item.id);
      }}
    />
  );
}
