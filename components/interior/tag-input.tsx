"use client";

import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

const LEAVE = [0.4, 0, 1, 1] as const;
const CROSSFADE = { type: "spring", stiffness: 260, damping: 34, mass: 0.8 } as const;
const CHIP = { type: "spring", stiffness: 700, damping: 46, mass: 0.5 } as const;
const EXIT = { duration: 0.18, ease: LEAVE } as const;
const INSTANT = { duration: 0 } as const;

const clean = (raw: string) => raw.trim().replace(/\s+/g, " ");

const splitter = (separators: string[]) =>
  new RegExp(`[${separators.map((s) => s.replace(/[\\\]^-]/g, "\\$&")).join("")}\\n\\r\\t]+`);

export type TagRejection = "duplicate" | "limit" | "invalid";

export type UseTagInputOptions = {
  value?: string[];
  defaultValue?: string[];
  onChange?: (tags: string[]) => void;
  max?: number;
  separators?: string[];
  allowDuplicates?: boolean;
  validate?: (candidate: string, tags: string[]) => boolean;
};

type Rejection = { reason: TagRejection; tag: string; visible: boolean };

export function useTagInput({
  value,
  defaultValue,
  onChange,
  max,
  separators = [","],
  allowDuplicates = false,
  validate,
}: UseTagInputOptions = {}) {
  const [internal, setInternal] = useState<string[]>(() => defaultValue ?? []);
  const [draft, setDraft] = useState("");
  const [armed, setArmed] = useState(-1);
  const [rejection, setRejection] = useState<Rejection | null>(null);
  const [flashed, setFlashed] = useState<string | null>(null);
  const [announcement, setAnnouncement] = useState("");

  const controlled = value !== undefined;
  const tags = value ?? internal;
  const armedIndex = armed >= tags.length ? -1 : armed;

  const emit = useRef(onChange);
  emit.current = onChange;
  const check = useRef(validate);
  check.current = validate;

  const rejectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const flashTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (rejectTimer.current) clearTimeout(rejectTimer.current);
      if (flashTimer.current) clearTimeout(flashTimer.current);
    },
    [],
  );

  const dismiss = useCallback(() => {
    if (rejectTimer.current) clearTimeout(rejectTimer.current);
    rejectTimer.current = null;
    setRejection((prev) => (prev && prev.visible ? { ...prev, visible: false } : prev));
  }, []);

  const refuse = useCallback(
    (reason: TagRejection, tag: string) => {
      if (rejectTimer.current) clearTimeout(rejectTimer.current);
      setRejection({ reason, tag, visible: true });
      rejectTimer.current = setTimeout(() => {
        setRejection((prev) => (prev ? { ...prev, visible: false } : prev));
      }, 2400);

      setAnnouncement(
        reason === "duplicate"
          ? `${tag} is already in the list.`
          : reason === "limit"
            ? `That is the limit of ${max} tags.`
            : `${tag} is not allowed here.`,
      );

      if (reason !== "duplicate") return;
      if (flashTimer.current) clearTimeout(flashTimer.current);
      setFlashed(tag);
      flashTimer.current = setTimeout(() => setFlashed(null), 460);
    },
    [max],
  );

  const apply = useCallback(
    (next: string[]) => {
      if (!controlled) setInternal(next);
      emit.current?.(next);
    },
    [controlled],
  );

  const add = useCallback(
    (raws: string[]) => {
      const next = [...tags];
      let added = 0;
      let failure: { reason: TagRejection; tag: string } | null = null;

      for (const raw of raws) {
        const candidate = clean(raw);
        if (!candidate) continue;

        if (max !== undefined && next.length >= max) {
          failure = { reason: "limit", tag: candidate };
          break;
        }

        if (!allowDuplicates) {
          const twin = next.find((t) => t.toLowerCase() === candidate.toLowerCase());
          if (twin) {
            failure = { reason: "duplicate", tag: twin };
            continue;
          }
        }

        if (check.current && !check.current(candidate, next)) {
          failure = { reason: "invalid", tag: candidate };
          continue;
        }

        next.push(candidate);
        added += 1;
      }

      if (added > 0) {
        apply(next);
        setDraft("");
        setArmed(-1);
        dismiss();
        setAnnouncement(
          `${added === 1 ? next[next.length - 1] : `${added} tags`} added, ${next.length} total.`,
        );
      }

      if (failure) refuse(failure.reason, failure.tag);
      return added > 0;
    },
    [tags, max, allowDuplicates, apply, dismiss, refuse],
  );

  const removeAt = useCallback(
    (index: number) => {
      if (index < 0 || index >= tags.length) return;
      const gone = tags[index];
      const next = tags.filter((_, i) => i !== index);
      apply(next);
      setArmed(-1);
      dismiss();
      setAnnouncement(`${gone} removed, ${next.length} left.`);
    },
    [tags, apply, dismiss],
  );

  const arm = useCallback(
    (index: number) => {
      setArmed(index);
      setAnnouncement(`${tags[index]} selected, press Backspace again to remove it.`);
    },
    [tags],
  );

  const inputProps = {
    value: draft,
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
      setDraft(e.target.value);
      setArmed(-1);
      dismiss();
    },
    onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.nativeEvent.isComposing) return;

      if (e.key === "Enter" || separators.includes(e.key)) {
        e.preventDefault();
        add([draft]);
        return;
      }

      if (e.key === "Backspace" && draft === "") {
        e.preventDefault();
        if (e.repeat) return;
        if (armedIndex >= 0) removeAt(armedIndex);
        else if (tags.length > 0) arm(tags.length - 1);
        return;
      }

      if (e.key === "Delete" && armedIndex >= 0) {
        e.preventDefault();
        if (e.repeat) return;
        removeAt(armedIndex);
        return;
      }

      if (e.key === "ArrowLeft") {
        const start = e.currentTarget.selectionStart;
        const end = e.currentTarget.selectionEnd;
        if (start !== 0 || end !== 0 || tags.length === 0) return;
        e.preventDefault();
        arm(armedIndex < 0 ? tags.length - 1 : Math.max(0, armedIndex - 1));
        return;
      }

      if (e.key === "ArrowRight" && armedIndex >= 0) {
        e.preventDefault();
        if (armedIndex >= tags.length - 1) setArmed(-1);
        else arm(armedIndex + 1);
        return;
      }

      if (e.key === "Escape" && armedIndex >= 0) {
        e.preventDefault();
        setArmed(-1);
      }
    },
    onPaste: (e: React.ClipboardEvent<HTMLInputElement>) => {
      const text = e.clipboardData.getData("text");
      const pattern = splitter(separators);
      if (!pattern.test(text)) return;
      e.preventDefault();
      add(text.split(pattern));
    },
    onBlur: () => setArmed(-1),
  };

  return {
    tags,
    draft,
    setDraft,
    armedIndex,
    flashed,
    rejection,
    announcement,
    inputProps,
    add,
    removeAt,
    max,
  };
}

