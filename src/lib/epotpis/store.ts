import { createClient } from "@sanity/client";
import type { SanityClient } from "@sanity/client";
import { createHash, randomUUID } from "node:crypto";
import { EPotpisError } from "./config";

export interface RecordDoc<T> { _id: string; _rev: string; kind: string; label: string; data: T }
interface WireDoc { _id: string; _rev: string; _type: string; kind: string; label: string; payload: string }
export type Write = { mode: "create" | "update"; id: string; kind: string; label: string; data: unknown; revision?: string } | { mode: "delete"; id: string; revision: string };
// Keep an existing namespace when integrating a previously deployed installation.
export function namespace() {
  const value = process.env.EPOTPIS_STORAGE_NAMESPACE || "epotpis";
  if (!/^[a-zA-Z][a-zA-Z0-9_-]*$/.test(value)) throw new EPotpisError("notConfigured", 503);
  return value;
}
export const recordId = (kind: string, key: string) => `${namespace()}.${kind}.${key}`;
export const digest = (value: string) => createHash("sha256").update(value).digest("hex");
function validateId(id: string) {
  if (!id.startsWith(`${namespace()}.`) || !/^[a-zA-Z0-9._-]{1,128}$/.test(id) || id.includes("..")) throw new EPotpisError("validationError");
}
let configured: SanityClient | undefined;
export function storeClient() {
  if (configured) return configured;
  const testUrl = process.env.EPOTPIS_SANITY_TEST_URL;
  if (testUrl && (process.env.NODE_ENV !== "development" || !/^http:\/\/127\.0\.0\.1:\d+$/.test(testUrl))) throw new EPotpisError("notConfigured", 503);
  const token = testUrl ? "local-test-token" : process.env.SANITY_API_WRITE_TOKEN;
  if (!token) throw new EPotpisError("notConfigured", 503);
  configured = createClient({ projectId: testUrl ? "epotpistest" : process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!, dataset: testUrl ? "test" : process.env.NEXT_PUBLIC_SANITY_DATASET!, token, apiVersion: "2026-09-01", useCdn: false, perspective: "raw", maxRetries: 0, timeout: 15000,
    ...(testUrl ? { apiHost: testUrl, useProjectHostname: false } : {}) });
  return configured;
}
function unpack<T>(doc: WireDoc): RecordDoc<T> { return { _id: doc._id, _rev: doc._rev, kind: doc.kind, label: doc.label, data: JSON.parse(doc.payload) as T }; }
export async function getRecord<T>(id: string): Promise<RecordDoc<T> | null> {
  validateId(id);
  const doc = await storeClient().getDocument<WireDoc>(id);
  return doc ? unpack<T>(doc) : null;
}
export async function listRecords<T>(kind: string): Promise<RecordDoc<T>[]> {
  const docs = await storeClient().fetch<WireDoc[]>('*[_type == "ePotpisRecord" && _id in path($scope) && kind == $kind]', { scope: `${namespace()}.**`, kind }, { cache: "no-store" });
  return docs.map(doc => unpack<T>(doc));
}
export const writeRecord = <T>(doc: RecordDoc<T>, data: T, label = doc.label): Write => ({ mode: "update", id: doc._id, revision: doc._rev, kind: doc.kind, label, data });
export const newRecord = (id: string, kind: string, data: unknown, label = kind): Write => ({ mode: "create", id, kind, label, data });
export const deleteRecord = (doc: RecordDoc<unknown>): Write => ({ mode: "delete", id: doc._id, revision: doc._rev });
export function isConflict(error: unknown) { return Boolean(error && typeof error === "object" && "statusCode" in error && error.statusCode === 409); }
export async function commitRecords(writes: Write[]) {
  if (!writes.length) return;
  const tx = storeClient().transaction();
  for (const write of writes) {
    validateId(write.id);
    if (write.mode === "delete") {
      // Guard deletion against a concurrent update in the same atomic transaction.
      tx.patch(write.id, patch => patch.ifRevisionId(write.revision).set({ payload: "" }));
      tx.delete(write.id);
      continue;
    }
    const fields = { kind: write.kind, label: write.label, payload: JSON.stringify(write.data) };
    // Bounded well below Sanity's document limit, including embedded PDF bytes.
    if (Buffer.byteLength(fields.payload, "utf8") > 4_000_000) throw new EPotpisError("validationError", 413);
    if (write.mode === "create") tx.create({ _id: write.id, _type: "ePotpisRecord", ...fields });
    else {
      if (!write.revision) throw new EPotpisError("conflict", 409);
      tx.patch(write.id, patch => patch.ifRevisionId(write.revision!).set(fields));
    }
  }
  await tx.commit({ visibility: "sync" });
}
export async function retryConflict<T>(action: () => Promise<T>): Promise<T> {
  for (let attempt = 0; attempt < 8; attempt++) {
    try { return await action(); } catch (error) {
      if (!isConflict(error)) throw error;
      if (attempt === 7) throw new EPotpisError("conflict", 409);
      await new Promise(resolve => setTimeout(resolve, 40 + attempt * 35 + Math.random() * 50));
    }
  }
  throw new EPotpisError("conflict", 409);
}
export async function setting(key: string) { return (await getRecord<{ value: string }>(recordId("setting", key)))?.data.value ?? null; }
export async function setSetting(key: string, value: string) {
  await retryConflict(async () => {
    const id = recordId("setting", key); const doc = await getRecord<{ value: string }>(id);
    await commitRecords([doc ? writeRecord(doc, { value }) : newRecord(id, "setting", { value }, key)]);
  });
}
export async function deleteSetting(key: string) {
  await retryConflict(async () => {
    const doc = await getRecord(recordId("setting", key));
    if (doc) await commitRecords([deleteRecord(doc)]);
  });
}
export function eventWrite(contractId: string, type: string, detail: unknown): Write {
  return newRecord(recordId("event", randomUUID()), "event", { contractId, at: new Date().toISOString(), type, detail }, type);
}
export async function eventsFor(contractId: string) {
  return (await listRecords<{ contractId: string; at: string; type: string; detail: unknown }>("event")).map(doc => doc.data).filter(event => event.contractId === contractId).sort((a,b) => a.at.localeCompare(b.at));
}
export async function rateLimit(key: string, limit: number, windowMs: number) {
  const result = await retryConflict(async () => {
    // Fixed bucket count keeps the number of Sanity rate-limit documents bounded.
    const bucket = Number.parseInt(digest(key).slice(0, 4), 16) % 128;
    // Different policies must never share counters or expiration windows.
    const id = recordId("rate", `${limit}-${windowMs}-${bucket}`);
    const current = await getRecord<{ count: number; resetAt: number }>(id);
    const data = current && current.data.resetAt > Date.now() ? { ...current.data, count: current.data.count + 1 } : { count: 1, resetAt: Date.now() + windowMs };
    await commitRecords([current ? writeRecord(current, data) : newRecord(id, "rate", data)]);
    return data.count;
  });
  if (result > limit) throw new EPotpisError("rateLimited", 429);
}
