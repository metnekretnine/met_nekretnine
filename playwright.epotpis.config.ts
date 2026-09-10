import { defineConfig } from "@playwright/test";


export default defineConfig({
  testDir: "./e2e", testMatch: "epotpis.spec.ts", workers: 1, timeout: 120000,
  reporter: "list",
  use: { baseURL: "http://localhost:3002", trace: "retain-on-failure", launchOptions: { args: ["--host-resolver-rules=MAP epotpis.test 127.0.0.1"] } },
  webServer: { command: "node scripts/epotpis-test-server.mjs", url: "http://localhost:3002/ugovori", reuseExistingServer: false, timeout: 120000 },
});
