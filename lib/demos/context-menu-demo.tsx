"use client";

import { useState } from "react";
import {
  ContextMenu,
  type ContextMenuItem,
} from "@/components/interior/context-menu";

const initial = [
  { id: "a", name: "cover-final-v4.png", meta: "PNG · 1.2 MB" },
  { id: "b", name: "hero-crop@2x.png", meta: "PNG · 840 KB" },
  { id: "c", name: "desk-shot-0912.jpg", meta: "JPG · 2.4 MB" },
];

export function ContextMenuDemo() {
  const [files, setFiles] = useState(initial);

  const actions = (id: string): ContextMenuItem[] => [
    { id: "open", label: "Open", shortcut: "↵" },
    { id: "rename", label: "Rename", shortcut: "F2" },
    { id: "copy", label: "Copy link", shortcut: "⌘L" },
    { id: "sep", type: "separator" },
    {
      id: "trash",
      label: "Move to trash",
      shortcut: "⌫",
      onSelect: () => setFiles((prev) => prev.filter((file) => file.id !== id)),
    },
  ];

  return (
    <div className="mx-auto w-full max-w-[380px]">
      {files.length > 0 ? (
        <ul className="space-y-1">
          {files.map((file) => (
            <li key={file.id}>
              <ContextMenu
                label={`Actions for ${file.name}`}
                items={actions(file.id)}
                className="flex h-[50px] items-center rounded-[9px] bg-sub px-3"
              >
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[12.5px] font-medium text-ink">
                    {file.name}
                  </span>
                  <span className="mt-[1px] block text-[11px] text-ink-3">
                    {file.meta}
                  </span>
                </span>
              </ContextMenu>
            </li>
          ))}
        </ul>
      ) : (
        <div className="grid h-[158px] place-items-center">
          <button
            type="button"
            onClick={() => setFiles(initial)}
            className="mat-cap press h-9 rounded-[9px] px-3.5 text-[13px] font-medium text-ink"
          >
            Put them back
          </button>
        </div>
      )}
    </div>
  );
}
