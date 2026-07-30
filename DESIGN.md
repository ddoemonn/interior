# interior.dev — Design Language

The source of truth. Read it before adding a component, a page, or a color.

Reference implementations, both by the author of this project:
`~/Desktop/lol/design/app/temp/CmdK.tsx` (the light material stack) and
`~/Desktop/lol/design/app/temptwo/Toast.tsx` (the dark one, plus the pixel
timer). When something here is ambiguous, those files decide.

Sections 0–11 are the language. Sections 12–22 are the laws the set actually
obeys, read back off all sixty-nine shipped files. Section 23 is the list of
places where the set does not yet obey itself — that is the refactor queue.

---

## 0 · The premise

Everybody builds these. Almost nobody finishes them.

None of these are hard components, and that is the problem: every team
writes them, no team is given a week to write them, so they ship at eighty
percent and stay there for the life of the product. The missing twenty percent
is always the same three things — a jump, a restart, an animation that ignores
the person watching it.

Trust is won in the half-second after a click and lost in exactly the same
place. Every rule below exists to protect that half-second.

The voice follows from that: short, declarative, a little dry. Never claim
nobody ships these, because everybody does. Claim they are unfinished, and
then show the finish. Never sell the animation — describe the problem it
removes.

---

## 1 · Three materials

Everything on screen is one of three layers. Depth is real: a well is cut into
the surface, a panel is lifted out of it, a cap has a bottom lip you could
press with a finger.

| Layer | What it is | Light | Dark |
|---|---|---|---|
| **bezel** | The frame everything sits in. The page background. | `#EFEEEA` | `#141312` |
| **panel** | The lifted card, where content lives. | `#FFFFFF` | `#1D1D1A` |
| **well** | The recessed slot: inputs, code, previews, chips. | `#F6F6F4` | `#252522` |

The shadows are utilities in `globals.css`. Never hand-write a box-shadow:

```
.mat-panel   lifted card           → 0 1px 2px + 1px ring
.mat-float   floating over all     → 0 28px 56px -24px + 1px ring
.mat-well    cut into the panel    → inset 0 1px 2px
.mat-cap     a pressable key       → bottom lip 0 1.5px 0 + hairline all round
.mat-row     picked out of a list  → inset ring + 0 1px 2px
```

In dark mode `.mat-panel` and `.mat-cap` also carry an `inset 0 1px 0` white
highlight on the top edge. That top light is what makes a dark surface read as
lifted rather than as a hole.

**Rule:** a plain `border` never carries elevation. Use `border-hairline` when
you are dividing one compartment from another, and material when you mean one
thing is above or below another.

### 1b · The two dialects

The rule above governs **the site**. It does not govern **the components**, and
the difference is deliberate rather than drift.

```
site chrome        tokens + utilities     var(--accent), .mat-panel, ink-3
shipped component  literal values         #4568FF, border-stone-200,
                                          shadow-[0_1px_2px_rgba(28,25,23,0.06)]
```

A component in `components/interior/` is copied into a codebase that does not
have `--accent`, does not have `.mat-well`, and will never load our
`globals.css`. So it writes the hex, it writes the shadow, and it uses the
Tailwind stone ramp — which is the closest stock palette to the ink ramp and
is present in every Tailwind install.

Zero of the sixty-nine components reference a `.mat-*` utility. That is
correct. What is **not** optional is that the hand-written shadow has to be the
same shadow:

```
panel      shadow-[0_1px_2px_rgba(28,25,23,0.06),0_4px_10px_-8px_rgba(28,25,23,0.45)]
           dark: shadow-[0_1px_6px_rgba(0,0,0,0.45)]
float      shadow-[0_18px_40px_-24px_rgba(28,25,23,0.5)]      popover
           shadow-[0_28px_56px_-24px_rgba(24,22,20,0.45)]     modal, detail
           shadow-[0_16px_36px_-18px_rgba(28,25,23,0.5)]      dropdown
well       shadow-[inset_0_1px_2px_rgba(28,25,23,0.07)]
           dark: shadow-[inset_0_1px_2px_rgba(0,0,0,0.45)]
lift       shadow-[inset_0_1.5px_0_rgba(255,255,255,0.95),
                   inset_0_-1px_0_rgba(28,25,23,0.06)]        press-depth cap
```

`rgba(28,25,23,·)` is the ink shadow. It is never `rgba(0,0,0,·)` on light —
a neutral black shadow on a warm surface reads as dirt. Dark mode does use
plain black, because there the shadow is an absence of light rather than a
tint.

---

## 2 · The page shell

Every page is a panel floating on the bezel, with a generous gutter around it.
The gutter is not spacing, it is the frame: it is what tells you the panel is
an object rather than the page itself.

```
p-3 sm:p-5          the bezel gutter, on both the landing and the docs
rounded-[20px]      the page panel
gap-3 sm:gap-4      between the sidebar and the panel
```

The docs shell is `fixed inset-0`. The document itself never scrolls; the two
panes inside it do, each with `overscroll-contain`. Anything that depends on an
ancestor height chain will eventually let the page grow past the viewport.

The sidebar sits directly on the bezel, unlifted. It is furniture, not content.
Its header is `h-12` so its top edge lines up with the panel's header.

---

## 3 · Banned — and what the ban is actually for

Read this before the table.

These bans exist to stop one thing: output that looks like every other
generated interface. They are a defence against genericness, not a formula.
The moment a ban becomes a formula it has failed in a new costume — swapping
every `rounded-full` for a strip of cells is the same absence of judgement as
reaching for `rounded-full` in the first place.

So: **a ban yields when the banned thing is genuinely the right answer, and
you can say why in one sentence.**

- A wait whose duration is unknown gets a spinner. It is circular, it loops,
  and it is honest. A meter filling against a guessed duration claims progress
  it cannot know, which is worse than looking generic.
- Discrete cells are for quantities that are actually countable in units — a
  hold you can abandon, a countdown you can watch run out, a set of items.
  They are not a universal replacement for a bar.
- An icon that a user already knows beats a clever mark they have to learn.
  Draw it inline, keep it 1.5px, and move on.

What is never allowed is the thing the ban was written against: decoration
with nothing behind it. A pulse that means nothing. A gradient because the
surface looked empty. A pill because everything else was a pill.


| Banned | Instead |
|---|---|
| `rounded-full`, pills, circular avatars | 5 / 6 / 9 / 11 / 14 / 20 px |
| `animate-pulse`, any idle loop | Discrete cells, event-driven motion |
| Grid or dot-grid backgrounds | Material difference |
| Decorative gradients, glow, aurora | One accent, where it means something |
| Uppercase mono as a default voice | Mono for metadata and numbers only |
| Borders standing in for depth | `.mat-*` |
| Drop shadows to "add polish" | The material already has the shadow |

### The three standing exemptions, and why each survives

The set uses `rounded-full` in exactly two files, and an infinite loop in
exactly five. Each has a one-sentence defence, which is the price of the
exemption:

```
ripple             a wave leaving a point is a circle; a scaled rounded rect
                   grows its own radius and turns into a blob
typing dots        three dots in a speech bubble is a published, learned
                   idiom — inventing a square one teaches nothing
spinner            unknown duration, constant speed, one arc              5 files
marquee            the loop IS the component                    logo-marquee
caret blink        1.06s, times [0,0.5,0.5,1] — a hard square wave, the
                   terminal's own shape          otp-input, streaming-text
```

