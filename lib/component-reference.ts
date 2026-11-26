import fs from "node:fs/promises";
import path from "node:path";
import { getCategoryOf, type Entry } from "@/lib/registry";
import { GITHUB, SITE } from "@/lib/site";

export async function componentReference(entry: Entry) {
  const source = await fs.readFile(
    path.join(process.cwd(), "components/interior", `${entry.slug}.tsx`),
    "utf8",
  );
  const category = getCategoryOf(entry.slug);
  const props = entry.props?.map((prop) => [
    `- \`${prop.name}\` (\`${prop.type}\`)${prop.default ? ` — default: \`${prop.default}\`` : ""}`,
    `  ${prop.note}`,
  ].join("\n")).join("\n") ?? "";

  return [
    `## ${entry.name} — ${category?.name ?? "Components"}`,
    "",
    `${entry.blurb}.`,
    "",
    `Docs: ${SITE}/docs/${entry.slug}`,
    `Reference: ${SITE}/reference/${entry.slug}`,
    `License: ${GITHUB}/blob/main/LICENSE (MIT)`,
    "",
    "### Install",
    "",
    "Requires a React project. Install `motion`; the styled example uses Tailwind CSS utilities. The source file is copied into your project.",
    "",
    `\`bunx shadcn@latest add @interior/${entry.slug}\``,
    "",
    "Or run `bun add motion` and copy the source below.",
    "",
    "### Usage",
    "",
    "```tsx",
    entry.usage ?? "",
    "```",
    "",
    "### Props",
    "",
    props,
    "",
    "### Behavior notes",
    "",
    entry.notes?.map((note) => `- ${note}`).join("\n") ?? "",
    "",
    `### Source (\`${entry.src}\`)`,
    "",
    "```tsx",
    source.trimEnd(),
    "```",
    "",
  ].join("\n");
}
