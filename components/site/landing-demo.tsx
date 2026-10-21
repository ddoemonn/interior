"use client";

import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { animate, motion, useInView, useMotionValue, useReducedMotion, useTransform } from "motion/react";
import { Tooltip, TooltipGroup } from "@/components/interior/tooltip-group";
import { LoadingButton } from "@/components/interior/loading-button";
import { useHoldToConfirm } from "@/components/interior/hold-to-confirm";
import { LikeBurst, type LikeBurstHandle } from "@/components/interior/like-burst";
import { SegmentedControl } from "@/components/interior/segmented-control";
import { SliderDetents } from "@/components/interior/slider-detents";

const PlaybackPaused = createContext(false);

const EASE = [0.23, 1, 0.32, 1] as const;
const CROSSFADE = { type: "spring", stiffness: 260, damping: 34, mass: 0.8 } as const;
const TOOLS = [
  { label: "Bold", glyph: "B", hint: "⌘B" },
  { label: "Italic", glyph: "I", hint: "⌘I" },
  { label: "Underline", glyph: "U", hint: "⌘U" },
  { label: "Code", glyph: "{}", hint: "⌘E" },
];
const TOUR = [0, 1, 2, 3, 2, 1, -1];
const RANGES = [
  { value: "day", label: "Day" },
  { value: "week", label: "Week" },
  { value: "month", label: "Month" },
  { value: "quarter", label: "Quarter" },
];
const DETENTS = [
  { value: 0.5, label: "0.5×" },
  { value: 1, label: "Normal" },
  { value: 1.5, label: "1.5×" },
  { value: 2, label: "2×" },
];
const SPEEDS = [1, 1.5, 2, 0.5];
const NOOP = () => {};
const formatSpeed = (value: number) => `${value.toFixed(2)}×`;
export type LandingDemoSlug = "loading-button" | "hold-to-confirm" | "tooltip-group" | "slider-detents" | "segmented-control" | "like-burst";

function usePlaybackStep(playing: boolean, interval = 1800) {
  const [step, setStep] = useState(0);
  useEffect(() => {
    if (!playing) return;
    const timer = setInterval(() => setStep((value) => (value + 1) % 12), interval);
    return () => clearInterval(timer);
  }, [playing, interval]);
  return step;
}

function LoadingFilm({ playing }: { playing: boolean }) {
  const container = useRef<HTMLDivElement>(null);
  const pending = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (!playing) return;
    // Play the actual local demo action; inert only blocks real user input.
    const start = () => container.current?.querySelector("button")?.click();
    const first = setTimeout(start, 700);
    const loop = setInterval(start, 5200);
    return () => {
      clearTimeout(first);
      clearInterval(loop);
      if (pending.current) clearTimeout(pending.current);
    };
  }, [playing]);
  return (
    <div ref={container} className="flex justify-center">
      <LoadingButton
        onAction={() => new Promise<void>((resolve) => { pending.current = setTimeout(resolve, 1600); })}
        successLabel="Published"
      >Publish</LoadingButton>
    </div>
  );
}

function HoldFilm({ playing }: { playing: boolean }) {
  // The shipped hook supplies the real hold/cancel timing, without autoplay haptics.
  const { bind, phase, reset } = useHoldToConfirm({ onConfirm: NOOP, haptic: false });
  const button = useRef<HTMLButtonElement>(null);
  const swept = useMotionValue(0);
  const clipPath = useTransform(swept, (value) => `inset(0 ${(1 - value) * 100}% 0 0)`);
  const committed = phase === "committed";
  useEffect(() => {
    if (!playing) return;
    const timers: ReturnType<typeof setTimeout>[] = [];
    const key = (type: "keydown" | "keyup") => button.current?.dispatchEvent(new KeyboardEvent(type, { key: "Enter", bubbles: true }));
    const later = (fn: () => void, delay: number) => timers.push(setTimeout(fn, delay));
    const play = () => {
      reset();
      later(() => key("keydown"), 800);
      later(() => key("keyup"), 1450);
      later(() => key("keydown"), 2800);
      later(() => key("keyup"), 4800);
      later(reset, 6400);
    };
    play();
    const loop = setInterval(() => { timers.length = 0; play(); }, 7800);
    return () => { clearInterval(loop); timers.forEach(clearTimeout); };
  }, [playing, reset]);
  useEffect(() => {
    const target = phase === "holding" || committed ? 1 : 0;
    const duration = committed ? 0.12 : phase === "holding" ? 1.8 * (1 - swept.get()) : 1.8 * swept.get() / 2.5;
    const controls = animate(swept, target, { duration, ease: phase === "holding" || committed ? "linear" : EASE });
    return () => controls.stop();
  }, [phase, committed, swept]);
  const labels = (
    <span className="grid place-items-center">
      <motion.span className="col-start-1 row-start-1" initial={false} animate={{ opacity: committed ? 0 : 1 }} transition={CROSSFADE}>Hold to delete workspace</motion.span>
      <motion.span className="col-start-1 row-start-1" initial={false} animate={{ opacity: committed ? 1 : 0 }} transition={CROSSFADE}>Workspace deleted</motion.span>
    </span>
  );
  return (
    <div className="flex justify-center">
      <button ref={button} {...bind} type="button" className="relative isolate inline-grid h-10 select-none place-items-center overflow-hidden rounded-[9px] border border-stone-200 bg-white px-4 text-[13px] font-medium text-stone-700 dark:border-white/[0.16] dark:bg-[#1D1D1A] dark:text-stone-200">
        {labels}
        <motion.span style={{ clipPath }} className="absolute inset-0 grid place-items-center bg-stone-800 px-4 text-white dark:bg-stone-100 dark:text-stone-900">{labels}</motion.span>
      </button>
    </div>
  );
}

