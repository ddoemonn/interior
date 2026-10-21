"use client";

import { ShowMore } from "@/components/interior/show-more";

export function ShowMoreDemo() {
  return (
    <div className="mat-panel mx-auto w-full max-w-[440px] rounded-[14px] p-4">
      <ShowMore lines={3} maxHeight={168} label="Release notes">
        <p>
          The scheduler no longer re-queues a job that was cancelled while its
          retry timer was still pending, which is what caused duplicate webhooks
          on slow upstreams. Idempotency keys are now written before the first
          attempt rather than after it, so a crash between the two no longer
          produces a second delivery. Retention for delivery logs moved from
          seven days to thirty. The dashboard reads them from a partitioned
          table, so the range picker stays fast past a million rows. Two
          deprecated fields on the event payload were removed after a full
          release of warnings.
        </p>
      </ShowMore>
    </div>
  );
}
