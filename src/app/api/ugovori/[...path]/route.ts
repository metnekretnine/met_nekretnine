import { isolatedAuthTest } from "@/lib/epotpis/auth-config";
import { NextResponse } from "next/server";
import { login, logout, requireAdmin, requireSameOrigin } from "@/lib/epotpis/auth";
import { EPotpisError } from "@/lib/epotpis/config";
import { deleteSetting, eventsFor, rateLimit, setSetting, setting } from "@/lib/epotpis/store";
import { decodeSignaturePng } from "@/lib/epotpis/pdf";
import { adminContract, brokerSignature, contractById, contractByToken, createContract, deleteContract, dispatchEmails, listContracts, listOutbox, previewContract, publicContract, revokeContract, signContract } from "@/lib/epotpis/service";
import { jsonBody, validateContract, validateSignature, validateSigningSignatures } from "@/lib/epotpis/validation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const privateHeaders = { "Cache-Control": "private, no-store, max-age=0", "Referrer-Policy": "no-referrer", "X-Robots-Tag": "noindex, nofollow, noarchive", "X-Content-Type-Options": "nosniff" };
function json(data: unknown, status = 200) { return NextResponse.json(data, { status, headers: privateHeaders }); }
function pdf(bytes: Uint8Array | string | null, download: boolean) {
  if (!bytes) throw new EPotpisError("invalidDescription", 404);
  return new Response(new Uint8Array(typeof bytes === "string" ? Buffer.from(bytes, "base64") : bytes), { headers: { ...privateHeaders, "Content-Type": "application/pdf", "Content-Disposition": `${download ? "attachment" : "inline"}; filename="MET-ugovor.pdf"` } });
}
function failure(error: unknown) {
  if (error instanceof EPotpisError) return json({ error: error.code }, error.status);
  // Do not log tokens, personal data, signed document bytes or provider credentials.
  console.error("ePotpis request failed:", error instanceof Error ? error.name : "UnknownError");
  if (process.env.NODE_ENV === "development" && error instanceof Error) console.error(error.stack?.split("\n").slice(1).join("\n"));
  return json({ error: "error" }, 500);
}
type Context = { params: Promise<{ path: string[] }> };
export async function GET(request: Request, context: Context) {
  try {
    const { path } = await context.params;
    const download = new URL(request.url).searchParams.get("download") === "1";
    if (path[0] === "sign" && path[1] && path.length <= 3) {
      const row = await contractByToken(path[1]);
      if (path.length === 2) return json(publicContract(row));
      if (path[2] === "pdf") return pdf(row.status === "signed" ? row.final_pdf : row.pdf, download);
    }
    await requireAdmin();
    if (path.join("/") === "contracts") return json({ contracts: await listContracts(), hasSignature: Boolean(await setting("broker_signature")) });
    if (path[0] === "contracts" && path.length === 3 && path[2] === "pdf") { const row = await contractById(path[1]); return pdf(row.status === "signed" ? row.final_pdf : row.pdf, download); }
    if (path.join("/") === "settings/signature") {
      const signature = await brokerSignature();
      if (signature.kind === "png") return new Response(new Uint8Array(decodeSignaturePng(signature)!), { headers: { ...privateHeaders, "Content-Type": "image/png" } });
      const paths = signature.paths.map(points => points.length === 1
        ? `<circle cx="${points[0][0]}" cy="${points[0][1]}" r="1.25" fill="#152c32" stroke="none"/>`
        : `<polyline points="${points.map(([x, y]) => `${x},${y}`).join(" ")}"/>`).join("");
      return new Response(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 720 240"><g fill="none" stroke="#152c32" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">${paths}</g></svg>`, { headers: { ...privateHeaders, "Content-Type": "image/svg+xml", "Content-Security-Policy": "default-src 'none'; style-src 'none'; sandbox" } });
    }
    if (path.join("/") === "outbox") return json(await listOutbox());
    if (path[0] === "contracts" && path.length === 3 && path[2] === "audit") { await contractById(path[1]); return json(await eventsFor(path[1])); }
    throw new EPotpisError("invalidDescription", 404);
  } catch (error) { return failure(error); }
}
export async function POST(request: Request, context: Context) {
  try {
    requireSameOrigin(request);
    const { path } = await context.params;
    if (path.join("/") === "session") {
      if (!isolatedAuthTest()) throw new EPotpisError("authError", 401);
      await rateLimit("login", 25, 15 * 60000);
      const body = await jsonBody(request) as { password?: unknown; logout?: boolean };
      if (body.logout === true) { await logout(); return json({ ok: true }); }
      if (typeof body.password !== "string" || body.password.length > 256) throw new EPotpisError("authError", 401);
      await login(body.password, request); return json({ ok: true });
    }
    if (path[0] === "sign" && path.length === 2) {
      await contractByToken(path[1]); await rateLimit(`sign:${path[1]}`, 12, 10 * 60000);
      const body = await jsonBody(request) as { signature?: unknown; signatures?: unknown; documentHash?: unknown; consent?: unknown; consumerConsent?: unknown };
      if (body.signature !== undefined && body.signatures !== undefined) throw new EPotpisError("validationError");
      const signature = body.signatures === undefined ? validateSignature(body.signature) : validateSigningSignatures(body.signatures);
      if (typeof body.documentHash !== "string") throw new EPotpisError("validationError");
      return json(await signContract(path[1], signature, body.documentHash, body.consent === true, body.consumerConsent === true));
    }
    await requireAdmin();
    if (path.join("/") === "settings/signature/delete") {
      const body = await jsonBody(request) as { confirmed?: unknown };
      if (body.confirmed !== true) throw new EPotpisError("validationError");
      await deleteSetting("broker_signature"); return json({ ok: true });
    }
    if (path.join("/") === "settings") {
      const body = await jsonBody(request) as { signature?: unknown };
      const signature = validateSignature(body.signature, true); decodeSignaturePng(signature);
      await setSetting("broker_signature", JSON.stringify(signature)); return json({ ok: true });
    }
    if (path.join("/") === "preview") return pdf((await previewContract(validateContract(await jsonBody(request)))).bytes, false);
    if (path.join("/") === "contracts") {
      await rateLimit("create", 30, 60000);
      return json(await createContract(validateContract(await jsonBody(request)), request.headers.get("Idempotency-Key") || ""));
    }
    if (path[0] === "contracts" && path.length === 3) {
      if (path[2] === "delete") { const body = await jsonBody(request) as { confirmation?: unknown }; await deleteContract(path[1], body.confirmation); return json({ ok: true }); }
      if (path[2] === "revoke") { await revokeContract(path[1]); return json({ ok: true }); }
      if (path[2] === "retry") { await contractById(path[1]); await dispatchEmails(path[1]); return json(await adminContract(await contractById(path[1]))); }
    }
    throw new EPotpisError("invalidDescription", 404);
  } catch (error) { return failure(error); }
}
