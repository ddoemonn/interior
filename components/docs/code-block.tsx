import { highlight, type Lang } from "@/lib/highlight";
import { CopySource } from "./copy-source";
import { CodeSurface } from "./code-surface";

export async function CodeBlock({
  code,
  lang = "tsx",
  filename,
}: {
  code: string;
  lang?: Lang;
  filename?: string;
}) {
  const trimmed = code.trimEnd();
  const html = await highlight(trimmed, lang);
  const lines = trimmed.split("\n").length;

  return (
    <div className="mat-panel rounded-[20px] p-2">
      <div className="flex h-9 items-center justify-between pb-1 pl-2.5 pr-0.5">
        <span className="truncate font-mono text-[12px] text-ink-2">{filename ?? lang}</span>
        <CopySource code={trimmed} />
      </div>

      <CodeSurface html={html} lines={lines} />
    </div>
  );
}
