import { test, expect, type APIRequestContext, type Page } from "@playwright/test";
import { randomUUID } from "node:crypto";
import { networkInterfaces } from "node:os";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { PDFDocument } from "pdf-lib";
import { oibCheck } from "../src/lib/epotpis/oib";
import { emailDashes, emailHtml } from "../src/lib/epotpis/email";
import { createContractPdf, signContractPdf } from "../src/lib/epotpis/pdf";
import { getEPotpisTexts } from "../src/lib/epotpis/texts";
import type { ContractInput, Signature } from "../src/lib/epotpis/types";
import { createClient } from "@sanity/client";

const coOwner = { ownerName: "TEST - Ana Čačić", oib: "47926577116", ownerAddress: "Druga ulica 2, Zagreb", phone: "+385 99 111 1111", signerName: "Ana Čačić" };

const origin = "http://localhost:3002";
const signature: Signature = { kind: "strokes", paths: [[[80,150],[120,80],[150,145],[180,75],[220,140],[280,100],[340,135],[410,80],[490,120],[560,90]]] };
const secondSignature: Signature = { kind: "strokes", paths: signature.paths.map(path => path.map(([x, y]) => [x, 240 - y])) };
const input: ContractInput = { contractNumber: "041/2026", kind: "open", consumer: true, ownerName: "TEST — Željko Čačić", oib: "12345678903", ownerAddress: "Testna ulica 12, Zagreb", phone: "+385 99 000 0000", email: "owner@example.test", signerName: "Željko Čačić", propertyAddress: "Testna ulica 18, Zagreb", descriptionField: "Stan 64 m², dvije sobe, balkon i spremište.", landRegistry: "k.o. Zagreb, zk. ul. 1234, k.č. 567/8", rent: 950, deposit: 1900, duration: "12 mjeseci", place: "Zagreb", date: "2026-09-09" };
const post = (request: APIRequestContext, path: string, data: unknown, headers: Record<string,string> = {}) => request.post(path, { data, headers: { Origin: origin, ...headers } });
function sanityFixture() {
  const apiHost = readFileSync(".data/epotpis-test-sanity-url.txt", "utf8");
  expect(apiHost).toMatch(/^http:\/\/127\.0\.0\.1:\d+$/);
  return createClient({ projectId: "epotpistest", dataset: "test", apiHost, useProjectHostname: false, apiVersion: "2026-09-01", token: "local-test-token", useCdn: false });
}
interface SentEmail { id: string; key: string; to: string[]; text: string; html: string; attachments?: { filename: string; content: string }[] }
async function sentEmails(request: APIRequestContext, contractId: string): Promise<SentEmail[]> {
  const url = readFileSync(".data/epotpis-test-sanity-url.txt", "utf8");
  const response = await request.get(`${url}/__emails`);
  expect(response.ok()).toBe(true);
  return (await response.json()).filter((email: SentEmail) => email.key.startsWith(`${contractId}-`));
}
test.beforeEach(async () => {
  // Keep each scenario's rate window independent without changing application limits.
  const fixture = sanityFixture();
  const rates = await fixture.fetch<{ _id: string }[]>('*[_type == "ePotpisRecord" && kind == "rate"]');
  if (rates.length) {
    const tx = fixture.transaction();
    for (const rate of rates) tx.delete(rate._id);
    await tx.commit();
  }
});
async function create(request: APIRequestContext, data = input, key = randomUUID()) {
  const response = await post(request, "/api/ugovori/contracts", data, { "Idempotency-Key": key });
  expect(response.ok(), await response.text()).toBeTruthy();
  return response.json();
}
async function draw(page: Page) {
  await page.locator(".ep-signature-box canvas").scrollIntoViewIfNeeded();
  const box = await page.locator(".ep-signature-box canvas").boundingBox();
  if (!box) throw new Error("Missing signature canvas");
  await page.mouse.move(box.x + box.width * .12, box.y + box.height * .7); await page.mouse.down();
  for (const [x,y] of [[.2,.3],[.3,.65],[.4,.3],[.5,.6],[.7,.4],[.85,.55]]) await page.mouse.move(box.x + box.width * x, box.y + box.height * y, { steps: 5 });
  await page.mouse.up();
}
async function dot(page: Page, touch = false, lower = false) {
  const canvas = page.locator(".ep-signature-box canvas");
  await canvas.scrollIntoViewIfNeeded();
  const box = await canvas.boundingBox();
  if (!box) throw new Error("Missing signature canvas");
  const x = Math.round(box.x + box.width * .92), y = Math.round(box.y + box.height * (lower ? .75 : .15));
  const position = { x: (x - box.x) * 720 / box.width, y: (y - box.y) * 240 / box.height };
  const hasInk = () => canvas.evaluate((element: HTMLCanvasElement, point) => {
    const x = point.x * element.width / 720, y = point.y * element.height / 240;
    const data = element.getContext("2d")!.getImageData(Math.floor(x) - 2, Math.floor(y) - 2, 5, 5).data;
    return data.some((value, index) => index % 4 === 3 && value > 0);
  }, position);
  expect(await hasInk()).toBe(false);
  if (touch) await page.touchscreen.tap(x, y);
  else {
    await page.mouse.move(x, y); await page.mouse.down();
    // A dot appears immediately, with no movement while the pointer is pressed.
    try { await expect.poll(hasInk).toBe(true); }
    finally { await page.mouse.up(); }
  }
  await expect.poll(hasInk).toBe(true);
}

test("signing coexists with the site and the full Studio", async ({ request }) => {
  const robots = await (await request.get("/robots.txt")).text();
  expect(robots).toContain("Disallow: /ugovori");
  expect(robots).toContain("Sitemap:");
  const manifest = await (await request.get("/manifest.webmanifest")).json();
  expect(manifest.start_url).toBe("/");
  expect((await request.get("/epotpis/pdf.worker.min.mjs")).status()).toBe(200);
  expect((await request.get("/admin/structure")).status()).toBe(200);
});

