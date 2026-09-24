// Previous price list versions must stay publicly available for at least
// 30 days after they are replaced (NN 101/2026-1213).
const MIN_RETENTION_MS = 30 * 24 * 60 * 60 * 1000;

export interface PriceListVersionTimelineItem {
  _id: string;
  publishedAt: string;
}

export type VersionDeleteBlock = "current" | "retention" | null;

// Why a version cannot be deleted yet, or null when deletion is allowed.
// `timeline` is ordered newest first; a version is replaced when the next
// newer one was published.
export function getVersionDeleteBlock(
  timeline: PriceListVersionTimelineItem[],
  documentId: string,
  now = Date.now(),
): VersionDeleteBlock {
  const index = timeline.findIndex((version) => version._id === documentId);

  if (index === -1) return null;
  if (index === 0) return "current";

  const replacedAt = new Date(timeline[index - 1].publishedAt).getTime();
  return now - replacedAt < MIN_RETENTION_MS ? "retention" : null;
}
