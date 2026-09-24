import { useEffect, useState } from "react";
import { DocumentActionComponent, useClient } from "sanity";
import {
  getVersionDeleteBlock,
  PriceListVersionTimelineItem,
  VersionDeleteBlock,
} from "@/lib/price-list/retention";

type DeleteBlock = "loading" | NonNullable<VersionDeleteBlock> | null;

const blockedTitles: Record<Exclude<DeleteBlock, null>, string> = {
  loading: "Provjera može li se verzija obrisati…",
  current:
    "Aktualna verzija cjenika ne može se obrisati jer se preuzima kao aktualni CSV.",
  retention:
    "Prethodna verzija mora ostati javno dostupna najmanje 30 dana nakon zamjene.",
};

// Read-only archive: only deletion is allowed, and only for versions the
// public CSV no longer needs.
export function withPriceListSnapshotDeleteGuard(
  DeleteAction: DocumentActionComponent,
): DocumentActionComponent {
  const GuardedDeleteAction: DocumentActionComponent = (props) => {
    const result = DeleteAction(props);
    const client = useClient({
      apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION!,
    });
    const [block, setBlock] = useState<DeleteBlock>("loading");
    const documentId = props.id.replace(/^drafts\./, "");

    useEffect(() => {
      let active = true;

      client
        .fetch<PriceListVersionTimelineItem[]>(
          `*[_type == "priceListSnapshot"] | order(publishedAt desc) { _id, publishedAt }`,
        )
        .then((timeline) => {
          if (active) setBlock(getVersionDeleteBlock(timeline, documentId));
        })
        .catch(() => active && setBlock(null));

      return () => {
        active = false;
      };
    }, [client, documentId]);

    if (!result || !block) return result;

    return { ...result, disabled: true, title: blockedTitles[block] };
  };

  GuardedDeleteAction.action = DeleteAction.action;

  return GuardedDeleteAction;
}
