"use client";

import { useRef, useState } from "react";
import { Lightbox } from "@/components/interior/lightbox";

const plate = (label: string, tone: string) =>
  `data:image/svg+xml;utf8,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="440"><rect width="640" height="440" fill="${tone}"/><g fill="none" stroke="#1B1B19" stroke-opacity="0.45" stroke-width="2"><rect x="34" y="34" width="572" height="372"/><path d="M34 262h236M270 262v144M406 34v228M406 132h200M150 34v96M34 130h116"/></g><g fill="#1B1B19" fill-opacity="0.66" font-family="ui-monospace, monospace" font-size="6.5"><text x="44" y="26">${label} · scale 1:50 · sheet 09.5</text><text x="44" y="122">utility 1.80 x 2.05 m</text><text x="282" y="282">bedroom 3.40 x 4.15 m</text><text x="418" y="152">terrace 6.02 x 2.24 m</text><text x="44" y="424">plotted at 100 percent — verify all dimensions on site</text></g></svg>`,
  )}`;

const SHEETS = [
  { id: "a", label: "Ground floor", src: plate("Ground floor", "#FFFFFF") },
  { id: "b", label: "Mezzanine", src: plate("Mezzanine", "#F6F6F4") },
  { id: "c", label: "Roof deck", src: plate("Roof deck", "#EFEEEA") },
];

export function LightboxDemo() {
  const [sheet, setSheet] = useState(SHEETS[0]);
  const [open, setOpen] = useState(false);
  const originRef = useRef<HTMLElement | null>(null);

  return (
    <div className="mx-auto w-full max-w-[440px]">
      <div className="grid grid-cols-3 gap-2">
        {SHEETS.map((s) => (
          <button
            key={s.id}
            type="button"
            aria-label={`Open ${s.label}`}
            onClick={(e) => {
              originRef.current = e.currentTarget;
              setSheet(s);
              setOpen(true);
            }}
            style={{ backgroundImage: `url("${s.src}")` }}
            className="mat-well aspect-[640/440] overflow-hidden rounded-[9px] border border-hairline bg-cover bg-center"
          />
        ))}
      </div>

      <Lightbox
        open={open}
        onClose={() => setOpen(false)}
        originRef={originRef}
        src={sheet.src}
        alt={`${sheet.label} floor plan`}
        caption={`${sheet.label} · 1:50`}
        width={640}
        height={440}
      />
    </div>
  );
}
