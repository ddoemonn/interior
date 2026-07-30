"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { CaretRightIcon, MagnifyingGlassIcon } from "@phosphor-icons/react";
import { categories, getCategoryOf, type Entry } from "@/lib/registry";
import { Logo } from "./logo";

const EASE = [0.23, 1, 0.32, 1] as const;

export function Sidebar() {
  const pathname = usePathname();
  const slug = pathname.startsWith("/docs/") ? pathname.slice(6) : null;
  const activeCat = slug ? getCategoryOf(slug)?.id : undefined;

  const [q, setQ] = useState("");
  const [open, setOpen] = useState<string[]>(activeCat ? [activeCat] : []);
  const inputRef = useRef<HTMLInputElement>(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    if (activeCat) {
      setOpen((prev) => (prev.includes(activeCat) ? prev : [...prev, activeCat]));
    }
  }, [activeCat]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "/" || e.metaKey || e.ctrlKey) return;
      const t = e.target as HTMLElement | null;
      if (t && /^(INPUT|TEXTAREA)$/.test(t.tagName)) return;
      e.preventDefault();
      inputRef.current?.focus();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const query = q.trim().toLowerCase();
  const groups = useMemo(() => {
    if (!query) return categories;
    return categories
      .map((c) => ({
        ...c,
        entries: c.entries.filter((e) =>
          `${e.name} ${e.blurb}`.toLowerCase().includes(query),
        ),
      }))
      .filter((c) => c.entries.length > 0);
  }, [query]);

  const hits = groups.reduce((n, c) => n + c.entries.length, 0);
  const allOpen = open.length === categories.length;

  function toggle(id: string) {
    setOpen((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }

  return (
    <nav aria-label="Components" className="flex h-full flex-col px-2">
      <div className="shrink-0 pb-2.5">
        <div className="flex h-12 items-center px-2.5">
          <Link href="/">
            <Logo size={15} />
          </Link>
        </div>
        <div className="mat-well flex h-[34px] items-center gap-2 rounded-[9px] px-2.5">
          <MagnifyingGlassIcon
            size={13}
            weight="bold"
            aria-hidden
            className="shrink-0"
            style={{ color: query ? "var(--ink-2)" : "var(--ink-3)" }}
          />
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => e.key === "Escape" && setQ("")}
            placeholder="Filter"
            aria-label="Filter components"
            className="min-w-0 flex-1 bg-transparent text-[13px] text-ink outline-none placeholder:text-ink-3"
          />
          {query ? (
            <span className="tnum shrink-0 font-mono text-[9.5px] text-ink-3">
              {hits}
            </span>
          ) : (
            <kbd className="mat-cap grid size-[16px] shrink-0 place-items-center rounded-[4px] text-[9.5px] text-ink-3">
              /
            </kbd>
          )}
        </div>

        {!query && (
          <button
            type="button"
            onClick={() =>
              setOpen(allOpen ? [] : categories.map((c) => c.id))
            }
            className="mt-2.5 px-2.5 text-[11.5px] text-ink-3 transition-colors hover:text-ink-2"
          >
            {allOpen ? "Collapse all" : "Expand all"}
          </button>
        )}
      </div>
      <div className="fade-y no-bar min-h-0 flex-1 overflow-y-auto overscroll-contain pb-8 pt-1">
        {groups.length === 0 && (
          <p className="px-2.5 py-6 text-[12.5px] text-ink-3">
            Nothing matches “{q.trim()}”.
          </p>
        )}

        {groups.map((cat) => {
          const expanded = !!query || open.includes(cat.id);
          return (
            <section key={cat.id}>
              <button
                type="button"
                onClick={() => !query && toggle(cat.id)}
                aria-expanded={expanded}
                className="group flex h-[32px] w-full items-center gap-2 rounded-[9px] px-2.5 hover:bg-well"
              >
                <motion.span
                  aria-hidden
                  className="flex shrink-0 items-center"
                  style={{ color: "var(--ink-3)" }}
                  animate={{ rotate: expanded ? 90 : 0 }}
                  transition={
                    reduce ? { duration: 0 } : { duration: 0.24, ease: EASE }
                  }
                >
                  <CaretRightIcon size={10} weight="bold" />
                </motion.span>
                <span
                  className={`flex-1 truncate text-left text-[13px] transition-colors duration-150 ${
                    expanded
                      ? "font-medium text-ink"
                      : "text-ink-2 group-hover:text-ink"
                  }`}
                >
                  {cat.name}
                </span>
                <Strip entries={cat.entries} activeSlug={slug} />
              </button>
              <AnimatePresence initial={false}>
                {expanded && (
                  <motion.div
                    key="body"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={
                      reduce
                        ? { duration: 0 }
                        : {
                            height: { duration: 0.28, ease: EASE },
                            opacity: { duration: 0.18, ease: EASE },
                          }
                    }
                    className="overflow-hidden"
                  >
                    <ul className="pb-1.5">
                      {cat.entries.map((e) => (
                        <Row
                          key={e.slug}
                          entry={e}
                          active={slug === e.slug}
                        />
                      ))}
                    </ul>
                  </motion.div>
                )}
              </AnimatePresence>
            </section>
          );
        })}
      </div>
    </nav>
  );
}

function Row({ entry, active }: { entry: Entry; active: boolean }) {
  if (entry.status !== "ready") {
    return (
      <li className="flex h-[30px] select-none items-center pl-[30px] pr-2.5 text-[13px] text-ink-3/70">
        <span className="truncate">{entry.name}</span>
      </li>
    );
  }

  return (
    <li>
      <Link
        href={`/docs/${entry.slug}`}
        aria-current={active ? "page" : undefined}
        className={`group flex h-[30px] items-center rounded-[8px] pl-[30px] pr-2.5 ${
          active ? "mat-row" : "hover:bg-well"
        }`}
      >
        <span
          className={`truncate text-[13px] ${
            active ? "font-medium text-ink" : "text-ink-2 group-hover:text-ink"
          }`}
        >
          {entry.name}
        </span>
      </Link>
    </li>
  );
}

function Strip({
  entries,
  activeSlug,
}: {
  entries: Entry[];
  activeSlug: string | null;
}) {
  return (
    <span className="flex shrink-0 gap-[2px]" aria-hidden>
      {entries.map((e) => {
        const here = e.slug === activeSlug;
        return (
          <span
            key={e.slug}
            className="block size-[4px] rounded-[1px] transition-colors duration-200"
            style={{
              background: here
                ? "var(--accent)"
                : e.status === "ready"
                  ? "color-mix(in oklab, var(--ink) 42%, transparent)"
                  : "color-mix(in oklab, var(--ink) 13%, transparent)",
            }}
          />
        );
      })}
    </span>
  );
}
