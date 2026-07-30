
export function Logo({ size = 14 }: { size?: number }) {
  return (
    <span
      className="inline-block whitespace-nowrap tracking-[-0.02em]"
      style={{ fontSize: size }}
    >
      <span className="font-semibold text-ink">interior</span>
      <span
        className="mx-[2.5px] font-semibold tracking-[0.04em]"
        style={{ color: "var(--accent)" }}
      >
        [.]
      </span>
      <span className="font-medium text-ink-3">dev</span>
    </span>
  );
}
