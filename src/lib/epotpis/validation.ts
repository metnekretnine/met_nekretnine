import { z } from "zod";
import { EPotpisError } from "./config";
import type { Signature } from "./types";
import { normalizeOib, oibCheck } from "./oib";
import { signatureHasInk } from "./signature-geometry";

const text = (max: number) => z.string().trim().min(1).max(max).refine(v => !/[\u0000-\u0008\u000b\u000c\u000e-\u001f\[\]]/.test(v));
const date = z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine(value => {
  const parsed = new Date(`${value}T12:00:00Z`);
  return !Number.isNaN(parsed.valueOf()) && parsed.toISOString().slice(0, 10) === value && Number(value.slice(0, 4)) >= 2020 && Number(value.slice(0, 4)) <= 2100;
});
export const contractSchema = z.object({
  contractNumber: text(40).refine(value => !/[\r\n]/.test(value)),
  coOwner: z.object({
    ownerName: text(120), oib: z.string().transform(normalizeOib).refine(oibCheck),
    ownerAddress: text(200), phone: text(40), signerName: text(120),
  }).strict().optional(),
  kind: z.enum(["open", "exclusive"]), consumer: z.boolean(), ownerName: text(120), oib: z.string().transform(normalizeOib).refine(oibCheck),
  ownerAddress: text(200), phone: text(40), email: z.email().max(200), signerName: text(120),
  propertyAddress: text(200), descriptionField: text(500), landRegistry: text(300),
  rent: z.number().finite().min(0.01).max(9999999), deposit: z.number().finite().min(0).max(9999999),
  duration: text(120), place: text(100), date,
}).strict();
export function validateContract(value: unknown) {
  const parsed = contractSchema.safeParse(value);
  if (!parsed.success) throw new EPotpisError(parsed.error.issues.some(issue => issue.path.includes("oib")) ? "oibInvalid" : parsed.error.issues.some(issue => issue.path[0] === "contractNumber") ? "contractNumberInvalid" : "validationError");
  return parsed.data;
}
export function validateSignature(value: unknown, allowPng = false): Signature {
  const signature = z.discriminatedUnion("kind", [
    z.object({ kind: z.literal("strokes"), paths: z.array(z.array(z.tuple([z.number().finite().min(0).max(720), z.number().finite().min(0).max(240)])).min(1).max(2000)).min(1).max(80) }),
    z.object({ kind: z.literal("png"), data: z.string().max(670000).regex(/^data:image\/png;base64,[A-Za-z0-9+/]+={0,2}$/) }),
  ]).safeParse(value);
  if (!signature.success) throw new EPotpisError("signatureRequired");
  if (signature.data.kind === "png") {
    if (!allowPng) throw new EPotpisError("signatureRequired");
    return signature.data;
  }
  if (!signatureHasInk(signature.data)) throw new EPotpisError("signatureRequired");
  return signature.data;
}
export function validateSigningSignatures(value: unknown): Signature[] {
  if (!Array.isArray(value) || value.length < 1 || value.length > 2) throw new EPotpisError("signatureRequired");
  return value.map(signature => validateSignature(signature));
}
export async function jsonBody(request: Request): Promise<unknown> {
  const reader = request.body?.getReader();
  if (!reader) throw new EPotpisError("validationError");
  const chunks: Uint8Array[] = []; let size = 0;
  while (true) {
    const { value, done } = await reader.read(); if (done) break;
    size += value.byteLength; if (size > 750000) { await reader.cancel(); throw new EPotpisError("validationError", 413); }
    chunks.push(value);
  }
  try { return JSON.parse(Buffer.concat(chunks).toString("utf8")); } catch { throw new EPotpisError("validationError"); }
}
