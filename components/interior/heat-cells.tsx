"use client";

import { useCallback, useEffect, useId, useMemo, useState, type KeyboardEvent } from "react";
import { useReducedMotion } from "motion/react";

const ROWS = 7;
const WAVE = 14;

export type HeatDay = { label: string; value: number };

export type UseHeatCellsOptions = {
  data: HeatDay[];
  levels?: number;
};

export type HeatCellsState = {
  cells: Array<HeatDay & { level: number; column: number; row: number; index: number }>;
  columns: number;
  active: number | null;
  total: number;
  peak: number;
  setActive: (index: number | null) => void;
  grid: {
    tabIndex: number;
    onKeyDown: (event: KeyboardEvent<HTMLElement>) => void;
    onBlur: () => void;
    onPointerLeave: () => void;
  };
};

export function useHeatCells({ data, levels = 4 }: UseHeatCellsOptions): HeatCellsState {
  const [active, setActive] = useState<number | null>(null);
  const count = data.length;
  const peak = data.reduce((m, d) => Math.max(m, d.value), 0);
  const total = data.reduce((sum, d) => sum + d.value, 0);

  const cells = useMemo(
    () =>
      data.map((day, index) => ({
        ...day,
        index,
        column: Math.floor(index / ROWS),
        row: index % ROWS,
        level: day.value <= 0 || peak <= 0 ? 0 : Math.max(1, Math.ceil((day.value / peak) * levels)),
      })),
    [data, levels, peak],
  );

  useEffect(() => {
    setActive((current) => (current !== null && current >= count ? null : current));
  }, [count]);

  const onKeyDown = useCallback(
    (event: KeyboardEvent<HTMLElement>) => {
      if (count === 0) return;
      const at = active ?? count - 1;
      const move: Record<string, number> = {
        ArrowUp: -1,
        ArrowDown: 1,
        ArrowLeft: -ROWS,
        ArrowRight: ROWS,
      };
      if (event.key === "Escape") {
        setActive(null);
        return;
      }
      const next =
        event.key === "Home" ? 0 : event.key === "End" ? count - 1 : at + (move[event.key] ?? NaN);
      if (Number.isNaN(next)) return;
      event.preventDefault();
      setActive(Math.min(count - 1, Math.max(0, next)));
    },
    [active, count],
  );

  return {
    cells,
    columns: Math.ceil(count / ROWS),
    active,
    total,
    peak,
    setActive,
    grid: {
      tabIndex: 0,
      onKeyDown,
      onBlur: () => setActive(null),
      onPointerLeave: () => setActive(null),
    },
  };
}

export type HeatTone = "green" | "blue" | "violet" | "orange" | "pink";

const TONE: Record<HeatTone, string> = {
  green: "[--heat:#06B457] dark:[--heat:#2FE582]",
  blue: "[--heat:#0F6FFF] dark:[--heat:#2E8BFF]",
  violet: "[--heat:#7A3DFF] dark:[--heat:#9B6BFF]",
  orange: "[--heat:#FF5A12] dark:[--heat:#FF7A2B]",
  pink: "[--heat:#F02D92] dark:[--heat:#FF4BAB]",
};

const SHADE = [0, 0.26, 0.48, 0.72, 1, 1, 1, 1];

export type HeatCellsProps = UseHeatCellsOptions & {
  label: string;
  unit?: string;
  tone?: HeatTone;
  className?: string;
};

export function HeatCells({
  data,
  levels = 4,
  label,
  unit = "",
  tone = "green",
  className = "",
}: HeatCellsProps) {
  const reduced = useReducedMotion();
  const id = useId();
  const { cells, columns, active, total, setActive, grid } = useHeatCells({ data, levels });
  const [arrived, setArrived] = useState(false);

  useEffect(() => {
    setArrived(true);
  }, []);

  const day = active !== null ? cells[active] : null;
  const scale = SHADE.map((_, i) => (i === 0 ? 0 : Math.min(1, i / levels)));

  return (
    <div className={`inline-block ${TONE[tone]} ${className}`}>
      <div className="mb-2 flex items-baseline justify-between gap-6">
        <span className="text-[12.5px] text-neutral-500 dark:text-neutral-400">
          {day ? day.label : label}
        </span>
        <span className="text-[12.5px] tabular-nums text-neutral-500 dark:text-neutral-400">
          <span className="font-medium text-neutral-900 dark:text-neutral-100">
            {(day ? day.value : total).toLocaleString("en-US")}
          </span>
          {unit ? ` ${unit}` : ""}
        </span>
      </div>

      <div
        role="grid"
        aria-label={label}
        aria-activedescendant={day ? `${id}-${day.index}` : undefined}
        tabIndex={0}
        onKeyDown={grid.onKeyDown}
        onBlur={grid.onBlur}
        onPointerLeave={grid.onPointerLeave}
        className="grid grid-flow-col gap-[3px] rounded-[10px] bg-neutral-100 p-2 shadow-[inset_0_1px_2px_rgba(0,0,0,0.09),inset_0_0_0_1px_rgba(0,0,0,0.07),0_1px_0_rgba(255,255,255,0.95)] outline-none focus-visible:shadow-[0_0_0_2px_#0F6FFF] dark:bg-[#121211] dark:shadow-[inset_0_1px_2px_rgba(0,0,0,0.6),inset_0_0_0_1px_rgba(0,0,0,0.5),0_1px_0_rgba(255,255,255,0.055)] dark:focus-visible:shadow-[0_0_0_2px_#2E8BFF]"
        style={{
          gridTemplateRows: `repeat(${ROWS}, 11px)`,
          gridTemplateColumns: `repeat(${columns}, 11px)`,
        }}
      >
        {cells.map((cell) => {
          const on = cell.index === active;
          const near =
            day && !on && Math.abs(cell.column - day.column) <= 1 && Math.abs(cell.row - day.row) <= 1;
          return (
            <span
              key={cell.index}
              id={`${id}-${cell.index}`}
              role="gridcell"
              aria-label={`${cell.label}: ${cell.value}${unit ? ` ${unit}` : ""}`}
              aria-selected={on}
              onPointerEnter={() => setActive(cell.index)}
              className={`relative block rounded-[3px] bg-neutral-900/[0.07] transition-[transform,opacity,box-shadow] duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] dark:bg-white/[0.07] ${
                on ? "shadow-[0_0_0_1.5px_#171717] dark:shadow-[0_0_0_1.5px_#f5f5f5]" : ""
              }`}
              style={{
                opacity: arrived ? 1 : 0,
                transform: !arrived ? "scale(0.4)" : on ? "scale(1.28)" : near ? "scale(1.1)" : "scale(1)",
                transitionDelay:
                  reduced || on || active !== null ? "0ms" : `${(cell.column + cell.row) * WAVE}ms`,
              }}
            >
              <span
                aria-hidden
                className="absolute inset-0 rounded-[3px] bg-[var(--heat)]"
                style={{ opacity: scale[cell.level] ?? 1 }}
              />
            </span>
          );
        })}
      </div>

      <div className="mt-2 flex items-center justify-end gap-1.5 text-[11px] text-neutral-400 dark:text-neutral-500">
        <span>Less</span>
        {Array.from({ length: levels + 1 }, (_, i) => (
          <span
            key={i}
            aria-hidden
            className="relative block size-[9px] rounded-[2px] bg-neutral-900/[0.07] dark:bg-white/[0.07]"
          >
            <span
              className="absolute inset-0 rounded-[2px] bg-[var(--heat)]"
              style={{ opacity: scale[i] }}
            />
          </span>
        ))}
        <span>More</span>
      </div>
    </div>
  );
}
