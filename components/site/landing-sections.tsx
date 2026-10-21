import Link from "next/link";
import { CodeBlock } from "@/components/docs/code-block";
import { SHIPPED } from "@/lib/registry";
import { GITHUB, SITE } from "@/lib/site";
import { LAUNCH_POST } from "@/lib/testimonials";
import { LandingDemo, LandingShowcase, type LandingDemoSlug } from "./landing-demo";
import { Logo } from "./logo";
import { ReactionWall } from "./reaction-wall";

const selection: { slug: LandingDemoSlug; name: string; note: string }[] = [
  { slug: "loading-button", name: "Loading Button", note: "The label changes. The button stays put." },
  { slug: "hold-to-confirm", name: "Hold to Confirm", note: "A moment to change your mind." },
  { slug: "tooltip-group", name: "Tooltip Group", note: "A little patience. Then no waiting." },
  { slug: "slider-detents", name: "Slider Detents", note: "Stops you can feel." },
  { slug: "segmented-control", name: "Segmented Control", note: "The selection travels. Nothing jumps." },
  { slug: "like-burst", name: "Like Burst", note: "Even a second tap is considered." },
];

function Arrow({ diagonal = false }: { diagonal?: boolean }) {
  return (
    <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d={diagonal ? "M6 18 18 6M6 6h12v12" : "M5 12h14m-5-5 5 5-5 5"} />
    </svg>
  );
}

export function LandingSections() {
  const install = `npx shadcn@latest add ${SITE}/r/copy-button.json`;

  return (
    <>
      <section id="components" aria-labelledby="components-title" className="landing-divider scroll-mt-8 py-14 sm:py-20">
        <div className="mb-7 flex flex-wrap items-end justify-between gap-5 sm:mb-9">
          <div>
            <h2 id="components-title" className="text-[27px] font-medium leading-[1.15] tracking-[-0.03em] text-ink">Small things. Finished.</h2>
            <p className="mt-3 max-w-[44ch] text-[13.5px] leading-relaxed text-ink-2">Animated React components, shown in motion.</p>
          </div>
          <Link href="/docs" className="inline-flex min-h-11 items-center gap-2 text-[12.5px] text-ink-2 hover:text-ink">
            All {SHIPPED} components <Arrow />
          </Link>
        </div>
        <LandingShowcase>
        <div className="grid gap-4 sm:grid-cols-2">
          {selection.map((entry) => (
            <article key={entry.slug} className="mat-panel min-w-0 rounded-[16px] p-[5px]">
              <LandingDemo name={entry.name} slug={entry.slug} />
              <div className="flex min-h-[76px] items-center justify-between gap-3 px-3 py-3">
                <div className="min-w-0">
                  <h3 className="text-[13px] font-medium leading-relaxed text-ink">
                    <Link href={`/docs/${entry.slug}`} className="hover:underline underline-offset-4">{entry.name}</Link>
                  </h3>
                  <p className="mt-1 text-[11.5px] leading-relaxed text-ink-3">{entry.note}</p>
                </div>
                <Link href={`/docs/${entry.slug}`} aria-label={`${entry.name} source and documentation`} className="grid size-11 shrink-0 place-items-center rounded-[7px] text-ink-3 hover:text-ink">
                  <Arrow diagonal />
                </Link>
              </div>
            </article>
          ))}
        </div>
        </LandingShowcase>
      </section>

      <section id="install" aria-labelledby="install-title" className="landing-divider grid gap-8 py-14 sm:grid-cols-[0.75fr_1.25fr] sm:gap-12 sm:py-20">
        <div>
          <h2 id="install-title" className="text-[27px] font-medium leading-[1.15] tracking-[-0.03em] text-ink">One file. Yours.</h2>
          <p className="mt-3 max-w-[32ch] text-[13.5px] leading-relaxed text-ink-2">Add a component. Keep the source. Change everything you want.</p>
          <p className="mt-4 max-w-[32ch] text-[11.5px] leading-relaxed text-ink-3">React, Tailwind CSS, and Motion.<br />TypeScript throughout. MIT licensed.</p>
          <Link href="/docs/copy-button" className="mt-4 inline-flex min-h-11 items-center gap-2 text-[12.5px] text-ink-2 hover:text-ink">Meet the copy button <Arrow /></Link>
        </div>
        <div className="min-w-0 space-y-3">
          <CodeBlock filename="terminal" lang="bash" code={install} />
          <CodeBlock filename="your-component.tsx" code={'import { CopyButton } from "@/components/interior/copy-button";\n\n<CopyButton value="hello@interior.dev" />'} />
        </div>
      </section>

      <section aria-labelledby="voices-title" className="landing-divider py-14 sm:py-20">
        <div className="mb-7 flex flex-wrap items-end justify-between gap-4 sm:mb-9">
          <div>
            <h2 id="voices-title" className="text-[27px] font-medium leading-[1.15] tracking-[-0.03em] text-ink">A few words back.</h2>
            <p className="mt-3 text-[13.5px] leading-relaxed text-ink-2">From the launch conversation on X.</p>
          </div>
          <a href={LAUNCH_POST} target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center gap-2 text-[12.5px] text-ink-2 hover:text-ink">Read the conversation <Arrow diagonal /></a>
        </div>
        <ReactionWall />
      </section>

      <section aria-labelledby="closing-title" className="landing-divider py-14 sm:py-16">
        <div className="flex flex-wrap items-center justify-between gap-6">
          <div>
            <h2 id="closing-title" className="text-[27px] font-medium leading-[1.15] tracking-[-0.03em] text-ink">Finish the small things.</h2>
            <p className="mt-3 text-[13.5px] leading-relaxed text-ink-2">{SHIPPED} components. The style is still yours.</p>
          </div>
          <Link href="/docs" className="press inline-flex h-8 items-center gap-2 rounded-[9px] px-3 text-[12.5px] font-medium sm:h-9 sm:px-3.5 sm:text-[13px]" style={{ background: "var(--ink)", color: "var(--panel)" }}>Explore the components <Arrow /></Link>
        </div>
      </section>

      <footer className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 landing-divider py-5 text-[11.5px] leading-relaxed text-ink-3">
        <Logo />
        <div className="flex items-center gap-5">
          <a href={`${GITHUB}/blob/main/LICENSE`} className="inline-flex min-h-11 items-center hover:text-ink">MIT license</a>
          <a href="https://x.com/ozzyxs1a" target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center hover:text-ink">Made by Ozzy</a>
        </div>
      </footer>
    </>
  );
}