test("access, numbering, immutable PDF, consent, concurrent signatures and revocation", async ({ request }) => {
  for (const oib of ["47926577116", "12345678903"]) expect(oibCheck(oib), oib).toBe(true);
  for (const oib of ["47926577115", "12345678904", "1234567890x", "1234567890", "123456789033", "HR47926577116", "hr47926577116", "HR1234567890x", "123 45678903"]) expect(oibCheck(oib), oib).toBe(false);
  expect((await request.get("/api/ugovori/contracts")).status()).toBe(401);
  expect((await request.get("/api/ugovori/settings/numbering")).status()).toBe(401);
  expect((await post(request, "/api/ugovori/settings/numbering", { nextSequence: 41 })).status()).toBe(401);
  expect((await request.get("/api/ugovori/sign/not-a-token")).status()).toBe(404);
  expect((await request.post("/api/ugovori/session", { data: { password: "met-demo-2026" }, headers: { Origin: "https://untrusted.example" } })).status()).toBe(403);
  expect((await request.post("/api/ugovori/session", { data: { password: "met-demo-2026" }, headers: { Origin: "http://epotpis.test:3003" } })).status()).toBe(403);
  expect((await request.post("/api/ugovori/session", { data: { password: "met-demo-2026" }, headers: { Origin: "null" } })).status()).toBe(403);
  expect((await post(request, "/api/ugovori/session", { password: "wrong-password" })).status()).toBe(401);
  expect((await post(request, "/api/ugovori/session", { password: "met-demo-2026" })).ok()).toBeTruthy();
  expect((await post(request, "/api/ugovori/settings", { signature: { kind: "strokes", paths: [[[1,1],[2,2]]] } })).status()).toBe(400);
  expect((await post(request, "/api/ugovori/settings", { signature })).ok()).toBeTruthy();
  for (const path of ["/api/ugovori/preview", "/api/ugovori/contracts"]) {
    const invalid = await post(request, path, { ...input, oib: "12345678904" });
    expect(invalid.status()).toBe(400);
    expect((await invalid.json()).error).toBe("oibInvalid");
    const invalidJoint = await post(request, path, { ...input, coOwner: { ...coOwner, oib: "47926577115" } });
    expect(invalidJoint.status()).toBe(400);
    expect((await invalidJoint.json()).error).toBe("oibInvalid");
    expect((await post(request, path, { ...input, coOwner: { ownerName: "Ana" } })).status()).toBe(400);
  }
  for (const path of ["/api/ugovori/preview", "/api/ugovori/contracts"]) {
    for (const data of [{ ...input, oib: "HR12345678903" }, { ...input, coOwner: { ...coOwner, oib: "hr47926577116" } }]) {
      const invalid = await post(request, path, data);
      expect(invalid.status()).toBe(400);
      expect((await invalid.json()).error).toBe("oibInvalid");
    }
  }
  const preview = await post(request, "/api/ugovori/preview", input);
  expect(preview.ok(), await preview.text()).toBeTruthy();
  expect((await PDFDocument.load(await preview.body())).getPageCount()).toBe(3);
  expect((await (await request.get("/api/ugovori/contracts")).json()).contracts).toHaveLength(0);
  const key = randomUUID();
  const first = await create(request, input, key);
  const replay = await create(request, input, key);
  expect(replay.id).toBe(first.id);
  const concurrent = await Promise.all([create(request, { ...input, kind: "exclusive", consumer: false }), create(request), create(request)]);
  expect(new Set([first, ...concurrent].map(c => c.number))).toEqual(new Set([input.contractNumber]));
  expect(new Set([first, ...concurrent].map(c => c.id)).size).toBe(4);
  const [exclusive] = concurrent;
  const exclusivePdf = await request.get(`/api/ugovori/contracts/${exclusive.id}/pdf`);
  expect((await PDFDocument.load(await exclusivePdf.body())).getPageCount()).toBe(2);
  mkdirSync(".data/check-artifacts", { recursive: true });
  writeFileSync(".data/check-artifacts/exclusive.pdf", await exclusivePdf.body());
  const token = first.signUrl.split("/").at(-1);
  const path = `/api/ugovori/sign/${token}`;
  const before = await request.get(`${path}/pdf`);
  expect(before.headers()["cache-control"]).toContain("no-store");
  const beforeBytes = await before.body();
  expect((await post(request, path, { signature, consent: false, consumerConsent: true, documentHash: first.documentHash })).status()).toBe(400);
  expect((await post(request, path, { signature, consent: true, consumerConsent: false, documentHash: first.documentHash })).status()).toBe(400);
  expect((await post(request, path, { signature, consent: true, consumerConsent: true, documentHash: "wrong" })).status()).toBe(409);
  await post(request, "/api/ugovori/settings", { signature: { ...signature, paths: signature.paths.map(p => p.map(([x,y]) => [x + 5,y])) } });
  expect(await (await request.get(`${path}/pdf`)).body()).toEqual(beforeBytes);
  const body = { signature, consent: true, consumerConsent: true, documentHash: first.documentHash };
  const responses = await Promise.all([post(request, path, body), post(request, path, body)]);
  for (const response of responses) expect((await response.json()).status).toBe("signed");
  const final = await request.get(`${path}/pdf`); const finalBytes = await final.body();
  expect(finalBytes.equals(beforeBytes)).toBeFalsy();
  expect((await PDFDocument.load(finalBytes)).getPageCount()).toBe(3);
  await post(request, path, body);
  expect(await (await request.get(`${path}/pdf`)).body()).toEqual(finalBytes);
  const audit = await (await request.get(`/api/ugovori/contracts/${first.id}/audit`)).json();
  expect(audit.filter((e: { type: string }) => e.type === "signed")).toHaveLength(1);
  const outbox = await (await request.get("/api/ugovori/outbox")).json();
  expect(outbox.filter((e: { id: string }) => e.id.startsWith(first.id))).toHaveLength(3);
  expect(outbox.every((e: { status: string }) => e.status === "delivered")).toBeTruthy();
  const sent = await sentEmails(request, first.id);
  expect(sent).toHaveLength(3);
  expect(sent.find(email => email.key.endsWith("-invitation"))).toMatchObject({ to: [input.email], text: expect.stringContaining(first.signUrl) });
  expect(sent.find(email => email.key.endsWith("-invitation"))?.attachments).toBeUndefined();
  for (const kind of ["owner_signed", "broker_signed"]) {
    const email = sent.find(email => email.key.endsWith(`-${kind}`))!;
    expect(email.to).toEqual([kind === "owner_signed" ? input.email : "broker@example.test"]);
    expect(email.attachments).toHaveLength(1);
    expect(Buffer.from(email.attachments![0].content, "base64")).toEqual(finalBytes);
  }
  for (const email of outbox) {
    expect(email.subject).not.toMatch(/[—–]/);
    expect(email.body).not.toMatch(/[—–]/);
    expect(email.body).toContain("\n\n");
    expect(email.body).toContain("MET d.o.o.");
    expect(email.html).toContain("<br>");
    expect(email.html).toContain("<p ");
    const contractLink = email.body.match(/^http:\/\/epotpis\.test:3002\/ugovori\/potpis\/[a-f0-9]{64}$/m)?.[0];
    expect(contractLink).toBeTruthy();
    expect(email.html.split(`href="${contractLink}"`).length - 1).toBe(2);
    expect(email.html).toContain(email.kind === "invitation" ? "Pregledaj i potpiši ugovor" : "Otvori potpisani ugovor");
    expect(email.html).toContain("Ako gumb ne radi, kliknite na poveznicu ispod ili je kopirajte u preglednik:");
    expect(email.html.split('href="https://metnekretnine.hr"').length - 1).toBe(1);
    if (email.contractId === first.id) writeFileSync(`.data/check-artifacts/${email.kind}-email.html`, email.html);
  }
  const invitation = outbox.find((e: { id: string }) => e.id === `${first.id}-invitation`);
  expect(invitation.body).toContain("Maja Mara");
  expect(invitation.html).toContain(`href="${first.signUrl}"`);
  writeFileSync(".data/check-artifacts/invitation-email.html", invitation.html);
  const hostile = emailHtml("MET", "Example", emailDashes('Hello — <img src=x onerror="alert(1)">\n\nhttps://example.test/?x="&y=1'), {
    url: 'https://example.test/?x="&y=1', label: '<img src=x onerror="alert(1)">', fallbackText: 'Use <this> link & keep "quotes"',
  });
  expect(hostile).not.toContain("<img");
  expect(hostile).toContain("&lt;img");
  expect(hostile).toContain("&quot;&amp;y=1");
  expect(hostile).toContain('Use &lt;this&gt; link &amp; keep &quot;quotes&quot;');
  expect((await post(request, `/api/ugovori/contracts/${first.id}/revoke`, {})).status()).toBe(409);
  const revoked = concurrent[1];
  expect((await post(request, `/api/ugovori/contracts/${revoked.id}/revoke`, {})).ok()).toBeTruthy();
  expect((await request.get(`/api/ugovori/sign/${revoked.signUrl.split("/").at(-1)}`)).status()).toBe(404);
  const next = await create(request);
  expect(next.number).toBe(input.contractNumber);
  writeFileSync(".data/check-artifacts/open-signed.pdf", finalBytes);
});

