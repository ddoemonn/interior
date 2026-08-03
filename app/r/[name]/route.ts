import { getEntry, readyEntries } from "@/lib/registry";
import { buildRegistryItem } from "@/lib/shadcn-registry";

export const dynamic = "force-static";
export const dynamicParams = false;

export function generateStaticParams() {
  return readyEntries.map((entry) => ({ name: `${entry.slug}.json` }));
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ name: string }> },
) {
  const { name } = await params;
  if (!name.endsWith(".json")) {
    return new Response("Not found", { status: 404 });
  }
  const entry = getEntry(name.slice(0, -".json".length));
  if (!entry || entry.status !== "ready" || !entry.src) {
    return new Response("Not found", { status: 404 });
  }
  return Response.json(await buildRegistryItem(entry));
}