Note what the caret does **not** do: it does not fade. `opacity: [1, 1, 0, 0]`
with `ease: "linear"` and equal times is a square wave. A sine-fading cursor is
the tell of a component that reached for `animate-pulse`.

---

## 3b · The input standard

Every field in the set is the same object. It was derived from the OTP cell,
which is the reference — copy it, do not reinvent it.

The idea: **an empty field is a slot; entering it brings it to the surface.**
A field that only changes its border colour on focus has no depth, and that is
what every field here looked like before.

```
rest      border-2 border-stone-200
          bg-stone-100/70
          shadow-[inset_0_1px_2px_rgba(28,25,23,0.07)]

focus     border-2 border-[#4568FF]
          bg-white
          shadow-none

invalid   border-2 border-red-500 + bg-white
success   border-2 border-emerald-500 + bg-white

height    h-10          radius   rounded-[10px]
dark      border-white/[0.08] · bg-[#1D1D1A] · inset 0 1px 2px rgba(0,0,0,0.45)
          — the interior is the SAME dark every card interior wears. A
          lighter tint inside a field makes it glow against its neighbours;
          the recession comes from the shadow, never from a lighter fill.
          — the border sits BELOW the hairline on purpose: a 2px border at
          hairline strength reads as a focus ring at rest. The well does
          the recessing; the border whispers until focus makes it shout.
          focus: border-[#93B0FF] · bg-[#252522] — dark surfaces rise by
          getting LIGHTER; a focus painted in the panel's own colour is a
          field that vanishes into the card
```

Six components implement this exact object. They are the roster; a seventh
field must join it rather than invent an eighth look:

```
floating-label     the field itself
inline-validation  + invalid branch
otp-input          + success branch, per-cell
expanding-search   on the animated shell, not the input inside it
tag-input          focus-within on the <ul>, because the input is a child
upload-dropzone    the same well, at 104px, as a drop target
```

**Focus is always the brand blue.** `#4568FF` on light, `#93B0FF` on dark, the
same value as `--accent`. It is the most repeated moment in any interface, so
it is where the identity lives. Shipped components write the hex literally
rather than reading `--accent`, because they get copied into projects that do
not have our tokens.

**No focus rings.** A 2px border plus the surface lifting is already two
signals. A ring on top of that is the "too much" everyone feels but few name.

The site's global `:focus-visible` outline lives in `@layer base` so a
component that draws its own focus can opt out with `focus-visible:outline-none`.
Unlayered CSS beats every layered utility regardless of specificity — if that
rule ever leaves its layer, every component's focus styling silently dies.

Exceptions, and why: OTP cells are `border-2` like everything else but each
cell is its own small target, so the border is the whole affordance. A chip
inside a field is **filled**, never outlined — a 1px outline on a white chip
sitting on a white field is invisible in light mode.

Two more things the roster agreed on:

- **The field owns the border, the input owns nothing.** `floating-label` and
  `expanding-search` both put the `border-2` on a wrapper and make the `<input>`
  `bg-transparent` with `outline-none`. That is what lets the shell animate its
  width, or a label float out of it, without the input's own box fighting.
- **`transition-[background-color,border-color,box-shadow] duration-150`.**
  Fields are the one place a CSS transition beats a spring, because nothing is
  being dragged — the state changes discretely, on focus, and 150ms of colour
  is the whole move.

## 4 · Radii nest

Outer radius = inner radius + the padding between them. A `rounded-[11px]`
well wrapped in `p-[5px]` sits inside a `rounded-[16px]` panel. The numbers are
derived, never guessed.

```
20  page panel
16  preview frame, code block frame
14  card, props table, overlay panel, section
13  list card
12  tabs shell
11  well inside a 16 frame, popover, dropdown panel, row card
10  field, drop target, avatar tile
 9  list row, button, search field, tile inside a 12
 8  nested list row, tab plateau, step tile
 7  icon button inside a panel, avatar well
 6  cap, chip, chevron button, small action
 5  cell, small chip, kbd, checkbox
 4  progress track
 2  fill, tick, rail
1.5 ripple cell, marquee mark
```

The nesting works out to a repeated pattern you can check by eye:

```
14 panel  → p-[5px] → 9 row      (14 = 9 + 5)
11 panel  → p-[5px] → 6 row      (11 = 6 + 5)
12 shell  → p-1     → 8 plateau  (12 = 8 + 4)
```

An icon button inside a panel is 7, not 6 or 8, because it sits at `p-3`
inside a `rounded-[11px]` box and 7 is what the eye reads as concentric there.
When a number is not derivable, it was derived from the nearest one that is.

---

## 5 · Motion

```ts
const EASE = [0.23, 1, 0.32, 1] as const;

enter    0.22s  { opacity: 0, scale: 0.97, y: 10, filter: "blur(6px)" }
exit     0.18s  { opacity: 0, scale: 0.98, y: 6,  filter: "blur(3px)" }
list     0.34s  y + scale, transformOrigin pinned to the edge it came from
disclose 0.28s  height 0 → auto, opacity trailing at 0.18s
select   0.20s  content slides 3px right
press    0.12s  translateY(1px)
```

- Scale never starts at 0. It starts at 0.9 or 0.97, because nothing in the
  physical world begins as a point.
- `transformOrigin` is always pinned to the edge the thing came from.
- Blur on the way in, less of it on the way out. That asymmetry is what makes
  a panel feel like it settles instead of appearing.
- Height and opacity get separate durations when disclosing. Opacity finishing
  first hides the reflow.
- No infinite loops. Marquee and the streaming caret are the only exceptions.

### 5a · Two curves, and only two

```ts
const EASE  = [0.23, 1, 0.32, 1] as const;   // arriving   · 27 files
const LEAVE = [0.4,  0, 1,    1] as const;   // leaving    · 15 files
```

`EASE` decelerates into place: it starts fast and lands soft, which is what
"something arrived and stopped" looks like. `LEAVE` is the mirror — it starts
slow and accelerates out of frame, which is what "this is over, do not wait for
it" looks like. It is spelled `EXIT`, `LEAVE`, `EXIT_EASE` and `EASE_OUT` in
different files; they are the same four numbers and should be one name.

**A departure is always shorter than an arrival.** Every exit in the set is
between 0.11s and 0.18s against a 0.20–0.28s entrance:

```
tooltip     0.12    dropdown     0.12    wizard back   0.12
popover     0.13    filter grid  0.14    swipe row     0.14
toast       0.15 (opacity 0.11)          modal         0.15
new items   0.16    detail       0.15    tag chip      0.18
```

The reason is not taste. An exit that takes as long as an entrance means the
thing replacing it either waits — which reads as lag — or crossfades through
it, which reads as a smear. Toast is the clearest case: the card leaves in
0.15s on `LEAVE`, its opacity beats that at 0.11s on `linear`, and it exits
**downward, out of the deck's band**, so the card behind it arrives into empty
space rather than through a ghost.

### 5b · The spring catalogue

Nine springs, in descending order of how often they appear. `ζ` is the damping
ratio, `c / 2√(km)` — under 1 overshoots, at 1 is critical, over 1 crawls in.

