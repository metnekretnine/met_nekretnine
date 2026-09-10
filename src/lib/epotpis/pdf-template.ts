import { createHash } from "node:crypto";
import { PDFDocument, type PDFFont, rgb } from "pdf-lib";
import type { ContractInput, ContractOwner, SignAnchor } from "./types";
import { EPotpisError } from "./config";
import { splitSignatureAnchor } from "./signature-geometry";

interface PdfField { key: "propertyAddress" | "descriptionField" | "landRegistry" | "rent" | "deposit" | "duration"; row: number; x: number; baseline: number; right: number; suffix: string }
export interface OriginalPdfLayout {
  format: "original-pdf-v1"; pdf: string; pdfSha256: string; width: number; height: number; bounds: number[];
  fields: PdfField[]; subtitle: string; subtitleBaseline: number;
  owner: { x: number; baseline: number; text: string; separator: string };
  date: { x: number; baseline: number; text: string }; signerBaseline: number;
  signatures: { x: number; width: number; baseline: number }[];
  footer: string; footerBaseline: number;
}
const replace = (text: string, values: Record<string, string>) => text.replace(/\[([^\]]+)\]|\{(\w+)\}/g, (match, bracket, brace) => values[bracket || brace] ?? match);
const personValues = (owner: ContractOwner) => ({ "IME I PREZIME / NAZIV": owner.ownerName, OIB: owner.oib, ADRESA: owner.ownerAddress, TELEFON: owner.phone });

// Wrap variable fields only. All fixed text, rules and tables come from the source PDF.
function wrap(text: string, font: PDFFont, size: number, width: number, firstWidth = width): string[] {
  const lines: string[] = [];
  let line = "";
  const limit = () => lines.length === 0 ? firstWidth : width;
  for (const paragraph of text.replace(/\r/g, "").split("\n")) {
    for (const word of paragraph.split(/\s+/u).filter(Boolean)) {
      const next = line ? `${line} ${word}` : word;
      if (font.widthOfTextAtSize(next, size) <= limit()) { line = next; continue; }
      if (line) { lines.push(line); line = ""; }
      for (const char of word) {
        if (font.widthOfTextAtSize(line + char, size) > limit() && line) { lines.push(line); line = ""; }
        line += char;
      }
    }
    lines.push(line); line = "";
  }
  return lines;
}

