"use client";

import { LaunchIcon } from "@sanity/icons";
import { Button, Card, Flex, Stack, Text } from "@sanity/ui";
import { useEffect, useMemo, useState } from "react";
import { useClient, useFormValue } from "sanity";
import { LISTING_LINK } from "@/lib/constants";

const API_VERSION = process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2024-01-01";

interface ListingDocumentValue {
  _id?: string;
}

function getPublishedId(documentId?: string) {
  return documentId?.replace(/^drafts\./, "");
}

function getBaseUrl() {
  const configuredBaseUrl =
    process.env.NODE_ENV === "production"
      ? process.env.NEXT_PUBLIC_BASE_URL_PROD
      : process.env.NEXT_PUBLIC_BASE_URL_DEV;

  return (configuredBaseUrl || "").replace(/\/$/, "");
}

export function ListingPublicLinkField() {
  const client = useClient({ apiVersion: API_VERSION });
  const document = useFormValue([]) as ListingDocumentValue | null;
  const [publishedSlug, setPublishedSlug] = useState<string | null>(null);

  const publishedId = useMemo(
    () => getPublishedId(document?._id),
    [document?._id],
  );

  useEffect(() => {
    if (!publishedId) {
      setPublishedSlug(null);
      return;
    }

    let cancelled = false;

    client
      .fetch<string | null>(
        `*[_id == $publishedId && _type == "listing"][0].slug.current`,
        { publishedId },
      )
      .then((slug) => {
        if (!cancelled) {
          setPublishedSlug(slug || null);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setPublishedSlug(null);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [client, publishedId]);

  if (!publishedSlug) {
    return null;
  }

  const publicUrl = `${getBaseUrl()}${LISTING_LINK}/${publishedSlug}`;

  return (
    <Card border padding={4} radius={3} tone="primary">
      <Flex align="center" gap={4} justify="space-between">
        <Stack space={2}>
          <Text size={1} weight="semibold">
            Objavljeni oglas
          </Text>
          <Text muted size={1}>
            {publicUrl}
          </Text>
        </Stack>
        <Button
          as="a"
          href={publicUrl}
          icon={LaunchIcon}
          mode="default"
          rel="noreferrer"
          target="_blank"
          text="Otvori oglas"
          tone="primary"
        />
      </Flex>
    </Card>
  );
}
