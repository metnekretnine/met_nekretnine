import { test, expect, type BrowserContext } from "@playwright/test";
import { createHmac } from "node:crypto";
import { createContractPdf } from "../src/lib/epotpis/pdf";
import { loadEPotpisTemplate } from "../src/lib/epotpis/templates";
import { testContractInput } from "./fixtures/epotpis-input";

// Exercise the production host locally, without sending requests to the deployed site.
const contractsOrigin = "http://ugovori.metnekretnine.hr:3003";
async function contractsHost(context: BrowserContext) {
  await context.route(`${contractsOrigin}/**`, async route => {
    const url = new URL(route.request().url()); url.hostname = "127.0.0.1";
    const response = await route.fetch({ url: url.href, headers: { ...route.request().headers(), host: "ugovori.metnekretnine.hr:3003" }, maxRedirects: 0 });
    await route.fulfill({ response });
  });
}

test("production rejects legacy cookies and demo password without Clerk configuration", async ({ page, context, request }) => {
  const expires = String(Date.now() + 3600000);
  const mac = createHmac("sha256", "production-smoke-secret").update("production-smoke-password").update(expires).digest("hex");
  await context.addCookies([{ name: "met_epotpis_session", value: `${expires}.${mac}`, domain: "localhost", path: "/", httpOnly: true, sameSite: "Strict" }]);
  for (const path of ["/ugovori", "/ugovori/novi", "/ugovori/postavke", "/ugovori/profil"]) {
    await page.goto(path);
    await expect(page.locator(".ep-login [role=alert]")).toContainText("Prijava još nije postavljena");
    await expect(page.locator('input[type="password"]')).toHaveCount(0);
  }
  expect((await request.get("/api/ugovori/contracts")).status()).toBe(503);
  expect((await request.post("/api/ugovori/session", { data: { password: "met-demo-2026" }, headers: { Origin: "http://localhost:3003" } })).status()).toBe(401);
});