| Name | k / c / m | ζ | What it is for |
|---|---|---|---|
| **CELL** | 520 · 34 · 0.45 | 1.11 | 27 files. The default. A cell lighting, a tick landing, a thumb sliding, a row taking its slot. ~180ms, no tail. |
| **CROSSFADE** | 260 · 34 · 0.8 | 1.18 | 25 files. Opacity between two faces, and anything whose whole content is being replaced. |
| **SMALL** | 700 · 46 · 0.5 | 1.23 | 7 files. A label lifting, a caret rotating, a chip settling, a grip growing. ~170ms. |
| **DISCLOSE** | 150 · 27 · 1 | 1.10 | 4 files. A surface travelling a real distance: a drawer, a swipe row, a card flying home. |
| **SURFACE** | 420 · 36 · 0.9 | 0.93 | The modal panel. Alive, does not bounce. |

And the one-offs, each of which earned its own numbers:

```
tabs INDICATOR    620 · 42 · 0.35   ζ 1.42  the plateau is wide and carries
                                            three shadows; any overshoot
                                            reads as a correction
wizard RAIL       520 · 40 · 0.5    ζ 1.24  a head that overshoots a milestone
                                            and comes back reads as a mistake
tooltip RISE      560 · 34 · 0.6    ζ 0.93  alive without bouncing
tooltip WARM      900 · 48 · 0.5    ζ 1.14  the trip is already paid for;
                                            it only has to arrive
tooltip GLIDE     520 · 40 · 0.75   ζ 1.01  the surface sliding along the row
dropdown OPEN     620 · 38 · 0.6    ζ 0.99  small and close: arrive, don't travel
tabs PANEL        460 · 38 · 0.8    ζ 0.99  a panel settling
toast SURFACE     400 · 44 · 0.85   ζ 1.19  cards settle, never snap
typing SURFACE    380 · 30 · 0.8    ζ 0.86  the bubble has a little life in it
new-items ARRIVE  540 · 34 · 0.5    ζ 1.03  a pill is a small move
search SHELL      380 · 38 · 0.7    ζ 1.17  a width opening
progress FILL     210 · 34 · 0.9    ζ 1.24  a meter should not spring past
                                            the number it is reporting
upload SMOOTH     240 · 44 · 0.6    ζ 1.16  useSpring over reported progress,
                                            so a lumpy transport reads smooth
carousel WALL     700 · 30 · 0.5    ζ 0.80  the ONLY underdamped spring in the
                                            set — an end is a wall, and a wall
                                            gives and comes back
```

Read the table as a shape rather than a list. Stiffness rises as the distance
falls: 150 for a drawer crossing the screen, 520 for a row taking its slot, 700
for a caret rotating, 900 for a tooltip that is already on screen. Mass falls
the same way. **The distance chooses the spring.** If you are unsure, measure
the travel in pixels: over 200 → DISCLOSE, 20–200 → CELL, under 20 → SMALL.

### 5c · Springs, not CSS transitions

`motion` is the animation layer, so use it. A CSS `transition-colors` on a
cell that is being driven by a gesture will always look flatter than a spring,
because it has one speed and no memory of where it was going.

Tweens with a fixed duration stay only where the timing itself is the
information: a count-up has to land when it says it will, a page entrance
should not vary, and a hold-to-confirm sweep is a contract with the finger.

There are exactly three jobs left for a CSS transition, and they are all
discrete colour changes on things nobody is dragging:

```
transition-colors duration-150               hover and focus tint
transition-[border-color,box-shadow] 150ms   a field or button changing state
transition-[background-color,...] 200ms      a tone crossing a threshold
                                             (password-strength danger→safe)
```

### 5d · Physics beats taste

Our springs are for things that move because a person intended them to: a
panel arriving, a row being picked, a sheet following a thumb. Those start and
stop under intent, so they ease.

Something that models a physical process obeys that process instead. A ripple
is a wave leaving the point you touched, and a wave travels at constant speed
— so it expands **linearly**, not eased. Easing it makes it read as a growing
shape rather than a spreading wave, which is exactly why the first version
felt wrong.

The ripple, fully specified, because it is worth getting right once:

```
radius     distance from the contact point to the FURTHEST corner of the box
shape      a real circle — a scaled rounded rect grows its own radius and
           turns into a shapeless blob
expansion  0.5s linear, from scale 0 at the contact point
opacity    in over 0.07s linear while it grows, out over its own duration
           with EASE once the press is released
tint       ink at 15% on light, white at 20% on dark
held       stays at full reach while the finger is down, fades on release
```

The same reasoning produces every other `linear` in the set: a spinner turns at
one rate because it is reporting an unknown, a marquee moves at one rate
because it is a belt, a retry countdown drains at one rate because seconds are
one rate, and a hold sweep fills at one rate because that is the promise the
button made.

**Research before inventing.** A ripple, a spinner, a slider detent — these
are solved, published, and measured. Invent the parts nobody has solved;
look up the parts everyone has. The first ripple here was invented and it
was wrong in three separate ways.

### 5e · Small moves want a tight spring

Our surface springs are tuned for panels, sheets and rows. Reuse them on a
small element and it reads as lag, because a soft spring reaches the target
quickly and then *crawls* the last few pixels. Nobody sees the crawl and thinks
"underdamped"; they think slow.

```
surfaces      stiffness 150–420, damping 27–34   panels, disclosure, rows
small moves   stiffness 700–900, damping 44–48   a label lifting, a chip
              mass 0.5                            settling, an icon nudging
                                                  ~170ms, no tail
```

Two more things learned the hard way on the floating label:

- **Scaling type blurs it.** Transform-scaled text loses its hinting. Below
  about 0.9 it is visibly soft. If a label must shrink as it moves, 0.92 is
  the floor; better still, move it and leave the size alone.
- **When something leaves its container, it must land on a line that already
  exists.** A label floating out of a field aligns with the field's own edge,
  not with the field's inner text padding — otherwise the page grows a third
  vertical axis that agrees with nothing.
- **Reserve the destination up front.** The space a floated label will occupy
  is padding on the wrapper from the start, so nothing below it ever moves.

### 5f · Velocity is handed over, never dropped

A gesture that ends and then starts an animation from zero velocity is the
single most common way to make a drag feel cheap. Every release in the set
passes `info.velocity.x` into the spring that takes over:

```ts
glide(to, velocity)   →   animate(x, to, { ...SPRING, velocity })
```

`drawer`, `snap-carousel` and `swipe-deck` all do this. The thresholds they
compare against are the second half of the same idea — a flick should commit
even when the finger never travelled far enough:

```
drawer          offset > width · 0.38   OR   speed > 520
snap-carousel   projected = at − (v · 0.14) / step, capped at ±1 slide
swipe-deck      |dx| ≥ 92               OR   |v| ≥ 520 and |dx| ≥ 32
toast           |dx| > 72               OR   |v| > 460 and |dx| > 20
```

`maxFlick: 1` on the carousel is the rule that keeps a hard flick from
skipping four slides. Momentum decides *whether* you move, not *how far*.

### 5g · Three ways to make it laggy

These are the mistakes that actually caused jank in this project, in order of
how long each took to find:

1. **Setting React state during an animation.** An `onAnimationStart` that
   flips a `willChange` flag re-renders the subtree mid-flight and drops
   frames. Set the hint statically or not at all.
