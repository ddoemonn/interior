import { categories } from "@/lib/registry";
import { SEO_DESCRIPTION, GITHUB, SITE } from "@/lib/site";

export const dynamic = "force-static";

export function GET() {
  const sections = categories
    .map((category) => {
      const rows = category.entries
        .filter((entry) => entry.status === "ready")
        .map(
          (entry) =>
            `- [${entry.name}](${SITE}/docs/${entry.slug}): ${entry.blurb}. [Plain-text reference](${SITE}/reference/${entry.slug})`,
        )
        .join("\n");
      return rows ? `## ${category.name}\n\n${rows}` : null;
    })
    .filter(Boolean)
    .join("\n\n");

  const body = [
    "# interior.dev",
    "",
    `> ${SEO_DESCRIPTION} Components are self-contained files. Most expose a headless hook alongside a styled example; Progress Bar and Segmented Control currently export the component only. React is required, Motion is the additional runtime dependency, and the styled examples use Tailwind CSS.`,
    "",
    `- Source code: ${GITHUB}`,
    `- Full documentation with component source: ${SITE}/llms-full.txt`,
    `- Install for any component: \`bun add motion\`, then copy the file from its docs page`,
    `- shadcn registry: \`bunx shadcn@latest add @interior/<name>\` — catalog at ${SITE}/r/registry.json`,
    "",
    sections,
    "",
  ].join("\n");

  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
