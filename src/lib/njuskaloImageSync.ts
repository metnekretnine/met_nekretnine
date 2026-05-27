export interface SanityImageValue {
  _key?: string;
  _type?: string;
  watermarkTone?: NjuskaloWatermarkTone;
  asset?: {
    _type?: string;
    _ref?: string;
    _id?: string;
  };
}

export type NjuskaloWatermarkTone = "white" | "dark";

export interface NjuskaloImageItem {
  _key?: string;
  _type?: "object";
  sourceAssetRef?: string;
  watermarkTone?: NjuskaloWatermarkTone;
  watermarkVersion?: string;
  image?: SanityImageValue;
}

export interface NjuskaloImageSyncState {
  sourceCount: number;
  syncedCount: number;
  missingCount: number;
  missingRefs: string[];
  staleRefs: string[];
  isReady: boolean;
}

export function getAssetRef(image?: SanityImageValue | null) {
  return image?.asset?._ref || image?.asset?._id || "";
}

export const DEFAULT_NJUSKALO_WATERMARK_TONE: NjuskaloWatermarkTone = "dark";
export const NJUSKALO_WATERMARK_VERSION = "met-logo-top-right-v4-tone";

export function getSourceImageRefs(images?: SanityImageValue[] | null) {
  return Array.from(new Set((images || []).map(getAssetRef).filter(Boolean)));
}

export function getWatermarkTone(image?: SanityImageValue | null) {
  return image?.watermarkTone === "white" || image?.watermarkTone === "dark"
    ? image.watermarkTone
    : DEFAULT_NJUSKALO_WATERMARK_TONE;
}

export function getSourceImageSignatures(images?: SanityImageValue[] | null) {
  const entries: [
    string,
    {
      sourceAssetRef: string;
      watermarkTone: NjuskaloWatermarkTone;
    },
  ][] = [];

  (images || []).forEach((image) => {
    const assetRef = getAssetRef(image);

    if (!assetRef) {
      return;
    }

    entries.push([
      assetRef,
      {
        sourceAssetRef: assetRef,
        watermarkTone: getWatermarkTone(image),
      },
    ]);
  });

  return Array.from(new Map(entries).values());
}

export function getNjuskaloImageSyncState(
  images?: SanityImageValue[] | null,
  njuskaloImages?: NjuskaloImageItem[] | null,
  watermarkVersion = NJUSKALO_WATERMARK_VERSION,
): NjuskaloImageSyncState {
  const sourceSignatures = getSourceImageSignatures(images);
  const sourceRefs = sourceSignatures.map((item) => item.sourceAssetRef);
  const sourceRefSet = new Set(sourceRefs);
  const sourceToneByRef = new Map(
    sourceSignatures.map((item) => [item.sourceAssetRef, item.watermarkTone]),
  );
  const syncedRefs = new Set(
    (njuskaloImages || [])
      .filter(
        (item) =>
          item.sourceAssetRef &&
          getAssetRef(item.image) &&
          item.watermarkVersion === watermarkVersion &&
          item.watermarkTone === sourceToneByRef.get(item.sourceAssetRef),
      )
      .map((item) => item.sourceAssetRef as string),
  );
  const missingRefs = sourceRefs.filter(
    (sourceRef) => !syncedRefs.has(sourceRef),
  );
  const staleRefs = (njuskaloImages || [])
    .filter(
      (item) =>
        item.sourceAssetRef &&
        (!sourceRefSet.has(item.sourceAssetRef) ||
          item.watermarkVersion !== watermarkVersion ||
          item.watermarkTone !== sourceToneByRef.get(item.sourceAssetRef)),
    )
    .map((item) => item.sourceAssetRef as string);

  return {
    sourceCount: sourceRefs.length,
    syncedCount: sourceRefs.length - missingRefs.length,
    missingCount: missingRefs.length,
    missingRefs,
    staleRefs,
    isReady:
      sourceRefs.length > 0 &&
      missingRefs.length === 0 &&
      staleRefs.length === 0,
  };
}