2. **Animating `mask-image`.** A mask is repainted every frame and cannot be
   composited. To fade an edge in and out, animate the `opacity` of a gradient
   overlay instead — that runs entirely on the compositor.
3. **Animating layout properties when transform would do.** A row leaving a
   list should exit on `opacity` and `x`, and let its siblings close the gap
   with `layout="position"`. Animating its `height` to zero relayouts the
   whole list every frame.

The mask rule has a corollary, not an exception: `upload-dropzone` and the
sidebar both use `mask-image`, and both are static. **A mask is fine where it
never animates; a gradient overlay is required where it does.** `show-more` and
`logo-marquee` animate their veil's opacity for exactly this reason.

Progress that comes from a gesture is reported in **discrete steps**, not as a
float. A 550ms hold drawn in twelve cells costs twelve renders instead of
thirty-three, and it is the honest shape for a countdown anyway.

### 5h · Write the DOM directly when a value changes every frame

React should not re-render at 60fps. Four components bypass it entirely, and
each names the channel it writes through:

```
logo-marquee       track.style.transform, off one shared rAF
resizable-panels   container.style.setProperty("--interior-split", "42%")
resizable readout  node.textContent = "42%"          — via an onStep callback
sticky-header      MotionValues only; React renders once, at the threshold
```

`resizable-panels` is the pattern worth copying: the live value is a CSS
custom property the grid template reads, the *reported* value is an
`aria-valuenow` attribute set imperatively, and React state is only written
when the drag **commits**. Three channels, three cadences, one render.

`sticky-header` is the other half of it. Everything is `useTransform` off
`scrollY`, so there is no curve to skip under `prefers-reduced-motion` — each
value resolves on the frame it is scrolled to. A scroll-driven component does
not need a reduced-motion branch, and saying so in a comment is how the next
reader knows it is not an oversight.

### 5i · `layout`, `layoutId`, and when to use neither

```
layout              a box whose size changes and must not be animated by
                    width/height  →  tabs plateau
layout="position"   a list where siblings close a gap
                    →  filter-grid, tag-input, upload, tooltip label
layoutId            ONE element that travels between mount points
                    →  filter-grid thumb, scroll-spy thumb, tooltip seat
neither             an always-mounted element moved on `y`
                    →  dropdown highlight
```

The dropdown is the instructive one, because it is the case against
`layoutId`. Drawing a highlight per row and crossfading kills the travel;
sharing it through `layoutId` makes it fly in from wherever it last was when
the list opens. So it does neither: one span, always mounted, animated on `y`
by `activeIndex * 32`, fading only when nothing is active. Row height is a
constant so nothing has to be measured.

The tabs plateau is the case *for* `layout`, and it comes with three traps
that are all written down in the file:

- Motion counter-scales the radius only for properties **it owns**, and it
  does not parse the four-value shorthand. Write `borderTopLeftRadius` etc.
  one by one or the corners smear on every move.
- Motion counter-scales a child that also carries `layout`. The hairline lives
  on such a child, because a border drawn on the plateau itself stretches with
  the box — the radius is corrected, a border is not.
- No `overflow-x-auto` on the row. It clips in both axes, and the plateau has
  to hang 1px past the bottom edge to cover the hairline. That overhang is the
  entire join between the tab and the panel.

### 5j · Entrances

Every docs page animates in on load, staggered by block, because a page that
appears fully formed after a refresh reads as a document rather than an
application.

```
header   delay 0
preview  delay 0.07
body     delay 0.14
0.34s, EASE, { opacity: 0, y: 10, filter: "blur(5px)" }
```

Stagger inside a component follows the same shape but is **capped**, because a
stagger that scales with the data eventually becomes a wait:

```
password bars   i * 0.03                     four bars, so no cap needed
like-burst      hash-derived, 0–0.05         eight sparks, deterministic
text-reveal     min(stagger, span / (n-1))   the whole reveal fits maxDuration
```

`text-reveal` states the general rule: the caller asks for a per-unit stagger,
the component silently compresses it so the total never exceeds `maxDuration`
(1.6s). A hundred-word paragraph reveals in the same time a ten-word one does.

---

## 6 · Discrete cells beat continuous bars

If a quantity can be split into units, draw the units.

The reference toast draws its auto-dismiss timer as a bed of pixels going out
one column at a time. The sidebar uses the same idea for real: a strip of
cells per section, one per component, with the accent marking where you are.

The block on the landing is the same shape but is **not** a progress readout —
it is a fixed brand mark with one cell lit. It stays that way as the set grows,
because a mark that changes every time a component ships is not a mark.

```
size-[5px] rounded-[1.5px]   landing block
size-[4px] rounded-[1px]     sidebar section strip
gap-[2px]                    both
```

Lit means the component exists. If a cell needs variation, use a
**deterministic hash** of its coordinates — never `Math.random`, because the
server and the client have to agree on the markup.

```ts
like-burst    const h = (((i + 1) * 2654435761) % 997) / 997;   // Knuth
skeleton-swap WIDTHS[(index * 7 + 3) % WIDTHS.length]           // a prime step
```

### 6a · Quantisation is a render budget, not a look

Every gesture that reports progress reports it in steps, and the step count is
chosen so the cells are big enough to see and few enough to be cheap:

```
long-press          12 steps over 550ms      the label charges with accent,
                                             clipped step by step
hold-to-confirm     20 steps over 1800ms     + a continuous sweep behind it
reading-progress    24 steps                 a fill on a transform; the
                                             quantization is the budget,
                                             not the look
pinch-lightbox       8 steps                 zoom, so the readout can settle
swipe-deck           6 steps                 how committed the drag is
```

`setStep((prev) => (prev === s ? prev : s))` is in every one of them. The rAF
runs at 60fps; React renders `steps` times. That identity check is the whole
saving, and leaving it out is how a hold-to-confirm costs 108 renders.

`hold-to-confirm` is the one that runs both at once, and it is worth reading as
a pair: **twenty discrete cells for the count you can abandon, and a continuous
`clipPath` sweep for the surface filling underneath.** The cells are the
information; the sweep is the material. Quantising the sweep would make the
fill look like it was stuttering; not quantising the cells would cost thirty
renders to say the same thing.

---

## 7 · Color

```
ink    #1B1B19 / #F3F3EF   headings, primary text
ink-2  #46463F / #C2C2BA   body copy
ink-3  #6E6E66 / #93938B   metadata, labels, disabled rows

hairline        ink 17% / white 16%    dividers, compartment edges
hairline-strong ink 30% / white 28%    hover borders, scrollbar thumb
```

The ink ramp and the hairlines were both raised twice: the first pass was
invisible, which is its own lesson. A divider at 7% and metadata at `#A6A6A0`
read as "refined" in a mockup and as "broken" on a real screen. When in doubt
between subtle and legible, legible wins — restraint is in the type sizes and
the motion, not in whether people can see the line.

```
accent #4568FF / #93B0FF   interaction, focus, selected state, "this exists"
moss   #3D7A4E / #5BD79C   success, confirmation
flag   #C0442F / #F5897F   rejection: validation errors, failed states
```

Accent marks **interaction and state**. It is never decoration. The one place
it appears without an interaction is the wordmark, and that is deliberate.

