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
            className="h-7 rounded-[7px] bg-[#4568FF] px-2.5 text-[11.5px] font-medium text-white shadow-[0_0_0_1px_#3655dc,0_1px_2px_rgba(42,68,184,0.16)] outline-none transition-[filter] duration-150 hover:brightness-105 focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-2 focus-visible:outline-[#4568FF] dark:shadow-[0_1px_2px_rgba(0,0,0,0.25)]"
          >
            Upgrade plan
          </button>
        }
      />
    </div>
  );
}
