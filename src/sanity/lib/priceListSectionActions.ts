import { useState } from "react";
import { DocumentActionComponent, useClient } from "sanity";

// "Novi cjenik" works like a spreadsheet you copy before changing:
// the published price list is read-only, "Kreiraj novi cjenik" creates an
// editable draft copy, and "Objavi novi cjenik" publishes it. The two buttons
// never show together, so the next step is always the primary action.

const CreateNewPriceListAction: DocumentActionComponent = (props) => {
  const client = useClient({
    apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION!,
  });
  const [isCreating, setIsCreating] = useState(false);

  if (props.draft || !props.published) return null;

  const published = props.published;

  return {
    label: isCreating ? "Izrađujem novi cjenik…" : "Kreiraj novi cjenik",
    title:
      "Napravi kopiju aktualnog cjenika koju možete urediti i zatim objaviti.",
    tone: "primary",
    disabled: isCreating,
    onHandle: async () => {
      setIsCreating(true);
      try {
        await client.createIfNotExists({
          _id: `drafts.${props.id}`,
          _type: props.type,
          services: published.services,
        });
      } finally {
        setIsCreating(false);
        props.onComplete();
      }
    },
  };
};

function relabel(
  Action: DocumentActionComponent,
  label: string,
): DocumentActionComponent {
  const Relabeled: DocumentActionComponent = (props) => {
    const result = Action(props);
    return result && props.draft ? { ...result, label } : result;
  };

  Relabeled.action = Action.action;

  return Relabeled;
}

export function priceListSectionActions(
  previousActions: DocumentActionComponent[],
): DocumentActionComponent[] {
  const publish = previousActions.find((action) => action.action === "publish");
  const discard = previousActions.find(
    (action) => action.action === "discardChanges",
  );

  return [
    CreateNewPriceListAction,
    ...(publish ? [relabel(publish, "Objavi novi cjenik")] : []),
    ...(discard ? [relabel(discard, "Odbaci novi cjenik")] : []),
  ];
}
