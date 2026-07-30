import { ImageResponse } from "next/og";

export const alt = "interior.dev";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const BEZEL = "#141312";
const PANEL = "#1D1D1A";
const HAIRLINE = "rgba(255,255,255,0.06)";
const CELL_OFF = "rgba(243,243,239,0.09)";
const CELL_ON = "#93B0FF";

const COLS = 10;
const ROWS = 8;
const LIT_COL = 3;
const LIT_ROW = 4;

const CELL = 22;
const GAP = 9;
const RADIUS = 6;

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: BEZEL,
          padding: 44,
        }}
      >
        <div
          style={{
            display: "flex",
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
            background: PANEL,
            border: `1px solid ${HAIRLINE}`,
            borderRadius: 30,
          }}
        >
          <div style={{ display: "flex", gap: GAP }}>
            {Array.from({ length: COLS }, (_col, col) => (
              <div key={col} style={{ display: "flex", flexDirection: "column", gap: GAP }}>
                {Array.from({ length: ROWS }, (_row, row) => (
                  <div
                    key={row}
                    style={{
                      width: CELL,
                      height: CELL,
                      borderRadius: RADIUS,
                      background:
                        col === LIT_COL && row === LIT_ROW ? CELL_ON : CELL_OFF,
                    }}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
    size,
  );
}
