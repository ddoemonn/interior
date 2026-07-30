# Contributing

Read [DESIGN.md](DESIGN.md) first. It is the source of truth; nothing lands
that contradicts it.

## A component is two files and one registry entry

```
components/interior/<slug>.tsx    the component: hook + styled example
lib/demos/<slug>-demo.tsx         the docs demo, minimal and replayable
lib/registry.meta.ts              usage, props and notes, hand-authored
lib/registry.ts                   one seed row in its category
```

## The file shape

Every component file is the same document, in the same order: `"use client"`,
motion constants, domain constants, pure helpers, exported types, the exported
`useX` hook (all behaviour, zero class names), inline icons, the exported
styled component. No code comments; reasoning lives in the registry notes.

## Before opening a PR

- `bun run check` must exit clean (oxlint + tsc).
- Springs and easings come from the catalogue in DESIGN.md §5. Do not invent
  numbers; if a component genuinely earns its own spring, document why in its
  registry notes.
- Walk the invariants in DESIGN.md §11: reserved space, interruptibility,
  reduced motion, keyboard + ARIA, one dependency, RSC compatibility.
- Demos are a bare component in a fixed container, with no extra chrome.
