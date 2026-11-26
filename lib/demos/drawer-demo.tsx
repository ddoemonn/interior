"use client";

import { useState } from "react";
import { Drawer } from "@/components/interior/drawer";

const FIELD =
  "h-10 w-full rounded-[10px] border-2 border-transparent bg-neutral-100/70 px-3 text-[13px] text-neutral-900 shadow-[inset_0_1px_2px_rgba(0,0,0,0.09),inset_0_0_0_1px_rgba(0,0,0,0.07),0_1px_0_rgba(255,255,255,0.95)] outline-none transition-[border-color,background-color,box-shadow] duration-150 placeholder:text-neutral-400 focus:border-[#0F6FFF] focus:bg-white focus:shadow-none dark:border-transparent dark:bg-[#121211] dark:text-neutral-100 dark:shadow-[inset_0_1px_2px_rgba(0,0,0,0.6),inset_0_0_0_1px_rgba(0,0,0,0.5),0_1px_0_rgba(255,255,255,0.055)] dark:placeholder:text-neutral-500 dark:focus:border-[#2E8BFF] dark:focus:bg-[#242424]";

const LABEL =
  "block text-[11px] font-medium uppercase tracking-[0.06em] text-neutral-400 dark:text-neutral-500";

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
              className="h-8 rounded-[8px] border border-black/[0.09] px-3 text-[12.5px] font-medium text-neutral-900 outline-none transition-colors duration-150 hover:bg-neutral-100 focus-visible:border-[#0F6FFF] dark:border-white/[0.08] dark:text-neutral-100 dark:hover:bg-white/10 dark:focus-visible:border-[#2E8BFF]"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="h-8 rounded-[8px] bg-neutral-800 px-3 text-[12.5px] font-medium text-white outline-none transition-colors duration-150 hover:bg-neutral-700 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-white shadow-[0_0_0_1px_#0c0c0c,inset_0_1px_0_rgba(255,255,255,0.28),inset_0_-1px_0_rgba(0,0,0,0.22)] dark:shadow-[0_0_0_1px_#000,inset_0_1px_0_#fff,inset_0_-1px_0_rgba(0,0,0,0.22)] bg-[linear-gradient(180deg,rgba(255,255,255,0.16),rgba(255,255,255,0))] dark:bg-[linear-gradient(180deg,#fff,rgba(214,214,210,0.9))]"
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
              className="size-3.5 rounded-[5px] accent-[#0F6FFF]"
            />
            Show my local time to teammates
          </label>
        </form>
      </Drawer>
    </div>
  );
}
