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
            className="h-7 rounded-[7px] border border-black/[0.09] bg-neutral-50 px-2.5 text-[11.5px] font-medium text-neutral-900 transition-colors duration-150 hover:bg-neutral-100 dark:border-white/[0.08] dark:bg-white/[0.06] dark:text-neutral-100 dark:hover:bg-white/10"
          >
            Upgrade plan
          </button>
        }
      />
    </div>
  );
}