function LikeFilm({ playing }: { playing: boolean }) {
  const handle = useRef<LikeBurstHandle>(null);
  useEffect(() => {
    if (!playing) return;
    const timer = setInterval(() => handle.current?.toggle(), 1900);
    return () => clearInterval(timer);
  }, [playing]);
  return <div className="flex justify-center"><LikeBurst ref={handle} initialCount={128} /></div>;
}

function TooltipFilm({ playing }: { playing: boolean }) {
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);
  const [active, setActive] = useState(-1);
  useEffect(() => {
    if (!playing) return;
    let position = 0;
    let previous: HTMLButtonElement | null = null;
    const advance = () => {
      previous?.dispatchEvent(new PointerEvent("pointerout", { bubbles: true, pointerType: "mouse" }));
      const index = TOUR[position % TOUR.length];
      const next = buttons.current[index] ?? null;
      if (next) {
        const rect = next.getBoundingClientRect();
        next.dispatchEvent(new PointerEvent("pointerover", {
          bubbles: true, pointerType: "mouse", clientX: rect.left + rect.width / 2,
        }));
      }
      previous = next;
      setActive(index);
      position += 1;
    };
    let loop: ReturnType<typeof setInterval> | undefined;
    const start = setTimeout(() => {
      advance();
      loop = setInterval(advance, 1200);
    }, 700);
    return () => { clearTimeout(start); clearInterval(loop); };
  }, [playing]);
  return (
    <div className="flex justify-center">
      <TooltipGroup className="flex items-center gap-1">
        {TOOLS.map((tool, index) => (
          <Tooltip key={tool.label} side="top" label={<span className="flex items-center gap-2">{tool.label}<span className="font-mono text-[9.5px] opacity-60">{tool.hint}</span></span>}>
            <button ref={(node) => { buttons.current[index] = node; }} type="button" aria-label={tool.label} className={`mat-cap flex size-9 items-center justify-center rounded-[7px] text-[12.5px] transition-colors duration-150 ${active === index ? "bg-sub text-ink" : "text-ink-3"}`}>
              <span className={index === 0 ? "font-semibold" : index === 1 ? "italic" : index === 2 ? "underline underline-offset-2" : "font-mono"}>{tool.glyph}</span>
            </button>
          </Tooltip>
        ))}
      </TooltipGroup>
    </div>
  );
}

function SelectionFilm({ slug, playing }: { slug: LandingDemoSlug; playing: boolean }) {
  const step = usePlaybackStep(playing);
  if (slug === "segmented-control") {
    return <div className="flex justify-center"><SegmentedControl label="Report range" options={RANGES} value={RANGES[step % RANGES.length].value} onValueChange={NOOP} /></div>;
  }
  if (slug === "slider-detents") {
    return <SliderDetents label="Playback speed" value={SPEEDS[step % SPEEDS.length]} onValueChange={NOOP} min={0.25} max={2} step={0.05} haptic={false} detents={DETENTS} format={formatSpeed} />;
  }
  return null;
}

export function LandingDemo({ name, slug }: { name: string; slug: LandingDemoSlug }) {
  const paused = useContext(PlaybackPaused);
  const frame = useRef<HTMLDivElement>(null);
  const visible = useInView(frame, { amount: 0.35 });
  const reduced = useReducedMotion();
  const [pageVisible, setPageVisible] = useState(true);
  useEffect(() => {
    const update = () => setPageVisible(!document.hidden);
    update();
    document.addEventListener("visibilitychange", update);
    return () => document.removeEventListener("visibilitychange", update);
  }, []);
  const playing = visible && pageVisible && reduced === false && !paused;
  return (
    <div ref={frame} role="img" aria-label={`${name} preview. Interactive example available in the documentation.`} className="@container mat-well relative flex h-[224px] items-center rounded-[11px] px-5 sm:h-[240px] sm:px-6">
      <div key={playing ? "playing" : "still"} inert aria-hidden="true" className="pointer-events-none w-full min-w-0 select-none">
        {slug === "loading-button" ? <LoadingFilm playing={playing} /> : slug === "hold-to-confirm" ? <HoldFilm playing={playing} /> : slug === "like-burst" ? <LikeFilm playing={playing} /> : slug === "tooltip-group" ? <TooltipFilm playing={playing} /> : <SelectionFilm slug={slug} playing={playing} />}
      </div>
    </div>
  );
}

export function LandingShowcase({ children }: { children: ReactNode }) {
  const [paused, setPaused] = useState(false);
  const [mounted, setMounted] = useState(false);
  const reduced = useReducedMotion();
  useEffect(() => setMounted(true), []);
  return (
    <PlaybackPaused.Provider value={paused}>
      {children}
      <div className="mt-3 flex h-11 justify-end">
        {mounted && reduced === false ? (
          <button type="button" onClick={() => setPaused((value) => !value)} className="inline-flex min-h-11 items-center gap-2 rounded-[6px] text-[11.5px] text-ink-3 hover:text-ink">
            <svg aria-hidden="true" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d={paused ? "m8 5 11 7-11 7V5Z" : "M8 5v14M16 5v14"} />
            </svg>
            {paused ? "Play previews" : "Pause previews"}
          </button>
        ) : null}
      </div>
    </PlaybackPaused.Provider>
  );
}
