"use client";

import { useEffect, useRef, useState } from "react";
import { ToastStack, useToastStack } from "@/components/interior/toast-stack";

type Row = { id: string; name: string; meta: string; verb: string };

const ROWS: Row[] = [
  { id: "invite", name: "maya@studio.co", meta: "Editor · pending seat", verb: "Invite" },
  { id: "upload", name: "brand-kit.zip", meta: "14.2 MB · not synced", verb: "Upload" },
  { id: "delete", name: "Q3 report.pdf", meta: "Edited 2 days ago", verb: "Delete" },
];

export function ToastStackDemo() {
  const { toasts, push, dismiss, pause, resume, promise } = useToastStack({
    duration: 2600,
    visible: 3,
  });

  const [removed, setRemoved] = useState(false);
  const timers = useRef(new Set<ReturnType<typeof setTimeout>>());

  useEffect(() => {
    const running = timers.current;
    return () => {
      running.forEach(clearTimeout);
      running.clear();
    };
  }, []);

  const after = <T,>(ms: number, settle: () => T, fail = false) =>
    new Promise<T>((resolve, reject) => {
      const id = setTimeout(() => {
        timers.current.delete(id);
        if (fail) reject(new Error("Connection reset"));
        else resolve(settle());
      }, ms);
      timers.current.add(id);
    });

  function act(row: Row) {
    if (row.id === "invite") {
      void promise(() => after(900, () => "maya@studio.co"), {
        pending: { title: "Sending invite", description: "maya@studio.co" },
        success: (email) => ({
          title: "Invite sent",
          description: `${email} · expires in 7 days`,
          duration: 1800,
        }),
        error: { title: "Invite failed", description: "Try again in a moment" },
      });
      return;
    }

    if (row.id === "upload") {
      void promise(() => after(1000, () => null, true), {
        pending: { title: "Uploading", description: "brand-kit.zip · 14.2 MB" },
        success: { title: "Upload complete", duration: 1800 },
        error: {
          title: "Upload failed",
          description: "Connection reset at 61%",
          duration: 4200,
          action: {
            label: "Retry",
            onClick: () => {
              void promise(() => after(900, () => null), {
                pending: { title: "Uploading", description: "brand-kit.zip · retry 2 of 3" },
                success: {
                  title: "Upload complete",
                  description: "brand-kit.zip · 14.2 MB",
                  duration: 1800,
                },
                error: "Upload failed",
              });
            },
          },
        },
      });
      return;
    }

    setRemoved(true);
    push({
      title: "Q3 report.pdf deleted",
      description: "Moved to trash",
      status: "success",
      duration: 3200,
      action: {
        label: "Undo",
        onClick: () => {
          setRemoved(false);
          push({ title: "Restored", description: "Q3 report.pdf is back", duration: 1600 });
        },
      },
    });
  }

  return (
    <div className="relative h-full w-full">
      <div className="flex h-full flex-col gap-2.5 p-4">
        <p className="meta text-ink-3">workspace files</p>

        <ul className="w-full max-w-[300px] space-y-1">
          {ROWS.map((row) => {
            const gone = row.id === "delete" && removed;
            return (
              <li
                key={row.id}
                className="mat-panel flex h-[46px] items-center gap-2 rounded-[9px] pl-3 pr-1.5 transition-opacity duration-200"
                style={{ opacity: gone ? 0.42 : 1 }}
              >
                <span className="min-w-0 flex-1">
                  <span
                    className="block truncate text-[12.5px] font-medium text-ink"
                    style={{ textDecoration: gone ? "line-through" : "none" }}
                  >
                    {row.name}
                  </span>
                  <span className="mt-px block truncate text-[10.5px] text-ink-3">
                    {row.meta}
                  </span>
                </span>

                <button
                  type="button"
                  onClick={() => act(row)}
                  className="mat-cap press h-[26px] shrink-0 rounded-[7px] px-2.5 text-[11.5px] font-medium text-ink-2 hover:text-ink"
                >
                  {gone ? "Deleted" : row.verb}
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 flex justify-end p-4">
        <ToastStack
          toasts={toasts}
          onDismiss={dismiss}
          onExpandedChange={(open) => (open ? pause() : resume())}
        />
      </div>
    </div>
  );
}