test("production signing captures two individual signatures in one confirmation", async ({ page, context }, testInfo) => {
  await contractsHost(context);
  // Exercise the real renderer and worker without native APIs absent in Safari 18.
  await page.addInitScript(() => {
    Reflect.deleteProperty(Math, "sumPrecise");
    Reflect.deleteProperty(Map.prototype, "getOrInsertComputed");
  });
  let workerRequests = 0;
  await page.route("**/epotpis/pdf.worker.min.mjs*", async route => {
    workerRequests++;
    const url = new URL(route.request().url()); url.hostname = "127.0.0.1";
    const response = await route.fetch({ url: url.href, headers: { ...route.request().headers(), host: "ugovori.metnekretnine.hr:3003" } });
    await route.fulfill({ response, body: `Reflect.deleteProperty(Math, "sumPrecise"); Reflect.deleteProperty(Map.prototype, "getOrInsertComputed");\n${await response.text()}` });
  });
  const token = "a".repeat(64);
  const contract = { ownerName: "Marko Horvat i Ana Horvat", signers: ["Marko Horvat", "Ana Horvat"], propertyAddress: "Testna ulica 20", kind: "open", consumer: false, status: "sent", documentHash: "test-hash", signedAt: null as string | null };
  // Use a populated contract, including the embedded font used in real documents.
  const { bytes } = await createContractPdf({ ...testContractInput(true), consumer: false }, await loadEPotpisTemplate("open"), { kind: "strokes", paths: [[[80, 150], [150, 80], [220, 140]]] });
  const pdf = Buffer.from(bytes);
  const writes: Record<string, unknown>[] = [];
  const unexpected: string[] = [];
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  let releasePdf!: () => void;
  const pdfReady = new Promise<void>(resolve => { releasePdf = resolve; });
  await page.route("**/api/ugovori/**", async route => {
    const path = new URL(route.request().url()).pathname;
    if (route.request().method() === "GET" && path === `/api/ugovori/sign/${token}/pdf`) {
      await pdfReady;
      await route.fulfill({ contentType: "application/pdf", body: pdf });
    }
    else if (path === `/api/ugovori/sign/${token}` && ["GET", "POST"].includes(route.request().method())) {
      if (route.request().method() === "POST") {
        writes.push(route.request().postDataJSON()); contract.status = "signed"; contract.signedAt = "2026-09-10T12:00:00Z";
      }
      await route.fulfill({ json: contract });
    } else { unexpected.push(path); await route.abort(); }
  });
  await page.goto(`${contractsOrigin}/potpis/${token}`);
  await expect(page).toHaveURL(`${contractsOrigin}/potpis/${token}`);
  await expect(page.locator("footer")).toHaveCount(0);
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
  const canvas = page.locator(".ep-signature-box canvas");
  const accept = page.getByRole("button", { name: "Prihvati potpis", exact: true });
  const sign = page.getByRole("button", { name: "POTPIŠI", exact: true });
  // Expanding is a layout action; signing must still wait for the document.
  await page.getByRole("button", { name: "Proširi prostor za potpis", exact: true }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await expect(canvas).toHaveAttribute("aria-disabled", "true");
  await expect(accept).toBeDisabled();
  await page.getByRole("button", { name: "Natrag na ugovor", exact: true }).click();
  releasePdf();
  await expect(canvas).toHaveAttribute("aria-disabled", "false");
  await expect(page.locator(".ep-pdf-pages canvas")).toHaveCount(2);
  await page.getByRole("button", { name: "Proširi prostor za potpis", exact: true }).click();
  await expect(canvas).toHaveAttribute("aria-disabled", "false");
  await page.screenshot({ path: testInfo.outputPath("expanded-signature.png") });
  await page.getByRole("button", { name: "Natrag na ugovor", exact: true }).click();
  // Re-rendering at maximum zoom also exercises the mobile canvas budget.
  for (let zoom = 150; zoom <= 250; zoom += 50) {
    await page.locator(".ep-pdf-toolbar button").last().click();
    await expect(page.locator(".ep-pdf-toolbar")).toContainText(`${zoom}%`);
    await expect(page.locator(".ep-pdf-pages")).toHaveAttribute("aria-busy", "false");
  }
  const pixels = await page.locator(".ep-pdf-pages canvas").evaluateAll(nodes => nodes.map(node => {
    const canvas = node as HTMLCanvasElement;
    return canvas.width * canvas.height;
  }));
  expect(pixels).toHaveLength(2);
  expect(pixels.every(count => count > 0 && count <= 4_000_000)).toBe(true);
  async function draw(reverse = false) {
    await canvas.scrollIntoViewIfNeeded();
    const box = (await canvas.boundingBox())!;
    await page.mouse.move(box.x + box.width * .1, box.y + box.height * .7); await page.mouse.down();
    for (const [x, y] of [[.2,.3],[.3,.6],[.4,.3],[.5,.7],[.7,.3]]) await page.mouse.move(box.x + box.width * x, box.y + box.height * (reverse ? 1 - y : y), { steps: 4 });
    await page.mouse.up();
  }
  await expect(canvas).toHaveAttribute("aria-label", `Potpis - ${contract.signers[0]}`);
  await draw(); await accept.click();
  const cards = page.locator(".ep-signer-card");
  const originalFirst = await cards.nth(0).locator("svg.ep-signature-ink").innerHTML();
  await expect(canvas).toHaveAttribute("aria-label", `Potpis - ${contract.signers[1]}`);
  await draw(true);
  const pendingSecond = await canvas.evaluate((node: HTMLCanvasElement) => node.toDataURL());
  // Replacing/cancelling the first signature must work before accepting the second.
  const replaceFirst = cards.nth(0).getByRole("button", { name: "Zamijeni potpis", exact: true });
  await replaceFirst.click();
  await page.getByRole("button", { name: "Obriši potpis", exact: true }).click();
  await page.locator(".ep-signature-capture > button").click();
  expect(await cards.nth(0).locator("svg.ep-signature-ink").innerHTML()).toBe(originalFirst);
  await expect(canvas).toHaveAttribute("aria-label", `Potpis - ${contract.signers[1]}`);
  expect(await canvas.evaluate((node: HTMLCanvasElement) => node.toDataURL())).toBe(pendingSecond);
  await replaceFirst.click();
  await page.getByRole("button", { name: "Obriši potpis", exact: true }).click();
  await draw(true); await accept.click();
  expect(await cards.nth(0).locator("svg.ep-signature-ink").innerHTML()).not.toBe(originalFirst);
  await expect(canvas).toHaveAttribute("aria-label", `Potpis - ${contract.signers[1]}`);
  expect(await canvas.evaluate((node: HTMLCanvasElement) => node.toDataURL())).toBe(pendingSecond);
  await expect(sign).toBeDisabled();
  await accept.click();
  expect(writes).toHaveLength(0);
  await expect(page.locator(".ep-signature-ink")).toHaveCount(2);
  await page.getByRole("checkbox").check();
  await sign.scrollIntoViewIfNeeded();
  expect(await page.evaluate(() => window.scrollY)).toBeGreaterThan(0);
  await sign.click();
  const heading = page.getByRole("heading", { name: "Ugovor je potpisan." });
  await expect(heading).toBeFocused();
  await expect(heading).toBeInViewport();
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);
  await expect(page.locator(".ep-pdf-pages")).toHaveAttribute("aria-busy", "false");
  await expect(page.locator(".ep-pdf [role=alert]")).toHaveCount(0);
  await page.screenshot({ path: testInfo.outputPath("signed-result.png") });
  expect(writes).toHaveLength(1);
  expect(writes[0].signatures).toHaveLength(2);
  expect(unexpected).toEqual([]);
  expect(errors).toEqual([]);
  expect(workerRequests).toBeGreaterThan(0);
});