test("HTTP network origin: desktop creation and owner signing on a mobile viewport", async ({ page, browser }) => {
  const errors: string[] = []; page.on("pageerror", e => errors.push(e.message));
  const initialLoad = Promise.withResolvers<void>();
  let holdInitialLoad = true;
  await page.route("**/api/ugovori/contracts", async route => {
    if (holdInitialLoad && route.request().method() === "GET") {
      holdInitialLoad = false;
      await initialLoad.promise;
    }
    await route.continue();
  });
  await page.goto("http://epotpis.test:3002/ugovori");
  expect(await page.evaluate(() => window.isSecureContext)).toBe(false);
  expect(await page.evaluate(() => typeof crypto.randomUUID)).toBe("undefined");
  await expect(page.getByLabel("Lozinka", { exact: true })).toHaveValue("met-demo-2026");
  await expect(page.getByText("Slanje emailova je uključeno.")).toHaveCount(0);
  await expect(page.getByText(/Demo lozinka/)).toHaveCount(0);
  await expect(page.getByText("Prijavite se za izradu i pregled ugovora.")).toHaveCount(0);
  await expect(page.locator(".ep-login-logo")).toBeVisible();
  await page.screenshot({ path: ".data/check-artifacts/login-met.png", fullPage: true });
  await page.getByRole("button", { name: "Prijavi se", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Pregled ugovora" })).toBeVisible();
  try {
    await expect(page.getByRole("link", { name: "Novi ugovor" })).toBeDisabled();
    await page.screenshot({ path: ".data/check-artifacts/admin-loader.png", fullPage: true });
  }
  finally { initialLoad.resolve(); }
  await page.getByRole("link", { name: "Novi ugovor" }).click();
  for (const [name, value] of Object.entries(input)) {
    if (["kind", "consumer"].includes(name)) continue;
    await page.locator(`[name="${name}"]`).fill(String(value));
  }
  for (const field of await page.locator(".ep-create-form input:not([type=radio]), .ep-create-form textarea").all()) expect(await field.getAttribute("placeholder")).toBeTruthy();
  await page.locator('[name="oib"]').fill("12345678904");
  await page.locator('[name="oib"]').blur();
  await expect(page.locator("#ep-oib-error")).toBeVisible();
  await page.getByRole("button", { name: "Pregledaj ugovor" }).click();
  await expect(page.locator(".ep-preview")).toHaveCount(0);
  await page.locator('[name="oib"]').fill("12345678903");
  await expect(page.locator("#ep-oib-error")).toHaveCount(0);
  await page.getByRole("button", { name: "Dodaj drugog Nalogodavca" }).click();
  await page.locator('[name="coOwner.ownerName"]').fill("Ovaj unos se uklanja");
  await page.getByRole("button", { name: "Ukloni drugog Nalogodavca" }).click();
  await expect(page.locator('[name="coOwner.ownerName"]')).toHaveCount(0);
  await expect(page.locator('[name="ownerName"]')).toHaveValue(input.ownerName);
  await page.getByRole("button", { name: "Dodaj drugog Nalogodavca" }).click();
  await expect(page.locator('[name="coOwner.ownerName"]')).toBeEmpty();
  for (const [name, value] of Object.entries(coOwner)) await page.locator(`[name="coOwner.${name}"]`).fill(value);
  await page.locator('[name="coOwner.oib"]').fill("47926577115");
  await page.locator('[name="coOwner.oib"]').blur();
  await expect(page.locator("#ep-coOwner-oib-error")).toBeVisible();
  await page.getByRole("button", { name: "Pregledaj ugovor" }).click();
  await expect(page.locator(".ep-preview")).toHaveCount(0);
  await page.locator('[name="coOwner.oib"]').fill("47926577116");
  await expect(page.locator("#ep-coOwner-oib-error")).toHaveCount(0);
  for (const name of ["oib", "coOwner.oib"]) {
    const field = page.locator(`[name="${name}"]`);
    await expect(field).toHaveAttribute("maxlength", "11");
    await expect(field).toHaveAttribute("minlength", "11");
    await expect(field).toHaveAttribute("inputmode", "numeric");
    await expect(field).toHaveAttribute("pattern", "[0-9]{11}");
    await expect(field).toHaveAttribute("placeholder", "11 znamenki");
  }
  await page.setViewportSize({ width: 390, height: 844 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: ".data/check-artifacts/create-joint-mobile.png", fullPage: true });
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.screenshot({ path: ".data/check-artifacts/create-met.png", fullPage: true });
  await page.getByRole("button", { name: "Pregledaj ugovor" }).click();
  await expect(page.getByRole("button", { name: "POŠALJI", exact: true })).toBeEnabled({ timeout: 60000 });
  await page.screenshot({ path: ".data/check-artifacts/desktop-preview.png", fullPage: true });
  await page.getByRole("button", { name: "POŠALJI", exact: true }).click();
  await expect(page.locator(".ep-share input")).toBeVisible();
  const link = await page.locator(".ep-share input").inputValue();
  expect(new URL(link).origin).toBe("http://epotpis.test:3002");
  const contracts = (await page.evaluate(async () => (await fetch("/api/ugovori/contracts")).json())).contracts;
  const joint = contracts.find((contract: { signUrl: string }) => contract.signUrl === link);
  expect(joint.ownerName).toContain(coOwner.ownerName);
  const stored = await sanityFixture().getDocument<{ payload: string }>(`epotpisDemo.contract.${joint.id}`);
  expect(JSON.parse(JSON.parse(stored!.payload).snapshot).input.coOwner).toEqual(coOwner);
  await page.screenshot({ path: ".data/check-artifacts/dashboard.png", fullPage: true });
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const owner = await context.newPage(); owner.on("pageerror", e => errors.push(e.message));
  await owner.goto(link);
  await expect(owner.locator(".ep-signature-box canvas")).toHaveAttribute("aria-disabled", "false", { timeout: 60000 });
  await expect(owner.locator(".ep-pdf-pages canvas")).toHaveCount(3);
  await expect(owner.locator("body")).toHaveJSProperty("scrollWidth", 390);
  await dot(owner, true);
  await draw(owner);
  await expect(owner.locator(".ep-signature-box canvas")).toHaveCount(1);
  await dot(owner, true, true);
  await owner.getByRole("button", { name: "Prihvati potpis", exact: true }).click();
  await expect(owner.getByRole("button", { name: "POTPIŠI", exact: true })).toBeDisabled();
  await draw(owner);
  await owner.getByRole("button", { name: "Prihvati potpis", exact: true }).click();
  await owner.getByRole("checkbox").nth(0).check(); await owner.getByRole("checkbox").nth(1).check();
  await owner.screenshot({ path: ".data/check-artifacts/mobile-sign.png", fullPage: true });
  const signingRequest = owner.waitForRequest(request => request.method() === "POST" && request.url().includes("/api/ugovori/sign/"));
  await owner.getByRole("button", { name: "POTPIŠI", exact: true }).click();
  const submitted = (await signingRequest).postDataJSON().signatures;
  expect(submitted).toHaveLength(2);
  expect(submitted[0].paths.filter((path: number[][]) => path.length === 1)).toHaveLength(2);
  await expect(owner.getByRole("heading", { name: "Ugovor je potpisan." })).toBeVisible();
  await expect(owner.getByRole("link", { name: "Preuzmi PDF" })).toBeVisible();
  const downloadUrl = await owner.getByRole("link", { name: "Preuzmi PDF" }).getAttribute("href");
  writeFileSync(".data/check-artifacts/mobile-dotted-signed.pdf", await (await owner.request.get(new URL(downloadUrl!, origin).href)).body());
  const messages = (await page.evaluate(async () => (await fetch("/api/ugovori/outbox")).json())).filter((message: { contractId: string }) => message.contractId === joint.id);
  expect(messages).toHaveLength(3);
  expect(messages.filter((message: { kind: string }) => message.kind !== "broker_signed").every((message: { recipient: string }) => message.recipient === input.email)).toBe(true);
  await owner.reload(); await expect(owner.getByRole("heading", { name: "Ugovor je potpisan." })).toBeVisible();
  await owner.screenshot({ path: ".data/check-artifacts/mobile-signed.png", fullPage: true });
  expect(errors).toEqual([]);
  await context.close();
});

test("mobile LAN access supports authenticated creation and public signing over HTTP", async ({ browser }) => {
  const address = Object.values(networkInterfaces()).flat().find(item => item && !item.internal && item.family === "IPv4" && /^(10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.)/.test(item.address))?.address;
  test.skip(!address, "No private LAN interface available");
  const lan = `http://${address}:3002`;
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  try {
    const api = context.request;
    expect((await api.get(`${lan}/api/ugovori/contracts`)).status()).toBe(401);
    expect((await api.post(`${lan}/api/ugovori/settings`, { headers: { Origin: lan }, data: { signature } })).status()).toBe(401);
    expect((await api.post(`${lan}/api/ugovori/session`, { headers: { Origin: lan }, data: { password: "met-demo-2026" } })).ok()).toBe(true);
    expect((await api.post(`${lan}/api/ugovori/settings`, { headers: { Origin: lan }, data: { signature } })).ok()).toBe(true);
    const page = await context.newPage();
    await page.goto(`${lan}/ugovori/novi`);
    expect(await page.evaluate(() => window.isSecureContext)).toBe(false);
    await page.getByRole("button", { name: "Popuni testnim podacima (2 osobe)", exact: true }).click();
    await page.getByRole("button", { name: "Pregledaj ugovor", exact: true }).click();
    const send = page.getByRole("button", { name: "POŠALJI", exact: true });
    await expect(send).toBeEnabled();
    const creation = page.waitForResponse(response => response.request().method() === "POST" && response.url() === `${lan}/api/ugovori/contracts`);
    await send.click();
    const response = await creation;
    expect(response.ok()).toBe(true);
    const contract = await response.json();
    expect(contract.emailStatus).toBe("delivered");
    await context.clearCookies();
    expect((await api.get(`${lan}/api/ugovori/contracts`)).status()).toBe(401);
    await page.goto(`${lan}${new URL(contract.signUrl).pathname}`);
    for (let person = 0; person < 2; person++) {
      await expect(page.locator(".ep-signature-box canvas")).toHaveAttribute("aria-disabled", "false");
      await draw(page);
      await page.getByRole("button", { name: "Prihvati potpis", exact: true }).click();
    }
    for (const checkbox of await page.getByRole("checkbox").all()) await checkbox.check();
    await page.getByRole("button", { name: "POTPIŠI", exact: true }).click();
    await expect(page.getByRole("heading", { name: "Ugovor je potpisan." })).toBeVisible();
    expect(await sentEmails(api, contract.id)).toHaveLength(3);
  } finally { await context.close(); }
});

test("saved signatures stay closed and every contract accepts its own manual number", async ({ page, request }) => {
  expect((await post(request, "/api/ugovori/session", { password: "met-demo-2026" })).status()).toBe(200);
  expect((await post(request, "/api/ugovori/settings", { signature })).status()).toBe(200);
  await page.goto("/ugovori");
  await page.getByRole("button", { name: "Prijavi se", exact: true }).click();
  await page.getByRole("link", { name: "Postavke", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Trenutni potpis", exact: true })).toBeVisible();
  await expect(page.locator(".ep-signature-box canvas")).toHaveCount(0);
  await page.getByRole("button", { name: "Zamijeni trenutni potpis" }).click();
  expect(await page.locator(".ep-signature-box canvas").evaluate((canvas: HTMLCanvasElement) => canvas.getContext("2d")!.getImageData(0, 0, canvas.width, canvas.height).data.some(value => value !== 0))).toBe(false);
  await dot(page);
  await draw(page);
  await dot(page, false, true);
  const signatureRequest = page.waitForRequest(request => request.method() === "POST" && request.url().endsWith("/api/ugovori/settings"));
  await page.getByRole("button", { name: "Spremi potpis", exact: true }).click();
  expect((await signatureRequest).postDataJSON().signature.paths.filter((path: number[][]) => path.length === 1)).toHaveLength(2);
  await expect(page.locator(".ep-notice")).toHaveText("Potpis posrednika je spremljen.");
  const savedSignature = await (await page.request.get("/api/ugovori/settings/signature")).text();
  expect(savedSignature.match(/<circle\b/g)).toHaveLength(2);
  await expect(page.locator(".ep-signature-box canvas")).toHaveCount(0);
  await expect(page.getByRole("heading", { name: "Vaš potpis", exact: true })).toHaveCount(0);
  const current = await page.locator(".ep-existing-signature img").getAttribute("src");
  await page.getByRole("button", { name: "Zamijeni trenutni potpis" }).click();
  expect(await page.locator(".ep-signature-box canvas").evaluate((canvas: HTMLCanvasElement) => canvas.getContext("2d")!.getImageData(0, 0, canvas.width, canvas.height).data.some(value => value !== 0))).toBe(false);
  await draw(page);
  await page.getByRole("button", { name: "Odustani", exact: true }).click();
  expect(await page.locator(".ep-existing-signature img").getAttribute("src")).toBe(current);
  await expect(page.locator(".ep-signature-box canvas")).toHaveCount(0);
  await expect(page.getByLabel("Broj sljedećeg ugovora", { exact: true })).toHaveCount(0);
  expect((await page.request.get("/api/ugovori/settings/numbering")).status()).toBe(404);
  await page.screenshot({ path: ".data/check-artifacts/settings-met.png", fullPage: true });
  for (const contractNumber of ["", " ", "x".repeat(41), "041\n2026"]) {
    for (const path of ["/api/ugovori/preview", "/api/ugovori/contracts"]) {
      const invalid = await post(page.request, path, { ...input, contractNumber });
      expect(invalid.status()).toBe(400);
      expect((await invalid.json()).error).toBe("contractNumberInvalid");
    }
  }
  const first = await create(page.request, { ...input, contractNumber: "  005/2026  " });
  expect(first.number).toBe("005/2026");
  writeFileSync(".data/check-artifacts/broker-dotted.pdf", await (await page.request.get(`/api/ugovori/contracts/${first.id}/pdf`)).body());
  const repeated = await Promise.all([create(page.request, { ...input, contractNumber: "005/2026" }), create(page.request, { ...input, contractNumber: "005/2026" })]);
  expect(repeated.map(contract => contract.number)).toEqual(["005/2026", "005/2026"]);
  expect(new Set([first, ...repeated].map(contract => contract.id)).size).toBe(3);
  expect((await create(page.request, { ...input, contractNumber: "1-A/2025" })).number).toBe("1-A/2025");
  expect(await sanityFixture().fetch('count(*[_type == "ePotpisRecord" && kind == "counter"])')).toBe(0);
  await page.locator(".ep-back").click();
  await page.getByRole("link", { name: "Novi ugovor", exact: true }).click();
  await expect(page.getByLabel("Broj ugovora", { exact: true })).toBeEmpty();
  await expect(page.getByLabel("Broj ugovora", { exact: true })).toHaveAttribute("placeholder", "Npr. 041/2026");
});

test("template and CMS edits leave sent and signed PDFs unchanged", async ({ request }) => {
  expect((await post(request, "/api/ugovori/session", { password: "met-demo-2026" })).status()).toBe(200);
  expect((await post(request, "/api/ugovori/settings", { signature })).status()).toBe(200);
  const first = await create(request);
  const signPath = `/api/ugovori/sign/${first.signUrl.split("/").at(-1)}`;
  const originalPdf = await (await request.get(`${signPath}/pdf`)).body();
  const fixture = ".data/epotpis-test-templates.json";
  const originalCms = readFileSync(fixture, "utf8");
  let finalPdf: Buffer | undefined;
  try {
    const docs = JSON.parse(originalCms);
    const page = { _type: "ePotpisPage", app: { pdfSignedAt: { hr: "" }, signedBody: { hr: "" } } };
    docs.push(page);
    page.app.pdfSignedAt.hr = "CHANGED CMS LABEL {signedAt}";
    page.app.signedBody.hr = "CHANGED EMAIL TEMPLATE";
    const template = docs.find((doc: any) => doc.kind === "open");
    template.version = "test-updated-template";
    const layout = JSON.parse(template.layoutJson);
    layout.subtitle = "IZMIJENJEN PREDLOŽAK | {number}";
    template.layoutJson = JSON.stringify(layout);
    writeFileSync(fixture, JSON.stringify(docs));
    expect(await (await request.get(`${signPath}/pdf`)).body()).toEqual(originalPdf);
    const current = await create(request);
    expect(await (await request.get(`/api/ugovori/contracts/${current.id}/pdf`)).body()).not.toEqual(originalPdf);
    const audit = await (await request.get(`/api/ugovori/contracts/${current.id}/audit`)).json();
    expect(audit.find((event: { type: string }) => event.type === "contract_created").detail.templateVersion).toBe("test-updated-template");
    const signed = await post(request, signPath, { signature, consent: true, consumerConsent: true, documentHash: first.documentHash });
    expect(signed.status()).toBe(200);
    finalPdf = await (await request.get(`${signPath}/pdf`)).body();
    expect(finalPdf.equals(originalPdf)).toBe(false);
    const outbox = await (await request.get("/api/ugovori/outbox")).json();
    const ownerEmail = outbox.find((message: { id: string }) => message.id === `${first.id}-owner_signed`);
    expect(ownerEmail.body).not.toContain("CHANGED EMAIL TEMPLATE");
    expect(ownerEmail.body).toContain("Maja Mara");
  } finally { writeFileSync(fixture, originalCms); }
  // Changing the template again after the signature also leaves the exact PDF bytes intact.
  expect(await (await request.get(`${signPath}/pdf`)).body()).toEqual(finalPdf);
  expect(await (await request.get(`/api/ugovori/contracts/${first.id}/pdf`)).body()).toEqual(finalPdf);
});

test("deletion removes contract content atomically and cannot revive old requests", async ({ request }) => {
  const confirmation = "OBRIŠI OVAJ UGOVOR";
  const signatureDelete = "/api/ugovori/settings/signature/delete";
  expect((await post(request, signatureDelete, { confirmed: true })).status()).toBe(401);
  expect((await post(request, "/api/ugovori/contracts/unknown/delete", { confirmation })).status()).toBe(401);
  expect((await post(request, "/api/ugovori/session", { password: "met-demo-2026" })).status()).toBe(200);
  expect((await post(request, "/api/ugovori/settings", { signature })).status()).toBe(200);
  const key = randomUUID();
  const sent = await create(request, input, key), signed = await create(request);
  const signPath = (contract: { signUrl: string }) => `/api/ugovori/sign/${contract.signUrl.split("/").at(-1)}`;
  const signData = (contract: { documentHash: string }) => ({ signature, documentHash: contract.documentHash, consent: true, consumerConsent: true });
  expect((await post(request, signPath(signed), signData(signed))).status()).toBe(200);
  const sentPdf = await (await request.get(`${signPath(sent)}/pdf`)).body();
  const signedPdf = await (await request.get(`${signPath(signed)}/pdf`)).body();
  for (const value of [undefined, "", "OBRISI OVAJ UGOVOR", "obriši ovaj ugovor", `${confirmation} `]) {
    expect((await post(request, `/api/ugovori/contracts/${sent.id}/delete`, { confirmation: value })).status()).toBe(400);
  }
  expect((await request.post(`/api/ugovori/contracts/${sent.id}/delete`, { data: { confirmation }, headers: { Origin: "https://untrusted.example" } })).status()).toBe(403);
  expect((await post(request, signatureDelete, {})).status()).toBe(400);
  const signatureResponses = await Promise.all([post(request, signatureDelete, { confirmed: true }), post(request, signatureDelete, { confirmed: true })]);
  for (const response of signatureResponses) expect(response.status()).toBe(200);
  expect((await (await request.get("/api/ugovori/contracts")).json()).hasSignature).toBe(false);
  expect((await request.get("/api/ugovori/settings/signature")).status()).toBe(400);
  expect(await (await request.get(`${signPath(sent)}/pdf`)).body()).toEqual(sentPdf);
  expect(await (await request.get(`${signPath(signed)}/pdf`)).body()).toEqual(signedPdf);
  expect((await post(request, "/api/ugovori/contracts", input, { "Idempotency-Key": randomUUID() })).status()).toBe(400);
  expect((await post(request, "/api/ugovori/settings", { signature })).status()).toBe(200);

  // Inspect only the isolated local Sanity fixture, never the configured CMS dataset.
  const fixture = sanityFixture();
  const outboxId = `epotpisDemo.outbox.${sent.id}-invitation`;
  const invitation = await fixture.getDocument<{ _id: string; _rev: string; payload: string }>(outboxId);
  const message = JSON.parse(invitation!.payload);
  await fixture.patch(outboxId).ifRevisionId(invitation!._rev).set({ payload: JSON.stringify({ ...message, status: "sending", leaseAt: new Date().toISOString() }) }).commit();
  const busy = await post(request, `/api/ugovori/contracts/${sent.id}/delete`, { confirmation });
  expect(busy.status()).toBe(409); expect((await busy.json()).error).toBe("deletionBusy");
  expect((await request.get(`${signPath(sent)}/pdf`)).status()).toBe(200);
  const active = await fixture.getDocument<{ _id: string; _rev: string }>(outboxId);
  await fixture.patch(outboxId).ifRevisionId(active!._rev).set({ payload: JSON.stringify(message) }).commit();

  const deleted = await Promise.all([post(request, `/api/ugovori/contracts/${sent.id}/delete`, { confirmation }), post(request, `/api/ugovori/contracts/${sent.id}/delete`, { confirmation })]);
  for (const response of deleted) expect(response.status()).toBe(200);
  expect((await post(request, `/api/ugovori/contracts/${signed.id}/delete`, { confirmation })).status()).toBe(200);
  for (const contract of [sent, signed]) {
    for (const path of [signPath(contract), `${signPath(contract)}/pdf`, `/api/ugovori/contracts/${contract.id}/pdf`, `/api/ugovori/contracts/${contract.id}/audit`]) expect((await request.get(path)).status()).toBe(404);
    expect((await post(request, signPath(contract), signData(contract))).status()).toBe(404);
    expect((await post(request, `/api/ugovori/contracts/${contract.id}/retry`, {})).status()).toBe(404);
    const docs = await fixture.fetch<{ _id: string; kind: string; label: string; payload: string }[]>('*[_type == "ePotpisRecord"]');
    expect(docs.filter(doc => JSON.parse(doc.payload).contractId === contract.id)).toHaveLength(0);
    const tombstone = docs.find((doc: any) => doc._id === `epotpisDemo.contract.${contract.id}`)!;
    expect(tombstone.kind).toBe("deletedContract");
    expect(JSON.parse(tombstone.payload)).toMatchObject({ status: "deleted", snapshot: "", request_hash: "", pdf: null, final_pdf: null, anchor: null });
    expect(JSON.stringify(tombstone)).not.toContain(input.ownerName);
  }
  expect((await post(request, "/api/ugovori/contracts", input, { "Idempotency-Key": key })).status()).toBe(409);
  const racing = await create(request);
  expect(racing.number).toBe(input.contractNumber);
  const race = await Promise.all([post(request, signPath(racing), signData(racing)), post(request, `/api/ugovori/contracts/${racing.id}/delete`, { confirmation })]);
  expect([200, 404]).toContain(race[0].status()); expect(race[1].status()).toBe(200);
  expect((await request.get(`${signPath(racing)}/pdf`)).status()).toBe(404);
  const remaining = await fixture.fetch<{ payload: string }[]>('*[_type == "ePotpisRecord"]');
  expect(remaining.filter(doc => JSON.parse(doc.payload).contractId === racing.id)).toHaveLength(0);
  const ids = [sent.id, signed.id, racing.id];
  expect((await (await request.get("/api/ugovori/contracts")).json()).contracts.some((contract: { id: string }) => ids.includes(contract.id))).toBe(false);
});

test("contract deletion requires the exact phrase and signature deletion uses a small confirmation dialog", async ({ page, request }) => {
  expect((await post(request, "/api/ugovori/session", { password: "met-demo-2026" })).status()).toBe(200);
  expect((await post(request, "/api/ugovori/settings", { signature })).status()).toBe(200);
  const contract = await create(request, { ...input, ownerName: "TEST - Brisanje ugovora" });
  await page.goto("/ugovori");
  await page.getByRole("button", { name: "Prijavi se", exact: true }).click();
  const row = page.getByRole("row").filter({ hasText: "TEST - Brisanje ugovora" });
  const trigger = row.getByRole("button", { name: "Obriši ugovor", exact: true });
  await trigger.click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toContainText(contract.number);
  await expect(dialog).toContainText("TEST - Brisanje ugovora");
  await expect(dialog.getByRole("button", { name: "Odustani", exact: true })).toBeFocused();
  const confirmation = dialog.getByRole("textbox");
  const remove = dialog.getByRole("button", { name: "Obriši ugovor", exact: true });
  await expect(remove).toBeDisabled();
  await confirmation.fill("OBRISI OVAJ UGOVOR"); await expect(remove).toBeDisabled();
  await confirmation.fill("OBRIŠI OVAJ UGOVOR"); await expect(remove).toBeEnabled();
  await page.keyboard.press("Escape"); await expect(dialog).toHaveCount(0); await expect(trigger).toBeFocused();
  await trigger.click(); await expect(confirmation).toHaveValue("");
  await dialog.getByRole("button", { name: "Odustani", exact: true }).click(); await expect(row).toHaveCount(1);
  await trigger.click(); await confirmation.fill("OBRIŠI OVAJ UGOVOR");
  await page.screenshot({ path: ".data/check-artifacts/delete-contract-dialog.png" });
  await remove.click(); await expect(dialog).toHaveCount(0); await expect(row).toHaveCount(0);
  await expect(page.locator(".ep-notice")).toHaveText("Ugovor je obrisan.");
  await page.reload(); await expect(row).toHaveCount(0);
  await page.getByRole("link", { name: "Postavke", exact: true }).click();
  await page.getByRole("button", { name: "Obriši potpis", exact: true }).click();
  await expect(dialog.getByRole("textbox")).toHaveCount(0);
  await dialog.getByRole("button", { name: "Odustani", exact: true }).click();
  await expect(page.locator(".ep-existing-signature img")).toBeVisible();
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole("button", { name: "Obriši potpis", exact: true }).click();
  const bounds = await dialog.boundingBox();
  expect(bounds!.x).toBeGreaterThanOrEqual(0); expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(390);
  await page.screenshot({ path: ".data/check-artifacts/delete-signature-dialog-mobile.png" });
  await dialog.getByRole("button", { name: "Obriši potpis", exact: true }).click();
  await expect(dialog).toHaveCount(0);
  await expect(page.locator(".ep-notice")).toHaveText("Spremljeni potpis je obrisan.");
  await expect(page.locator(".ep-existing-signature img")).toHaveCount(0);
  await expect(page.locator(".ep-signature-box canvas")).toBeVisible();
  await expect(page.getByRole("button", { name: "Spremi potpis", exact: true })).toBeDisabled();
  await page.reload(); await page.getByRole("link", { name: "Postavke", exact: true }).click();
  await expect(page.locator(".ep-existing-signature img")).toHaveCount(0);
});


test("both original PDF templates support joint owners and reject overflowing data without truncation", async () => {
  const docs = JSON.parse(readFileSync("resources/epotpis/templates/templates.json", "utf8"));
  const cms = getEPotpisTexts().app;
  for (const kind of ["open", "exclusive"] as const) {
    const template = docs.find((doc: any) => doc.kind === kind);
    for (const joint of [false, true]) {
      const data = { ...input, kind, ...(joint ? { coOwner } : {}) };
      const result = await createContractPdf(data, data.contractNumber, template, signature);
      expect(result.anchor.height).toBe(13);
      expect(result.anchor.slots).toHaveLength(joint ? 2 : 1);
      const final = await signContractPdf(result.bytes, result.anchor, joint ? [signature, secondSignature] : [signature], "2026-09-10T12:00:00Z", cms);
      expect((await PDFDocument.load(final)).getPageCount()).toBe(3);
      writeFileSync(`.data/check-artifacts/native-${kind}-${joint ? "joint" : "single"}.pdf`, final);
    }
    await expect(createContractPdf({ ...input, kind, coOwner, propertyAddress: "Duga adresa ".repeat(16), descriptionField: "Opširan opis nekretnine ".repeat(21), landRegistry: "Zemljišnoknjižni podaci ".repeat(12) }, input.contractNumber, template, signature)).rejects.toThrow("pdfContentTooLong");
    const layout = JSON.parse(template.layoutJson);
    layout.pdfSha256 = "0".repeat(64);
    await expect(createContractPdf({ ...input, kind }, input.contractNumber, { ...template, layoutJson: JSON.stringify(layout) }, signature)).rejects.toThrow("notConfigured");
  }
});

test("admin routes support direct entry, refresh, client navigation and browser history", async ({ page, request }) => {
  await post(request, "/api/ugovori/session", { password: "met-demo-2026" });
  await post(request, "/api/ugovori/settings", { signature });
  await page.goto("/ugovori/novi");
  await expect(page.getByLabel("Lozinka", { exact: true })).toBeVisible();
  await expect(page.locator(".ep-create-form")).toHaveCount(0);
  await page.getByRole("button", { name: "Prijavi se", exact: true }).click();
  await expect(page).toHaveURL(/\/ugovori\/novi$/);
  await expect(page.getByRole("heading", { name: "Novi ugovor", exact: true })).toBeVisible();
  await expect(page.locator('[name="contractNumber"]')).toBeVisible();
  await page.evaluate(() => { (window as unknown as { routeMarker: string }).routeMarker = "same-document"; });
  await page.getByRole("link", { name: "Postavke", exact: true }).click();
  await expect(page).toHaveURL(/\/ugovori\/postavke$/);
  await expect(page.getByRole("heading", { name: "Trenutni potpis", exact: true })).toBeVisible();
  expect(await page.evaluate(() => (window as unknown as { routeMarker: string }).routeMarker)).toBe("same-document");
  await page.goBack();
  await expect(page).toHaveURL(/\/ugovori\/novi$/);
  await expect(page.locator('[name="contractNumber"]')).toBeVisible();
  await page.goForward();
  await expect(page).toHaveURL(/\/ugovori\/postavke$/);
  await expect(page.getByRole("heading", { name: "Trenutni potpis", exact: true })).toBeVisible();
  await page.reload();
  await expect(page).toHaveURL(/\/ugovori\/postavke$/);
  await expect(page.getByRole("heading", { name: "Trenutni potpis", exact: true })).toBeVisible();
  await expect(page.locator(".ep-signature-box canvas")).toHaveCount(0);
  await page.locator(".ep-back").click();
  await expect(page).toHaveURL(/\/ugovori$/);
  await page.getByRole("link", { name: "Novi ugovor", exact: true }).click();
  await expect(page).toHaveURL(/\/ugovori\/novi$/);
  await page.reload();
  await expect(page).toHaveURL(/\/ugovori\/novi$/);
  await expect(page.locator('[name="contractNumber"]')).toBeEmpty();
  await page.getByRole("button", { name: "Odjavi se", exact: true }).click();
  await expect(page.getByLabel("Lozinka", { exact: true })).toBeVisible();
  await page.goto("/ugovori/postavke");
  await expect(page.getByLabel("Lozinka", { exact: true })).toBeVisible();
  await expect(page.locator(".ep-existing-signature")).toHaveCount(0);
});

test("test-fill buttons populate one or two owners and both contracts can be signed", async ({ page, request, browser }) => {
  await post(request, "/api/ugovori/session", { password: "met-demo-2026" });
  await post(request, "/api/ugovori/settings", { signature });
  await page.goto("/ugovori/novi");
  await page.getByRole("button", { name: "Prijavi se", exact: true }).click();
  const single = page.getByRole("button", { name: "Popuni testnim podacima (1 osoba)", exact: true });
  const joint = page.getByRole("button", { name: "Popuni testnim podacima (2 osobe)", exact: true });
  const writes: string[] = [];
  page.on("request", event => { if (event.method() === "POST" && event.url().includes("/api/ugovori/")) writes.push(event.url()); });
  await joint.click();
  await expect(page.locator('[name="coOwner.email"]')).toHaveCount(0);
  await page.locator('[name="oib"]').fill("12345678904");
  await page.locator('[name="oib"]').blur();
  await expect(page.locator("#ep-oib-error")).toBeVisible();
  await single.click();
  await expect(page.locator('[name="coOwner.ownerName"]')).toHaveCount(0);
  await expect(page.locator("#ep-oib-error")).toHaveCount(0);
  expect(await page.locator(".ep-create-form").evaluate((form: HTMLFormElement) => form.checkValidity())).toBe(true);
  expect(writes).toHaveLength(0);
  for (const two of [false, true]) {
    if (two) await page.getByRole("link", { name: "Novi ugovor", exact: true }).click();
    const beforeFill = writes.length;
    await (two ? joint : single).click();
    await expect(page.locator('[name="email"]')).toHaveValue("filipivanovic7@gmail.com");
    await expect(page.locator('[name="ownerName"]')).toHaveValue("Marko Horvat");
    if (two) {
      await expect(page.locator('[name="coOwner.ownerName"]')).toHaveValue("Ana Horvat");
      await expect(page.locator('[name="coOwner.email"]')).toHaveCount(0);
      expect(oibCheck(await page.locator('[name="coOwner.oib"]').inputValue())).toBe(true);
      await page.locator('[name="kind"][value="exclusive"]').check();
    }
    expect(writes).toHaveLength(beforeFill);
    expect(oibCheck(await page.locator('[name="oib"]').inputValue())).toBe(true);
    await page.getByRole("button", { name: "Pregledaj ugovor", exact: true }).click();
    const send = page.getByRole("button", { name: "POŠALJI", exact: true });
    await expect(send).toBeEnabled({ timeout: 60000 });
    await expect(page).toHaveURL(/\/ugovori\/novi$/);
    await page.locator(".ep-preview").getByRole("button", { name: "Natrag", exact: true }).click();
    await expect(page.locator('[name="ownerName"]')).toHaveValue("Marko Horvat");
    if (two) await expect(page.locator('[name="coOwner.ownerName"]')).toHaveValue("Ana Horvat");
    await page.screenshot({ path: `.data/check-artifacts/test-data-${two ? "joint" : "single"}.png`, fullPage: true });
    await page.getByRole("button", { name: "Pregledaj ugovor", exact: true }).click();
    await expect(send).toBeEnabled({ timeout: 60000 });
    const creation = page.waitForResponse(response => response.request().method() === "POST" && response.url().endsWith("/api/ugovori/contracts"));
    await send.click();
    const contract = await (await creation).json();
    await expect(page).toHaveURL(/\/ugovori$/);
    await expect(page.locator(".ep-share input")).toHaveValue(contract.signUrl);
    const stored = await sanityFixture().getDocument<{ payload: string }>(`epotpisDemo.contract.${contract.id}`);
    const saved = JSON.parse(JSON.parse(stored!.payload).snapshot).input;
    expect(saved.email).toBe("filipivanovic7@gmail.com");
    if (two) {
      expect(saved.coOwner).toMatchObject({ ownerName: "Ana Horvat", oib: "98765432106" });
      expect(saved.coOwner).not.toHaveProperty("email");
    }
    else expect(saved.coOwner).toBeUndefined();
    const context = await browser.newContext({ viewport: { width: two ? 390 : 1280, height: 844 }, isMobile: two, hasTouch: two });
    const owner = await context.newPage();
    await owner.goto(contract.signUrl);
    await expect(owner.locator(".ep-signature-box canvas")).toHaveAttribute("aria-disabled", "false", { timeout: 60000 });
    for (let person = 0; person < (two ? 2 : 1); person++) {
      await expect(owner.locator(".ep-signature-box canvas")).toHaveCount(1);
      await draw(owner);
      await owner.getByRole("button", { name: "Prihvati potpis", exact: true }).click();
      if (two && person === 0) await expect(owner.getByRole("button", { name: "POTPIŠI", exact: true })).toBeDisabled();
    }
    for (const checkbox of await owner.getByRole("checkbox").all()) await checkbox.check();
    await owner.getByRole("button", { name: "POTPIŠI", exact: true }).click();
    await expect(owner.getByRole("heading", { name: "Ugovor je potpisan." })).toBeVisible();
    const final = await request.get(`/api/ugovori/contracts/${contract.id}/pdf`);
    expect(final.ok()).toBe(true);
    expect((await PDFDocument.load(await final.body())).getPageCount()).toBe(3);
    writeFileSync(`.data/check-artifacts/test-data-${two ? "joint" : "single"}-signed.pdf`, await final.body());
    const audit = await (await request.get(`/api/ugovori/contracts/${contract.id}/audit`)).json();
    const signed = audit.filter((event: { type: string }) => event.type === "signed");
    expect(signed).toHaveLength(1);
    expect(signed[0].detail.signatures).toHaveLength(two ? 2 : 1);
    expect(signed[0].detail.signatures.every((item: Signature) => item.kind === "strokes" && item.paths.length === 1)).toBe(true);
    const messages = (await (await request.get("/api/ugovori/outbox")).json()).filter((message: { contractId: string }) => message.contractId === contract.id);
    expect(messages).toHaveLength(3);
    expect(messages.every((message: { status: string }) => message.status === "delivered")).toBe(true);
    const sent = await sentEmails(request, contract.id);
    expect(sent).toHaveLength(3);
    expect(sent.find(email => email.key.endsWith("-owner_signed"))?.to).toEqual(["filipivanovic7@gmail.com"]);
    expect(sent.find(email => email.key.endsWith("-broker_signed"))?.to).toEqual(["broker@example.test"]);
    for (const email of sent.filter(email => email.attachments)) {
      expect(Buffer.from(email.attachments![0].content, "base64")).toEqual(await final.body());
    }
    await context.close();
  }
});

test("failed email delivery can be retried without duplicate messages", async ({ request }) => {
  await post(request, "/api/ugovori/session", { password: "met-demo-2026" });
  await post(request, "/api/ugovori/settings", { signature });
  const contract = await create(request, { ...input, email: "retry-once@example.test" });
  expect(contract.emailStatus).toBe("failed");
  expect(await sentEmails(request, contract.id)).toHaveLength(0);
  const retry = await post(request, `/api/ugovori/contracts/${contract.id}/retry`, {});
  expect(retry.ok()).toBe(true);
  expect((await retry.json()).emailStatus).toBe("delivered");
  expect((await post(request, `/api/ugovori/contracts/${contract.id}/retry`, {})).ok()).toBe(true);
  expect(await sentEmails(request, contract.id)).toHaveLength(1);
});

test("every named signer is required and older shared signature anchors still work", async ({ request }) => {
  await post(request, "/api/ugovori/session", { password: "met-demo-2026" });
  await post(request, "/api/ugovori/settings", { signature });
  const joint = await create(request, { ...input, coOwner });
  const path = `/api/ugovori/sign/${joint.signUrl.split("/").at(-1)}`;
  expect((await (await request.get(path)).json()).signers).toEqual([input.signerName, coOwner.signerName]);
  const body = { consent: true, consumerConsent: true, documentHash: joint.documentHash };
  for (const signatures of [[], [signature], [signature, null], [signature, { kind: "strokes", paths: [[[1, 1]]] }], [signature, signature, signature]]) {
    expect((await post(request, path, { ...body, signatures })).status()).toBe(400);
    expect((await (await request.get(path)).json()).status).toBe("sent");
  }
  expect((await post(request, path, { ...body, signature })).status()).toBe(400);
  const results = await Promise.all([post(request, path, { ...body, signatures: [signature, secondSignature] }), post(request, path, { ...body, signatures: [signature, secondSignature] })]);
  for (const result of results) expect((await result.json()).status).toBe("signed");
  const audit = await (await request.get(`/api/ugovori/contracts/${joint.id}/audit`)).json();
  const events = audit.filter((event: { type: string }) => event.type === "signed");
  expect(events).toHaveLength(1);
  expect(events[0].detail.signatures).toEqual([signature, secondSignature]);

  const single = await create(request);
  const singlePath = `/api/ugovori/sign/${single.signUrl.split("/").at(-1)}`;
  expect((await post(request, singlePath, { ...body, documentHash: single.documentHash, signatures: [signature, secondSignature] })).status()).toBe(400);

  const legacy = await create(request, { ...input, coOwner });
  const legacyPath = `/api/ugovori/sign/${legacy.signUrl.split("/").at(-1)}`;
  const before = await (await request.get(`${legacyPath}/pdf`)).body();
  const fixture = sanityFixture();
  const id = `epotpisDemo.contract.${legacy.id}`;
  const stored = await fixture.getDocument<{ payload: string }>(id);
  const row = JSON.parse(stored!.payload), anchor = JSON.parse(row.anchor);
  delete anchor.slots; row.anchor = JSON.stringify(anchor);
  await fixture.patch(id).ifRevisionId(stored!._rev).set({ payload: JSON.stringify(row) }).commit();
  expect((await (await request.get(legacyPath)).json()).signers).toEqual([input.signerName, coOwner.signerName]);
  expect(await (await request.get(`${legacyPath}/pdf`)).body()).toEqual(before);
  expect((await post(request, legacyPath, { ...body, documentHash: legacy.documentHash, signatures: [signature, secondSignature] })).status()).toBe(200);
});

test("mobile signing preserves ink across rotation and lets each owner replace only their signature", async ({ request, browser }) => {
  await post(request, "/api/ugovori/session", { password: "met-demo-2026" });
  await post(request, "/api/ugovori/settings", { signature });
  const contract = await create(request, { ...input, coOwner });
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
  const page = await context.newPage();
  const errors: string[] = []; page.on("pageerror", error => errors.push(error.message));
  await page.goto(contract.signUrl);
  const canvas = page.locator(".ep-signature-box canvas");
  await expect(canvas).toHaveAttribute("aria-disabled", "false", { timeout: 60000 });
  await expect(page.getByText("Za lakše potpisivanje okrenite uređaj vodoravno.")).toBeVisible();
  await expect(page.getByRole("button", { name: "Prihvati potpis", exact: true })).toBeDisabled();
  await draw(page);
  await page.getByRole("button", { name: "Proširi prostor za potpis", exact: true }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  const hasInk = () => canvas.evaluate((node: HTMLCanvasElement) => node.getContext("2d")!.getImageData(0, 0, node.width, node.height).data.some((value, i) => i % 4 === 3 && value > 0));
  await expect.poll(hasInk).toBe(true);
  await page.setViewportSize({ width: 844, height: 390 });
  await expect(page.getByText("Za lakše potpisivanje okrenite uređaj vodoravno.")).toBeHidden();
  await expect.poll(hasInk).toBe(true);
  const box = (await canvas.boundingBox())!;
  expect(box.width / box.height).toBeCloseTo(3, 1);
  await page.screenshot({ path: ".data/check-artifacts/signature-landscape.png" });
  await page.getByRole("button", { name: "Natrag na ugovor", exact: true }).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect.poll(hasInk).toBe(true);
  await page.getByRole("button", { name: "Prihvati potpis", exact: true }).click();
  await expect(page.getByRole("button", { name: "POTPIŠI", exact: true })).toBeDisabled();
  await draw(page);
  await page.getByRole("button", { name: "Prihvati potpis", exact: true }).click();
  const cards = page.locator(".ep-signer-card");
  const firstInk = await cards.nth(0).locator("svg.ep-signature-ink").innerHTML();
  const secondInk = await cards.nth(1).locator("svg.ep-signature-ink").innerHTML();
  await cards.nth(0).getByRole("button", { name: "Zamijeni potpis", exact: true }).click();
  await page.getByRole("button", { name: "Obriši potpis", exact: true }).click();
  await expect.poll(hasInk).toBe(false);
  await expect(page.getByRole("button", { name: "POTPIŠI", exact: true })).toBeDisabled();
  await page.locator(".ep-signature-capture > button").click();
  expect(await cards.nth(0).locator("svg.ep-signature-ink").innerHTML()).toBe(firstInk);
  expect(await cards.nth(1).locator("svg.ep-signature-ink").innerHTML()).toBe(secondInk);
  await cards.nth(0).getByRole("button", { name: "Zamijeni potpis", exact: true }).click();
  await page.getByRole("button", { name: "Obriši potpis", exact: true }).click();
  await draw(page); await dot(page, true);
  await page.getByRole("button", { name: "Prihvati potpis", exact: true }).click();
  expect(await cards.nth(0).locator("svg.ep-signature-ink").innerHTML()).not.toBe(firstInk);
  expect(await cards.nth(1).locator("svg.ep-signature-ink").innerHTML()).toBe(secondInk);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.locator(".ep-sign-form").screenshot({ path: ".data/check-artifacts/signature-review-mobile.png" });
  for (const checkbox of await page.getByRole("checkbox").all()) await checkbox.check();
  await page.getByRole("button", { name: "POTPIŠI", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Ugovor je potpisan." })).toBeVisible();
  expect(errors).toEqual([]);
  await context.close();
});


test("local contracts subdomain keeps login, client navigation and logout on short routes", async ({ page }) => {
  const url = "http://ugovori.localhost:3002";
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  await page.goto(url);
  await expect(page.locator('input[name="password"]')).toBeVisible();
  await page.locator(".ep-login button").click();
  await expect(page.locator("#ep-heading")).toHaveText("Pregled ugovora");
  await expect(page.locator(".ep-brand")).toHaveAttribute("href", "/");
  await page.getByRole("link", { name: "Postavke", exact: true }).click();
  await expect(page).toHaveURL(`${url}/postavke`);
  await expect(page.locator("#ep-heading")).toHaveText("Postavke");
  await page.locator(".ep-back").click();
  await expect(page).toHaveURL(`${url}/`);
  await page.getByRole("link", { name: "Novi ugovor", exact: true }).click();
  await expect(page).toHaveURL(`${url}/novi`);
  await expect(page.locator("#ep-heading")).toHaveText("Novi ugovor");
  await page.reload();
  await expect(page.locator("#ep-heading")).toHaveText("Novi ugovor");
  await page.getByRole("button", { name: "Odjavi se", exact: true }).click();
  await expect(page).toHaveURL(`${url}/`);
  await expect(page.locator('input[name="password"]')).toBeVisible();
  expect(errors).toEqual([]);
});
