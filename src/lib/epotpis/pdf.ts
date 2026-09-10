import type { EPotpisTexts } from "@/lib/epotpis/texts";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { createHash } from "node:crypto";
import { PDFDocument, PDFFont, PDFPage, rgb } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";
import { PNG } from "pngjs";
import type { TemplateLayout, TemplateParagraph, TemplateBlock, EPotpisTemplate } from "@/lib/epotpis/templates";
import type { ContractInput, Signature, SignAnchor } from "./types";
import { EPotpisError } from "./config";
import { populateOriginalPdf, type OriginalPdfLayout } from "./pdf-template";
import { ownerDisplayName } from "./types";

export const sha256 = (value: Uint8Array | string) => createHash("sha256").update(value).digest("hex");
export const interpolate = (text: string, values: Record<string, string>) => text.replace(/\{(\w+)\}/g, (match, key) => values[key] ?? match);
const WIDTH = 595.28, HEIGHT = 841.89, MARGIN = 36;
const fontBytes: Record<string, Promise<Buffer>> = {};
async function fontFor(pdf: PDFDocument, bold = false) {
  const file = bold ? "Arimo-Bold.ttf" : "Arimo-Regular.ttf";
  fontBytes[file] ??= readFile(join(process.cwd(), "resources/epotpis/fonts", file));
  pdf.registerFontkit(fontkit);
  // Embed complete static fonts: fontkit subsetting drops composite glyph outlines in Arimo.
  return pdf.embedFont(await fontBytes[file], { subset: false });
}
function substitutions(input: ContractInput, number: string) {
  const [year, month, day] = input.date.split("-");
  return {
    BROJ: number.includes("/") ? number.split("/")[0] : number, GODINA: number.includes("/") ? number.split("/")[1] : year,
    "IME I PREZIME / NAZIV": ownerDisplayName(input), OIB: [input.oib, input.coOwner?.oib].filter(Boolean).join(" i "), ADRESA: [input.ownerAddress, input.coOwner?.ownerAddress].filter(Boolean).join("; "), TELEFON: [input.phone, input.coOwner?.phone].filter(Boolean).join("; "),
    "E-POŠTA": input.email, "ADRESA NEKRETNINE": input.propertyAddress,
    "OPIS, POVRŠINA I PRIPADCI NEKRETNINE": input.descriptionField, "ZK PODACI": input.landRegistry,
    TRAJANJE: input.duration, NAJAMNINA: input.rent.toLocaleString("hr-HR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
    POLOG: input.deposit.toLocaleString("hr-HR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
    MJESTO: input.place, DATUM: `${Number(day)}. ${Number(month)}. ${year}`, "IME I PREZIME / FUNKCIJA": [input.signerName, input.coOwner?.signerName].filter(Boolean).join(" i "),
  };
}
interface Draw { text: string; x: number; top: number; size: number; bold: boolean }
function pageLayout(blocks: TemplateBlock[], font: PDFFont, boldFont: PDFFont, values: Record<string, string>, scale: number) {
  const commands: Draw[] = [];
  const characterSet = new Set(font.getCharacterSet());
  let anchor: SignAnchor | null = null;
  function replace(text: string) {
    const result = text.replace(/\[([^\]]+)\]/g, (match, key) => values[key] ?? match);
    if (/\[[^\]]+\]/.test(result)) throw new EPotpisError("validationError");
    for (const char of result.replace(/[\n\r\t]/g, "")) {
      if (!characterSet.has(char.codePointAt(0)!)) throw new EPotpisError("validationError");
    }
    return result;
  }
  function paragraph(p: TemplateParagraph, x: number, top: number, width: number, draw: boolean) {
    type Token = { text: string; size: number; bold: boolean; width: number };
    const lines: Token[][] = [[]]; let used = 0;
    const runs = p.bullet ? [{ text: "• ", size: 8.5, bold: false }, ...p.runs] : p.runs;
    for (const run of runs) {
      const size = run.size * scale;
      const runFont = run.bold ? boldFont : font;
      const pieces = replace(run.text).split(/(\n|[^\S\n]+)/u).filter(Boolean);
      for (const piece of pieces) {
        if (piece === "\n") { lines.push([]); used = 0; continue; }
        const groups = runFont.widthOfTextAtSize(piece, size) > width ? Array.from(piece) : [piece];
        for (const text of groups) {
          const token = { text, size, bold: run.bold, width: runFont.widthOfTextAtSize(text, size) };
          if (used + token.width > width && lines.at(-1)!.length) { lines.push([]); used = 0; }
          if (used === 0 && /^\s+$/.test(text)) continue;
          lines.at(-1)!.push(token); used += token.width;
        }
      }
    }
    let y = top + p.before * scale;
    for (const line of lines) {
      const height = Math.max(8.5 * scale, ...line.map(t => t.size)) * 1.13;
      const lineWidth = line.reduce((sum, t) => sum + t.width, 0);
      let left = x + (p.align === "center" ? (width - lineWidth) / 2 : p.align === "right" ? width - lineWidth : 0);
      for (const token of line) {
        if (draw && token.text.trim()) commands.push({ text: token.text, x: left, top: y + token.size, size: token.size, bold: token.bold });
        left += token.width;
      }
      y += height;
    }
    return y + p.after * scale;
  }
  let top = 27;
  for (const block of blocks) {
    if (block.type === "paragraph") { top = paragraph(block, MARGIN, top, WIDTH - MARGIN * 2, true); continue; }
    const total = block.widths.reduce((sum, w) => sum + w, 0);
    for (let rowIndex = 0; rowIndex < block.rows.length; rowIndex++) {
      if (block.signature && rowIndex === 1) {
        // The rule sits just below the following row's baseline (26 + 2 + 8.5 pt).
        // Leave roughly 2 pt between the signature's lower edge and the rule.
        anchor = { x: MARGIN + 40, y: HEIGHT - top - 36 * scale, width: (WIDTH - MARGIN * 2) / 2 - 80, height: 24 * scale, verticalAlign: "bottom" };
        top += 26 * scale;
      }
      const row = block.rows[rowIndex]; let x = MARGIN;
      let end = top;
      for (let index = 0; index < row.length; index++) {
        const width = (WIDTH - MARGIN * 2) * (block.widths[index] || total / row.length) / total;
        let y = top + 2 * scale;
        for (const p of row[index]) y = paragraph(p, x + 3, y, width - 6, true);
        end = Math.max(end, y + 2 * scale); x += width;
      }
      top = end;
    }
    top += 2 * scale;
  }
  return { commands, height: top, anchor };
}

