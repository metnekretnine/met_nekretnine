import { generatePriceListCsv } from "@/lib/price-list/csv";
import { getPriceListSnapshotByFileName } from "@/lib/price-list/store";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ filename: string }> },
): Promise<Response> {
  const { filename } = await params;
  const snapshot = await getPriceListSnapshotByFileName(filename);

  if (!snapshot) {
    return new Response(null, { status: 404 });
  }

  // Each file name belongs to one immutable version.
  return new Response(generatePriceListCsv(snapshot), {
    headers: {
      "Cache-Control": "public, max-age=31536000, immutable",
      "Content-Disposition": `attachment; filename="${snapshot.fileName}"`,
      "Content-Type": "text/csv; charset=utf-8",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
