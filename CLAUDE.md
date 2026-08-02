# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

interior.dev — a copy-paste library of React micro-interactions plus the Next.js docs site that presents them. There is no package: every component is one self-contained file in `components/interior/` whose only dependency is `motion`.

**DESIGN.md is the source of truth.** Read it before adding a component, a page, or a color. Nothing lands that contradicts it — springs, easings, radii, colors, focus shapes, and typography all come from its catalogues, never invented. CONTRIBUTING.md is the short checklist version.

## Commands

Bun is the package manager and runner (`bunx`, not `npx`).

```
bun install
bun run check      # oxlint + tsc --noEmit — must exit clean before a PR
bun run lint:fix   # oxlint --fix
bun run lint:react # eslint (react-specific rules)
bun run dev        # docs site; the user usually runs their own on :3000
```

There is no test suite; `bun run check` is the gate.

## Architecture

### The component pipeline

A component is two files and one registry entry. Nothing that builds a component touches a file another component also touches:

```
components/interior/<slug>.tsx   the product: headless hook + styled example
lib/demos/<slug>-demo.tsx        docs demo, registered in lib/demos/index.tsx
lib/registry.ts                  one seed row [id, slug, name, blurb] in its category
lib/registry.meta.ts             usage example, props, notes (hand-authored)
```

`lib/registry.ts` holds seed rows for every planned component. A slug becomes `status: "ready"` purely by having an entry in the meta map — `registry.meta.ts` merges hand-authored entries over `registry.generated.ts` (machine-written; hand edits belong in `registry.meta.ts`).

`app/docs/[slug]/page.tsx` statically generates a page per ready entry and reads the component's source **from disk at build time** (`fs.readFile` of `components/interior/<slug>.tsx`), so the displayed source can never drift from the real file. Syntax highlighting is shiki via `lib/highlight.ts` (dual vitesse themes through CSS variables).

### The component file shape

Every file in `components/interior/` is the same document in the same order: `"use client"` → imports → motion constants (`EASE`, `LEAVE`, springs, `INSTANT`) → domain constants → pure helpers → exported types → `export function useX()` (all behaviour, zero class names) → inline icons → `export function X()` (styled example built on the hook).

- **The hook is the product; the component is an example.** The hook never touches a class name.
- **No code comments** in component or docs source; reasoning lives in the registry notes.
- Motion constants are deliberately **copied into every file** (a copied file must not import from a shared module), but the values must be identical across files — a spring change is a change to every file declaring it.
- Icons are drawn inline (Phosphor geometry), never imported, so the file stays at one dependency.

### The two styling dialects (deliberate, not drift)

- **Site chrome** (`app/`, `components/docs/`, `components/site/`) uses the tokens and utilities from `app/globals.css`: `--accent`, the ink ramp (`ink`, `ink-2`, `ink-3`), `border-hairline`, and the `.mat-*` material shadows (`.mat-panel`, `.mat-well`, `.mat-float`, `.mat-cap`, `.mat-row`). Never hand-write a box-shadow in site code.
- **Shipped components** (`components/interior/`) use literal values — `#4568FF` / `#93B0FF` accent, the Tailwind stone ramp, hand-written shadows matching the material spec in DESIGN.md §1b — because they get copied into codebases that don't have our tokens. Zero components reference a `.mat-*` utility, and that is correct.

### Invariants every component obeys (DESIGN.md §11)

Zero layout shift (every reachable state reserves its space up front — usually the invisible-twin grid trick); interruptible springs; `prefers-reduced-motion` delivers the information and skips the trip (`{ duration: 0 }`, not removal); full keyboard support and ARIA (keyboard is a second complete implementation, announcements are debounced sentences); one dependency (`motion`); RSC-compatible; direct DOM writes when a value changes every frame (React never re-renders at 60fps).

Gestures must handle the full abandonment surface: `pointercancel`, `lostpointercapture`, window `blur`, `visibilitychange`, Escape, move tolerance — not just `pointerup`.

### Docs pages

Every component page is the same block order: header (category · sheet id · name · one-sentence blurb), Preview (live replayable demo), Install, Usage, Source, Props. Demos are a bare component in a fixed container with no extra chrome. The docs shell is `fixed inset-0`; only the two inner panes scroll.

## Conventions

- Commit messages are a single lowercase line (see git log).
- Motion research: ripples, spinners, detents and the like are solved problems — look up the published spec instead of inventing one (DESIGN.md §5d).
- Banned by default, with narrow written exemptions: `rounded-full`, `animate-pulse`/idle loops, decorative gradients, borders standing in for depth (DESIGN.md §3).
