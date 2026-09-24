import {
  LocalizedPriceListText,
  PriceListSnapshotSource,
} from "./types";

const PRICE_LIST_CSV_HEADERS = [
  "Naziv usluge",
  "Maloprodajna cijena",
  "Poseban oblik prodaje (DA/NE)",
  "Naziv posebnog oblika prodaje",
  "Sidrena cijena",
  "Datum sidrene cijene",
] as const;

function localizedCroatian(value?: LocalizedPriceListText): string {
  return value?.hr?.trim() || value?.en?.trim() || "";
}

function escapeCsvCell(value: string): string {
  return `"${value.replaceAll('"', '""')}"`;
}

export function generatePriceListCsv(
  snapshot: PriceListSnapshotSource,
): string {
  const rows = snapshot.services.map((service) => [
    localizedCroatian(service.name),
    localizedCroatian(service.currentPrice),
    service.isSpecialSale ? "DA" : "NE",
    service.isSpecialSale
      ? localizedCroatian(service.specialSaleName)
      : "",
    localizedCroatian(service.referencePrice),
    service.referenceDate,
  ]);

  const csv = [PRICE_LIST_CSV_HEADERS, ...rows]
    .map((row) => row.map((cell) => escapeCsvCell(String(cell))).join(","))
    .join("\r\n");

  return `\uFEFF${csv}\r\n`;
}

function sanitizeFileNamePart(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/gi, (match) => (match === "Đ" ? "D" : "d"))
    .replace(/[^A-Za-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();
}

function formatZagrebTimestamp(isoDate: string): string {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Zagreb",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date(isoDate));

  const value = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? "";

  return `${value("year")}${value("month")}${value("day")}_${value("hour")}${value("minute")}`;
}

export function buildPriceListFileName({
  locationType,
  locationAddress,
  locationCode,
  storageNumber,
  publishedAt,
}: {
  locationType: string;
  locationAddress: string;
  locationCode: string;
  storageNumber: number;
  publishedAt: string;
}): string {
  const paddedStorageNumber = String(storageNumber).padStart(4, "0");

  return [
    sanitizeFileNamePart(locationType),
    sanitizeFileNamePart(locationAddress),
    sanitizeFileNamePart(locationCode).toUpperCase(),
    paddedStorageNumber,
    formatZagrebTimestamp(publishedAt),
  ].join("_") + ".csv";
}
