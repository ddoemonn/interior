"use client";

import { useRef, useState } from "react";
import { Lightbox } from "@/components/interior/lightbox";

const PHOTO = "/demo/river-valley.jpg";

export function LightboxDemo() {
  const [open, setOpen] = useState(false);
  const originRef = useRef<HTMLElement | null>(null);

  return (
    <div className="grid w-full place-items-center">
      <figure className="w-full max-w-[300px]">
        <button
          type="button"
          aria-label="Open River valley"
          onClick={(e) => {
            originRef.current = e.currentTarget;
            setOpen(true);
          }}
          className="group block w-full cursor-zoom-in overflow-hidden rounded-[9px] outline-none focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-2 focus-visible:outline-[#4568FF]"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={PHOTO}
            alt="River winding through a mountain valley"
            width={1280}
            height={800}
            draggable={false}
            className="block w-full transition-transform duration-200 ease-out group-hover:scale-[1.02]"
          />
        </button>
        <figcaption className="mt-1.5 flex items-baseline justify-between">
          <span className="text-[11.5px] text-neutral-600 dark:text-neutral-300">
            River valley
          </span>
          <span className="font-mono text-[9.5px] tabular-nums text-neutral-500 dark:text-neutral-400">
            1280 × 800
          </span>
        </figcaption>
      </figure>

      <Lightbox
        open={open}
        onClose={() => setOpen(false)}
        originRef={originRef}
        src={PHOTO}
        alt="River winding through a mountain valley"
        caption="River valley"
        width={1280}
        height={800}
      />
    </div>
  );
}
