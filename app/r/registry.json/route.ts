import { readyEntries } from "@/lib/registry";
import { registryItemMeta, REGISTRY_SCHEMA } from "@/lib/shadcn-registry";
import { SITE } from "@/lib/site";

export const dynamic = "force-static";

export function GET() {
  return Response.json({
    $schema: REGISTRY_SCHEMA,
    name: "interior",
    homepage: SITE,
    items: readyEntries.map(registryItemMeta),
  });
}