Text selection is `accent-soft` with ink text, not a saturated block.

### 7a · What the components actually spend

In component code the three semantic colours are spelled in Tailwind, and there
is a fourth that only exists for one job:

```
accent   #4568FF / #93B0FF         literal hex, both modes
moss     emerald-500 / emerald-400 fill · emerald-600 / emerald-400 text
flag     red-500 / red-400 fill    · red-600 / red-400 text
caution  amber-500 · amber-600 / amber-400
```

`amber` appears in exactly one place — `password-strength`, for the middle of
a three-band scale and for "commonly guessed". It exists because a strength
meter genuinely has three verdicts and painting the middle one red or green
would be a lie. **Do not spend it anywhere else.** A third semantic colour in a
set this size is a slope, not a palette.

### 7b · Accent inversion on inverted surfaces

The accent flips with the theme, and it flips again on a surface that is
already inverted. The primary button in `wizard-steps` and `swipe-deck` is
`bg-stone-800` in light mode — a dark surface on a light page — so its focus
mark is `#93B0FF`, the *dark-mode* accent, in *light* mode:

```
light page, light surface    focus #4568FF
dark page,  dark surface     focus #93B0FF
light page, INVERTED surface focus #93B0FF     ← wizard/deck primary button
dark page,  INVERTED surface focus #4568FF
```

This looks like a bug in a diff and is not one. The rule is: **the accent is
chosen against the surface it is drawn on, not against the page.**

### 7c · Neutral fills, and why they are not accent

Selection and "on" states in this set are usually **ink, not blue**:

```
segmented thumb     bg-stone-800 / bg-stone-100
filter chip thumb   bg-stone-800 / bg-stone-100
slider fill+thumb   bg-stone-800 / bg-stone-100
wizard done tile    bg-stone-800 / bg-stone-100
tag chip, armed     bg-stone-800 / bg-stone-100
carousel dots       bg-stone-800 / bg-stone-100
```

Accent is reserved for the things where the meaning is *"the system is
responding to you right now"* — focus, a drop marker, a progress fill, a live
drag divider, a card you are holding. A control whose only news is "this one
is selected" says that with ink and depth. If every selected thing were blue,
focus would stop meaning anything.

---

## 8 · Typography

Sans by default. Mono only for metadata, numbers, code, ids and keycaps.

```
clamp(32,5.6vw,52) medium tracking-[-0.04em]  landing headline
27px   medium  tracking-[-0.03em]             page title
20px   medium  tracking-[-0.03em]             sticky-header expanded title
15px   regular leading-relaxed                lede, modal title, otp char
13.5px regular leading-relaxed                body, panel copy
13px   medium                                 card title, row name, control
12.5px regular                                sidebar row, secondary line, chip
11.5px regular                                hint, error, tooltip, caption
11px   semibold uppercase tracking-[0.08em]   section label, column header
11px   medium                                 dock label
10.5px mono                                   metadata (.meta), counts
9.5px  mono tabular                           ids, counters, keycaps
```

Headings are **medium**, never bold. The negative tracking does the work that
weight would do badly. Anything showing a number gets `tabular-nums`.

Two rules the components enforce and prose does not:

- **`leading-none` is banned on anything containing a word.** It shrinks the
  box to the em square and a descender then sits high in it. `tabs` uses
  `leading-[1.4]` and says why: a normal line box centres on the baseline,
  which is what the eye reads as centred. `leading-none` is only for a numeral
  or a glyph in a fixed-size tile.
- **Uppercase is always `tracking-[0.06em]` or `[0.08em]`.** Uppercase at
  default tracking is a wall. It appears in three places only: section labels,
  table column headers, and the swipe-deck intent badge.

### The wordmark

`interior[.]dev` — "interior" in ink semibold, `[.]` in accent, "dev" in ink-3
medium. The bracketed dot gets `mx-[2.5px]` and positive tracking so the
brackets can breathe against the surrounding negative tracking. There is no
logotype, no symbol, no icon. The brackets are the mark.

### Icons

Phosphor, regular weight, **drawn inline**. Twelve files carry the same
comment — *"drawn inline so the file still costs one dependency"* — and that is
the reason: an icon package would be a second dependency for a component whose
whole promise is one.

```
viewBox 0 0 256 256   strokeWidth 16    the Phosphor grid, scaled by width/height
viewBox 0 0 24 24     strokeWidth 1.5   a custom mark on the 24 grid
viewBox 0 0 12 12     strokeWidth 1.6   a mark inside a control
strokeLinecap="round" strokeLinejoin="round"   always
```

`strokeWidth 16` on a 256 viewBox is 1.5px at a 24px render. The two grids are
the same line weight; use whichever the source glyph came from and do not
convert.

---

## 9 · Details that carry the whole thing

- **Scroll containers fade at both ends**, never hard-cut. The sidebar uses
  `mask-image` (`.fade-y`) because it never animates; the docs panel uses
  sticky gradient strips under the header and at the foot, because those sit
  over content that does.
- **The scrollbar is a 4px mark in a 10px gutter**, `ink` at 16 percent, 2px
  radius, transparent track, 28 percent on hover. It is furniture: visible
  when you look for it, invisible when you do not. `.no-bar` removes it
  entirely where a fade already says there is more.
- **A row picked out of a list is marked by its surface, not by moving.** The
  3px content nudge belongs to *transient* selection — a cursor travelling a
  command palette — where it reads as the cursor landing. On a **persistent**
  state like the current route it is just one row permanently out of line with
  every other row, which is the ragged left edge you feel before you name it.
  `dropdown` states the same conclusion for hover: the highlight already says
  which option is yours, so sliding the label as it arrives reads as the list
  shifting under the pointer, on every hover.
- **A button keeps its width when its state changes.** Both labels live in the
  same grid cell; only opacity moves.
- **Every component in one flat list is a wall, not navigation.** Sections open and
  close independently, any number at once, the active one opens itself, and a
  filter is one `/` away for when the name is already known.
- **Demos are replayable.** A micro-interaction you can only watch once is a
  screenshot with extra steps.
- **Sub-text wakes up on selection:** `ink-3` → `ink-2`. Never a color change
  large enough to notice as a color change.
- **Separators belong to the slots, not to the rows.** In `sortable-table` the
  hairlines are absolutely positioned at `(i+1) * rowHeight` and are not
  children of any row — hanging them off a row's sorted index makes them blink
  off mid-travel. They also paint last, so a marked row's tint cannot swallow
  one.
- **A ghost of the thing you are dragging is one statement too many.** The gap
  the siblings open **is** the drop target.

---

## 10 · Documentation structure

Every component page is the same five blocks, in the same order:

1. Category and sheet id, then the name, then one sentence on the problem
2. **Preview** — the live demo in a well, with a replay control
3. **Install** — one line, one dependency
4. **Usage** — a real example, not a hello-world
5. **Source** — read from the actual file at build time, so it can never drift
6. **Props**

The page ends at the props table. There was a "Guarantees" section listing what
each component refuses to get wrong, and a footer restating the dependency on
every page — both were cut. The work still has to be done; it just does not
need to be announced seventy-seven times.

---

## 11 · Invariants for every component

1. **Zero layout shift.** Every reachable state reserves its space up front.
2. **Interruptible.** The spring resumes from where the element currently is,
   not from the start.
