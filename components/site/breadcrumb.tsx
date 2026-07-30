"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { getCategoryOf, getEntry } from "@/lib/registry";

export function Breadcrumb() {
  const pathname = usePathname();
  const slug = pathname.startsWith("/docs/") ? pathname.slice(6) : null;
  const entry = slug ? getEntry(slug) : undefined;
  const cat = slug ? getCategoryOf(slug) : undefined;

  return (
    <div className="flex min-w-0 items-center gap-1.5 text-[12px]">
      <Link
        href="/docs"
        className="text-ink-3 transition-colors hover:text-ink-2"
      >
        Components
      </Link>
      {cat && (
        <>
          <span className="text-ink-3/60">·</span>
          <span className="text-ink-3">{cat.name}</span>
        </>
      )}
      {entry && (
        <>
          <span className="text-ink-3/60">·</span>
          <span className="truncate font-medium text-ink-2">{entry.name}</span>
        </>
      )}
    </div>
  );
}
