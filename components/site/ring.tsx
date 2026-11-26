const round = (value: number) => Math.round(value * 100) / 100;

type Stroke = { d: string; opacity: number; blue: boolean };

/* One ring of lens-shaped strokes. Each stroke points at the centre; how bright and how wide it is depends on where the light is. */
function layer(count: number, radius: number, length: number, width: number, light: number, gain: number, phase: number): Stroke[] {
  return Array.from({ length: count }, (_, i) => {
    const angle = ((i + phase) / count) * Math.PI * 2;
    const facing = Math.max(0, Math.cos(angle - light));
    const lit = 0.07 + 0.93 * Math.pow(facing, 1.6);
    const half = (length / 2) * (0.62 + 0.38 * lit);
    const bulge = width * (0.35 + 0.65 * lit);
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    const at = (along: number, across: number) =>
      `${round(100 + (radius + along) * cos - across * sin)} ${round(100 + (radius + along) * sin + across * cos)}`;
    return {
      d: `M${at(-half, 0)}Q${at(0, bulge)} ${at(half, 0)}Q${at(0, -bulge)} ${at(-half, 0)}Z`,
      opacity: round(lit * gain),
      blue: facing > 0.55 && i % 9 < 3,
    };
  });
}

const LIGHT = (-118 * Math.PI) / 180;
const BACK = layer(64, 58, 24, 1.5, LIGHT + Math.PI * 0.86, 0.38, 0.5);
const FRONT = layer(64, 76, 40, 2.1, LIGHT, 1, 0);

/** A ring seen as a solid: a near side of long bright strokes and, through it, a far side of short dim ones. Drawn once, on the server. */
export function Ring({ size = 380, className = "" }: { size?: number; className?: string }) {
  return (
    <svg aria-hidden width={size} height={size} viewBox="0 0 200 200" className={`pointer-events-none ${className}`}>
      {BACK.map((stroke) => (
        <path key={stroke.d} d={stroke.d} fill="currentColor" opacity={stroke.opacity} />
      ))}
      {FRONT.map((stroke) => (
        <path
          key={stroke.d}
          d={stroke.d}
          opacity={stroke.opacity}
          style={{ fill: stroke.blue ? "var(--accent)" : "currentColor" }}
        />
      ))}
    </svg>
  );
}
