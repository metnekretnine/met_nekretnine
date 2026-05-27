"use client";

/* eslint-disable @next/next/no-img-element */

import { Button, Card, Stack, Text } from "@sanity/ui";
import { useClient, useFormValue } from "sanity";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import type { ReactNode } from "react";
import { LogoCompany } from "@/components/Icons/LogoCompany";
import {
  getAssetRef,
  getNjuskaloImageSyncState,
  getSourceImageSignatures,
  getSourceImageRefs,
  NJUSKALO_WATERMARK_VERSION,
  type NjuskaloImageItem,
  type NjuskaloWatermarkTone,
  type SanityImageValue,
} from "@/lib/njuskaloImageSync";

const API_VERSION = process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2024-01-01";
const PROJECT_ID = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const DATASET = process.env.NEXT_PUBLIC_SANITY_DATASET;
const WATERMARK_OPACITY = 0.7;
const WATERMARK_MARGIN_RATIO = 0.045;
const WATERMARK_LOGO_WIDTH_RATIO = 0.09;
const WATERMARK_JPEG_QUALITY = 1;
const WATERMARK_COLOR_BY_TONE: Record<NjuskaloWatermarkTone, string> = {
  white: "#FFFFFF",
  dark: "#2E2E2E",
};
const WATERMARK_LOGO_ASPECT_RATIO = 397 / 1145;

interface ListingImagesInputProps {
  value?: unknown[];
  renderDefault: (props: never) => ReactNode;
}

interface PreviewItem {
  sourceAssetRef: string;
  watermarkTone: NjuskaloWatermarkTone;
  blob: Blob;
  previewUrl: string;
}

interface NjuskaloReadonlyItem {
  assetRef: string;
  hasSource: boolean;
  isCurrent: boolean;
  key: string;
  sourceAssetRef: string;
  url: string;
  watermarkTone?: NjuskaloWatermarkTone;
}

function getSanityImageUrl(assetRef: string) {
  const match = assetRef.match(/^image-([a-f0-9]+)-(\d+x\d+)-(\w+)$/);

  if (!match || !PROJECT_ID || !DATASET) {
    return null;
  }

  return `https://cdn.sanity.io/images/${PROJECT_ID}/${DATASET}/${match[1]}-${match[2]}.${match[3]}`;
}

function getStableKey(sourceAssetRef: string) {
  return `njuskalo-${sourceAssetRef.replace(/[^a-zA-Z0-9]/g, "-")}`;
}

function getSignatureKey(item: {
  sourceAssetRef: string;
  watermarkTone: NjuskaloWatermarkTone;
}) {
  return `${item.sourceAssetRef}:${item.watermarkTone}`;
}

