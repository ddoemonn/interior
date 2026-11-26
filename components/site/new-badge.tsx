/** Marks a component added in the latest release: a small enamel pill running pink to orange. */
export function NewBadge({ className = "" }: { className?: string }) {
  return (
    <span
      className={`inline-flex h-[16px] shrink-0 items-center rounded-full px-[6px] text-[9.5px] font-semibold uppercase leading-none tracking-[0.06em] text-white ${className}`}
      style={{
        background: "linear-gradient(100deg, #f02d92, #ff5a12)",
        boxShadow:
          "inset 0 1px 0 rgba(255,255,255,0.45), inset 0 -1px 0 rgba(0,0,0,0.16), 0 0 0 1px rgba(190,30,60,0.55)",
        textShadow: "0 1px 0 rgba(120,20,40,0.35)",
      }}
    >
      New
    </span>
  );
}