3. **`prefers-reduced-motion`** → the information still arrives, the trip is
   skipped. Never hide the element.
4. **Full keyboard and ARIA.** Screen readers get the final value once, not
   sixty updates a second.
5. **One dependency:** `motion`. Tailwind classes are overridable from outside.
6. **RSC-compatible.** `"use client"` only on the file that actually needs it.
7. **The DOM is written directly** when a value changes every frame. React
   should not re-render at 60fps to move a number.

---

## 12 · The file shape

Every component file is the same document, in the same order. This is not
convention for its own sake — the docs page reads the file at build time, so
the order is what a reader meets.

```
"use client"
imports
motion constants        EASE, LEAVE, springs, INSTANT
domain constants        ROW_H, THRESHOLD, PEEK, HEAD
pure helpers            place(), relocate(), tokenize(), perimeterPath()
exported types          UseXOptions, UseXReturn, XProps
export function useX()  the headless hook — all behaviour, zero markup
inline icons            drawn as consts or tiny components
export function X()     the styled component, built on the hook
```

**The hook is the product; the component is an example of using it.** Every
file exports both, and the hook never touches a class name. That is what makes
the set copy-pasteable into a design system that is not ours.

Three signatures repeat and should not be re-invented:

```ts
// 1 · Controlled or uncontrolled, decided per render, never mid-flight.
const [internal, setInternal] = useState(defaultValue);
const controlled = value !== undefined;
const current = controlled ? value : internal;

// 2 · Callbacks live in a ref, so no effect ever depends on their identity.
const emit = useRef(onChange);
emit.current = onChange;

// 3 · A prop mirrored into a ref, so a rAF loop can read it without
//     re-subscribing.
const live = useRef(items);
live.current = items;
```

Rule 2 is the one that matters. A parent that passes an inline arrow re-creates
it every render; an effect that lists it as a dependency then tears down and
re-subscribes every render. Every timer, observer and rAF in this set is
immune to that by construction.

---

## 13 · State without disabling

`disabled` is a last resort, and most of the set never reaches for it. A
disabled control is a dead thing you can still see and cannot ask about — it
leaves a hole in the tab order, drops out of the accessibility tree, and gets
repainted in the UA's grey, which is the one colour we do not control.

Four replacements, in order of preference:

**Let it leave.** If a control has genuinely nothing left to do, remove it.
`wizard-steps` has no Back button on the first step and no Finish button once
the flow is complete — *"a permanently dead control is worse than an empty
slot"*, and *"a Finish that stays pressable is a Finish that never finished
anything."* Both leave through `AnimatePresence` and come back when they mean
something again.

**Let it go invisible but keep its cell.** `swipe-deck` defines
`spent(out) => out ? "opacity-0" : ""` and pairs it with `inert`. The control
is gone to the eye, gone to the keyboard, and still occupying its grid column
— so the row never moves. This is the right answer when the layout around it
must not shift.

**Make it not a control.** `wizard-steps` renders a step you have not reached
as a `<span>` with an `sr-only` label, not as a disabled `<button>`: *"a step
you have not reached is not a broken button, it is not a button."*

**`aria-disabled`, and refuse the click yourself.** `segmented-control` spells
out why: *"a native disabled radio is dropped from the accessibility tree and
repainted in the UA's grey."* The control stays reachable and announced, the
handler returns early, and we keep our own colours. `load-more` and
`hold-to-confirm` do the same.

The one legitimate use of the attribute is a real `<button disabled>` on a
control whose whole component is switched off from outside — `copy-button`,
`icon-morph`, `loading-button` — where `disabled:opacity-50` is the entire
story.

---

## 14 · Reserving space: the invisible twin

Invariant 1 says every reachable state reserves its space up front. In practice
that is one technique, used eighteen times:

```tsx
<span className="grid">
  <span aria-hidden className="invisible col-start-1 row-start-1">{widest}</span>
  <span className="col-start-1 row-start-1">{current}</span>
</span>
```

An invisible copy of the **widest state the box can ever hold**, in the same
grid cell, sizing the column once. What it reserves against varies:

```
width, longest label      like-burst, upload-dropzone (WIDEST_LABEL),
                          slider-detents, wizard next/finish
width, longest number     swipe-deck counter,
                          floating-label counter, tag-input max
width, longest string     reading-progress ("N min left" at its maximum)
FONT WEIGHT               scroll-spy, tabs — an invisible *medium* twin under
                          a regular label, so going bold cannot reflow
```

The weight case is the subtle one and it appears twice. A row whose label goes
from regular to medium when selected gets wider. In a vertical rail that means
the whole column reflows as you scroll. The invisible medium twin fixes the
column at its widest and the live label is drawn over it.

Where a twin is overkill, a fixed box does the same job:

```
inline-validation   height: reserveLines * 16    the error's space, always
floating-label      pt-[20px] wrapper            the raised label's destination
floating-label      h-[16px] hint row            hint and counter, always
otp-input           h-4 status row               hint / error / success
wizard-steps        h-9 button row               back and advance
upload-dropzone     h-[136px] list, h-[16px]     the list and its summary
value-flash         size-[14px] mark cell        the arrow that may or may not
                                                 land
```

The general form: **find the tallest and widest state the component can reach,
give the box those dimensions permanently, and animate opacity inside it.**

---

## 15 · Focus, three shapes

There is one focus colour and three focus shapes. Which one you use is decided
by geometry, not by taste.

**Inset** — a row, cell, item or region inside a container. The focus mark
cannot leave the container's clipping box, so it is drawn inward:

```
focus-visible:bg-[#4568FF]/[0.06]
focus-visible:shadow-[inset_0_0_0_1px_#4568FF]
dark:focus-visible:bg-[#93B0FF]/[0.1]
dark:focus-visible:shadow-[inset_0_0_0_1px_#93B0FF]
```

Used by: logo-marquee, scroll-spy, segmented-control, sortable-table headers,
show-more region, hide-on-scroll, sticky-header, snap-carousel,
slider-detents, drawer and modal close buttons, toast buttons.

**Border plus lift** — a standalone button sitting on the page with room around
it. The border goes accent and the shadow gains an accent-tinted glow, which
reads as the button coming further forward:

```
focus-visible:border-[#4568FF]
focus-visible:shadow-[0_1px_2px_rgba(28,25,23,0.08),
                      0_10px_20px_-14px_rgba(69,104,255,0.6)]
```

Used by: popover trigger, show-more button, wizard back, snap-carousel arrows,
pinch-lightbox chrome, new-items pill, long-press.

**Outside** — for an element that fills its own frame, where an inset line
would be painted over by its own content. `swipe-deck` uses
`focus-visible:shadow-[0_0_0_1px_...]` because the top card covers the box
exactly; `wizard-steps` uses `focus-visible:shadow-[0_0_0_1.5px_...]` on the
step tile because the tile *is* the button's content.

Two structural notes that recur:

- **When something slides underneath, focus is drawn as a sibling above it.**
  `tabs` solves this with `after:` — the plateau is a child at `inset-0` and
  would paint straight over a shadow set on the parent. Anything with a
  travelling marker has the same problem and needs the same answer.
- **Draw the focus edge after the fill.** `filter-grid` renders the chip's
  border span *after* the thumb, because roving tabindex means focus lands on
  the selected chip, and an edge painted underneath a filled thumb is invisible
  exactly when it is needed.

