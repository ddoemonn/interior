"use client";

import { CollapsibleBanner } from "@/components/interior/collapsible-banner";

export function CollapsibleBannerDemo() {
  return (
    <div className="mx-auto w-full max-w-[420px] space-y-2">
      <CollapsibleBanner
        dismissible={false}
        title="Payments are degraded"
        description="Charges are queued and settle automatically once the provider recovers. Nothing is lost."
      />

      <CollapsibleBanner
        title="Storage is nearly full"
        description="This workspace is using 94% of its 10 GB."
        action={
          <button
            type="button"
            className="h-7 rounded-[7px] bg-gradient-to-b from-[#5878ff] to-[#4568ff] px-2.5 text-[11.5px] font-medium text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.38),0_0_0_1px_#3655dc,0_2px_3px_rgba(42,68,184,0.16)] outline-none transition-[filter] duration-150 hover:brightness-105 focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-2 focus-visible:outline-[#4568FF] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.3),0_0_0_1px_#3655dc,0_2px_3px_rgba(0,0,0,0.25)]"
          >
            Upgrade plan
          </button>
        }
      />
    </div>
  );
}
