import { randomBytes } from "node:crypto";
import { baseUrl, resendApiKey, emailSender, EPotpisError } from "./config";
import { createContractPdf, interpolate, sha256, signContractPdf } from "./pdf";
import { loadEPotpisTemplate } from "@/lib/epotpis/templates";
import { getEPotpisTexts } from "@/lib/epotpis/texts";
import { commitRecords, deleteRecord, digest, eventWrite, getRecord, listRecords, newRecord, recordId, retryConflict, setting, writeRecord, type Write } from "./store";
import type { AdminContract, ContractInput, ContractRow, ContractSnapshot, PublicContract, SignAnchor, Signature } from "./types";
import { ownerDisplayName } from "./types";
import { emailDashes, emailHtml } from "./email";
import { splitSignatureAnchor } from "./signature-geometry";
import { signingUrl } from "./routes";
import { contractPdfFilename } from "./filename";
import { CONTRACT_LINK_LIFETIME_MS, contractLinkExpiresAt } from "./link-expiry";

// "preview" is retained only to display archived messages that were never sent.
export interface OutboxRow { id: string; contractId: string; kind: string; recipient: string; subject: string; body: string; html?: string; attachment: boolean; status: "pending" | "preview" | "sending" | "delivered" | "failed" | "cancelled"; attemptedAt: string | null; leaseAt: string | null; providerId: string | null }
export async function contractById(id: string): Promise<ContractRow> {
  const doc = await getRecord<ContractRow>(recordId("contract", id));
  if (!doc || doc.data.status === "deleted") throw new EPotpisError("invalidDescription", 404);
  return doc.data;
}
export async function contractByToken(token: string) {
  if (!/^[a-f0-9]{64}$/.test(token)) throw new EPotpisError("invalidDescription", 404);
  const index = await getRecord<{ contractId: string }>(recordId("token", sha256(token)));
  if (!index) throw new EPotpisError("invalidDescription", 404);
  const row = await contractById(index.data.contractId); checkActive(row); return row;
}
function checkActive(row: ContractRow) {
  if (!["sent", "signed"].includes(row.status)) throw new EPotpisError("invalidDescription", 404);
  const expiresAt = contractLinkExpiresAt(row, JSON.parse(row.snapshot) as ContractSnapshot);
  if (!expiresAt || Date.now() >= Date.parse(expiresAt)) throw new EPotpisError("invalidDescription", 410);
}
export function publicContract(row: ContractRow): PublicContract {
  if (row.status === "deleted") throw new EPotpisError("invalidDescription", 404);
  const snapshot = JSON.parse(row.snapshot) as ContractSnapshot; const input = snapshot.input;
  return { ownerName: ownerDisplayName(input), propertyAddress: input.propertyAddress, kind: input.kind, consumer: input.consumer,
    signers: [input.signerName, ...(input.coOwner ? [input.coOwner.signerName] : [])],
    status: row.status === "preparing" ? "failed" : row.status === "sent" && Date.parse(snapshot.expiresAt) <= Date.now() ? "expired" : row.status,
    documentHash: row.document_hash || "", signedAt: row.signed_at };
}
export async function listOutbox() { return (await listRecords<OutboxRow>("outbox")).map(doc => doc.data); }
export async function adminContract(row: ContractRow, outbox?: OutboxRow[]): Promise<AdminContract> {
  const snapshot = JSON.parse(row.snapshot) as ContractSnapshot;
  const messages = (outbox ?? await listOutbox()).filter(m => m.contractId === row.id && m.status !== "cancelled");
  const status = messages.some(m => m.status === "failed") ? "failed" : messages.some(m => m.status === "pending" || m.status === "sending") ? "pending" : messages.length && messages.every(m => m.status === "preview") ? "preview" : messages.length ? "delivered" : "pending";
  return { ...publicContract(row), id: row.id, createdAt: snapshot.createdAt, signUrl: signingUrl(baseUrl(), snapshot.token), emailStatus: status };
}
export async function listContracts() {
  const [docs, outbox] = await Promise.all([listRecords<ContractRow>("contract"), listOutbox()]);
  return Promise.all(docs.sort((a,b) => (JSON.parse(b.data.snapshot) as ContractSnapshot).createdAt.localeCompare((JSON.parse(a.data.snapshot) as ContractSnapshot).createdAt)).map(doc => adminContract(doc.data, outbox)));
}
export async function brokerSignature(): Promise<Signature> {
  const stored = await setting("broker_signature"); if (!stored) throw new EPotpisError("signatureRequired"); return JSON.parse(stored);
}
function checkEmailConfig() {
  emailSender();
  if (!resendApiKey() || !process.env.EPOTPIS_EMAIL_FROM || !process.env.EPOTPIS_RECIPIENT_EMAIL) throw new EPotpisError("notConfigured", 503);
}
export async function previewContract(input: ContractInput) {
  const [template, signature] = await Promise.all([loadEPotpisTemplate(input.kind), brokerSignature()]);
  return createContractPdf(input, template, signature);
}
export async function createContract(input: ContractInput, requestKey: string) {
  if (!/^[a-f0-9-]{36}$/.test(requestKey)) throw new EPotpisError("validationError");
  checkEmailConfig(); baseUrl();
  const requestHash = sha256(JSON.stringify(input)), id = digest(requestKey).slice(0, 32), contractId = recordId("contract", id);
  const existing = await getRecord<ContractRow>(contractId);
  if (existing) {
    if (existing.data.request_hash !== requestHash || existing.data.status === "failed" || existing.data.status === "deleted") throw new EPotpisError("conflict", 409);
    if (existing.data.status !== "preparing") return adminContract(existing.data);
  }
  const [template, cms, broker] = await Promise.all([loadEPotpisTemplate(input.kind), getEPotpisTexts("hr"), brokerSignature()]);
  // These legacy metadata fields remain readable; they never reserve or assign a number.
  const year = Number(input.date.slice(0, 4));
  const token = randomBytes(32).toString("hex");
  const reserved = await retryConflict(async () => {
    const repeated = await getRecord<ContractRow>(contractId); if (repeated) return repeated.data;
    const snapshot: ContractSnapshot = { input, token, createdAt: new Date().toISOString(), expiresAt: new Date(Date.now() + CONTRACT_LINK_LIFETIME_MS).toISOString(), template, cms: cms.app, brokerSignature: broker };
    const row: ContractRow = { id, year, sequence: 0, request_hash: requestHash, status: "preparing", snapshot: JSON.stringify(snapshot), pdf: null, final_pdf: null, document_hash: null, final_hash: null, anchor: null, signed_at: null };
    await commitRecords([
      newRecord(contractId, "contract", row, ownerDisplayName(input)),
      newRecord(recordId("token", sha256(token)), "token", { contractId: id }),
      eventWrite(id, "contract_created", { templateVersion: template.version, sourceSha256: template.sourceSha256 }),
    ]); return row;
  });
  if (reserved.request_hash !== requestHash || reserved.status === "deleted") throw new EPotpisError("conflict", 409);
  const snapshot = JSON.parse(reserved.snapshot) as ContractSnapshot;
  if (!["preparing", "failed"].includes(reserved.status)) return adminContract(reserved);
  try {
    const result = await createContractPdf(snapshot.input, snapshot.template, snapshot.brokerSignature);
    await retryConflict(async () => {
      const doc = await getRecord<ContractRow>(contractId); if (!doc) throw new EPotpisError("error", 500);
      if (doc.data.status !== "preparing") return;
      const row: ContractRow = { ...doc.data, status: "sent", pdf: Buffer.from(result.bytes).toString("base64"), anchor: JSON.stringify(result.anchor), document_hash: sha256(result.bytes) };
      await commitRecords([writeRecord(doc, row), eventWrite(id, "sent", { documentHash: row.document_hash, expiresAt: snapshot.expiresAt }), enqueue(id, snapshot, "invitation")]);
    });
  } catch (error) {
    if (error instanceof EPotpisError && error.status === 400) await retryConflict(async () => {
      const doc = await getRecord<ContractRow>(contractId);
      if (doc?.data.status === "preparing") await commitRecords([writeRecord(doc, { ...doc.data, status: "failed" }), eventWrite(id, "generation_failed", {})]);
    }); throw error;
  }
  await dispatchEmails(id).catch(() => undefined); return adminContract(await contractById(id));
}
export async function signContract(token: string, signature: Signature | Signature[], hash: string, consent: boolean, consumerConsent: boolean) {
  const row = await contractByToken(token); if (row.status === "signed") return publicContract(row);
  const snapshot = JSON.parse(row.snapshot) as ContractSnapshot;
  if (!consent || (snapshot.input.consumer && !consumerConsent)) throw new EPotpisError("consentRequired");
  if (hash !== row.document_hash || !row.pdf || !row.anchor) throw new EPotpisError("conflict", 409);
  const signedAt = new Date().toISOString();
  const anchor = JSON.parse(row.anchor) as SignAnchor;
  const count = snapshot.input.coOwner ? 2 : 1;
  if (Array.isArray(signature) && signature.length !== count) throw new EPotpisError("signatureRequired");
  // Older sent PDFs retain their bytes and placement. Split only their existing signing box.
  const placement = Array.isArray(signature) && !anchor.slots ? splitSignatureAnchor(anchor, count) : anchor;
  const signed = await signContractPdf(Buffer.from(row.pdf,"base64"), placement, signature, signedAt, snapshot.cms);
  await retryConflict(async () => {
    const doc = await getRecord<ContractRow>(recordId("contract", row.id)); if (!doc) throw new EPotpisError("invalidDescription", 404);
    checkActive(doc.data); if (doc.data.status === "signed") return;
    if (doc.data.document_hash !== hash) throw new EPotpisError("conflict", 409);
    await commitRecords([
      writeRecord(doc, { ...doc.data, status: "signed", final_pdf: Buffer.from(signed).toString("base64"), final_hash: sha256(signed), signed_at: signedAt }),
      eventWrite(row.id, "signed", { signedAt, documentHash: hash, finalHash: sha256(signed), ...(Array.isArray(signature) ? { signatures: signature } : { signature }), consent, consumerConsent: snapshot.input.consumer ? consumerConsent : false, consentText: snapshot.cms.consent, consumerConsentText: snapshot.input.consumer ? snapshot.cms.consumerConsent : null }),
      enqueue(row.id, snapshot, "owner_signed", signedAt), enqueue(row.id, snapshot, "broker_signed", signedAt),
    ]);
  });
  await dispatchEmails(row.id).catch(() => undefined); return publicContract(await contractById(row.id));
}
export async function revokeContract(id: string) {
  await retryConflict(async () => {
    const doc = await getRecord<ContractRow>(recordId("contract", id)); if (!doc || doc.data.status !== "sent") throw new EPotpisError("conflict", 409);
    const invitation = await getRecord<OutboxRow>(recordId("outbox", `${id}-invitation`));
    const writes: Write[] = [writeRecord(doc, { ...doc.data, status: "revoked" }), eventWrite(id, "revoked", {})];
    if (invitation && ["pending","failed"].includes(invitation.data.status)) writes.push(writeRecord(invitation, { ...invitation.data, status: "cancelled" }));
    await commitRecords(writes);
  });
}
export async function deleteContract(id: string, confirmation: unknown) {
  const { app } = await getEPotpisTexts("hr");
  if (!app.deleteContractConfirmationPlaceholder || confirmation !== app.deleteContractConfirmationPlaceholder) throw new EPotpisError("deleteContractConfirmationError");
  await retryConflict(async () => {
    const doc = await getRecord<ContractRow>(recordId("contract", id));
    if (!doc) throw new EPotpisError("invalidDescription", 404);
    if (doc.data.status === "deleted") return;
    const snapshot = JSON.parse(doc.data.snapshot) as ContractSnapshot;
    const [token, outbox, events] = await Promise.all([
      getRecord(recordId("token", sha256(snapshot.token))),
      listRecords<OutboxRow>("outbox"),
      listRecords<{ contractId: string }>("event"),
    ]);
    const messages = outbox.filter(message => message.data.contractId === id);
    if (messages.some(message => message.data.status === "sending" && message.data.leaseAt && Date.now() - Date.parse(message.data.leaseAt) < 60000)) throw new EPotpisError("deletionBusy", 409);
    // Keep the ID so a delayed/retried create cannot revive the contract.
    // Remove all contract content, PDF bytes, signatures and personal data from the record.
    const deleted: ContractRow = { id, year: doc.data.year, sequence: doc.data.sequence, status: "deleted", snapshot: "", request_hash: "", pdf: null, final_pdf: null, document_hash: null, final_hash: null, anchor: null, signed_at: null };
    await commitRecords([
      { mode: "update", id: doc._id, revision: doc._rev, kind: "deletedContract", label: "Obrisan ugovor", data: deleted },
      ...(token ? [deleteRecord(token)] : []),
      ...messages.map(deleteRecord),
      ...events.filter(event => event.data.contractId === id).map(deleteRecord),
    ]);
  });
}
function enqueue(id: string, snapshot: ContractSnapshot, kind: "invitation" | "owner_signed" | "broker_signed", signedAt = "") {
  // New notifications use current wording; PDF and consent snapshots stay immutable.
  const c = getEPotpisTexts("hr").app;
  const values = { name: ownerDisplayName(snapshot.input), link: signingUrl(baseUrl(), snapshot.token), signedAt: signedAt ? new Date(signedAt).toLocaleString("hr-HR", { timeZone: "Europe/Zagreb" }) : "" };
  const subject = kind === "invitation" ? c.invitationSubject : kind === "owner_signed" ? c.signedSubject : c.brokerSignedSubject;
  const body = kind === "invitation" ? c.invitationBody : kind === "owner_signed" ? c.signedBody : c.brokerSignedBody;
  const recipient = kind === "broker_signed" ? process.env.EPOTPIS_RECIPIENT_EMAIL || "" : snapshot.input.email;
  const renderedSubject = emailDashes(interpolate(subject, values));
  const renderedBody = emailDashes(interpolate(body, values));
  const action = { url: values.link, label: (kind === "invitation" ? c.emailSignButton : c.emailSignedButton) || c.viewDocument, fallbackText: c.emailLinkFallback || c.viewDocument };
  const message: OutboxRow = { id: `${id}-${kind}`, contractId: id, kind, recipient, subject: renderedSubject, body: renderedBody, html: emailHtml(c.brand, renderedSubject, renderedBody, action), attachment: kind !== "invitation", status: "pending", attemptedAt: null, leaseAt: null, providerId: null };
  return newRecord(recordId("outbox", message.id), "outbox", message, message.subject);
}
export async function dispatchEmails(id: string) {
  checkEmailConfig();
  const messages = (await listOutbox()).filter(m => m.contractId === id && ["pending","failed","sending"].includes(m.status));
  await Promise.all(messages.map(async original => {
    const message = await retryConflict(async () => {
      const doc = await getRecord<OutboxRow>(recordId("outbox",original.id)); if (!doc || !["pending","failed","sending"].includes(doc.data.status)) return null;
      const data = doc.data;
      if (data.attemptedAt && Date.now() - Date.parse(data.attemptedAt) > 23 * 3600000) return null;
      if (data.status === "sending" && data.leaseAt && Date.now() - Date.parse(data.leaseAt) < 60000) return null;
      const claimed: OutboxRow = { ...data, status:"sending", attemptedAt:data.attemptedAt || new Date().toISOString(), leaseAt:new Date().toISOString() };
      await commitRecords([writeRecord(doc,claimed)]); return claimed;
    });
    if (!message) return;
    let status: OutboxRow["status"] = "failed", providerId: string | null = null;
    try {
      const row = await contractById(id);
      const snapshot = JSON.parse(row.snapshot) as ContractSnapshot;
      if (message.kind === "invitation" && !["sent","signed"].includes(row.status)) status = "cancelled";
      else {
        const response = await fetch("https://api.resend.com/emails", { method:"POST", signal:AbortSignal.timeout(10000), headers:{ Authorization:`Bearer ${resendApiKey()}`, "Content-Type":"application/json", "Idempotency-Key":message.id }, body:JSON.stringify({ from:emailSender(), to:[message.recipient], subject:message.subject, text:message.body, ...(message.html ? { html:message.html } : {}), ...(message.attachment ? { attachments:[{ filename:contractPdfFilename(snapshot.input, true), content:row.final_pdf }] } : {}) }) });
        if (!response.ok) throw new Error("delivery_failed");
        const data = await response.json() as { id:string }; providerId = data.id; status = "delivered";
      }
    } catch { status = "failed"; }
    await retryConflict(async () => {
      const doc = await getRecord<OutboxRow>(recordId("outbox",message.id));
      if (doc && doc.data.leaseAt === message.leaseAt) await commitRecords([writeRecord(doc,{ ...doc.data,status,providerId }), eventWrite(id,status === "delivered" ? "email_accepted" : "email_failed",{ kind:message.kind,providerId })]);
    });
  }));
}
