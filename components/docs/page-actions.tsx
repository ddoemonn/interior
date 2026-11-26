"use client";

import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  ArrowUpRightIcon,
  CaretDownIcon,
  CheckIcon,
  CopyIcon,
  FileTextIcon,
  TerminalIcon,
} from "@phosphor-icons/react";

const OPEN = { type: "spring", stiffness: 520, damping: 34, mass: 0.6 } as const;
const CLOSE = { duration: 0.12, ease: [0.4, 0, 1, 1] } as const;
const INSTANT = { duration: 0 } as const;

type Copied = "page" | "install" | null;

export function PageActions({
  name,
  markdown,
  install,
  reference,
}: {
  name: string;
  markdown: string;
  install: string;
  reference: string;
}) {
  const reduced = useReducedMotion();
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState<Copied>(null);
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const menu = useRef<HTMLDivElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const menuId = useId();

  const prompt = `Read ${reference} and add the ${name} component from interior.dev to my project.`;
  const q = encodeURIComponent(prompt);
  const targets = [
    { label: "ChatGPT", href: `https://chatgpt.com/?q=${q}` },
    { label: "Claude", href: `https://claude.ai/new?q=${q}` },
    { label: "Cursor", href: `https://cursor.com/link/prompt?text=${q}` },
    { label: "v0", href: `https://v0.app/chat?q=${q}` },
  ];

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  useEffect(() => {
    if (!open) return;
    const onDown = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onDown);
    menu.current?.querySelector<HTMLElement>("[role=menuitem]")?.focus();
    return () => document.removeEventListener("pointerdown", onDown);
  }, [open]);

  async function copy(text: string, which: Exclude<Copied, null>) {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      return;
    }
    setCopied(which);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(null), 1800);
  }

  function onMenuKey(event: KeyboardEvent<HTMLDivElement>) {
    const items = Array.from(
      menu.current?.querySelectorAll<HTMLElement>("[role=menuitem]") ?? [],
    );
    const at = items.indexOf(document.activeElement as HTMLElement);
    if (event.key === "Escape") {
      event.preventDefault();
      setOpen(false);
      trigger.current?.focus();
    } else if (event.key === "ArrowDown") {
      event.preventDefault();
      items[(at + 1) % items.length]?.focus();
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      items[(at - 1 + items.length) % items.length]?.focus();
    } else if (event.key === "Home") {
      event.preventDefault();
      items[0]?.focus();
    } else if (event.key === "End") {
      event.preventDefault();
      items[items.length - 1]?.focus();
    } else if (event.key === "Tab") {
      setOpen(false);
    }
  }

  const row =
    "flex w-full items-center gap-2.5 rounded-[9px] px-2.5 py-2 text-left text-[13px] text-ink-2 outline-none transition-colors duration-150 hover:bg-[var(--accent-soft)] hover:text-ink focus-visible:bg-[var(--accent-soft)] focus-visible:text-ink";

  return (
    <div ref={root} className="relative ml-auto shrink-0">
      <div className="mat-cap flex h-8 items-stretch rounded-[10px] text-[12.5px] font-medium text-ink-2">
        <button
          type="button"
          onClick={() => copy(markdown, "page")}
          className="press flex items-center gap-1.5 rounded-l-[10px] pl-2.5 pr-2.5 outline-none hover:text-ink focus-visible:text-ink focus-visible:shadow-[inset_0_0_0_2px_var(--accent)]"
        >
          <span className="relative grid size-[14px] place-items-center">
            <CopyIcon
              size={14}
              aria-hidden
              className="col-start-1 row-start-1 transition-[opacity,transform] duration-150"
              style={{
                opacity: copied === "page" ? 0 : 1,
                transform: copied === "page" ? "scale(0.6)" : "scale(1)",
              }}
            />
            <CheckIcon
              size={13}
              weight="bold"
              aria-hidden
              className="col-start-1 row-start-1 transition-[opacity,transform] duration-150"
              style={{
                color: "var(--moss)",
                opacity: copied === "page" ? 1 : 0,
                transform: copied === "page" ? "scale(1)" : "scale(0.6)",
              }}
            />
          </span>
          Copy for AI
        </button>
        <span aria-hidden className="my-1.5 w-px bg-[var(--hairline)]" />
        <button
          ref={trigger}
          type="button"
          aria-label="More page actions"
          aria-haspopup="menu"
          aria-expanded={open}
          aria-controls={open ? menuId : undefined}
          onClick={() => setOpen((value) => !value)}
          className="press grid w-7 place-items-center rounded-r-[10px] outline-none hover:text-ink focus-visible:text-ink focus-visible:shadow-[inset_0_0_0_2px_var(--accent)]"
        >
          <CaretDownIcon
            size={11}
            weight="bold"
            aria-hidden
            className="transition-transform duration-200 ease-[cubic-bezier(0.23,1,0.32,1)]"
            style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)" }}
          />
        </button>
      </div>

      <AnimatePresence>
        {open ? (
          <motion.div
            ref={menu}
            id={menuId}
            role="menu"
            tabIndex={-1}
            aria-label="Page actions"
            onKeyDown={onMenuKey}
            initial={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.94, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={
              reduced
                ? { opacity: 0, transition: INSTANT }
                : { opacity: 0, scale: 0.96, y: -2, transition: CLOSE }
            }
            transition={reduced ? INSTANT : OPEN}
            style={{ transformOrigin: "top right" }}
            className="mat-float absolute right-0 top-[calc(100%+6px)] z-30 w-[236px] rounded-[14px] p-1.5 max-w-[calc(100vw-48px)]"
          >
            <button
              type="button"
              role="menuitem"
              className={row}
              onClick={() => copy(markdown, "page")}
            >
              <CopyIcon size={15} aria-hidden className="shrink-0 text-ink-3" />
              <span className="flex-1">Copy page as Markdown</span>
              {copied === "page" ? (
                <CheckIcon size={12} weight="bold" aria-hidden style={{ color: "var(--moss)" }} />
              ) : null}
            </button>
            <a
              role="menuitem"
              href={reference}
              target="_blank"
              rel="noreferrer"
              className={row}
              onClick={() => setOpen(false)}
            >
              <FileTextIcon size={15} aria-hidden className="shrink-0 text-ink-3" />
              <span className="flex-1">View as Markdown</span>
              <ArrowUpRightIcon size={12} aria-hidden className="text-ink-3" />
            </a>
            <button
              type="button"
              role="menuitem"
              className={row}
              onClick={() => copy(install, "install")}
            >
              <TerminalIcon size={15} aria-hidden className="shrink-0 text-ink-3" />
              <span className="flex-1">Copy install command</span>
              {copied === "install" ? (
                <CheckIcon size={12} weight="bold" aria-hidden style={{ color: "var(--moss)" }} />
              ) : null}
            </button>

            <div aria-hidden className="mx-2.5 my-1.5 h-px bg-[var(--hairline)]" />

            {targets.map((target) => (
              <a
                key={target.label}
                role="menuitem"
                href={target.href}
                target="_blank"
                rel="noreferrer"
                className={row}
                onClick={() => setOpen(false)}
              >
                <span className="flex-1">Open in {target.label}</span>
                <ArrowUpRightIcon size={12} aria-hidden className="text-ink-3" />
              </a>
            ))}
          </motion.div>
        ) : null}
      </AnimatePresence>

      <span className="sr-only" role="status">
        {copied ? "Copied" : ""}
      </span>
    </div>
  );
}
