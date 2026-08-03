import fs from "node:fs/promises";
import path from "node:path";
import { categories } from "@/lib/registry";
import { DESCRIPTION, GITHUB, SITE } from "@/lib/site";

export const dynamic = "force-static";

export async function GET() {
  const ready = categories.flatMap((category) =>
    category.entries
      .filter((entry) => entry.status === "ready" && entry.src)
      .map((entry) => ({ category, entry })),
  );

  const chunks = await Promise.all(
    ready.map(async ({ category, entry }) => {
      const source = await fs.readFile(
        path.join(process.cwd(), "components/interior", `${entry.slug}.tsx`),
        "utf8",
      );
      const notes = entry.notes?.length
        ? `\nGuarantees:\n${entry.notes.map((note) => `- ${note}`).join("\n")}\n`
        : "";
      const usage = entry.usage
        ? `\n### Usage\n\n\`\`\`tsx\n${entry.usage}\n\`\`\`\n`
        : "";
      return [
        `## ${entry.name} — ${category.name}`,
        "",
        `${entry.blurb}.`,
        "",
        `Docs: ${SITE}/docs/${entry.slug}`,
        `Install: \`bun add motion\`, then copy the source below into \`components/interior/${entry.slug}.tsx\`.`,
        notes,
        usage,
        `### Source (\`${entry.src}\`)`,
        "",
        "```tsx",
        source.trimEnd(),
        "```",
      ].join("\n");
    }),
  );

  const body = [
    "# interior.dev — full component reference",
    "",
    `> ${DESCRIPTION} A copy-paste library of React micro-interactions: every component below is one self-contained file whose only dependency is motion, shipped as a headless hook plus a styled example.`,
    "",
    `Source code: ${GITHUB}`,
    "",
    chunks.join("\n\n---\n\n"),
    "",
  ].join("\n");

  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
