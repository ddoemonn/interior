import fs from "node:fs/promises";
import path from "node:path";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Enter } from "@/components/docs/enter";
import { Preview } from "@/components/docs/preview";
import { CodeBlock } from "@/components/docs/code-block";
import { bleedDemos, demos } from "@/lib/demos";
import { getCategoryOf, getEntry, readyEntries } from "@/lib/registry";
import { GITHUB, SITE } from "@/lib/site";

export function generateStaticParams() {
  return readyEntries.map((e) => ({ slug: e.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const entry = getEntry(slug);
  if (!entry) return {};
  return {
    title: entry.name,
    description: entry.blurb,
    alternates: { canonical: `/docs/${slug}` },
    openGraph: {
      type: "article",
      url: `${SITE}/docs/${slug}`,
      title: entry.name,
      description: entry.blurb,
      siteName: "interior.dev",
    },
    twitter: {
      card: "summary_large_image",
      title: entry.name,
      description: entry.blurb,
    },
  };
}

export default async function SheetPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const entry = getEntry(slug);

  if (!entry || entry.status !== "ready" || !entry.src) notFound();

  const category = getCategoryOf(slug);
  const Demo = demos[slug];
  // scoped to one folder so the build only traces that folder
  const source = await fs.readFile(
    path.join(process.cwd(), "components/interior", `${slug}.tsx`),
    "utf8",
  );

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareSourceCode",
    name: entry.name,
    description: entry.blurb,
    url: `${SITE}/docs/${slug}`,
    codeRepository: GITHUB,
    programmingLanguage: "TypeScript",
    runtimePlatform: "React",
    isAccessibleForFree: true,
    isPartOf: { "@type": "WebSite", name: "interior.dev", url: SITE },
  };

  return (
    <article className="mx-auto max-w-[740px] px-6 pb-24 pt-11 sm:px-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Enter>
        <header>
          <p className="flex items-center gap-1.5 text-[11px] text-ink-3">
            <span>{category?.name}</span>
            <span className="text-ink-3/60">·</span>
            <span className="tnum font-mono">{entry.id}</span>
          </p>

          <h1 className="mt-3 text-[27px] font-medium leading-[1.15] tracking-[-0.03em] text-ink">
            {entry.name}
          </h1>
          <p className="mt-2.5 max-w-[54ch] text-[14px] leading-relaxed text-ink-2">
            {entry.blurb}.
          </p>
        </header>
      </Enter>

      {Demo && (
        <Enter delay={0.07} className="mt-8">
          <Preview label={entry.slug} bleed={bleedDemos.has(slug)}>
            <Demo />
          </Preview>
        </Enter>
      )}

      <Enter delay={0.14}>
      <H2>Install</H2>
      <p className="mb-3 max-w-[58ch] text-[13.5px] leading-relaxed text-ink-2">
        One dependency. The component is copied into your project, so the file
        is yours after that.
      </p>
      <CodeBlock code="bun add motion" lang="bash" filename="terminal" />
      <p className="mb-3 mt-5 max-w-[58ch] text-[13.5px] leading-relaxed text-ink-2">
        Or let the shadcn CLI do the copying — same file, landing in
        components/interior.
      </p>
      <CodeBlock
        code={`bunx shadcn@latest add ${SITE}/r/${slug}.json`}
        lang="bash"
        filename="terminal"
      />

      {entry.usage && (
        <>
          <H2>Usage</H2>
          <CodeBlock code={entry.usage} lang="tsx" filename="stats.tsx" />
        </>
      )}

      <H2>Source</H2>
      <CodeBlock code={source} lang="tsx" filename={entry.src} />

      {entry.props && (
        <>
          <H2>Props</H2>
          <div className="mat-panel rounded-[14px] px-4">
            {entry.props.map((prop, i) => (
              <div
                key={`${prop.name}-${i}`}
                className={`grid gap-x-5 gap-y-1.5 py-3.5 sm:grid-cols-[168px_minmax(0,1fr)] ${
                  i > 0 ? "border-t border-hairline" : ""
                }`}
              >
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                  <code className="font-mono text-[12px] font-medium text-ink">
                    {prop.name}
                  </code>
                  {prop.default && (
                    <span className="mat-well tnum rounded-[5px] px-1.5 py-0.5 font-mono text-[10px] text-ink-3">
                      {prop.default}
                    </span>
                  )}
                </div>
                <div className="min-w-0">
                  <code
                    className="font-mono text-[11px]"
                    style={{ color: "var(--accent)" }}
                  >
                    {prop.type}
                  </code>
                  <p className="mt-1 text-[13px] leading-relaxed text-ink-2">
                    {prop.note}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      </Enter>
    </article>
  );
}

function H2({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mb-3 mt-12 text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-3">
      {children}
    </h2>
  );
}