function getSvgDataUrl(svgMarkup: string) {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgMarkup)}`;
}

function getLogoCompanyDataUrl(
  width: number,
  height: number,
  tone: NjuskaloWatermarkTone,
) {
  return getSvgDataUrl(
    renderToStaticMarkup(
      <LogoCompany
        width={width}
        height={height}
        primaryColor={WATERMARK_COLOR_BY_TONE[tone]}
      />,
    ),
  );
}

async function loadImage(url: string) {
  return await new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Image could not be loaded."));
    image.src = url;
  });
}

async function createWatermarkedBlob(
  imageUrl: string,
  tone: NjuskaloWatermarkTone,
) {
  const image = await loadImage(imageUrl);
  const canvas = document.createElement("canvas");
  canvas.width = image.naturalWidth;
  canvas.height = image.naturalHeight;

  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("Canvas context could not be created.");
  }

  context.drawImage(image, 0, 0);

  const marginX = Math.round(canvas.width * WATERMARK_MARGIN_RATIO);
  const marginY = Math.round(canvas.height * WATERMARK_MARGIN_RATIO);
  const logoWidth = Math.round(canvas.width * WATERMARK_LOGO_WIDTH_RATIO);
  const logoHeight = Math.round(
    logoWidth * WATERMARK_LOGO_ASPECT_RATIO,
  );
  const logo = await loadImage(
    getLogoCompanyDataUrl(logoWidth, logoHeight, tone),
  );

  context.save();
  context.globalAlpha = WATERMARK_OPACITY;
  context.drawImage(
    logo,
    canvas.width - marginX - logoWidth,
    marginY,
    logoWidth,
    logoHeight,
  );
  context.restore();

  return await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error("Watermarked image could not be created."));
        }
      },
      "image/jpeg",
      WATERMARK_JPEG_QUALITY,
    );
  });
}

function revokePreviewItems(items: PreviewItem[]) {
  items.forEach((item) => {
    URL.revokeObjectURL(item.previewUrl);
  });
}

export function ListingImagesInput(props: ListingImagesInputProps) {
  const client = useClient({ apiVersion: API_VERSION });
  const document = useFormValue([]) as {
    _id?: string;
    njuskaloImages?: NjuskaloImageItem[];
  } | null;
  const [actionStatus, setActionStatus] = useState<string | null>(null);
  const [isPreparingPreview, setIsPreparingPreview] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [previewItems, setPreviewItems] = useState<PreviewItem[]>([]);
  const previewItemsRef = useRef<PreviewItem[]>([]);
  const orphanCleanupKeyRef = useRef("");

  const documentId = document?._id;
  const images = useMemo(
    () => (props.value || []) as SanityImageValue[],
    [props.value],
  );
  const sourceRefs = useMemo(
    () => getSourceImageRefs(images),
    [images],
  );
  const sourceSignatures = useMemo(
    () => getSourceImageSignatures(images),
    [images],
  );
  const sourceSignaturesKey = sourceSignatures
    .map((item) => `${item.sourceAssetRef}:${item.watermarkTone}`)
    .join("|");
  const existingItems = useMemo(
    () => document?.njuskaloImages || [],
    [document?.njuskaloImages],
  );
  const existingRefsKey = existingItems
    .map(
      (item) =>
        `${item.sourceAssetRef || ""}:${getAssetRef(item.image)}:${item.watermarkVersion || "legacy"}:${item.watermarkTone || "legacy"}`,
    )
    .join("|");
  const existingBySignature = useMemo(
    () =>
      new Map(
        existingItems
          .filter(
            (item) =>
              Boolean(item.sourceAssetRef) &&
              item.watermarkVersion === NJUSKALO_WATERMARK_VERSION,
          )
          .map((item) => [
            `${item.sourceAssetRef}:${item.watermarkTone || "legacy"}`,
            item,
          ]),
      ),
    [existingItems],
  );
  const currentSourceSet = useMemo(() => new Set(sourceRefs), [sourceRefs]);
  const currentToneBySource = useMemo(
    () =>
      new Map(
        sourceSignatures.map((item) => [
          item.sourceAssetRef,
          item.watermarkTone,
        ]),
      ),
    [sourceSignatures],
  );
  const staleItems = useMemo(
    () =>
      existingItems.filter(
        (item) =>
          item.sourceAssetRef &&
          (!currentSourceSet.has(item.sourceAssetRef) ||
            item.watermarkVersion !== NJUSKALO_WATERMARK_VERSION ||
            item.watermarkTone !== currentToneBySource.get(item.sourceAssetRef)),
      ),
    [currentSourceSet, currentToneBySource, existingItems],
  );
  const orphanedItems = useMemo(
    () =>
      existingItems.filter(
        (item) =>
          item.sourceAssetRef && !currentSourceSet.has(item.sourceAssetRef),
      ),
    [currentSourceSet, existingItems],
  );
  const orphanedItemsKey = orphanedItems
    .map(
      (item) =>
        `${item.sourceAssetRef || ""}:${getAssetRef(item.image) || ""}`,
    )
    .join("|");
  const sourceOrder = useMemo(
    () => new Map(sourceRefs.map((sourceRef, index) => [sourceRef, index])),
    [sourceRefs],
  );
  const readonlyNjuskaloItems = useMemo(
    () =>
      existingItems
        .map<NjuskaloReadonlyItem | null>((item) => {
          const sourceAssetRef = item.sourceAssetRef || "";
          const assetRef = getAssetRef(item.image);
          const url = assetRef ? getSanityImageUrl(assetRef) : null;

          if (!sourceAssetRef || !assetRef || !url) {
            return null;
          }

          const hasSource = currentSourceSet.has(sourceAssetRef);

          return {
            assetRef,
            hasSource,
            isCurrent:
              hasSource &&
              item.watermarkVersion === NJUSKALO_WATERMARK_VERSION &&
              item.watermarkTone === currentToneBySource.get(sourceAssetRef),
            key: `${sourceAssetRef}:${assetRef}`,
            sourceAssetRef,
            url,
            watermarkTone: item.watermarkTone,
          };
        })
        .filter((item): item is NjuskaloReadonlyItem => Boolean(item))
        .sort(
          (itemA, itemB) =>
            (sourceOrder.get(itemA.sourceAssetRef) ?? Number.MAX_SAFE_INTEGER) -
            (sourceOrder.get(itemB.sourceAssetRef) ?? Number.MAX_SAFE_INTEGER),
        ),
    [currentSourceSet, currentToneBySource, existingItems, sourceOrder],
  );
  const missingSignatures = useMemo(
    () =>
      sourceSignatures.filter(
        (item) => !existingBySignature.has(getSignatureKey(item)),
      ),
    [existingBySignature, sourceSignatures],
  );
  const missingSignaturesKey = missingSignatures.map(getSignatureKey).join("|");
  const previewItemsKey = previewItems.map(getSignatureKey).join("|");
  const isPreviewReady =
    missingSignatures.length === 0 ||
    (previewItems.length === missingSignatures.length &&
      previewItemsKey === missingSignaturesKey);
  const needsUpdate = missingSignatures.length > 0 || staleItems.length > 0;
  const njuskaloImageSyncState = useMemo(
    () =>
      getNjuskaloImageSyncState(
        images,
        existingItems,
        NJUSKALO_WATERMARK_VERSION,
      ),
    [existingItems, images],
  );
  const persistentStatus = useMemo(() => {
    if (njuskaloImageSyncState.sourceCount === 0) {
      return {
        message:
          "Status Njuškalo slika: nema dodanih slika. Njuškalo sync nije moguć.",
        tone: "caution" as const,
      };
    }

    if (njuskaloImageSyncState.isReady) {
      return {
        message: `Status Njuškalo slika: spremno (${njuskaloImageSyncState.syncedCount}/${njuskaloImageSyncState.sourceCount} watermark verzija).`,
        tone: "positive" as const,
      };
    }

    const staleCount = njuskaloImageSyncState.staleRefs.length;

    if (njuskaloImageSyncState.missingCount > 0 && staleCount > 0) {
      return {
        message: `Status Njuškalo slika: nedostaje ${njuskaloImageSyncState.missingCount}/${njuskaloImageSyncState.sourceCount} watermark verzija i postoji ${staleCount} zastarjelih verzija. Prikažite preview pa potvrdite kreiranje.`,
        tone: "caution" as const,
      };
    }

    if (staleCount > 0 && njuskaloImageSyncState.missingCount === 0) {
      return {
        message: `Status Njuškalo slika: postoji ${staleCount} zastarjelih watermark verzija. Potvrdite ažuriranje prije Njuškalo synca.`,
        tone: "caution" as const,
      };
    }

    return {
      message: `Status Njuškalo slika: nedostaje ${njuskaloImageSyncState.missingCount}/${njuskaloImageSyncState.sourceCount} watermark verzija. Njuškalo sync nije moguć dok se sve ne generira.`,
      tone: "caution" as const,
    };
  }, [njuskaloImageSyncState]);
  const statusTone =
    actionStatus?.startsWith("Nije") || actionStatus?.startsWith("Greška")
      ? ("critical" as const)
      : actionStatus?.includes("spreman") || actionStatus?.includes("kreirane")
        ? ("positive" as const)
        : actionStatus
          ? ("caution" as const)
          : persistentStatus.tone;

  useEffect(() => {
    previewItemsRef.current = previewItems;
  }, [previewItems]);

  useEffect(() => {
    return () => {
      revokePreviewItems(previewItemsRef.current);
    };
  }, []);

  const clearPreviewItems = useCallback(() => {
    revokePreviewItems(previewItemsRef.current);
    previewItemsRef.current = [];
    setPreviewItems([]);
  }, []);

  useEffect(() => {
    clearPreviewItems();
    setActionStatus(null);
  }, [clearPreviewItems, existingRefsKey, sourceSignaturesKey]);

  useEffect(() => {
    if (orphanedItems.length === 0) {
      orphanCleanupKeyRef.current = "";
      return;
    }

    if (!documentId || orphanCleanupKeyRef.current === orphanedItemsKey) {
      return;
    }

    let isCancelled = false;
    orphanCleanupKeyRef.current = orphanedItemsKey;

    const orphanedSourceRefs = new Set(
      orphanedItems
        .map((item) => item.sourceAssetRef)
        .filter((sourceRef): sourceRef is string => Boolean(sourceRef)),
    );
    const orphanedAssetRefs = orphanedItems
      .map((item) => getAssetRef(item.image))
      .filter(Boolean);
    const nextItems = existingItems.filter(
      (item) =>
        !item.sourceAssetRef || !orphanedSourceRefs.has(item.sourceAssetRef),
    );

    setActionStatus("Brisanje Njuškalo slika za obrisane originale...");

    client
      .patch(documentId)
      .set({ njuskaloImages: nextItems })
      .commit()
      .then(async () => {
        await Promise.all(
          orphanedAssetRefs.map(async (assetRef) => {
            await client.delete(assetRef).catch(() => null);
          }),
        );

        if (!isCancelled) {
          setActionStatus("Njuškalo slike za obrisane originale su obrisane.");
        }
      })
      .catch((error) => {
        console.error("Njuškalo orphan cleanup failed:", error);

        if (!isCancelled) {
          setActionStatus(
            "Greška: Njuškalo slike za obrisane originale nisu obrisane.",
          );
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [
    client,
    documentId,
    existingItems,
    orphanedItems,
    orphanedItemsKey,
  ]);

  const handlePreparePreview = useCallback(async () => {
    if (missingSignatures.length === 0) {
      setActionStatus("Nema novih watermark verzija za preview.");
      return;
    }

    setIsPreparingPreview(true);
    setActionStatus("Priprema preview watermarka...");
    clearPreviewItems();

    const nextPreviewItems: PreviewItem[] = [];

    try {
      for (const sourceImage of missingSignatures) {
        const imageUrl = getSanityImageUrl(sourceImage.sourceAssetRef);

        if (!imageUrl) {
          throw new Error("Sanity image URL could not be created.");
        }

        const blob = await createWatermarkedBlob(
          imageUrl,
          sourceImage.watermarkTone,
        );

        nextPreviewItems.push({
          sourceAssetRef: sourceImage.sourceAssetRef,
          watermarkTone: sourceImage.watermarkTone,
          blob,
          previewUrl: URL.createObjectURL(blob),
        });
      }

      previewItemsRef.current = nextPreviewItems;
      setPreviewItems(nextPreviewItems);
      setActionStatus(
        "Preview je spreman. Ako watermark izgleda dobro, potvrdite kreiranje Njuškalo slika.",
      );
    } catch (error) {
      console.error("Njuškalo watermark preview failed:", error);
      revokePreviewItems(nextPreviewItems);
      setActionStatus("Nije moguće pripremiti preview watermarka.");
    } finally {
      setIsPreparingPreview(false);
    }
  }, [clearPreviewItems, missingSignatures]);

  const handleConfirmUpload = useCallback(async () => {
    if (!documentId) {
      setActionStatus("Nije moguće kreirati Njuškalo slike prije spremanja oglasa.");
      return;
    }

    if (missingSignatures.length > 0 && !isPreviewReady) {
      setActionStatus("Prvo prikažite preview watermarka, zatim potvrdite kreiranje.");
      return;
    }

    const previewBySignature = new Map(
      previewItems.map((item) => [getSignatureKey(item), item]),
    );
    const nextItems: NjuskaloImageItem[] = [];
    const uploadedAssetIds: string[] = [];

    setIsUploading(true);
    setActionStatus("Kreiranje Njuškalo watermark slika...");

    try {
      for (const sourceImage of sourceSignatures) {
        const existingItem = existingBySignature.get(getSignatureKey(sourceImage));

        if (existingItem) {
          nextItems.push(existingItem);
          continue;
        }

        const previewItem = previewBySignature.get(getSignatureKey(sourceImage));

        if (!previewItem) {
          throw new Error("Missing confirmed watermark preview.");
        }

        const asset = await client.assets.upload("image", previewItem.blob, {
          filename: `${getStableKey(sourceImage.sourceAssetRef)}-${sourceImage.watermarkTone}-${NJUSKALO_WATERMARK_VERSION}.jpg`,
        });
        uploadedAssetIds.push(asset._id);

        nextItems.push({
          _key: getStableKey(sourceImage.sourceAssetRef),
          _type: "object",
          sourceAssetRef: sourceImage.sourceAssetRef,
          watermarkTone: sourceImage.watermarkTone,
          watermarkVersion: NJUSKALO_WATERMARK_VERSION,
          image: {
            _type: "image",
            asset: {
              _type: "reference",
              _ref: asset._id,
            },
          },
        });
      }

      await client.patch(documentId).set({ njuskaloImages: nextItems }).commit();

      await Promise.all(
        staleItems.map(async (item) => {
          const assetRef = getAssetRef(item.image);

          if (assetRef) {
            await client.delete(assetRef).catch(() => null);
          }
        }),
      );

      clearPreviewItems();
      setActionStatus("Njuškalo watermark slike su kreirane i povezane s oglasom.");
    } catch (error) {
      console.error("Njuškalo image upload failed:", error);
      await Promise.all(
        uploadedAssetIds.map(async (assetId) => {
          await client.delete(assetId).catch(() => null);
        }),
      );
      setActionStatus("Greška: Njuškalo watermark slike nisu kreirane.");
    } finally {
      setIsUploading(false);
    }
  }, [
    clearPreviewItems,
    client,
    documentId,
    existingBySignature,
    isPreviewReady,
    missingSignatures.length,
    previewItems,
    sourceSignatures,
    staleItems,
  ]);

  return (
    <Stack data-listing-images-input="" space={3}>
      <style>
        {`
          [data-listing-images-input] img {
            object-fit: contain !important;
            object-position: center center !important;
          }
        `}
      </style>
      {props.renderDefault(props as never)}
      <Card border padding={4} radius={3}>
        <Stack space={4}>
          <Stack space={2}>
            <Text size={1} weight="semibold">
              Njuškalo watermark slike
            </Text>
            <Text muted size={1}>
              Verzije samo za pregled koje se koriste za Njuškalo feed.
            </Text>
          </Stack>

          {readonlyNjuskaloItems.length > 0 ? (
            <div
              style={{
                display: "grid",
                gap: 12,
                gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
              }}
            >
              {readonlyNjuskaloItems.map((item) => (
                <Card
                  border
                  key={item.key}
                  padding={2}
                  radius={2}
                  tone={item.isCurrent ? "default" : "caution"}
                >
                  <Stack space={2}>
                    <a
                      href={item.url}
                      rel="noreferrer"
                      target="_blank"
                      style={{
                        alignItems: "center",
                        background: "#0f1117",
                        borderRadius: 6,
                        display: "flex",
                        height: 220,
                        justifyContent: "center",
                        overflow: "hidden",
                        width: "100%",
                      }}
                    >
                      <img
                        alt=""
                        src={item.url}
                        style={{
                          display: "block",
                          maxHeight: "100%",
                          maxWidth: "100%",
                          objectFit: "contain",
                        }}
                      />
                    </a>
                    <Text muted size={1}>
                      {item.watermarkTone === "white"
                        ? "Bijeli watermark"
                        : "Tamnosivi watermark"}
                      {" · "}
                      {item.isCurrent
                        ? "Spremna"
                        : item.hasSource
                          ? "Treba ažuriranje"
                          : "Original obrisan"}
                    </Text>
                  </Stack>
                </Card>
              ))}
            </div>
          ) : (
            <Text muted size={1}>
              Nema kreiranih Njuškalo watermark slika.
            </Text>
          )}
        </Stack>
      </Card>
      <Card padding={3} radius={2} tone={statusTone}>
        <Text size={1}>{actionStatus || persistentStatus.message}</Text>
      </Card>
      {needsUpdate && (
        <Card border padding={4} radius={3}>
          <Stack space={4}>
            <Stack space={2}>
              <Text size={1} weight="semibold">
                Njuškalo watermark preview
              </Text>
              <Text muted size={1}>
                Preview se priprema lokalno u browseru. Sanity asset se kreira tek nakon potvrde.
              </Text>
            </Stack>

            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {missingSignatures.length > 0 && (
                <Button
                  disabled={isPreparingPreview || isUploading}
                  mode="ghost"
                  onClick={handlePreparePreview}
                  text={
                    isPreparingPreview
                      ? "Priprema preview..."
                      : "Prikaži preview watermarka"
                  }
                  tone="primary"
                />
              )}
              <Button
                disabled={
                  isPreparingPreview ||
                  isUploading ||
                  !documentId ||
                  !isPreviewReady
                }
                onClick={handleConfirmUpload}
                text={
                  isUploading
                    ? "Kreiranje..."
                    : missingSignatures.length > 0
                      ? "Potvrdi i kreiraj Njuškalo slike"
                      : "Potvrdi ažuriranje Njuškalo slika"
                }
                tone="primary"
              />
            </div>

            {previewItems.length > 0 && (
              <div
                style={{
                  display: "grid",
                  gap: 12,
                  gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
                }}
              >
                {previewItems.map((item) => (
                  <Card
                    border
                    key={getSignatureKey(item)}
                    padding={2}
                    radius={2}
                  >
                    <Stack space={2}>
                      <a
                        href={item.previewUrl}
                        rel="noreferrer"
                        target="_blank"
                        style={{
                          alignItems: "center",
                          background: "#0f1117",
                          borderRadius: 6,
                          display: "flex",
                          height: 220,
                          justifyContent: "center",
                          overflow: "hidden",
                          width: "100%",
                        }}
                      >
                        <img
                          alt=""
                          src={item.previewUrl}
                          style={{
                            display: "block",
                            maxHeight: "100%",
                            maxWidth: "100%",
                            objectFit: "contain",
                          }}
                        />
                      </a>
                      <Text muted size={1}>
                        {item.watermarkTone === "white"
                          ? "Bijeli watermark"
                          : "Tamnosivi watermark"}
                      </Text>
                    </Stack>
                  </Card>
                ))}
              </div>
            )}
          </Stack>
        </Card>
      )}
    </Stack>
  );
}