---

## 16 · Overlays: portal, lock, inert, stack

Four things happen when a surface covers the page, and all four are required.

**Portal.** `drawer`, `modal` and `pinch-lightbox` render into `document.body`.
The reason is written in `drawer`: *"`position: fixed` is enough right up until
an ancestor grows a transform, a filter or a will-change, at which point the
drawer silently becomes a child of that box instead of the page — and that
ancestor is rarely yours."* The host is resolved in an effect and the tree
returns `null` until then, so the server and the first client render agree.

**Scroll lock, with the gutter paid back.** Hiding the scrollbar narrows the
viewport and shifts the whole page left. Every lock compensates:

```ts
const gap = window.innerWidth - document.documentElement.clientWidth;
body.style.overflow = "hidden";
if (gap > 0) body.style.paddingRight = `${base + gap}px`;
```

`modal` is the reference implementation because it **refcounts**. A module-level
`locks` counter and a single `releaseLock` mean two stacked dialogs do not each
restore a stale `overflow` value on the way out. It also reads the computed
`padding-right` first and adds the gutter to it, rather than overwriting a
padding the app already had.

**`inert` to mute everything else.** Four different scopes, one attribute:

```
drawer            every body child that does not contain the drawer
modal             every sibling of the overlay in its portal parent
snap-carousel     every slide that is not the current one
swipe-deck        every card that is not the top one
```

Every one of them records the previous value and restores it on cleanup.
Setting `inert` and removing it unconditionally is how you break a page that
was already using it.

**A stack, so Escape means one thing.** `modal` keeps a module-level
`stack: object[]`; each open dialog pushes a token, and the keydown handler
returns unless its own token is on top. Without it, one Escape closes three
dialogs. `pinch-lightbox` implements the same idea in one component: a native
listener on the shell runs *before* the frame's React handler, which is what
lets Escape mean "come home" while zoomed and "close" only once the image is
back.

**Focus goes in and comes back.** All four record `document.activeElement` on
open and restore it on close, guarded by `isConnected` because the opener may
have unmounted. The trap itself is the same fifteen lines everywhere: collect
`FOCUSABLE`, wrap at both ends, and if the panel contains nothing focusable,
focus the panel. `modal` additionally listens on `focusin` and pulls focus back
if it ever escapes — the belt to the Tab handler's braces.

---

## 17 · Gestures: the whole abandonment surface

A gesture that only ends on `pointerup` is a gesture that gets stuck. Every
pointer-driven component in this set listens for the full set of ways a press
can stop being a press:

```
onPointerUp              the normal ending
onPointerCancel          the OS took the pointer (a system gesture, a call)
onLostPointerCapture     capture was stolen — treat as cancel
onPointerLeave           the finger left the target       (holds only)
window "blur"            the user alt-tabbed mid-press
document visibilitychange  the tab went to the background
"keydown" Escape         the deliberate abort
onBlur                   keyboard-initiated press, focus moved away
move tolerance           the finger drifted: 8px long-press, 10px hold
```

`hold-to-confirm`, `long-press`, `press-depth`, `ripple`,
`resizable-panels`, `slider-detents`, `swipe-deck`,
`pinch-lightbox`, `logo-marquee` and `tooltip-group` all install some subset.
The rule: **if a component can be mid-gesture, it registers a window `blur`
listener.** That single line is the difference between a component that
recovers and one that needs a reload.

Two more that are easy to miss:

- **`setPointerCapture` on the element you started on**, so a drag survives the
  pointer leaving the box. Paired with `onLostPointerCapture` treated as a
  cancel, not as a drop.
- **`touchAction`, chosen by the axis you own.** `manipulation` on a button
  (kills the 300ms delay, keeps scrolling); `pan-y` on a horizontal drag (the
  page still scrolls vertically); `none` on a two-dimensional gesture —
  `pinch-lightbox`, `slider-detents` — where you own both axes.

**Keyboard is not an afterthought; it is a second complete implementation.**
Every gesture has one:

```
resizable        arrows step, Shift+arrow fine, Home/End limits, Enter parks
slider-detents   arrows step, Shift/PageUp/PageDown jump detent to detent
swipe-deck       ←→ decide, Backspace undoes
pinch-lightbox   +/− zoom, arrows pan, 0 returns home
snap-carousel    ←→ move, Home/End to the ends
```

And every one of them announces what it did through a live region — see §18.

---

## 18 · Announcements

A live region that fires on every state change is worse than none: it turns a
drag into a hundred interruptions. Three rules.

**Announce late.** Anything driven by a stream of small events waits for the
stream to stop before it says anything. The delay is a `setTimeout` whose
cleanup cancels the previous one, so only the final value is ever spoken:

```
scroll-spy          420ms   the section you settled in
expanding-search    500ms   the result count
new-items-pill      700ms   how many arrived
password-strength   700ms   the verdict
typing-indicator    700ms   who is typing
value-flash         700ms   the number that stayed
presence-avatars    900ms   "four people joining at once is one sentence"
```

**Announce once.** `toast-stack` keys a `Set` on `${id}:${status}` — one
announcement per message, and one more when that message resolves. It clears
the set past 64 entries so a long session cannot leak.

**Announce the outcome, not the mechanism.** The sr-only text is a sentence,
not a value:

```
sortable-table "Sorted by Revenue, descending. 24 rows."
tag-input      "design removed, 4 left."
```

The counterpart is the **hint**: a permanent `sr-only` element wired through
`aria-describedby`, read once when the control is focused, that teaches the
keyboard model. `resizable-panels`, `snap-carousel`,
`swipe-deck`, `hold-to-confirm`, `long-press` and `pinch-lightbox` all
carry one, and they read like instructions rather than descriptions:

> *"Drag to resize, or move the divider with the arrow keys. Home and End
> go to the limits, and Escape cancels a drag in progress."*

`role="status"` with no `aria-live` is the same thing at a lower volume, and is
correct where the value is polled rather than pushed — `pinch-lightbox` reports
`Zoom 2.4 times` that way, off the **settled** zoom, not the live one.

---

## 19 · Async: grace, minimum, settle, rollback

Four timing patterns, each solving a different flavour of flicker.

**Grace before you claim nothing is there.** Wait ~220ms after a count hits
zero before saying "empty", because a list that is one frame from arriving
should not flash an empty state. Until then the status is `waiting`, which
draws nothing at all.

**A minimum, so a fast response does not strobe.** `skeleton-swap` waits 120ms
before showing the skeleton *and* keeps it up for at least 380ms once shown.
A 200ms request never sees a skeleton; a 400ms one sees a complete one.
`ripple` does the same for a tap: `minVisible: 220ms` before it may begin to
fade, so a fast click still produces a wave you can see.

**A settle window, so a flurry becomes one commit.** `like-burst` is the
reference. Every tap updates the UI immediately, and a 400ms timer restarts on
each one. When it fires:

- if the intent now matches the truth, it snaps back and sends nothing;
- otherwise it aborts the in-flight request, bumps a sequence number, and
  sends one;
- a response whose sequence is stale is discarded;
- a failure rolls both the count and the flag back to the last known truth.

That is the complete optimistic contract, and any component that writes to a
server should copy it rather than approximate it. `tag-input` uses a smaller
version of the same idea for rejections (2400ms visible, 460ms flash on the
duplicate).

