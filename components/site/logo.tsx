import { Mark } from "./mark";

export function Logo({ size = 14 }: { size?: number }) {
  return (
    <span
      className="inline-flex items-center whitespace-nowrap text-ink"
      style={{ fontSize: size, gap: size * 0.45 }}
    >
      <Mark size={size * 1.4} />
      <span className="font-semibold tracking-[-0.035em]">
        interior<span className="font-medium text-ink-3">.dev</span>
      </span>
    </span>
  );
}
