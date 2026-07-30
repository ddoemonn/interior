"use client";

import { useState } from "react";
import {
  CommandPalette,
  type CommandItem,
} from "@/components/interior/command-palette";

const commands: CommandItem[] = [
  { id: "new", label: "New document", hint: "Workspace", shortcut: ["⌘", "N"] },
  { id: "dup", label: "Duplicate document", keywords: "copy clone" },
  { id: "del", label: "Delete document", keywords: "remove trash" },
  { id: "share", label: "Share link", hint: "Anyone with the link" },
  { id: "export", label: "Export as PDF", keywords: "download print" },
  { id: "rename", label: "Rename document", shortcut: ["F2"] },
  { id: "history", label: "Version history", keywords: "revisions restore" },
  { id: "settings", label: "Open settings", shortcut: ["⌘", ","] },
];

export function CommandPaletteDemo() {
  const [open, setOpen] = useState(false);

  return (
    <div className="grid w-full place-items-center">
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mat-cap press h-9 rounded-[9px] px-3.5 text-[13px] font-medium text-ink"
      >
        Open commands
      </button>
      <CommandPalette
        open={open}
        items={commands}
        autoFocus={open}
        onDismiss={() => setOpen(false)}
        onSelect={() => setOpen(false)}
        placeholder="Type d, then o, then c"
      />
    </div>
  );
}
