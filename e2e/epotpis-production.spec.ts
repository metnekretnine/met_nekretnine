import { test, expect } from "@playwright/test";
import { createHmac } from "node:crypto";

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

test("production signing captures two individual signatures in one confirmation", async ({ page }) => {
  const { readFileSync } = await import("node:fs");
  const pdf = readFileSync("resources/epotpis/templates/MET_OTVORENO_POSREDOVANJE_UGOVOR_I_OPCI_UVJETI_PREDLOZAK_08-09-2026.pdf");
  const token = "a".repeat(64);
  const contract = { number: "TEST-001/2026", ownerName: "Marko Horvat i Ana Horvat", signers: ["Marko Horvat", "Ana Horvat"], propertyAddress: "Testna ulica 20", kind: "open", consumer: false, status: "sent", documentHash: "test-hash", signedAt: null as string | null };
  const writes: Record<string, unknown>[] = [];
  const unexpected: string[] = [];
  await page.route("**/api/ugovori/**", async route => {
    const path = new URL(route.request().url()).pathname;
    if (route.request().method() === "GET" && path === `/api/ugovori/sign/${token}/pdf`) await route.fulfill({ contentType: "application/pdf", body: pdf });
    else if (path === `/api/ugovori/sign/${token}` && ["GET", "POST"].includes(route.request().method())) {
      if (route.request().method() === "POST") {
        writes.push(route.request().postDataJSON()); contract.status = "signed"; contract.signedAt = "2026-09-10T12:00:00Z";
      }
      await route.fulfill({ json: contract });
    } else { unexpected.push(path); await route.abort(); }
  });
  await page.goto(`/ugovori/potpis/${token}`);
  for (const name of contract.signers) {
    const canvas = page.locator(".ep-signature-box canvas");
    await expect(canvas).toHaveAttribute("aria-disabled", "false");
    await expect(canvas).toHaveAttribute("aria-label", `Potpis - ${name}`);
    await canvas.scrollIntoViewIfNeeded();
    const box = (await canvas.boundingBox())!;
    await page.mouse.move(box.x + box.width * .1, box.y + box.height * .7); await page.mouse.down();
    for (const [x, y] of [[.2,.3],[.3,.6],[.4,.3],[.5,.7],[.7,.3]]) await page.mouse.move(box.x + box.width * x, box.y + box.height * y, { steps: 4 });
    await page.mouse.up();
    await page.getByRole("button", { name: "Prihvati potpis", exact: true }).click();
  }
  expect(writes).toHaveLength(0);
  await expect(page.locator(".ep-signature-ink")).toHaveCount(2);
  await page.getByRole("checkbox").check();
  await page.getByRole("button", { name: "POTPIŠI", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Ugovor je potpisan." })).toBeVisible();
  expect(writes).toHaveLength(1);
  expect(writes[0].signatures).toHaveLength(2);
  expect(unexpected).toEqual([]);
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