test("the property website and its redirects remain public and indexable", async ({ request, page }) => {
  for (const path of ["/", "/stanovi-za-najam", "/za-najmodavce", "/za-najmoprimce", "/ponudite-stan", "/o-agenciji", "/kontakt", "/blog"]) {
    const response = await request.get(path, { maxRedirects: 0 });
    expect(response.status(), path).toBe(200);
    expect(response.headers()["x-robots-tag"] || "", path).not.toContain("noindex");
    const html = await response.text();
    expect(html, path).toContain("<h1");
    expect(html, path).not.toContain('name="robots" content="noindex');
  }
  for (const [from, to] of [["/najam", "/stanovi-za-najam"], ["/o-nama", "/o-agenciji"], ["/prodaja", "/stanovi-za-najam"], ["/usluge", "/za-najmodavce"]]) {
    const response = await request.get(from, { maxRedirects: 0 });
    expect(response.status()).toBe(308);
    expect(new URL(response.headers().location, "https://metnekretnine.hr").pathname).toBe(to);
  }
  const sitemap = await (await request.get("/sitemap.xml")).text();
  expect(sitemap).toContain("https://metnekretnine.hr/stanovi-za-najam");
  expect(sitemap).not.toContain("/ugovori");
  const detail = sitemap.match(/<loc>(https:\/\/metnekretnine\.hr\/stanovi-za-najam\/[^<]+)<\/loc>/)?.[1];
  expect(detail).toBeTruthy();
  expect((await request.get(new URL(detail!).pathname)).status()).toBe(200);
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  await page.goto("/stanovi-za-najam");
  await expect(page.locator("h1")).toBeVisible();
  await expect(page.locator('a[href^="/stanovi-za-najam/"]').first()).toBeVisible();
  expect(errors).toEqual([]);
});

test("contracts and public signing are excluded from indexing without blocking the site", async ({ request, page }) => {
  const robots = await (await request.get("/robots.txt")).text();
  expect(robots).toContain("Allow: /");
  expect(robots).toContain("Disallow: /ugovori");
  expect(robots).toContain("Sitemap: https://metnekretnine.hr/sitemap.xml");
  for (const path of ["/ugovori", "/ugovori/novi", "/ugovori/potpis/test-invalid", "/api/ugovori/contracts", "/api/ugovori/sign/test-invalid"]) {
    const response = await request.get(path);
    expect(response.headers()["x-robots-tag"], path).toContain("noindex");
    expect(response.headers()["referrer-policy"], path).toBe("no-referrer");
  }
  await page.goto("/ugovori");
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
  await expect(page.locator("footer")).toHaveCount(0);
  expect(await page.locator('script[src*="clarity"],script[src*="googletagmanager"],script[src*="connect.facebook"]').count()).toBe(0);
});


test("contracts subdomain isolates administration, indexing and the public website", async ({ page, context, request }) => {
  await contractsHost(context);
  for (const path of ["/", "/novi", "/postavke", "/profil"]) {
    const response = await page.goto(`${contractsOrigin}${path}`);
    expect(response?.status(), path).toBe(200);
    expect(response?.headers()["x-robots-tag"], path).toContain("noindex");
    expect(response?.headers()["cache-control"], path).toContain("no-store");
    await expect(page.locator(".ep-login [role=alert]")).toContainText("Prijava još nije postavljena");
    await expect(page.locator("footer")).toHaveCount(0);
    expect(await page.locator('script[src*="clarity"],script[src*="googletagmanager"],script[src*="connect.facebook"]').count()).toBe(0);
    await expect(page).toHaveURL(`${contractsOrigin}${path}`);
  }
  const get = (path: string) => request.get(path, { headers: { Host: "ugovori.metnekretnine.hr" }, maxRedirects: 0 });
  const robots = await get("/robots.txt");
  expect(await robots.text()).toBe("User-agent: *\nDisallow: /\n");
  expect(robots.headers()["x-robots-tag"]).toContain("noindex");
  for (const path of ["/sitemap.xml", "/api/contact", "/ugovori", "/ugovori/potpis/unused"]) {
    const response = await get(path);
    expect(response.status(), path).toBe(404);
    expect(response.headers()["x-robots-tag"], path).toContain("noindex");
  }
  expect((await get("/api/ugovori/contracts")).status()).toBe(503);
  expect((await get("/api/ugovori/sign/invalid")).status()).toBe(404);
  expect((await get("/epotpis/pdf.worker.min.mjs")).status()).toBe(200);
  for (const path of ["/stanovi-za-najam?filter=test", "/admin/structure"]) {
    const response = await get(path);
    expect(response.status()).toBe(307);
    expect(response.headers().location).toBe(`https://metnekretnine.hr${path}`);
  }
  for (const host of ["metnekretnine.hr", "www.metnekretnine.hr"]) {
    expect((await request.get("/ugovori", { headers: { Host: host }, maxRedirects: 0 })).status()).toBe(404);
  }
});