export async function populateOriginalPdf(pdf: PDFDocument, input: ContractInput, number: string, layout: OriginalPdfLayout, font: PDFFont) {
  const bytes = Buffer.from(layout.pdf, "base64");
  if (createHash("sha256").update(bytes).digest("hex") !== layout.pdfSha256) throw new EPotpisError("notConfigured", 503);
  const source = await PDFDocument.load(bytes);
  const left = 48.3, right = 549.6;
  const people = [input, ...(input.coOwner ? [input.coOwner] : [])];
  const signerNames = people.map(person => person.signerName).join(` ${layout.owner.separator.trim()} `);
  // Only the first owner has an email; omit the source template's email clause for the second.
  const coOwnerText = layout.owner.text.replace(/,\s*e-pošta:\s*\[E-POŠTA\]/iu, "");
  const ownerText = [
    replace(layout.owner.text, { ...personValues(input), "E-POŠTA": input.email }),
    ...(input.coOwner ? [replace(coOwnerText, personValues(input.coOwner))] : []),
  ].join(` ${layout.owner.separator.trim()} `);
  const values = Object.fromEntries(layout.fields.map(field => [field.key,
    (typeof input[field.key] === "number" ? input[field.key].toLocaleString("hr-HR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : input[field.key]) + field.suffix]));
  // Normally use the source's 8.5 pt. Only unusually long variable data can use 7.5 pt.
  function measure(size: number) {
    const lineHeight = size * (9.8 / 8.5);
    const owners = wrap(ownerText, font, size, right - left, right - layout.owner.x);
    const fields = layout.fields.map(field => ({ ...field, lines: wrap(values[field.key], font, size, field.right - field.x) }));
    const ownerExtra = Math.max(0, (owners.length - 1) * lineHeight);
    const rows = [0, 1, 2].map(row => Math.max(0, ...fields.filter(field => field.row === row).map(field => (field.lines.length - 1) * lineHeight)));
    const extra = ownerExtra + rows.reduce((sum, n) => sum + n, 0);
    const signers = wrap(signerNames, font, size, 240);
    return { size, lineHeight, owners, fields, ownerExtra, rows, extra, signers, bottom: layout.signerBaseline + extra + (signers.length - 1) * lineHeight + 3 };
  }
  let measured = measure(8.5);
  if (measured.bottom > 790) measured = measure(7.5);
  if (measured.bottom > 790) throw new EPotpisError("pdfContentTooLong");
  const page = pdf.addPage([layout.width, layout.height]);
  const characterSet = new Set(font.getCharacterSet());
  const draw = (text: string, x: number, baseline: number, size = measured.size) => {
    if (Array.from(text).some(char => !characterSet.has(char.codePointAt(0)!))) throw new EPotpisError("validationError");
    try { page.drawText(text, { x, y: layout.height - baseline, size, font, color: rgb(0, 0, 0) }); }
    catch { throw new EPotpisError("validationError"); }
  };
  function centered(text: string, baseline: number, size: number, center = layout.width / 2) {
    draw(text, center - font.widthOfTextAtSize(text, size) / 2, baseline, size);
  }
  let offset = 0;
  for (let index = 0; index < layout.bounds.length - 1; index++) {
    if (index === 1) offset += measured.ownerExtra;
    if (index >= 3 && index <= 5) offset += measured.rows[index - 3];
    const top = layout.bounds[index], bottom = layout.bounds[index + 1];
    const embedded = await pdf.embedPage(source.getPage(index), { left: 0, right: layout.width, top: layout.height - top, bottom: layout.height - bottom });
    page.drawPage(embedded, { x: 0, y: layout.height - bottom - offset, width: layout.width, height: bottom - top });
  }
  centered(replace(layout.subtitle, { number }), layout.subtitleBaseline, 9.5);
  measured.owners.forEach((text, index) => draw(text, index ? left : layout.owner.x, layout.owner.baseline + index * measured.lineHeight));
  for (const field of measured.fields) {
    const shift = measured.ownerExtra + measured.rows.slice(0, field.row).reduce((sum, n) => sum + n, 0);
    field.lines.forEach((text, index) => draw(text, field.x, field.baseline + shift + index * measured.lineHeight));
  }
  const [year, month, day] = input.date.split("-");
  const date = replace(layout.date.text, { MJESTO: input.place, DATUM: `${Number(day)}. ${Number(month)}. ${year}` });
  const dateSize = Math.min(8.5, 8.5 * (right - left) / font.widthOfTextAtSize(date, 8.5));
  if (dateSize < 7) throw new EPotpisError("pdfContentTooLong");
  draw(date, layout.date.x, layout.date.baseline + measured.extra, dateSize);
  const sign = layout.signatures[0];
  measured.signers.forEach((text, index) => centered(text, layout.signerBaseline + measured.extra + index * measured.lineHeight, measured.size, sign.x + sign.width / 2));
  const anchors: SignAnchor[] = layout.signatures.map(box => ({ x: box.x, y: layout.height - box.baseline - measured.extra + 2, width: box.width, height: 13, verticalAlign: "bottom" }));
  const attachments = await pdf.copyPages(source, input.consumer ? [6, 7] : [6]);
  attachments.forEach(attachment => pdf.addPage(attachment));
  pdf.getPages().forEach((p, index) => {
    const text = replace(layout.footer, { number, page: String(index + 1), total: String(pdf.getPageCount()) });
    p.drawText(text, { x: (layout.width - font.widthOfTextAtSize(text, 8)) / 2, y: layout.height - layout.footerBaseline, font, size: 8, color: rgb(0, 0, 0) });
  });
  return { anchor: splitSignatureAnchor(anchors[0], people.length), brokerAnchor: anchors[1] };
}
