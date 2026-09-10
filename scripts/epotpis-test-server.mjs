import { spawn } from "node:child_process";
import { createRequire } from "node:module";
import { startSanityMock } from "./epotpis-sanity-mock.mjs";
import { copyFile, mkdir, writeFile } from "node:fs/promises";
const require = createRequire(import.meta.url);
await mkdir(".data", { recursive: true });
await copyFile("resources/epotpis/templates/templates.json", ".data/epotpis-test-templates.json");
const sanity = await startSanityMock();
await writeFile(".data/epotpis-test-sanity-url.txt", sanity.url);
const child = spawn(process.execPath, [require.resolve("next/dist/bin/next"), "dev", "--port", "3002"], {
  stdio: "inherit",
  env: {
    ...process.env, NODE_ENV: "development",
    NODE_OPTIONS: `${process.env.NODE_OPTIONS || ""} --import=${new URL("./epotpis-email-mock.mjs", import.meta.url).href}`,
    EPOTPIS_STORAGE_NAMESPACE: "epotpisDemo", EPOTPIS_AUTH_TEST_MODE: "true",
    EPOTPIS_RESEND_API_KEY: "local-test-resend-key", RESEND_API_KEY: "",
    EPOTPIS_EMAIL_FROM: "MET Test <sender@example.test>", EPOTPIS_RECIPIENT_EMAIL: "broker@example.test",
    EPOTPIS_BASE_URL: "http://epotpis.test:3002",
    EPOTPIS_SANITY_TEST_URL: sanity.url, EPOTPIS_BUILD_DIR: ".next-epotpis-test",
  },
});
for (const signal of ["SIGTERM", "SIGINT"]) process.on(signal, () => child.kill(signal));
child.on("exit", code => { sanity.close(); process.exit(code ?? 0); });
