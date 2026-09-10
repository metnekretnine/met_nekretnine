import { defineConfig } from "@playwright/test";
import base from "./playwright.epotpis.config";

export default defineConfig({
  ...base, testMatch: "epotpis-production.spec.ts",
  outputDir: ".data/epotpis-production-results",
  use: { ...base.use, baseURL: "http://localhost:3003" },
  webServer: {
    command: "pnpm exec next start --hostname 127.0.0.1 --port 3003", url: "http://localhost:3003/ugovori", reuseExistingServer: false, timeout: 120000,
    env: {
      NODE_ENV: "production", EPOTPIS_BUILD_DIR: ".next-validation", EPOTPIS_STORAGE_NAMESPACE: "epotpisDemo",
      EPOTPIS_BASE_URL: "http://localhost:3003",
      NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: "", CLERK_SECRET_KEY: "",
      EPOTPIS_AUTH_TEST_MODE: "true",
      // Page texts must render without querying Sanity, even with the live template source.
      // All browser APIs are mocked. Any accidental server store access fails closed.
      EPOTPIS_SANITY_TEST_URL: "disabled-for-production-smoke", RESEND_API_KEY: "", EPOTPIS_RESEND_API_KEY: "",
    },
  },
});
