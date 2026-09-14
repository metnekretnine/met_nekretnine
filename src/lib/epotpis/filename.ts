import type { ContractInput } from "./types";

function filenameName(name: string) {
  return name.normalize("NFKD")
    .replace(/Đ/g, "D").replace(/đ/g, "d").replace(/\p{M}/gu, "")
    .replace(/[^a-zA-Z0-9]+/g, "-").replace(/^-+|-+$/g, "")
    .slice(0, 80).replace(/-+$/, "") || "Nalogodavac";
}

/** Stable, portable names for previews, downloads, Studio and email attachments. */
export function contractPdfFilename(input: Pick<ContractInput, "ownerName" | "coOwner" | "date">, signed = false) {
  const names = [input.ownerName, ...(input.coOwner ? [input.coOwner.ownerName] : [])].map(filenameName);
  // Legacy records without a date remain downloadable; new inputs always have a valid date.
  const date = /^\d{4}-\d{2}-\d{2}$/.test(input.date || "") ? input.date : "";
  return ["MET-ugovor", ...names, ...(signed ? ["potpisan"] : []), ...(date ? [date] : [])].join("-") + ".pdf";
}
