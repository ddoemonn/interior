import Link from "next/link";
import { ThemeToggle } from "@/components/site/theme-toggle";
import { BrandMark } from "@/components/site/brand-mark";
import { Logo } from "@/components/site/logo";

/** Placeholder cover. The real landing comes once the set is further along. */
export default function Home() {
  return (
    <div className="flex h-dvh flex-1 p-3 sm:h-auto sm:min-h-screen sm:p-5">
      <div className="mat-panel flex min-h-0 flex-1 flex-col overflow-hidden rounded-[20px]">
        <header className="flex h-12 shrink-0 items-center gap-4 border-b border-hairline px-5">
          <Logo />
          <span className="flex-1" />
          <ThemeToggle />
        </header>

        <main className="flex min-h-0 flex-1 overflow-y-auto overscroll-contain px-6 sm:px-12">
          <div className="mx-auto my-auto w-full max-w-[900px] py-10 sm:py-24">
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
                Every one of these is argued out to the frame. The behaviour is
                finished; the style is yours.
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
                href="https://github.com/ddoemonn/interior"
                target="_blank"
                rel="noreferrer"
                className="mat-cap press inline-flex h-8 items-center gap-2 rounded-[9px] px-3 text-[12.5px] font-medium text-ink-2 hover:text-ink sm:h-9 sm:px-3.5 sm:text-[13px]"
              >
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 16 16"
                  fill="currentColor"
                  aria-hidden
                >
                  <path d="M8 0C3.58 0 0 3.58 0 8a8 8 0 0 0 5.47 7.59c.4.07.55-.17.55-.38l-.01-1.49c-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82a7.4 7.4 0 0 1 4 0c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48l-.01 2.19c0 .21.15.46.55.38A8 8 0 0 0 16 8c0-4.42-3.58-8-8-8Z" />
                </svg>
                GitHub
              </a>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
