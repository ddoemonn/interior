"use client";

import { SnapCarousel } from "@/components/interior/snap-carousel";

const ROOMS = [
  { id: "atrium", name: "Atrium", line: "North light, all afternoon" },
  { id: "stair", name: "Stair hall", line: "Travertine, half a step out" },
  { id: "kitchen", name: "Kitchen", line: "Oak run, brass where hands land" },
  { id: "library", name: "Library", line: "Iron shelves, no plastic in reach" },
  { id: "terrace", name: "Terrace", line: "Brick, best at dusk" },
];

export function SnapCarouselDemo() {
  return (
    <div className="mx-auto w-full max-w-[440px]">
      <SnapCarousel label="Rooms" peek={48} gap={10}>
        {ROOMS.map((room, i) => (
          <figure key={room.id} className="mat-panel rounded-[11px] p-[5px]">
            <div className="mat-well relative grid h-[104px] place-items-center rounded-[9px]">
              <div className="text-center">
                <p className="text-[15px] font-medium text-ink">{room.name}</p>
                <p className="mt-1 text-[11.5px] text-ink-3">{room.line}</p>
              </div>
              <span className="absolute bottom-1.5 right-2.5 font-mono text-[9.5px] tabular-nums text-ink-3">
                {String(i + 1).padStart(2, "0")} · {String(ROOMS.length).padStart(2, "0")}
              </span>
            </div>
          </figure>
        ))}
      </SnapCarousel>
    </div>
  );
}
