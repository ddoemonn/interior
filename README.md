# interior[.]dev

<img width="1195" height="622" alt="Screenshot 2026-07-30 at 22 15 10" src="https://github.com/user-attachments/assets/73e360b2-5dd1-4e92-b806-5bf4e0c02930" />

Finished micro-interactions for React. Copy the file, own the code.

Everybody builds these components. Almost nobody finishes them. The missing
twenty percent is always the same three things: a jump, a restart, an animation
that ignores the person watching it. This set ships that last twenty percent.

## How it works

There is no package. Every component is one file in
[`components/interior/`](components/interior/) that you copy into your project.
Each file exports two things:

- a headless hook (`useX`) that owns all the behaviour and touches zero class names
- a styled component (`X`) built on the hook, as an example you can keep or replace

The only dependency is [`motion`](https://motion.dev). Tailwind classes are
overridable from outside.

## The idea

Trust is won in the half-second after a click, and lost in exactly the same
place. A button that resizes when its label changes, a list that jumps as it
loads, a drag that gets stuck because the tab lost focus: none of these are
bugs anyone files, but every one of them teaches the person to stop believing
the interface.

So every component here is argued out to the frame. Nothing moves unless
something happened; motion that models a physical process obeys that process
instead of taste; every state the component can reach has its space reserved
before it arrives; and every gesture knows all the ways it can be abandoned.
The keyboard is not a fallback but a second complete implementation, and under
`prefers-reduced-motion` the information still arrives; only the trip is
skipped.

## Running the docs

```
bun install
bun run dev
```

The design language behind every decision lives in [DESIGN.md](DESIGN.md).
