export interface LocalizedPriceListText {
  hr?: string;
  en?: string;
}

export interface PriceListServiceSource {
  _key?: string;
  name: LocalizedPriceListText;
  payer: LocalizedPriceListText;
  currentPrice: LocalizedPriceListText;
  maxPrice?: LocalizedPriceListText;
  referencePrice: LocalizedPriceListText;
  referenceDate: string;
  isSpecialSale: boolean;
  specialSaleName?: LocalizedPriceListText;
  note?: LocalizedPriceListText;
}

export interface PriceListSnapshotSource {
  _id: string;
  sourceRevision: string;
  contentHash: string;
  publishedAt: string;
  storageNumber: number;
  fileName: string;
  locationType: string;
  locationAddress: string;
  locationCode: string;
  services: PriceListServiceSource[];
}
