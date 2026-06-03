import { Button, Flex, Stack, Text } from "@sanity/ui";
import { useCallback, useEffect, useState } from "react";
import { set, StringInputProps, useClient, useFormValue } from "sanity";
import { generateListingCode } from "@/lib/listingCode";

const API_VERSION = process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2024-01-01";
const MAX_GENERATION_ATTEMPTS = 30;

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

export function CodeInputSanity(props: StringInputProps) {
  const { onChange, value, readOnly } = props;
  const client = useClient({ apiVersion: API_VERSION });
  const document = useFormValue([]) as { _id?: string } | null;
  const [message, setMessage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const documentId = typeof document?._id === "string" ? document._id : undefined;

  const generateUniqueCode = useCallback(async () => {
    const { draftId, publishedId } = getDocumentIds(documentId);

    for (let attempt = 0; attempt < MAX_GENERATION_ATTEMPTS; attempt += 1) {
      const code = generateListingCode();
      const duplicateCount = await client.fetch<number>(
        `count(*[_type == "listing" && code == $code && !(_id in [$draftId, $publishedId])])`,
        { code, draftId, publishedId },
      );

      if (duplicateCount === 0) {
        return code;
      }
    }

    throw new Error("Unique listing code could not be generated.");
  }, [client, documentId]);

  useEffect(() => {
    if (value || readOnly) {
      return;
    }

    let cancelled = false;

    setIsGenerating(true);

    generateUniqueCode()
      .then((code) => {
        if (!cancelled) {
          onChange(set(code));
          setMessage(null);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setMessage("Nije moguće automatski generirati šifru.");
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIsGenerating(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [generateUniqueCode, onChange, readOnly, value]);

  const handleGenerate = useCallback(() => {
    setMessage("Generiranje šifre...");
    setIsGenerating(true);

    generateUniqueCode()
      .then((code) => {
        onChange(set(code));
        setMessage(null);
      })
      .catch(() => {
        setMessage("Nije moguće generirati jedinstvenu šifru.");
      })
      .finally(() => {
        setIsGenerating(false);
      });
  }, [generateUniqueCode, onChange]);

  return (
    <Stack space={3}>
      {props.renderDefault({ ...props, readOnly: true })}
      {message && (
        <Text size={1} muted>
          {message}
        </Text>
      )}
      {!value && (
        <Flex>
          <Button
            text={isGenerating ? "Generiranje..." : "Generiraj šifru"}
            tone="primary"
            mode="ghost"
            disabled={readOnly || isGenerating}
            onClick={handleGenerate}
          />
        </Flex>
      )}
    </Stack>
  );
}
