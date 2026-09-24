import "server-only";

import { Language } from "@/lib/constants";
import { writeClient } from "@/sanity/lib/writeClient";
import {
  localizedServicesProjection,
  PriceListArchiveItemCMS,
  PriceListSnapshotCMS,
} from "@/sanity/queries/priceListSection";
import { PriceListSnapshotSource } from "./types";

// Field order matters: archive.ts hashes this shape to detect changes.
export const serviceFieldsProjection = `services[] {
  _key,
  name,
  payer,
  currentPrice,
  maxPrice,
  referencePrice,
  referenceDate,
  isSpecialSale,
  specialSaleName,
  note
}`;

export interface PublishedPriceListVersions {
  current: PriceListSnapshotCMS | null;
  archive: PriceListArchiveItemCMS[];
}

// Versions are private documents created at request time, so they are read
// uncached with the server token instead of through the cached CMS query.
export async function getPublishedPriceListVersions(
  lang: Language["id"],
): Promise<PublishedPriceListVersions> {
  const result = await writeClient.fetch<PublishedPriceListVersions>(
    `{
      "current": *[_type == "priceListSnapshot"] | order(publishedAt desc)[0] {
        "id": _id,
        publishedAt,
        fileName,
        ${localizedServicesProjection}
      },
      "archive": *[_type == "priceListSnapshot"] | order(publishedAt desc)[1...100] {
        "id": _id,
        publishedAt,
        fileName
      }
    }`,
    { lang },
    { cache: "no-store" },
  );

  return { current: result.current ?? null, archive: result.archive ?? [] };
}

export async function getCurrentPriceListFileName(): Promise<string | null> {
  return writeClient.fetch<string | null>(
    `*[_type == "priceListSnapshot"] | order(publishedAt desc)[0].fileName`,
    {},
    { cache: "no-store" },
  );
}

export async function getPriceListSnapshotByFileName(
  fileName: string,
): Promise<PriceListSnapshotSource | null> {
  return writeClient.fetch<PriceListSnapshotSource | null>(
    `*[_type == "priceListSnapshot" && fileName == $fileName][0] {
      ...,
      ${serviceFieldsProjection}
    }`,
    { fileName },
    { cache: "no-store" },
  );
}