**Backoff you can watch and interrupt.** A scheduled retry runs its wait on
rAF rather than a timer, so the drain can be drawn in discrete steps with a
"retrying in 3s" readout beside it. Default backoff is
`min(8000, 700 · 2^(n-1))`, and the retry control stays live during the wait.

Two more that belong here:

- **An automatic loader must be interruptible by inaction.** `load-more` runs
  at most `maxAutoLoads: 3` consecutive automatic loads before it pauses and
  waits for a real click. Scrolling the sentinel out of view resets the count.
  An error blocks automatic loading entirely until a manual retry.
- **Per-file progress, never one global bar.** `upload-dropzone` runs a
  concurrency-2 queue, each row owning its own `AbortController`, its own
  progress `MotionValue`, and its own `clipPath` fill. Removing a row aborts
  it. Unmounting aborts everything.

---

## 20 · Scroll containers

Nine components own a scroll box, and they agree on six things.

```
overflow-y-auto overscroll-contain        never let a wheel escape to the page
[scrollbar-gutter:stable]                 reserve the track from the first paint
tabIndex={0} + role="region" + aria-label a scroller is keyboard-reachable
scrollPaddingTop: barHeight + 8           anchors land below a sticky bar
style={{ overflowAnchor: "none" }}        the browser must not "help" (new-items)
a spacer div, not padding                 content starts below an absolute bar
```

`scrollbar-gutter: stable` is conditional twice, and both conditions are
correct: `filter-grid` only reserves it when the grid can actually overflow
(*"otherwise every short grid pays for a track it will never show"*), and
`show-more` reserves it in **both** states once the content is capped, because
expanding into a scrollbar would move every line left by its width.

The keyboard-reachability rule collides with a lint rule and is worth the
suppression, spelled out in two files: *"Content that scrolls has to be
reachable without a pointer, and the rule cannot see that this box overflows."*
The inverse also holds — `logo-marquee` gives its viewport a tab stop **only**
under `prefers-reduced-motion`, when it stops looping and the overflow becomes
the only route to the rest of the names.

`new-items-pill` is the hard case and worth reading in full. `overflowAnchor:
none` turns off the browser's scroll anchoring, and the component does the job
itself: when items arrive and you are not pinned, it restores the distance from
the bottom rather than the offset from the top. On jump it **focuses first,
then scrolls** — moving focus into a container that is already mid-flight
cancels the smooth scroll in WebKit, and the jump silently does nothing.

---

## 21 · Measurement

Nothing in this set reads a layout value more than it has to, and nothing
re-renders because a number changed by half a pixel.

```ts
// Always: a ResizeObserver, not a resize listener.
const observer = new ResizeObserver(read);
observer.observe(el);
return () => observer.disconnect();

// Always: an epsilon, so a subpixel jitter cannot loop.
setBox((prev) => Math.abs(prev.width - w) < 0.5 ? prev : { width: w });

// Always: useIsomorphicLayoutEffect, so the first paint is already correct.
const useIsomorphicLayoutEffect =
  typeof window === "undefined" ? useEffect : useLayoutEffect;
```

That `< 0.5` guard appears in `expanding-search`, `snap-carousel` and
`show-more`. Without it a fractional layout width feeds
back into a state update that changes the layout width, and the observer never
settles.

Prefer **not measuring**:

```
dropdown         ROW_H = 32 is a constant, so the highlight needs no measurement
wizard rail      evenly spaced, so the head travels on a percentage translate
segmented        gridTemplateColumns: repeat(n, 1fr), thumb x = i * 100%
carousel         one slide width, read once, everything else is arithmetic
```

`segmented-control` is the trick worth stealing: the inverted label is not a
second copy positioned per option, it is **the whole row of labels drawn once
inside the thumb and counter-translated**. `x: thumbX` on the thumb,
`x: maskX` (the exact negation) on the row inside it. Two transforms, one
truth, and the label inverts *through* the thumb rather than crossfading with
a duplicate.

Where a measurement is unavoidable and expensive, take it **once per gesture,
not per frame**: read every rect you will need at lift and cache it, then let
the move handler do pure arithmetic against the cache and write one
`transform`.

---

## 22 · Reduced motion

`useReducedMotion()` is in every component but two, and both exceptions are
justified in the file:

- `sticky-header` — every value is a `useTransform` off `scrollY`, so there is
  no trip to skip; each one resolves on the frame it is scrolled to.

The pattern is one constant and one ternary:

```ts
const INSTANT = { duration: 0 } as const;
const move = reduced ? INSTANT : CELL;
```

`{ duration: 0 }` rather than removing the animation, because the element must
still end up in the right place — invariant 3 says the information arrives, the
trip is skipped. Three refinements:

- **`initial={false}`** where a mount would otherwise animate. Under reduced
  motion the entrance is skipped, not deleted.
- **`layoutId={reduced ? undefined : id}`** — a shared-layout animation cannot
  be given `duration: 0`; it has to be switched off. `filter-grid` and
  `tooltip-group` both do this.
- **Behaviour, not just timing.** `scroll-spy` and `new-items-pill` pass
  `behavior: reduced ? "auto" : "smooth"` to `scrollTo`. `streaming-text`
  jumps straight to `done` and shows the whole string. `logo-marquee` stops
  looping entirely and becomes a real scroll container.

---

## 23 · Where the set does not obey itself

The refactor queue, in the order the inconsistency costs the most.

**1 · Two focus vocabularies.** Seven files still use
`focus-visible:ring-2 focus-visible:ring-stone-400`, which is neither the
accent nor any of the three shapes in §15, and which §3b explicitly bans
("no focus rings"):

```
copy-button  hold-to-confirm  icon-morph  like-burst
loading-button  press-depth  ripple  streaming-text
```

These are the oldest files in the set. They should move to the border-plus-lift
shape, since all of them are standalone buttons.

**2 · Twenty-four copies of the same five constants.** `EASE` is declared in 24
files, `CELL` in 23, and `CROSSFADE`, `LEAVE` and `INSTANT` in comparable
numbers — `LEAVE` under four different names (`EXIT`, `LEAVE`, `EXIT_EASE`,
`EASE_OUT`).
This is deliberate — a copied file must not import from a shared module — but
the *values* must not drift. Any change to a spring is a change to every file
that declares it. A codegen check that asserts all declarations of a given name
are identical would cost an hour and close this permanently.

**4 · Two spellings of the small spring.** `700/46/0.5` (seven files),
`760/46/0.5` (floating-label), `720/46/0.5` (toast), `700/44/0.5` (tooltip).
The differences are almost certainly not perceptible. Pick 700/46/0.5 and
delete the other three, or write down why each is different.

**5 · Duplicate icon geometry.** The Phosphor check mark is drawn from scratch
in `wizard-steps`, `reading-progress`, `swipe-deck`, `load-more`,
`loading-button`, `password-strength`, `dropdown`, `sortable-table` and
`inline-validation`, at five different stroke widths on three different
viewBoxes. They should be one path per grid.

**6 · The "nothing here" states inside components.** `filter-grid`,
`sortable-table`, `dropdown` and `swipe-deck` each draw their own empty
message with their own type size. They should agree on one two-line copy
structure.