export type TagInputProps = UseTagInputOptions & {
  label?: string;
  placeholder?: string;
  hint?: string;
  className?: string;
};

function CloseGlyph() {
  return (
    <svg
      viewBox="0 0 10 10"
      aria-hidden
      className="size-[9px]"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
    >
      <path d="M2.6 2.6 7.4 7.4M7.4 2.6 2.6 7.4" />
    </svg>
  );
}

export function TagInput({
  label,
  placeholder = "Add a tag",
  hint = "Enter adds · Backspace removes",
  className = "",
  ...options
}: TagInputProps) {
  const { tags, draft, armedIndex, flashed, rejection, announcement, inputProps, removeAt, max } =
    useTagInput(options);

  const reduced = useReducedMotion();
  const inputRef = useRef<HTMLInputElement>(null);
  const uid = useId();
  const inputId = `${uid}-tag-input`;
  const hintId = `${uid}-tag-hint`;

  const rows = useMemo(() => {
    const seen = new Map<string, number>();
    return tags.map((tag) => {
      const n = seen.get(tag) ?? 0;
      seen.set(tag, n + 1);
      return { tag, key: n === 0 ? tag : `${tag}#${n}` };
    });
  }, [tags]);

  const message = !rejection
    ? ""
    : rejection.reason === "duplicate"
      ? `${rejection.tag} is already in the list`
      : rejection.reason === "limit"
        ? `That is the limit of ${max} tags`
        : `${rejection.tag} is not allowed here`;

  const showMessage = rejection?.visible === true;

  return (
    <div className={`w-full ${className}`}>
      {label ? (
        <label
          htmlFor={inputId}
          className="mb-1.5 block text-[12.5px] font-medium text-stone-700 dark:text-stone-200"
        >
          {label}
        </label>
      ) : null}

      <ul
        onPointerDown={(e) => {
          if (e.target !== e.currentTarget) return;
          e.preventDefault();
          inputRef.current?.focus();
        }}
        className="relative flex max-h-[116px] min-h-10 list-none flex-wrap items-center gap-1.5 overflow-y-auto overscroll-contain rounded-[10px] border-2 border-stone-200 bg-stone-100/70 p-[4px] shadow-[inset_0_1px_2px_rgba(28,25,23,0.07)] transition-[background-color,border-color,box-shadow] duration-150 focus-within:border-[#4568FF] focus-within:bg-white focus-within:shadow-none dark:border-white/[0.08] dark:bg-[#1D1D1A] dark:shadow-[inset_0_1px_2px_rgba(0,0,0,0.45)] dark:focus-within:border-[#93B0FF] dark:focus-within:bg-[#252522]"
      >
        <AnimatePresence initial={false} mode="popLayout">
          {rows.map(({ tag, key }, index) => {
            const lit = armedIndex === index || flashed === tag;
            return (
              <motion.li
                key={key}
                role="listitem"
                layout="position"
                initial={reduced ? false : { opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={
                  reduced
                    ? { opacity: 0, transition: INSTANT }
                    : { opacity: 0, scale: 0.9, transition: EXIT }
                }
                transition={reduced ? INSTANT : { default: CHIP, layout: CHIP }}
                className={`flex h-6 max-w-full shrink-0 select-none items-center gap-1 rounded-[6px] border pl-2 pr-1.5 text-[12.5px] transition-[background-color,border-color,box-shadow,color] duration-150 ${
                  lit
                    ? "border-stone-800 bg-stone-800 text-white shadow-[0_1px_2px_rgba(28,25,23,0.18)] dark:border-stone-100 dark:bg-stone-100 dark:text-stone-900 dark:shadow-[0_1px_2px_rgba(0,0,0,0.4)]"
                    : "border-stone-200 bg-white text-stone-800 shadow-[inset_0_1.5px_0_rgba(255,255,255,0.95),inset_0_-1px_0_rgba(28,25,23,0.06),0_1px_2px_rgba(28,25,23,0.08)] dark:border-white/[0.16] dark:bg-[#2A2A27] dark:text-stone-200 dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.07),0_1px_2px_rgba(0,0,0,0.4)]"
                }`}
              >
                <span className="truncate">{tag}</span>
                <button
                  type="button"
                  tabIndex={-1}
                  aria-label={`Remove ${tag}`}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    removeAt(index);
                    inputRef.current?.focus();
                  }}
                  className={`-mr-0.5 grid size-[14px] shrink-0 place-items-center rounded-[5px] transition-colors duration-150 ${
                    lit
                      ? "text-white/70 hover:text-white dark:text-stone-900/60 dark:hover:text-stone-900"
                      : "text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100"
                  }`}
                >
                  <CloseGlyph />
                </button>
              </motion.li>
            );
          })}
        </AnimatePresence>

        <motion.li
          layout={reduced ? false : "position"}
          transition={reduced ? INSTANT : CHIP}
          className="relative flex h-6 flex-1"
        >
          <span
            aria-hidden
            className="pointer-events-none invisible max-w-56 overflow-hidden whitespace-pre px-1 text-[12.5px]"
          >
            {draft || placeholder}
          </span>
          <input
            {...inputProps}
            ref={inputRef}
            id={inputId}
            type="text"
            aria-describedby={hintId}
            aria-label={label ? undefined : "Tags"}
            placeholder={placeholder}
            autoComplete="off"
            autoCapitalize="off"
            autoCorrect="off"
            spellCheck={false}
            enterKeyHint="done"
            className="absolute inset-0 h-full w-full bg-transparent px-1 text-[12.5px] text-stone-700 outline-none placeholder:text-stone-400 dark:text-stone-200 dark:placeholder:text-stone-500"
          />
        </motion.li>
      </ul>

      <div className="mt-1.5 flex items-baseline justify-between gap-3">
        <div className="grid min-w-0 flex-1">
          <motion.p
            id={hintId}
            initial={false}
            animate={{ opacity: showMessage ? 0 : 1 }}
            transition={reduced ? INSTANT : CROSSFADE}
            className="col-start-1 row-start-1 truncate text-[11.5px] text-stone-500 dark:text-stone-400"
          >
            {hint}
          </motion.p>
          <motion.p
            aria-hidden
            initial={false}
            animate={{ opacity: showMessage ? 1 : 0 }}
            transition={reduced ? INSTANT : CROSSFADE}
            className="col-start-1 row-start-1 truncate text-[11.5px] text-stone-700 dark:text-stone-200"
          >
            {message}
          </motion.p>
        </div>

        {max === undefined ? null : (
          <p className="shrink-0 text-[11.5px] tabular-nums text-stone-500 dark:text-stone-400">
            <span className="inline-grid justify-items-end">
              <span aria-hidden className="invisible col-start-1 row-start-1">
                {max}
              </span>
              <span className="col-start-1 row-start-1">{tags.length}</span>
            </span>
            <span> / {max}</span>
          </p>
        )}
      </div>

      <span role="status" aria-live="polite" aria-atomic="true" className="sr-only">
        {announcement}
      </span>
    </div>
  );
}
