import { readFile } from "node:fs/promises";
import { join } from "node:path";

export interface TemplateRun { text: string; bold: boolean; size: number }
export interface TemplateParagraph { type: "paragraph"; runs: TemplateRun[]; align: string; before: number; after: number; bullet: boolean }
export interface TemplateTable { type: "table"; rows: TemplateParagraph[][][]; widths: number[]; signature: boolean }
export type TemplateBlock = TemplateParagraph | TemplateTable;
export interface EPotpisTemplate { kind: "open" | "exclusive"; version: string; sourceFile: string; sourceSha256: string; layoutJson: string }
export interface TemplateLayout { pages: TemplateBlock[][]; footer: string }

/** Local prepared PDFs and field layouts; the full template is copied into each contract. */
export async function loadEPotpisTemplate(kind: "open" | "exclusive"): Promise<EPotpisTemplate> {
  const path = process.env.NODE_ENV === "development" && process.env.EPOTPIS_SANITY_TEST_URL
    ? ".data/epotpis-test-templates.json" : "resources/epotpis/templates/templates.json";
  const templates: EPotpisTemplate[] = JSON.parse(await readFile(join(process.cwd(), path), "utf8"));
  const template = templates.find(item => item.kind === kind);
  if (!template) throw new Error(`Missing local contract template: ${kind}`);
  return template;
}
