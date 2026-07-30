import Link from "next/link";
import { categories } from "@/lib/registry";

export const metadata = {
  title: "Why this exists",
  description:
    "every team builds these. nobody agrees on how. this is the argument for one way.",
};

const failures = [
  {
    wrong: "The button jumps",
    right:
      "A label changes from Save to Saving and the button resizes, so the row beneath it moves and your cursor is suddenly over something else. Every state a component can reach has to reserve its width before it gets there.",
  },
  {
    wrong: "The animation cannot be interrupted",
    right:
      "You click again halfway through and the transition restarts from the beginning, or worse, queues. A spring should resume from wherever it currently is, because that is where the element actually is.",
  },
  {
    wrong: "Motion is the only channel",
    right:
      "With reduced motion on, most libraries either play the animation anyway or hide the element entirely. The information has to arrive either way. The trip is optional, the destination is not.",
  },
];

const moments = [
  ["Action Feedback", "You did something. Did it land?"],
  ["Input", "You are telling the system something it might reject."],
  ["Async", "You are waiting, and you deserve to know on what."],
  ["Notification", "The system is telling you something you did not ask for."],
  ["Overlay", "Something came on top. It has to know where it came from."],
  ["Navigation", "You moved. The interface should agree about where."],
  ["Scroll", "You are reading, and the page is reacting to that."],
  ["Data", "A number changed. Which one, and by how much?"],
  ["Gesture", "Your finger is on it. Physics is now part of the API."],
  ["Content", "The thing itself arrives, resolves, or is missing."],
];

export default function DocsIndexPage() {
  return (
    <div className="mx-auto max-w-[680px] px-6 py-12 sm:px-10">
      <header>
        <h1 className="text-[27px] font-medium leading-[1.15] tracking-[-0.03em] text-ink">
          Why this exists
        </h1>
        <p className="mt-3.5 text-[15px] leading-relaxed text-ink-2">
          None of these are hard components. That is exactly the problem. Every
          team writes them, nobody is given a week to write them, and so they
          ship at eighty percent and stay there for the life of the product.
        </p>
        <p className="mt-3 text-[15px] leading-relaxed text-ink-2">
          Nobody chooses a product because its accordion animated well. But
          people do quietly decide software is cheap, and they decide it in the
          first thirty seconds, from a dozen small moments that were almost
          right.
        </p>
      </header>

      <section className="mt-12">
        <h2 className="text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-3">
          The three failures
        </h2>
        <p className="mt-3 text-[13.5px] leading-relaxed text-ink-2">
          Almost every animated component library ships all three. They are not
          hard problems. They are just invisible until they are not.
        </p>

        <ol className="mt-5 grid gap-2">
          {failures.map((f, i) => (
            <li key={f.wrong} className="mat-panel rounded-[13px] p-4">
              <div className="flex items-baseline gap-2.5">
                <span className="mat-well tnum grid size-[18px] shrink-0 place-items-center rounded-[5px] font-mono text-[9.5px] text-ink-3">
                  {i + 1}
                </span>
                <h3 className="text-[13.5px] font-medium tracking-[-0.01em] text-ink">
                  {f.wrong}
                </h3>
              </div>
              <p className="mt-2 pl-[28px] text-[13px] leading-relaxed text-ink-2">
                {f.right}
              </p>
            </li>
          ))}
        </ol>
      </section>

      <section className="mt-12">
        <h2 className="text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-3">
          What you get
        </h2>
        <p className="mt-3 text-[13.5px] leading-relaxed text-ink-2">
          A file. Not an install, not a wrapper, not a config object with
          nineteen keys. You copy the source into your project and it becomes
          yours, including the parts you disagree with. The only thing it needs
          from you is{" "}
          <code className="mat-well rounded-[5px] px-1.5 py-0.5 font-mono text-[11.5px] text-ink-2">
            motion
          </code>
          .
        </p>
        <p className="mt-3 text-[13.5px] leading-relaxed text-ink-2">
          Every component states what it refuses to get wrong, and the demo on
          its page can be replayed, because a micro-interaction you can only
          watch once is a screenshot with extra steps.
        </p>
      </section>

      <section className="mt-12">
        <h2 className="text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-3">
          Ten moments
        </h2>
        <p className="mt-3 text-[13.5px] leading-relaxed text-ink-2">
          The set is not organised by widget type. It is organised by what the
          person is in the middle of when the interaction happens.
        </p>

        <dl className="mt-5 grid gap-px overflow-hidden rounded-[13px]">
          {moments.map(([name, line], i) => (
            <div
              key={name}
              className={`mat-panel flex flex-col gap-1 px-4 py-3 sm:flex-row sm:items-baseline sm:gap-4 ${
                i === 0
                  ? "rounded-t-[13px]"
                  : i === moments.length - 1
                    ? "rounded-b-[13px]"
                    : ""
              }`}
            >
              <dt className="w-[130px] shrink-0 text-[13px] font-medium text-ink">
                {name}
              </dt>
              <dd className="text-[13px] leading-relaxed text-ink-2">{line}</dd>
            </div>
          ))}
        </dl>
      </section>

      <div className="mt-12 flex flex-wrap items-center gap-2.5">
        <Link
          href="/docs/poll-results"
          className="press inline-flex h-9 items-center rounded-[9px] px-3.5 text-[13px] font-medium"
          style={{ background: "var(--ink)", color: "var(--panel)" }}
        >
          Start with Poll Results
        </Link>
        <span className="text-[12px] text-ink-3">
          or pick anything from the {categories.length} sections on the left
        </span>
      </div>
    </div>
  );
}
