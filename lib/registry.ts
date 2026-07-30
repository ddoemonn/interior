import { meta, type ComponentMeta, type Prop } from "./registry.meta";

export type { Prop, ComponentMeta };

export type Status = "ready" | "planned";

export type Entry = {
  /** sheet number, e.g. "08.2" */
  id: string;
  slug: string;
  name: string;
  /** the UX problem it solves — one line */
  blurb: string;
  status: Status;
  /** path to the copy-paste source, relative to repo root */
  src?: string;
  export?: string;
  usage?: string;
  props?: Prop[];
  notes?: string[];
};

export type Category = {
  id: string;
  name: string;
  entries: Entry[];
};

type Seed = [id: string, slug: string, name: string, blurb: string];

const seeds: Array<[id: string, name: string, rows: Seed[]]> = [
  [
    "01",
    "Action Feedback",
    [
      ["01.1", "copy-button", "Copy Button", "Copy to tick, width locked, reverts after 2s"],
      ["01.2", "loading-button", "Loading Button", "Label to state without layout shift"],
      ["01.3", "hold-to-confirm", "Hold to Confirm", "A guard rail in front of destructive actions"],
      ["01.4", "like-burst", "Like Burst", "Optimistic like that survives rapid taps"],
      ["01.5", "ripple", "Ripple", "Touch feedback from the pointer origin"],
      ["01.6", "icon-morph", "Icon Morph", "Play/pause, menu/close as one mechanism"],
      ["01.7", "press-depth", "Press Depth", "The feeling that the press landed"],
    ],
  ],
  [
    "02",
    "Input",
    [
      ["02.1", "floating-label", "Floating Label", "The label makes room instead of disappearing"],
      ["02.2", "inline-validation", "Inline Validation", "Error message that does not shove the form"],
      ["02.3", "password-strength", "Password Strength", "Strength read segment by segment"],
      ["02.4", "otp-input", "OTP Input", "Auto advance, paste, error recovery"],
      ["02.5", "tag-input", "Tag Input", "Enter adds, backspace highlights then removes"],
      ["02.6", "expanding-search", "Expanding Search", "Icon to field with focus handled"],
    ],
  ],
  [
    "03",
    "Async",
    [
      ["03.1", "skeleton-swap", "Skeleton Swap", "Skeleton to content with zero layout shift"],
      ["03.2", "progress-bar", "Progress Bar", "Indeterminate handing over to determinate"],
      ["03.3", "load-more", "Load More", "Sentinel that loads before you hit the end"],
      ["03.4", "streaming-text", "Streaming Text", "Token by token with a caret"],
      ["03.5", "task-steps", "Task Steps", "The system narrates its work"],
    ],
  ],
  [
    "04",
    "Notification",
    [
      ["04.1", "toast-stack", "Toast Stack", "Stacked, expands on hover, swipes away"],
      ["04.2", "collapsible-banner", "Collapsible Banner", "Folds to its title, or lets go entirely"],
      ["04.3", "presence-avatars", "Presence Avatars", "Join and leave as a layout change"],
      ["04.4", "typing-indicator", "Typing Indicator", "Someone is writing"],
      ["04.5", "new-items-pill", "New Items Pill", "New content without stealing your scroll"],
    ],
  ],
  [
    "05",
    "Overlay",
    [
      ["05.1", "modal", "Modal", "Backdrop, scroll lock, focus trap"],
      ["05.2", "bottom-sheet", "Bottom Sheet", "Snap points driven by velocity"],
      ["05.3", "popover", "Popover", "Knows its origin, flips on collision"],
      ["05.4", "tooltip-group", "Tooltip Group", "Delayed once, instant after that"],
      ["05.5", "command-palette", "Command Palette", "Results reorder as you type"],
      ["05.6", "drawer", "Drawer", "Side panel that keeps its place"],
      ["05.7", "context-menu", "Context Menu", "Opens from the pointer, not the corner"],
      ["05.8", "dropdown", "Dropdown", "Active highlight travels between items"],
    ],
  ],
  [
    "06",
    "Navigation",
    [
      ["06.1", "tabs", "Tabs", "One indicator shared across tabs"],
      ["06.2", "segmented-control", "Segmented Control", "Thumb slides, label inverts through it"],
      ["06.3", "accordion", "Accordion", "height auto, done correctly"],
      ["06.4", "wizard-steps", "Wizard Steps", "Transition knows forward from back"],
      ["06.5", "pagination", "Pagination", "The window moves, the row does not"],
      ["06.6", "tree-view", "Tree View", "Disclosure the arrow keys can walk"],
    ],
  ],
  [
    "07",
    "Scroll",
    [
      ["07.1", "sticky-header", "Sticky Header", "Condenses as you go down"],
      ["07.2", "reading-progress", "Reading Progress", "How much is left"],
      ["07.3", "scroll-spy", "Scroll Spy", "The section you are actually in"],
      ["07.4", "snap-carousel", "Snap Carousel", "Momentum that lands on a slide"],
      ["07.5", "hide-on-scroll", "Hide on Scroll", "Toolbar yields to the content"],
    ],
  ],
  [
    "08",
    "Data",
    [
      ["08.1", "sortable-table", "Sortable Table", "Rows travel to their new order"],
      ["08.2", "filter-grid", "Filter Grid", "Filtering rearranges, it does not blink"],
      ["08.3", "value-flash", "Value Flash", "Marks what just changed"],
      ["08.4", "poll-results", "Poll Results", "The winner lands last"],
    ],
  ],
  [
    "09",
    "Gesture",
    [
      ["09.1", "slider-detents", "Slider Detents", "Stops you can feel"],
      ["09.2", "swipe-deck", "Swipe Deck", "A stack you decide through"],
      ["09.3", "reorder-list", "Reorder List", "The gap the siblings open is the drop target"],
      ["09.4", "long-press", "Long Press", "Intent confirmed by time, and cancelled by everything else"],
      ["09.5", "lightbox", "Lightbox", "Zoom that returns where it started"],
    ],
  ],
  [
    "10",
    "Content",
    [
      ["10.1", "text-reveal", "Text Reveal", "Words arrive in reading order"],
      ["10.2", "logo-marquee", "Logo Marquee", "Stops when you look at it"],
      ["10.3", "blur-up-image", "Blur-up Image", "Placeholder resolves into the photo"],
      ["10.4", "show-more", "Show More", "Height animates, text does not reflow"],
    ],
  ],
];

export const categories: Category[] = seeds.map(([id, name, rows]) => ({
  id,
  name,
  entries: rows.map(([entryId, slug, entryName, blurb]) => {
    const m = meta[slug];
    return m
      ? {
          id: entryId,
          slug,
          name: entryName,
          blurb,
          status: "ready" as const,
          src: `components/interior/${slug}.tsx`,
          export: m.export,
          usage: m.usage,
          props: m.props,
          notes: m.notes,
        }
      : {
          id: entryId,
          slug,
          name: entryName,
          blurb,
          status: "planned" as const,
        };
  }),
}));

export const allEntries: Entry[] = categories.flatMap((c) => c.entries);

export const readyEntries: Entry[] = allEntries.filter(
  (e) => e.status === "ready",
);

export function getEntry(slug: string): Entry | undefined {
  return allEntries.find((e) => e.slug === slug);
}

export function getCategoryOf(slug: string): Category | undefined {
  return categories.find((c) => c.entries.some((e) => e.slug === slug));
}

export const TOTAL = allEntries.length;
export const SHIPPED = readyEntries.length;
