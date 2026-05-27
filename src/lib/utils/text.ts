import { PortableTextBlock } from "@portabletext/types";

export function portableToText(
  blocks: PortableTextBlock[] | string | undefined
): string {
  if (!blocks) {
    return "";
  }

  if (typeof blocks === "string") {
    return blocks;
  }

  if (!Array.isArray(blocks) || blocks.length === 0) {
    return "";
  }

  return blocks
    .map((block) => {
      if (block._type !== "block" || !block.children) {
        return "";
      }
      return block.children.map((span) => span.text).join("");
    })
    .join("\n\n");
}
