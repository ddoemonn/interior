const COLS = 10;
const ROWS = 8;

const LIT_COL = 3;
const LIT_ROW = 4;

export function BrandMark() {
  return (
    <div
      className="grid w-fit grid-flow-col gap-[2px]"
      style={{ gridTemplateRows: `repeat(${ROWS}, 5px)` }}
      aria-hidden
    >
      {Array.from({ length: COLS }, (_col, col) =>
        Array.from({ length: ROWS }, (_row, row) => (
          <span
            key={`${col}-${row}`}
            className="block size-[5px] rounded-[1.5px]"
            style={{
              background:
                col === LIT_COL && row === LIT_ROW
                  ? "var(--accent)"
                  : "color-mix(in oklab, var(--ink) 11%, transparent)",
            }}
          />
        )),
      )}
    </div>
  );
}
