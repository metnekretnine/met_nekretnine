import { test, expect } from "@playwright/test";

test("should navigate to the About page", async ({ page }) => {
  await page.goto("/");
  await page.click('a[href="/about"]');
  await expect(page).toHaveURL("/about");
  await expect(page.locator("h1").first()).toBeVisible();
});

test("should navigate to the Contact page", async ({ page }) => {
  await page.goto("/");
  await page.click('a[href="/contact"]');
  await expect(page).toHaveURL("/contact");
  await expect(page.locator("h1").first()).toBeVisible();
});

test("should navigate to the Home Page from About", async ({ page }) => {
  await page.goto("/about");
  await page.click('a[href="/"]');
  await expect(page).toHaveURL("/");
  await expect(page.locator("h1").first()).toBeVisible();
});

test("should navigate to the Home page from Contact", async ({ page }) => {
  await page.goto("/contact");
  await page.click('a[href="/"]');
  await expect(page).toHaveURL("/");
  await expect(page.locator("h1").first()).toBeVisible();
});
