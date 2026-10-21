import Link from "next/link";
import { ThemeToggle } from "@/components/site/theme-toggle";
import { BrandMark } from "@/components/site/brand-mark";
import { Logo } from "@/components/site/logo";
import { LandingSections } from "@/components/site/landing-sections";
import { LIBRARY_FEATURE } from "@/lib/testimonials";
import { GITHUB, SEO_DESCRIPTION, SITE, TITLE } from "@/lib/site";

const STAR_BADGE = /^\d+(\.\d+)?[kKmM]?$/;

async function fetchJson(url: string, headers?: HeadersInit): Promise<Record<string, unknown> | null> {
  try {
    const response = await fetch(url, {
      headers,
      next: { revalidate: 3600 },
      signal: AbortSignal.timeout(3000),
    });
    if (!response.ok) return null;
    const data: unknown = await response.json();
    return data && typeof data === "object" ? (data as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}

async function getGitHubStars(): Promise<string | null> {
  const token = process.env.GITHUB_TOKEN;
  const repo = await fetchJson("https://api.github.com/repos/ddoemonn/interior", {
    Accept: "application/vnd.github+json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  });
  const count = repo?.stargazers_count;
  if (typeof count === "number" && Number.isSafeInteger(count) && count >= 0) {
    return new Intl.NumberFormat("en", {
      notation: count >= 10000 ? "compact" : "standard",
      maximumFractionDigits: 1,
    }).format(count);
  }
  const badge = await fetchJson("https://img.shields.io/github/stars/ddoemonn/interior.json");
  const value = badge?.value;
  return typeof value === "string" && STAR_BADGE.test(value) ? value : null;
}

export default async function Home() {
  const stars = await getGitHubStars();
  const starCount = stars ?? "—";
  const website = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE}/#website`,
    name: TITLE,
    url: SITE,
    description: SEO_DESCRIPTION,
    inLanguage: "en",
    sameAs: [GITHUB],
  };

  return (
    <div className="flex min-h-screen flex-1 p-3 sm:p-5">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(website).replace(/</g, "\\u003c") }}
      />
      <div className="landing-panel mat-panel flex min-h-0 flex-1 flex-col overflow-hidden rounded-[20px]">
        <header className="flex h-12 shrink-0 items-center gap-4 border-b border-hairline px-5">
          <Logo />
          <span className="flex-1" />
          <nav aria-label="Main" className="mr-2 hidden items-center gap-5 text-[12.5px] text-ink-3 sm:flex">
            <a href="#components" className="inline-flex min-h-11 items-center hover:text-ink">Components</a>
            <a href="#install" className="inline-flex min-h-11 items-center hover:text-ink">Get started</a>
          </nav>
          <ThemeToggle />
        </header>

        <main className="flex-1 px-6 sm:px-12">
          <div className="mx-auto w-full max-w-[900px]">
            <section aria-label="Introduction" className="py-10 sm:py-24">
              <div className="w-fit origin-left scale-[1.3] sm:scale-[1.6]">
                <BrandMark />
              </div>

              <h1 className="mt-8 max-w-[22ch] text-balance text-[clamp(26px,7.6vw,32px)] font-medium leading-[1.08] tracking-[-0.04em] text-ink sm:mt-16 sm:text-[clamp(32px,5.6vw,52px)]">
                Software feels cheap in the{" "}
                <span className="whitespace-nowrap">half-second</span> after a
                click.
              </h1>

              <div className="mt-6 grid max-w-[44ch] gap-3 text-[13.5px] leading-[1.7] text-ink-2 sm:mt-9 sm:gap-4 sm:text-[15px]">
                <p>
                  The fade a beat too slow. The spinner outliving the request. The
                  row that jumps as it loads.
                </p>
                <p>
                  Free, open-source React micro-interactions, argued out to the
                  frame. The behaviour is finished; the style is yours.
                </p>
              </div>

              <div className="mt-8 flex flex-wrap items-center gap-3 sm:mt-12">
                <Link
                  href="/docs"
                  className="press inline-flex h-8 items-center rounded-[9px] px-3 text-[12.5px] font-medium sm:h-9 sm:px-3.5 sm:text-[13px]"
                  style={{ background: "var(--ink)", color: "var(--panel)" }}
                >
                  See the components
                </Link>
                <a
                  href={GITHUB}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={stars === null ? "View interior.dev on GitHub" : `View interior.dev on GitHub, ${stars} stars`}
                  className="group mat-cap press inline-flex h-8 items-center gap-1.5 rounded-[9px] px-3 text-[12.5px] font-medium text-ink-2 hover:text-ink sm:h-9 sm:px-3.5 sm:text-[13px]"
                >
                  <svg
                    className="shrink-0"
                    width="15"
                    height="15"
                    viewBox="0 0 16 16"
                    fill="currentColor"
                    aria-hidden
                  >
                    <path d="M8 0C3.58 0 0 3.58 0 8a8 8 0 0 0 5.47 7.59c.4.07.55-.17.55-.38l-.01-1.49c-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82a7.4 7.4 0 0 1 4 0c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48l-.01 2.19c0 .21.15.46.55.38A8 8 0 0 0 16 8c0-4.42-3.58-8-8-8Z" />
                  </svg>
                  GitHub
                  <span
                    aria-hidden="true"
                    title={stars === null ? "Star count temporarily unavailable" : `${stars} stars`}
                    className="inline-flex h-3 items-center border-l border-hairline pl-1.5 text-[11px] font-normal tabular-nums tracking-tight text-ink-3 transition-colors duration-150 group-hover:text-ink group-focus-visible:text-ink motion-reduce:transition-none"
                  >
                    {starCount}
                  </span>
                  <svg
                    aria-hidden="true"
                    width="11"
                    height="11"
                    viewBox="0 0 256 256"
                    fill="currentColor"
                    className="-ml-0.5 shrink-0 text-ink-3 transition-colors duration-150 group-hover:text-[#EAB308] group-focus-visible:text-[#EAB308] motion-reduce:transition-none"
                  >
                    <path
                      className="opacity-0 transition-opacity duration-150 group-hover:opacity-100 group-focus-visible:opacity-100 motion-reduce:transition-none"
                      d="M229.06,108.79l-48.7,42,14.88,62.79a8.4,8.4,0,0,1-12.52,9.17L128,189.09,73.28,222.74a8.4,8.4,0,0,1-12.52-9.17l14.88-62.79-48.7-42A8.46,8.46,0,0,1,31.73,94L95.64,88.8l24.62-59.6a8.36,8.36,0,0,1,15.48,0l24.62,59.6L224.27,94A8.46,8.46,0,0,1,229.06,108.79Z"
                    />
                    <path
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="16"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M229.06,108.79l-48.7,42,14.88,62.79a8.4,8.4,0,0,1-12.52,9.17L128,189.09,73.28,222.74a8.4,8.4,0,0,1-12.52-9.17l14.88-62.79-48.7-42A8.46,8.46,0,0,1,31.73,94L95.64,88.8l24.62-59.6a8.36,8.36,0,0,1,15.48,0l24.62,59.6L224.27,94A8.46,8.46,0,0,1,229.06,108.79Z"
                    />
                  </svg>
                </a>
              </div>
              <a href={LIBRARY_FEATURE} target="_blank" rel="noreferrer" className="mt-5 inline-flex min-h-11 items-center gap-1.5 text-[11.5px] leading-relaxed text-ink-3 hover:text-ink">
                Library of the Month on <span className="font-medium text-ink-2">21st.dev</span><span aria-hidden="true">↗</span>
              </a>
            </section>
            <LandingSections />
          </div>
        </main>
      </div>
    </div>
  );
}
