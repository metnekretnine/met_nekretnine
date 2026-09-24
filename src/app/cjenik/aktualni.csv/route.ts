import { ensurePriceListArchived } from "@/lib/price-list/archive";
import { getCurrentPriceListFileName } from "@/lib/price-list/store";

export const dynamic = "force-dynamic";

// Stable address for automated retrieval; redirects to the current file.
export async function GET(request: Request): Promise<Response> {
  await ensurePriceListArchived();
  const fileName = await getCurrentPriceListFileName();

  if (!fileName) {
    return new Response(null, { status: 404 });
  }

  return new Response(null, {
    status: 307,
    headers: {
      "Cache-Control": "no-store",
      Location: new URL(
        `/cjenik/datoteke/${encodeURIComponent(fileName)}`,
        request.url,
      ).toString(),
    },
  });
}
