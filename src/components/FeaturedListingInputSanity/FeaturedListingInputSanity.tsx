import { Stack, Text } from "@sanity/ui";
import { useEffect, useState } from "react";
import { BooleanInputProps, useClient, useFormValue } from "sanity";
import {
  FEATURED_LISTINGS_COUNT_QUERY,
  MAX_FEATURED_LISTINGS,
} from "@/lib/featuredListings";

const API_VERSION = process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2024-01-01";

function getDocumentIds(documentId?: string) {
  const publishedId = documentId?.replace(/^drafts\./, "");

  if (!publishedId) {
    return { draftId: undefined, publishedId: undefined };
  }

  return {
    draftId: `drafts.${publishedId}`,
    publishedId,
  };
}

export function FeaturedListingInputSanity(props: BooleanInputProps) {
  const client = useClient({ apiVersion: API_VERSION });
  const document = useFormValue([]) as { _id?: string } | null;
  const [featuredCount, setFeaturedCount] = useState<number | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const documentId = typeof document?._id === "string" ? document._id : undefined;
  const isDisabled =
    props.value !== true &&
    featuredCount !== null &&
    featuredCount >= MAX_FEATURED_LISTINGS;

  useEffect(() => {
    let cancelled = false;
    const { draftId, publishedId } = getDocumentIds(documentId);

    client
      .fetch<number>(FEATURED_LISTINGS_COUNT_QUERY, { draftId, publishedId })
      .then((count) => {
        if (!cancelled) {
          setFeaturedCount(count);
          setMessage(null);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setMessage("Nije moguće provjeriti broj istaknutih nekretnina.");
        }
      });

    return () => {
      cancelled = true;
    };
  }, [client, documentId]);

  return (
    <Stack space={3}>
      {props.renderDefault({
        ...props,
        readOnly: props.readOnly || isDisabled,
      })}
      {isDisabled && (
        <Text size={1} muted>
          Već su istaknute {MAX_FEATURED_LISTINGS} nekretnine. Uklonite oznaku s
          jedne nekretnine prije dodavanja nove.
        </Text>
      )}
      {message && (
        <Text size={1} muted>
          {message}
        </Text>
      )}
    </Stack>
  );
}
