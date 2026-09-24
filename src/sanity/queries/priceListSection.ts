import { Language } from "@/lib/constants";
import { groq } from "next-sanity";
import { sanityFetch } from "../lib/live";

export interface PriceListServiceCMS {
  key: string;
  name: string;
  payer: string;
  currentPrice: string;
  maxPrice?: string;
  referencePrice: string;
  referenceDate: string;
  isSpecialSale: boolean;
  specialSaleName?: string;
  note?: string;
}

export interface PriceListArchiveItemCMS {
  id: string;
  publishedAt: string;
  fileName: string;
}

export interface PriceListSnapshotCMS extends PriceListArchiveItemCMS {
  services: PriceListServiceCMS[];
}

export interface PriceListSectionCMS {
  serviceLabel: string;
  payerLabel: string;
  currentPriceLabel: string;
  referencePriceLabel: string;
  lastUpdatedLabel: string;
  downloadCsvLabel: string;
  archiveTitle: string;
  archiveDescription?: string;
  archiveItemLabel: string;
  downloadArchiveLabel: string;
}

// Used for published versions (see src/lib/price-list/store.ts).
export const localizedServicesProjection = groq`
  "services": services[] {
    "key": _key,
    "name": name[$lang],
    "payer": payer[$lang],
    "currentPrice": currentPrice[$lang],
    "maxPrice": maxPrice[$lang],
    "referencePrice": referencePrice[$lang],
    referenceDate,
    isSpecialSale,
    "specialSaleName": specialSaleName[$lang],
    "note": note[$lang]
  }
`;

const priceListSectionQuery = groq`
  *[_id == "priceListSettings"][0] {
    "serviceLabel": serviceLabel[$lang],
    "payerLabel": payerLabel[$lang],
    "currentPriceLabel": currentPriceLabel[$lang],
    "referencePriceLabel": referencePriceLabel[$lang],
    "lastUpdatedLabel": lastUpdatedLabel[$lang],
    "downloadCsvLabel": downloadCsvLabel[$lang],
    "archiveTitle": archiveTitle[$lang],
    "archiveDescription": archiveDescription[$lang],
    "archiveItemLabel": archiveItemLabel[$lang],
    "downloadArchiveLabel": downloadArchiveLabel[$lang]
  }
`;

// Returns null instead of notFound(): the price list is an optional block.
export async function fetchPriceListSectionCms(
  lang: Language["id"],
): Promise<PriceListSectionCMS | null> {
  const { data } = await sanityFetch({
    query: priceListSectionQuery,
    params: { lang },
    tags: ["priceListSettings"],
  });

  return (data as PriceListSectionCMS | null) ?? null;
}
