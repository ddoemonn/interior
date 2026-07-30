"use client";

import { Accordion } from "@/components/interior/accordion";

const SIZES = [
  "XS — 44cm chest, 66cm length",
  "S — 48cm chest, 68cm length",
  "M — 52cm chest, 70cm length",
  "L — 56cm chest, 72cm length",
  "XL — 60cm chest, 74cm length",
  "2XL — 64cm chest, 76cm length",
  "3XL — 68cm chest, 78cm length",
];

const items = [
  {
    id: "shipping",
    title: "Shipping",
    meta: "3 zones",
    content: (
      <p>
        Standard delivery lands in two to four working days. Orders placed before
        2pm local time leave the warehouse the same day.
      </p>
    ),
  },
  {
    id: "returns",
    title: "Returns",
    meta: "30 days",
    content: (
      <p>
        Send anything back unworn within 30 days.{" "}
        <a href="#returns" className="text-ink underline underline-offset-2">
          Read the full policy
        </a>
      </p>
    ),
  },
  {
    id: "sizing",
    title: "Sizing",

    content: (
      <ul className="space-y-1 tabular-nums">
        {SIZES.map((size) => (
          <li key={size}>{size}</li>
        ))}
      </ul>
    ),
  },
];

export function AccordionDemo() {
  return (
    <div className="mx-auto flex h-[248px] w-full max-w-[440px] items-start">
      <Accordion
        type="single"
        items={items}
        defaultOpen={["shipping"]}
        maxPanelHeight={132}
        className="w-full"
      />
    </div>
  );
}