export function decodeSignaturePng(signature: Signature) {
  if (signature.kind !== "png") return null;
  const bytes = Buffer.from(signature.data.split(",")[1], "base64");
  try {
    if (bytes.length < 24 || bytes.readUInt32BE(16) > 2048 || bytes.readUInt32BE(20) > 2048) throw new Error();
    const png = PNG.sync.read(bytes, { checkCRC: true });
    let ink = 0;
    for (let i = 0; i < png.data.length; i += 4) if (png.data[i + 3] > 40 && Math.min(png.data[i], png.data[i + 1], png.data[i + 2]) < 180) ink++;
    if (ink < 30) throw new Error();
    return bytes;
  } catch { throw new EPotpisError("signatureUploadError"); }
}
export async function drawSignature(pdf: PDFDocument, page: PDFPage, signature: Signature, box: SignAnchor) {
  if (signature.kind === "png") {
    const png = await pdf.embedPng(decodeSignaturePng(signature)!);
    const scale = Math.min(box.width / png.width, box.height / png.height);
    page.drawImage(png, { x: box.x + (box.width - png.width * scale) / 2, y: box.y + (box.verticalAlign === "bottom" ? 0 : (box.height - png.height * scale) / 2), width: png.width * scale, height: png.height * scale });
    return;
  }
  const points = signature.paths.flat();
  const minX = Math.min(...points.map(p => p[0])), maxX = Math.max(...points.map(p => p[0]));
  const minY = Math.min(...points.map(p => p[1])), maxY = Math.max(...points.map(p => p[1]));
  const scale = Math.min(box.width / Math.max(maxX - minX, 1), box.height / Math.max(maxY - minY, 1));
  const xOffset = box.x + (box.width - (maxX - minX) * scale) / 2;
  // Existing contracts retain their stored, centered placement when the flag is absent.
  const yOffset = box.y + (box.verticalAlign === "bottom" ? 0 : (box.height - (maxY - minY) * scale) / 2);
  const thickness = Math.max(0.7, 1.7 * scale), color = rgb(0.07, 0.15, 0.21);
  for (const path of signature.paths) {
    if (path.length === 1) {
      page.drawCircle({ x: xOffset + (path[0][0] - minX) * scale, y: yOffset + (maxY - path[0][1]) * scale, size: thickness / 2, color });
      continue;
    }
    for (let i = 1; i < path.length; i++) {
      page.drawLine({ start: { x: xOffset + (path[i - 1][0] - minX) * scale, y: yOffset + (maxY - path[i - 1][1]) * scale }, end: { x: xOffset + (path[i][0] - minX) * scale, y: yOffset + (maxY - path[i][1]) * scale }, thickness, color });
    }
  }
}
export async function createContractPdf(input: ContractInput, number: string, template: EPotpisTemplate, broker: Signature) {
  const pdf = await PDFDocument.create();
  const font = await fontFor(pdf);
  const parsedLayout = JSON.parse(template.layoutJson) as TemplateLayout | OriginalPdfLayout;
  if ("format" in parsedLayout && parsedLayout.format === "original-pdf-v1") {
    const { anchor, brokerAnchor } = await populateOriginalPdf(pdf, input, number, parsedLayout, font);
    await drawSignature(pdf, pdf.getPage(0), broker, brokerAnchor);
    pdf.setTitle(number); pdf.setAuthor("MET d.o.o."); pdf.setSubject(template.version);
    return { bytes: await pdf.save(), anchor };
  }
  const boldFont = await fontFor(pdf, true);
  const layout = parsedLayout as TemplateLayout;
  const pages = input.consumer ? layout.pages : layout.pages.slice(0, 2);
  const values = substitutions(input, number);
  let anchor: SignAnchor | null = null;
  for (let index = 0; index < pages.length; index++) {
    let scale = 1;
    let result = pageLayout(pages[index], font, boldFont, values, scale);
    while (result.height > HEIGHT - 58 && scale > 0.8) { scale -= 0.02; result = pageLayout(pages[index], font, boldFont, values, scale); }
    if (result.height > HEIGHT - 58) throw new EPotpisError("validationError");
    const page = pdf.addPage([WIDTH, HEIGHT]);
    for (const command of result.commands) {
      const opts = { x: command.x, y: HEIGHT - command.top, size: command.size, font: command.bold ? boldFont : font, color: rgb(0.05, 0.05, 0.05) };
      page.drawText(command.text, opts);
    }
    const footerValues = { ...values, STRANICA: String(index + 1), UKUPNO: String(pages.length) };
    const footer = layout.footer.replace(/\[([^\]]+)\]/g, (_, key) => footerValues[key as keyof typeof footerValues]);
    const size = 7.2;
    page.drawText(footer, { x: (WIDTH - font.widthOfTextAtSize(footer, size)) / 2, y: 11, size, font });
    if (index === 0 && result.anchor) {
      anchor = result.anchor;
      await drawSignature(pdf, page, broker, { ...anchor, x: anchor.x + (WIDTH - MARGIN * 2) / 2 });
    }
  }
  if (!anchor) throw new EPotpisError("error", 500);
  pdf.setTitle(number); pdf.setAuthor("MET d.o.o."); pdf.setSubject(template.version);
  return { bytes: await pdf.save(), anchor };
}
export async function signContractPdf(bytes: Uint8Array, anchor: SignAnchor, signature: Signature | Signature[], signedAt: string, cms: EPotpisTexts) {
  const pdf = await PDFDocument.load(bytes);
  const font = await fontFor(pdf);
  const signatures = Array.isArray(signature) ? signature : [signature];
  const slots = anchor.slots || [anchor];
  if (signatures.length !== slots.length) throw new EPotpisError("signatureRequired");
  for (const [index, item] of signatures.entries()) await drawSignature(pdf, pdf.getPage(0), item, slots[index]);
  const date = new Date(signedAt).toLocaleString("hr-HR", { timeZone: "Europe/Zagreb" });
  const label = interpolate(cms.pdfSignedAt, { signedAt: date });
  for (const page of pdf.getPages()) {
    page.drawText(label, { x: MARGIN, y: 35, size: 7, font });
  }
  pdf.setModificationDate(new Date(signedAt));
  return pdf.save();
}
export async function signaturePreview(signature: Signature) {
  const pdf = await PDFDocument.create();
  const page = pdf.addPage([360, 120]);
  await drawSignature(pdf, page, signature, { x: 10, y: 10, width: 340, height: 100 });
  return pdf.save();
}
