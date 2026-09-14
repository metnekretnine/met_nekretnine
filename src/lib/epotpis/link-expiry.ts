import type { ContractRow, ContractSnapshot } from "./types";

export const CONTRACT_LINK_LIFETIME_MS = 30 * 24 * 60 * 60 * 1000;

/** Public access expires independently of document retention and administrator access. */
export function contractLinkExpiresAt(row: Pick<ContractRow, "status" | "signed_at">, snapshot: Pick<ContractSnapshot, "expiresAt">): string | null {
  const timestamp = row.status === "signed"
    ? Date.parse(row.signed_at || "") + CONTRACT_LINK_LIFETIME_MS
    : Date.parse(snapshot.expiresAt);
  const expiry = new Date(timestamp);
  return Number.isFinite(expiry.getTime()) ? expiry.toISOString() : null;
}
