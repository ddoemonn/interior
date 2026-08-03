import fs from "node:fs/promises";
import path from "node:path";
import { getCategoryOf, type Entry } from "@/lib/registry";
import { SITE } from "@/lib/site";

export const REGISTRY_SCHEMA = "https://ui.shadcn.com/schema/registry.json";
export const ITEM_SCHEMA = "https://ui.shadcn.com/schema/registry-item.json";

export function registryItemMeta(entry: Entry) {
  const category = getCategoryOf(entry.slug);
  return {
    name: entry.slug,
    type: "registry:ui" as const,
    title: entry.name,
    description: `${entry.blurb}.`,
    dependencies: ["motion"],
    ...(category ? { categories: [category.name.toLowerCase()] } : {}),
    docs: `${SITE}/docs/${entry.slug}`,
    files: [
      {
        path: `registry/interior/${entry.slug}.tsx`,
        type: "registry:ui" as const,
        target: `components/interior/${entry.slug}.tsx`,
      },
    ],
  };
}

export async function buildRegistryItem(entry: Entry) {
  const source = await fs.readFile(
    path.join(process.cwd(), "components/interior", `${entry.slug}.tsx`),
    "utf8",
  );
  const meta = registryItemMeta(entry);
  return {
    $schema: ITEM_SCHEMA,
    ...meta,
    files: [{ ...meta.files[0], content: source }],
  };
}
