import { copyFile, mkdir } from "node:fs/promises";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
await mkdir("public/epotpis", { recursive: true });
await copyFile(require.resolve("pdfjs-dist/build/pdf.worker.min.mjs"), "public/epotpis/pdf.worker.min.mjs");
