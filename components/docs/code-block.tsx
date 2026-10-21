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
    <div className="mat-panel rounded-[14px] p-[5px]">
      <div className="flex h-8 items-center justify-between pl-2.5 pr-[3px]">
        <span className="meta truncate text-ink-3">{filename ?? lang}</span>
        <CopySource code={trimmed} />
      </div>

      <CodeSurface html={html} lines={lines} />
    </div>
  );
}
