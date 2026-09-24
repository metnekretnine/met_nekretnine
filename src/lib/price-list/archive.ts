import "server-only";

import { createHash } from "node:crypto";
import { writeClient } from "@/sanity/lib/writeClient";
import { buildPriceListFileName } from "./csv";
import { serviceFieldsProjection } from "./store";
import { PriceListServiceSource, PriceListSnapshotSource } from "./types";

interface PublishedPriceListSource {
  section: {
    _rev: string;
    _updatedAt: string;
    services?: PriceListServiceSource[];
  } | null;
  settings: {
    _rev: string;
    _updatedAt: string;
    locationType?: string;
    locationAddress?: string;
    locationCode?: string;
  } | null;
  latest: Pick<
    PriceListSnapshotSource,
    "_id" | "contentHash" | "storageNumber"
  > | null;
}

const publishedSourceQuery = `{
  "section": *[_id == "priceListSection"][0] {
    _rev,
    _updatedAt,
    ${serviceFieldsProjection}
  },
  "settings": *[_id == "priceListSettings"][0] {
    _rev,
    _updatedAt,
    locationType,
    locationAddress,
    locationCode
  },
  "latest": *[_type == "priceListSnapshot"] | order(storageNumber desc)[0] {
    _id,
    contentHash,
    storageNumber
  }
}`;

// GROQ projections return null for missing fields; Sanity forms reject null
// in typed fields, so empty values are left out of the stored version.
function withoutEmptyFields(
  services: PriceListServiceSource[],
): PriceListServiceSource[] {
  return services.map(
    (service) =>
      Object.fromEntries(
        Object.entries(service).filter(([, value]) => value != null),
      ) as PriceListServiceSource,
  );
}

// Stores the published price list as a new immutable version whenever its
// content changed. Runs before every read of the web component and the CSV,
// so it does not depend on webhooks (which cannot reach localhost either).
// Never throws: a failure must not break the page.
export async function ensurePriceListArchived(): Promise<void> {
  try {
    const { section, settings, latest } =
      await writeClient.fetch<PublishedPriceListSource>(
        publishedSourceQuery,
        {},
        { cache: "no-store" },
      );
    const { locationType, locationAddress, locationCode } = settings ?? {};

    if (
      !section?.services?.length ||
      !settings ||
      !locationType?.trim() ||
      !locationAddress?.trim() ||
      !locationCode?.trim()
    ) {
      return;
    }

    const contentHash = createHash("sha256")
      .update(
        JSON.stringify({
          locationType,
          locationAddress,
          locationCode,
          services: section.services,
        }),
      )
      .digest("hex");

    if (latest?.contentHash === contentHash) {
      return;
    }

    const storageNumber = (latest?.storageNumber ?? 0) + 1;
    const publishedAt =
      section._updatedAt > settings._updatedAt
        ? section._updatedAt
        : settings._updatedAt;
    const location = {
      locationType: locationType.trim(),
      locationAddress: locationAddress.trim(),
      locationCode: locationCode.trim(),
    };

    // The ID follows the storage number, so concurrent requests cannot create
    // two versions with the same number.
    const transaction = writeClient.transaction().createIfNotExists({
      _id: `priceListSnapshot.${storageNumber}`,
      _type: "priceListSnapshot",
      sourceRevision: `${section._rev}.${settings._rev}`,
      contentHash,
      publishedAt,
      storageNumber,
      fileName: buildPriceListFileName({
        ...location,
        storageNumber,
        publishedAt,
      }),
      ...location,
      services: withoutEmptyFields(section.services),
    });

    // The previous version only learns when it was replaced.
    if (latest) {
      transaction.patch(latest._id, (patch) =>
        patch.setIfMissing({ replacedAt: publishedAt }),
      );
    }

    await transaction.commit();
  } catch (error) {
    console.error("Price list archiving failed", error);
  }
}
