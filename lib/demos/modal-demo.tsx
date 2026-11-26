"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { Modal } from "@/components/interior/modal";

const EASE = [0.23, 1, 0.32, 1] as const;

export function ModalDemo() {
  const [open, setOpen] = useState(false);
  const [working, setWorking] = useState(false);
  const cancelRef = useRef<HTMLButtonElement>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const confirm = () => {
    setWorking(true);
    timers.current.push(
      setTimeout(() => {
        setWorking(false);
        setOpen(false);
      }, 900),
    );
  };

  return (
    <div className="grid w-full place-items-center">
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mat-cap press h-9 rounded-[9px] px-3.5 text-[13px] font-medium text-ink"
      >
        Delete project
      </button>

      <Modal
        open={open}
        onClose={() => (working ? undefined : setOpen(false))}
        initialFocusRef={cancelRef}
        closeOnBackdrop={!working}
        closeOnEscape={!working}
        title="Delete atlas-edge?"
        description="This removes the project, its deployments and its domains. It cannot be undone."
        footer={
          <>
            <button
              ref={cancelRef}
              type="button"
              onClick={() => setOpen(false)}
              className="h-8 rounded-[8px] border border-black/[0.09] px-3 text-[12.5px] font-medium text-neutral-900 outline-none transition-colors duration-150 hover:bg-neutral-100 focus-visible:border-[#0F6FFF] dark:border-white/[0.08] dark:text-neutral-100 dark:hover:bg-white/10 dark:focus-visible:border-[#2E8BFF]"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={confirm}
              className="grid h-8 place-items-center rounded-[8px] bg-[#F2303F] bg-[linear-gradient(180deg,rgba(255,255,255,0.22),rgba(255,255,255,0))] px-3 text-[12.5px] font-medium text-white shadow-[0_0_0_1px_#B81826,inset_0_1px_0_rgba(255,255,255,0.4)] outline-none transition-[filter] duration-150 hover:brightness-110 focus-visible:shadow-[0_0_0_1px_#B81826,0_0_0_3px_rgba(242,48,63,0.35)] disabled:opacity-60"
            >
              <span aria-hidden className="invisible col-start-1 row-start-1">
                Deleting
              </span>
              <motion.span
                aria-hidden
                className="col-start-1 row-start-1"
                initial={false}
                animate={{ opacity: working ? 0 : 1 }}
                transition={{ duration: 0.16, ease: EASE }}
              >
                Delete
              </motion.span>
              <motion.span
                aria-hidden
                className="col-start-1 row-start-1"
                initial={false}
                animate={{ opacity: working ? 1 : 0 }}
                transition={{ duration: 0.16, ease: EASE }}
              >
                Deleting
              </motion.span>
              <span className="sr-only">{working ? "Deleting" : "Delete"}</span>
            </button>
          </>
        }
      >
        <p className="text-neutral-500 dark:text-neutral-400">
          Four deployments and one custom domain are attached.
        </p>
      </Modal>
    </div>
  );
}
