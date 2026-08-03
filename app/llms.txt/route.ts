import { categories } from "@/lib/registry";
import { DESCRIPTION, GITHUB, SITE } from "@/lib/site";

export const dynamic = "force-static";

export function GET() {
  const sections = categories
    .map((category) => {
      const rows = category.entries
        .filter((entry) => entry.status === "ready")
        .map(
          (entry) =>
            `- [${entry.name}](${SITE}/docs/${entry.slug}): ${entry.blurb}`,
        )
        .join("\n");
      return rows ? `## ${category.name}\n\n${rows}` : null;
    })
    .filter(Boolean)
    .join("\n\n");

  const body = [
    "# interior.dev",
    "",
    `> ${DESCRIPTION} A copy-paste library of React micro-interactions: every component is one self-contained file whose only dependency is motion, shipped as a headless hook plus a styled example. No package to install — the file is copied into your codebase and is yours after that.`,
    "",
    `- Source code: ${GITHUB}`,
    `- Full documentation with component source: ${SITE}/llms-full.txt`,
    `- Install for any component: \`bun add motion\`, then copy the file from its docs page`,
    "",
    sections,
    "",
  ].join("\n");

  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
