import { useId } from "react";

/* The drawing is one luminance mask over a single fill, so the whole mark takes the text colour and still has depth:
   the front face is full strength, the faces and edges behind it fade as they recede, and the room inside is seen through the front face. */
const DRAWING =
  '<defs><linearGradient id="IDt" gradientUnits="userSpaceOnUse" x1="0" y1="38" x2="0" y2="12"><stop stop-color="#5c5c5c"/><stop offset="1" stop-color="#121212"/></linearGradient><linearGradient id="IDr" gradientUnits="userSpaceOnUse" x1="62" y1="0" x2="88" y2="0"><stop stop-color="#333333"/><stop offset="1" stop-color="#0d0d0d"/></linearGradient><linearGradient id="IDl" gradientUnits="userSpaceOnUse" x1="8" y1="0" x2="34" y2="0"><stop stop-color="#808080"/><stop offset="1" stop-color="#1a1a1a"/></linearGradient><linearGradient id="IDw" gradientUnits="userSpaceOnUse" x1="0" y1="38" x2="0" y2="66"><stop stop-color="#212121"/><stop offset="1" stop-color="#0d0d0d"/></linearGradient><linearGradient id="IDf" gradientUnits="userSpaceOnUse" x1="0" y1="92" x2="0" y2="66"><stop stop-color="#333333"/><stop offset="1" stop-color="#0a0a0a"/></linearGradient><linearGradient id="IDb" gradientUnits="userSpaceOnUse" x1="0" y1="92" x2="0" y2="66"><stop stop-color="#f2f2f2"/><stop offset="1" stop-color="#383838"/></linearGradient><linearGradient id="IDd" gradientUnits="userSpaceOnUse" x1="14" y1="82" x2="84" y2="18"><stop stop-color="#fff"/><stop offset="1" stop-color="#6b6b6b"/></linearGradient><clipPath id="IDh"><path d="M13.27 43.27L39.27 17.27A18 18 0 0 1 52 12H70A18 18 0 0 1 88 30V48A18 18 0 0 1 82.73 60.73L56.73 86.73Z"/></clipPath><linearGradient id="IDu" gradientUnits="userSpaceOnUse" x1="0" y1="92" x2="0" y2="66"><stop stop-color="#fff"/><stop offset="1" stop-color="#4c4c4c"/></linearGradient><clipPath id="IDk"><rect x="13.25" y="43.25" width="43.5" height="43.5" rx="12.75"/></clipPath><mask id="IDm" maskUnits="userSpaceOnUse" x="0" y="0" width="100" height="100"><rect width="100" height="100" fill="#000"/><g clip-path="url(#IDh)"><path d="M8 38H62L88 12H34Z" fill="url(#IDt)"/><path d="M62 38L88 12V66L62 92Z" fill="url(#IDr)"/></g><g clip-path="url(#IDk)"><rect x="34" y="38" width="28" height="28" fill="url(#IDw)"/><path d="M8 38L34 12V66L8 92Z" fill="url(#IDl)"/><path d="M8 92H62L88 66H34Z" fill="url(#IDf)"/><path d="M10.85 92L14.15 92L39.08 66L37.92 66ZM19.85 92L23.15 92L48.08 66L46.92 66ZM37.85 92L41.15 92L66.08 66L64.92 66ZM46.85 92L50.15 92L75.08 66L73.92 66ZM55.85 92L59.15 92L84.08 66L82.92 66Z" fill="url(#IDb)"/><path d="M34 12V66H88M8 92L34 66" stroke="#808080" stroke-width="0.8"/></g><path d="M12.77 43.77L39.27 17.27A18 18 0 0 1 52 12H70A18 18 0 0 1 88 30V48A18 18 0 0 1 82.73 60.73L56.23 87.23M56.23 43.77L82.73 17.27" stroke="url(#IDd)" stroke-width="10.5" stroke-linejoin="round"/><path d="M26 38H44A18 18 0 0 1 62 56V74A18 18 0 0 1 44 92H26A18 18 0 0 1 8 74V56A18 18 0 0 1 26 38Z" stroke="#fff" stroke-width="10.5"/></mask><mask id="IDn" maskUnits="userSpaceOnUse" x="0" y="0" width="100" height="100"><rect width="100" height="100" fill="url(#IDu)"/></mask></defs><rect width="100" height="100" fill="currentColor" mask="url(#IDm)"/><g clip-path="url(#IDk)"><path d="M28.85 92L32.15 92L57.08 66L55.92 66Z" style="fill:var(--accent)" mask="url(#IDn)"/></g>';

/** The interior mark: a cube you look into. A solid front face, sides that fade into the depth, and inside it a floor of boards running to the back wall, one of them in the accent colour. */
export function Mark({ size = 16, className }: { size?: number; className?: string }) {
  const id = useId().replace(/[^a-zA-Z0-9]/g, "");
  return (
    <svg
      aria-hidden
      className={className}
      width={size}
      height={size}
      viewBox="2 2 96 96"
      fill="none"
      dangerouslySetInnerHTML={{ __html: DRAWING.replaceAll("ID", `m${id}`) }}
    />
  );
}

const ECHO = Array.from({ length: 18 }, (_, i) => {
  const step = i + 2;
  return {
    shift: step * 4.2,
    opacity: Math.round(Math.pow(1 - step / 20, 1.5) * 0.62 * 1000) / 1000,
    blue: step >= 6 && step <= 10,
  };
});

/* the cube is partly see-through, so the echo behind it is blocked out with the page colour in the shape of the cube first */
const SOLID = Array.from({ length: 14 }, (_, i) => (i / 13) * 26);

/** The mark with its depth drawn out: behind the cube, the outline of its far face repeats into the distance and thins out, a few of the repeats in the accent colour. For large, decorative use. */
export function MarkEcho({ size = 600, className }: { size?: number; className?: string }) {
  const id = useId().replace(/[^a-zA-Z0-9]/g, "");
  return (
    <svg aria-hidden className={className} width={size} height={size} viewBox="0 -80 180 180" fill="none">
      {ECHO.map((echo) => (
        <rect
          key={echo.shift}
          x={34 + echo.shift}
          y={12 - echo.shift}
          width="54"
          height="54"
          rx="18"
          strokeWidth={echo.blue ? 1.5 : 1.1}
          opacity={echo.opacity * (echo.blue ? 1.5 : 1)}
          style={{ stroke: echo.blue ? "var(--accent)" : "currentColor" }}
        />
      ))}
      {SOLID.map((shift) => (
        <rect key={shift} x={2.75 + shift} y={32.75 - shift} width="64.5" height="64.5" rx="23.25" style={{ fill: "var(--page)" }} />
      ))}
      <g dangerouslySetInnerHTML={{ __html: DRAWING.replaceAll("ID", `e${id}`) }} />
    </svg>
  );
}
