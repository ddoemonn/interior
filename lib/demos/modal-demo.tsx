"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { Modal, ModalAction } from "@/components/interior/modal";

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
            <ModalAction ref={cancelRef} onClick={() => setOpen(false)}>
              Cancel
            </ModalAction>
            <ModalAction tone="destructive" onClick={confirm}>
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
            </ModalAction>
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
