"use client";

import { useState } from "react";
import { Drawer } from "@/components/interior/drawer";

const FIELD =
  "h-10 w-full rounded-[10px] border-2 border-stone-200 bg-stone-100/70 px-3 text-[13px] text-stone-700 shadow-[inset_0_1px_2px_rgba(28,25,23,0.07)] outline-none transition-[border-color,background-color,box-shadow] duration-150 placeholder:text-stone-400 focus:border-[#4568FF] focus:bg-white focus:shadow-none dark:border-white/[0.08] dark:bg-[#1D1D1A] dark:text-stone-200 dark:shadow-[inset_0_1px_2px_rgba(0,0,0,0.45)] dark:placeholder:text-stone-500 dark:focus:border-[#93B0FF] dark:focus:bg-[#252522]";

const LABEL =
  "block text-[11px] font-medium uppercase tracking-[0.06em] text-stone-400 dark:text-stone-500";

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
              className="h-8 rounded-[8px] border border-stone-200 px-3 text-[12.5px] font-medium text-stone-700 outline-none transition-colors duration-150 hover:bg-stone-100 focus-visible:border-[#4568FF] dark:border-white/[0.16] dark:text-stone-200 dark:hover:bg-white/10 dark:focus-visible:border-[#93B0FF]"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="h-8 rounded-[8px] bg-stone-800 px-3 text-[12.5px] font-medium text-white outline-none transition-colors duration-150 hover:bg-stone-700 dark:bg-stone-100 dark:text-stone-900 dark:hover:bg-white"
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
          <label className="flex cursor-pointer items-center gap-2.5 text-[12.5px] text-stone-600 dark:text-stone-300">
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
