import { generated } from "./registry.generated";

export type Prop = {
  name: string;
  type: string;
  default?: string;
  note: string;
};

export type ComponentMeta = {
  /** the named export a consumer imports */
  export: string;
  /** a real usage example, not a hello-world */
  usage: string;
  props: Prop[];
  /** what this component refuses to get wrong */
  notes: string[];
};

/**
 * A slug appearing here is what makes a component `ready`. Each component
 * owns exactly two source files and one entry in this map, so nothing that
 * builds a component ever has to touch a file another component also touches.
 */
const handAuthored: Record<string, ComponentMeta> = {
  "long-press": {
    export: "LongPressButton",
    usage: `import { LongPressButton, useLongPress } from "@/components/interior/long-press";

export function ArchiveRow({ onArchive }: { onArchive: () => void }) {
  return <LongPressButton onLongPress={onArchive}>Hold to archive</LongPressButton>;
}

export function Tile({ onOpen }: { onOpen: () => void }) {
  const { bind, step, steps, holding } = useLongPress({
    onLongPress: onOpen,
    duration: 700,
  });

  return (
    <div {...bind} tabIndex={0} role="button" data-holding={holding}>
      Press and hold
      <span>{step} / {steps}</span>
    </div>
  );
}`,
    props: [
      {
        name: "onLongPress",
        type: "() => void",
        note: "Fires once, when the press survives the full duration",
      },
      {
        name: "duration",
        type: "number",
        default: "550",
        note: "Milliseconds the press has to survive",
      },
      {
        name: "steps",
        type: "number",
        default: "12",
        note: "Cells drawn, and the render budget for the whole gesture",
      },
      {
        name: "moveTolerance",
        type: "number",
        default: "8",
        note: "Pixels of drift allowed before it is treated as a scroll (hook only)",
      },
      {
        name: "haptic",
        type: "boolean",
        default: "true",
        note: "Buzz on commit where the platform supports it (hook only)",
      },
      {
        name: "onCancel",
        type: "() => void",
        note: "Fires when a press is abandoned, never after it commits (hook only)",
      },
      {
        name: "disabled",
        type: "boolean",
        default: "false",
        note: "Refuses to start",
      },
      { name: "className", type: "string", note: "Applied to the button" },
    ],
    notes: [
      "Drifting more than eight pixels cancels the press. On a phone this is the difference between holding a row and scrolling past it, and it is the reason most long-press implementations feel broken on touch.",
      "The click that follows a completed press is swallowed. Otherwise the element runs its normal tap action immediately after the hold already ran.",
      "Progress is reported in discrete steps, not as a float, so a 550ms press costs twelve renders instead of thirty-three.",
      "Losing the window, hiding the tab, a pointercancel from the browser taking over the gesture, or Escape all end the press. A hold that survives you switching apps is not a hold.",
      "Space and Enter hold too, so the gesture is reachable without a pointer, and the duration is announced through a described-by hint.",
      "The native touch callout and context menu are suppressed on the target, because on touch platforms they are the default answer to a long press.",
    ],
  },
  "task-steps": {
    export: "TaskSteps",
    usage: `"use client";

import { useState } from "react";
import { TaskSteps } from "@/components/interior/task-steps";

const STEPS = [
  { id: "queue", label: "Queued" },
  { id: "build", label: "Building" },
  { id: "test", label: "Running checks" },
  { id: "deploy", label: "Deploying" },
];

export function DeployCard({ runId }: { runId: string }) {
  const [current, setCurrent] = useState(0);
  const [failed, setFailed] = useState(false);

  useDeployEvents(runId, {
    onStage: (index) => setCurrent(index),
    onError: () => setFailed(true),
  });

  return (
    <div className="rounded-[14px] border border-stone-200 bg-white p-4 dark:border-white/[0.16] dark:bg-[#1D1D1A]">
      <h3 className="mb-3 text-[13px] font-medium">Deploy {runId}</h3>
      <TaskSteps steps={STEPS} current={current} failed={failed} label="Deploy progress" />
    </div>
  );
}`,
    props: [
      {
        name: "steps",
        type: "TaskStep[]",
        note: "The plan, in order. Each step is { id, label, meta? }; meta is a right-aligned mono aside — a duration, a count — revealed when its step completes.",
      },
      {
        name: "current",
        type: "number",
        note: "Index of the step running now. Everything before it is done; at steps.length the run is complete.",
      },
      {
        name: "failed",
        type: "boolean",
        default: "false",
        note: "The run stopped at `current`. The active row becomes the failure, and nothing after it pretends to have run.",
      },
      {
        name: "label",
        type: "string",
        default: '"Task progress"',
        note: "Accessible name for the list.",
      },
      {
        name: "className",
        type: "string",
        default: '""',
        note: "Appended last to the root, so width and spacing are the caller's.",
      },
    ],
    notes: [
      "The whole plan is mounted from the first paint with pending steps dimmed, so the run moves through existing rows — a step completing changes colours and marks, never geometry, and the panel never grows a pixel.",
      "The active label shimmers at one constant speed — the spinner's licence extended to type: an honest signal of an unknown wait, not decoration. Under reduced motion it is simply the medium-weight label.",
      "A completed step's check lands on an underdamped pop in a cell that was reserved all along, and its duration fades in beside it; a failure lands the same way in the flag colour, and nothing after it pretends to have run.",
      "State is two values — current and failed — so the component can be driven by anything that counts: a websocket, polling, or server-sent events, with no internal timer to fight.",
      "Screen readers get one settled sentence per stage — 'Building, step 2 of 4' — after a half-second hold, so a run that hops through three stages in a second is one announcement, not three.",
      "aria-current='step' rides the active row, and the finish is announced once — complete or failed — from its own polite region.",
    ],
  },
  "poll-results": {
    export: "PollResults",
    usage: `"use client";

import { useState } from "react";
import { PollResults, type PollOption } from "@/components/interior/poll-results";

export function FloorPoll({ initial }: { initial: PollOption[] }) {
  const [options, setOptions] = useState(initial);

  return (
    <PollResults
      label="Floor for the front room?"
      options={options}
      onVote={async (id) => {
        setOptions((prev) =>
          prev.map((o) => (o.id === id ? { ...o, votes: o.votes + 1 } : o)),
        );
        await fetch("/api/polls/floor", {
          method: "POST",
          body: JSON.stringify({ choice: id }),
        });
      }}
    />
  );
}`,
    props: [
      {
        name: "options",
        type: "PollOption[]",
        note: "The choices, each { id, label, votes }. Votes are the truth the reveal draws; update them optimistically in onVote.",
      },
      {
        name: "label",
        type: "string",
        note: "The question. Required — a poll with no name is unreadable, to everyone.",
      },
      {
        name: "value",
        type: "string | null",
        note: "Controlled choice. null means not voted; anything else reveals the results.",
      },
      {
        name: "defaultValue",
        type: "string | null",
        default: "null",
        note: "Uncontrolled starting choice, for a poll the person already answered.",
      },
      {
        name: "onVote",
        type: "(id: string) => void",
        note: "Fires once, on the first choice. Later clicks are refused — one person, one vote.",
      },
      {
        name: "className",
        type: "string",
        default: '""',
        note: "Appended last to the root, so width and spacing are the caller's.",
      },
    ],
    notes: [
      "The reveal is a race run on physics: every bar leaves the line at the same instant on the same spring, so a longer share is simply a longer road — the biggest number arrives last and the winner is announced by its own landing, not by a stage-managed delay.",
      "Each percentage is its bar's own motion value written straight to the DOM, so the numbers count up in lockstep with the fills while React renders once per vote, not once per frame.",
      "Your answer runs in the accent and the rest of the field runs in ink — the one bar that is a response to you is the one drawn in the colour reserved for that.",
      "The fill is a clipPath sweep over a fully-rounded bar, so the corners never stretch, and the winner's check pops only after the winning bar has landed.",
      "The material tells the story: before the vote every option is a pressable key — cap material, top light, bottom lip, a pixel of travel under the finger — and the vote turns the key into the slot it was hiding, a recessed well the result sweeps inside. Depth is the state change; colour only signs it.",
      "Nothing moves but the fills: the percent column and the tally line reserve their space before the first vote exists, and a revealed row refuses further clicks with aria-disabled instead of leaving the accessibility tree.",
      "Screen readers get the outcome once, as a sentence — who leads, with what share, out of how many votes — after the race has settled; under prefers-reduced-motion the bars are simply at their numbers.",
    ],
  },
  pagination: {
    export: "Pagination",
    usage: `"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Pagination } from "@/components/interior/pagination";

export function ResultsPager({ total, perPage }: { total: number; perPage: number }) {
  const router = useRouter();
  const params = useSearchParams();
  const page = Math.max(1, Number(params.get("page") ?? 1));

  return (
    <Pagination
      count={Math.ceil(total / perPage)}
      page={page}
      label="Search results"
      onPageChange={(next) => {
        const query = new URLSearchParams(params);
        query.set("page", String(next));
        router.push(\`?\${query.toString()}\`, { scroll: false });
      }}
    />
  );
}`,
    props: [
      {
        name: "count",
        type: "number",
        note: "Total number of pages. The slot geometry is derived from its digit count, so the row is sized for its widest page from the first paint.",
      },
      {
        name: "page",
        type: "number",
        note: "Controlled current page. Supplying it makes the parent the source of truth.",
      },
      {
        name: "defaultPage",
        type: "number",
        default: "1",
        note: "Uncontrolled starting page, clamped into range.",
      },
      {
        name: "siblings",
        type: "number",
        default: "1",
        note: "Pages shown on each side of the current page once the window is sliding.",
      },
      {
        name: "boundaries",
        type: "number",
        default: "1",
        note: "Pages pinned at each end of the row no matter where the window is.",
      },
      {
        name: "onPageChange",
        type: "(page: number) => void",
        note: "Fires with the next page on every move, controlled or not.",
      },
      {
        name: "label",
        type: "string",
        default: '"Pagination"',
        note: "Accessible name for the nav landmark.",
      },
      {
        name: "className",
        type: "string",
        default: '""',
        note: "Appended last to the nav element, so a caller's spacing wins.",
      },
    ],
    notes: [
      "The slot count is identical at every page — the near-start, middle and near-end windows all resolve to the same number of cells, so moving from page 4 to page 5 can never change the row's width or shift the arrows under the cursor.",
      "The active marker is one always-mounted thumb translated between slots, the dropdown's answer rather than a shared-layout animation: it cannot fly in from a stale position, and slots need no measurement because their width is arithmetic.",
      "When the window slides, only the cells whose number changed remount, and the new number rolls in from the direction the window travelled; unchanged cells do not flicker.",
      "The arrows at their limits stay in the accessibility tree with aria-disabled and refuse the click in the handler, keeping our colours instead of the UA's disabled grey.",
      "Page changes are announced once through a status region after the page has held for half a second, so paging through quickly is one sentence, not a stutter of interruptions.",
      "Under prefers-reduced-motion the thumb and the numbers arrive instantly; nothing is hidden, only the travel is dropped.",
    ],
  },
  "tree-view": {
    export: "TreeView",
    usage: `"use client";

import { useState } from "react";
import { TreeView, type TreeNode } from "@/components/interior/tree-view";

const FILES: TreeNode[] = [
  {
    id: "src",
    label: "src",
    children: [
      { id: "index", label: "index.ts", meta: "2 kB" },
      { id: "config", label: "config.ts", meta: "1 kB" },
    ],
  },
  { id: "readme", label: "README.md", meta: "4 kB" },
];

export function FilePicker({ onOpen }: { onOpen: (id: string) => void }) {
  const [selected, setSelected] = useState<string | null>("readme");

  return (
    <TreeView
      nodes={FILES}
      label="Repository files"
      defaultExpanded={["src"]}
      selected={selected}
      onSelectedChange={(id) => {
        setSelected(id);
        onOpen(id);
      }}
      className="max-w-[280px]"
    />
  );
}`,
    props: [
      {
        name: "nodes",
        type: "TreeNode[]",
        note: "The tree, root list first. Each node is { id, label, meta?, children? }; id must be stable because it keys expansion, selection and the roving focus.",
      },
      {
        name: "label",
        type: "string",
        note: "Accessible name for the tree.",
      },
      {
        name: "expanded",
        type: "string[]",
        note: "Controlled set of open branch ids.",
      },
      {
        name: "defaultExpanded",
        type: "string[]",
        default: "[]",
        note: "Uncontrolled starting open set.",
      },
      {
        name: "onExpandedChange",
        type: "(expanded: string[]) => void",
        note: "Fires with the next open set on every toggle.",
      },
      {
        name: "selected",
        type: "string | null",
        note: "Controlled selected id.",
      },
      {
        name: "defaultSelected",
        type: "string | null",
        default: "null",
        note: "Uncontrolled starting selection.",
      },
      {
        name: "onSelectedChange",
        type: "(selected: string) => void",
        note: "Fires when a row is chosen by click, Enter or Space.",
      },
      {
        name: "className",
        type: "string",
        default: '""',
        note: "Appended last to the card, so a caller's width and surface win.",
      },
    ],
    notes: [
      "The keyboard model is the full APG tree pattern, not a subset: arrows walk and fold, Home and End jump, Enter and Space choose, and typing a letter moves to the next visible name that starts with it.",
      "One tab stop for the whole tree. If the focused row is folded away by an ancestor, the stop falls back to the selection or the first row without stealing the browser's focus from wherever it actually is.",
      "A closed branch is not rendered and hidden — it is not rendered at all, so assistive technology is never handed rows the eye cannot reach.",
      "Disclosure runs height and opacity on separate clocks with opacity finishing first, so rows are fully formed before the reflow that reveals them has finished.",
      "aria-level, aria-setsize and aria-posinset are written from the data on every row, so a screen reader hears 'level 2, item 3 of 5' rather than a flat list.",
      "Every row reserves the caret's slot whether or not it has one, so labels in one list share one left edge instead of ragging on folder boundaries.",
      "Under prefers-reduced-motion branches open and close in place; the information arrives, the travel is skipped.",
    ],
  },
};

export const meta: Record<string, ComponentMeta> = {
  ...generated,
  ...handAuthored,
};
