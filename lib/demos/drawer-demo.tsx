"use client";

import { useState } from "react";
import { Drawer } from "@/components/interior/drawer";

const FIELD =
  "h-10 w-full rounded-[10px] bg-white px-3 text-[13px] text-neutral-900 shadow-[0_0_0_1px_rgba(0,0,0,0.17),0_1px_2px_rgba(0,0,0,0.10)] outline-none transition-[box-shadow] duration-150 placeholder:text-neutral-400 focus:shadow-[0_0_0_2px_#4568FF,0_1px_2px_rgba(0,0,0,0.10)] dark:bg-[#111111] dark:text-neutral-100 dark:shadow-[0_0_0_1px_rgba(255,255,255,0.12),0_1px_2px_rgba(0,0,0,0.4)] dark:placeholder:text-neutral-500 dark:focus:shadow-[0_0_0_2px_#4568FF,0_1px_2px_rgba(0,0,0,0.4)]";

const LABEL =
  "block text-[11px] font-medium uppercase tracking-[0.06em] text-neutral-500 dark:text-neutral-400";

const ACTION =
  "h-8 rounded-[8px] px-3 text-[12.5px] font-medium outline-none transition-[filter] duration-150 focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4568FF]";

const NEUTRAL =
  "bg-gradient-to-b from-white to-[#f5f5f5] text-neutral-700 shadow-[inset_0_1px_0_rgba(255,255,255,0.95),0_0_0_1px_rgba(0,0,0,0.15),0_2px_3px_rgba(0,0,0,0.09)] hover:brightness-[0.98] dark:from-[#303030] dark:to-[#282828] dark:text-neutral-200 dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.14),0_0_0_1px_#202020,0_2px_3px_rgba(0,0,0,0.25)] dark:hover:brightness-110";

const PRIMARY =
  "bg-gradient-to-b from-[#5878ff] to-[#4568ff] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.38),0_0_0_1px_#3655dc,0_2px_3px_rgba(42,68,184,0.16)] hover:brightness-[1.04] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.3),0_0_0_1px_#3655dc,0_2px_3px_rgba(0,0,0,0.25)]";

export function DrawerDemo() {
  const [open, setOpen] = useState(false);

  return (
    <div className="grid w-full place-items-center">
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mat-cap press h-9 rounded-[9px] px-3.5 text-[13px] font-medium text-ink"
      >
        Edit profile
      </button>
      <Drawer
        open={open}
        onOpenChange={setOpen}
        width={420}
        title="Edit profile"
        description="Visible to everyone in the workspace"
        footer={
          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className={`${ACTION} ${NEUTRAL}`}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className={`${ACTION} ${PRIMARY}`}
            >
              Save changes
            </button>
          </div>
        }
      >
        <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
          <div className="space-y-1.5">
            <label htmlFor="drawer-name" className={LABEL}>
              Display name
            </label>
            <input
              id="drawer-name"
              defaultValue="Mira Sandoval"
              className={FIELD}
            />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="drawer-role" className={LABEL}>
              Role
            </label>
            <select id="drawer-role" defaultValue="design" className={FIELD}>
              <option value="design">Design</option>
              <option value="eng">Engineering</option>
              <option value="ops">Operations</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <label htmlFor="drawer-email" className={LABEL}>
              Email
            </label>
            <input
              id="drawer-email"
              type="email"
              defaultValue="mira@studio.co"
              className={FIELD}
            />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="drawer-bio" className={LABEL}>
              About
            </label>
            <textarea
              id="drawer-bio"
              rows={4}
              defaultValue="Interiors, mostly residential. Currently rebuilding a 1930s terrace in Lisbon."
              className={`${FIELD} h-auto resize-none py-2.5 leading-relaxed`}
            />
          </div>
          <label className="flex cursor-pointer items-center gap-2.5 text-[12.5px] text-neutral-600 dark:text-neutral-300">
            <input
              type="checkbox"
              defaultChecked
              className="size-3.5 rounded-[5px] accent-[#4568FF]"
            />
            Show my local time to teammates
          </label>
        </form>
      </Drawer>
    </div>
  );
}
