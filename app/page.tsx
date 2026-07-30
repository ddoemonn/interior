import Link from "next/link";
import { ThemeToggle } from "@/components/site/theme-toggle";
import { BrandMark } from "@/components/site/brand-mark";
import { Logo } from "@/components/site/logo";

/** Placeholder cover. The real landing comes once the set is further along. */
export default function Home() {
  return (
    <div className="flex min-h-screen flex-1 p-3 sm:p-5">
      <div className="mat-panel flex flex-1 flex-col rounded-[20px]">
        <header className="flex h-12 items-center gap-4 border-b border-hairline px-5">
          <Logo />
          <span className="flex-1" />
          <ThemeToggle />
        </header>

        <main className="flex flex-1 items-center px-6 sm:px-12">
          <div className="mx-auto w-full max-w-[900px] py-24">
            <div className="origin-left scale-[1.6]">
              <BrandMark />
            </div>

            <h1 className="mt-16 max-w-[22ch] text-balance text-[clamp(32px,5.6vw,52px)] font-medium leading-[1.08] tracking-[-0.04em] text-ink">
              Software feels cheap in the{" "}
              <span className="whitespace-nowrap">half-second</span> after a
              click.
            </h1>

            <div className="mt-9 grid max-w-[44ch] gap-4 text-[15px] leading-[1.7] text-ink-2">
              <p>
                The fade a beat too slow. The spinner outliving the request. The
                row that jumps as it loads.
              </p>
              <p>
                Every one of these is argued out to the frame, then handed over
                as a file you own.
              </p>
            </div>

            <div className="mt-12 flex flex-wrap items-center gap-3">
              <Link
                href="/docs"
                className="press inline-flex h-9 items-center rounded-[9px] px-3.5 text-[13px] font-medium"
                style={{ background: "var(--ink)", color: "var(--panel)" }}
              >
                See the components
              </Link>
              <a
                href="https://github.com/ddoemonn/interior"
                target="_blank"
                rel="noreferrer"
                className="mat-cap press inline-flex h-9 items-center gap-1.5 rounded-[9px] px-3.5 text-[13px] font-medium text-ink-2 hover:text-ink"
              >
                GitHub
                <svg
                  width="13"
                  height="13"
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-hidden
                >
                  <path
                    d="M7 17 17 7M9 7h8v8"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </a>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
