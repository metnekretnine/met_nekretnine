import { SanityImageSource } from "@sanity/image-url/lib/types/types";
import { PortableTextBlock } from "@portabletext/types";
import { defineField, defineType } from "sanity";

export interface ContentImage {
  image: SanityImageSource;
  alt: string;
}

export interface ContentSectionCMS {
  text: PortableTextBlock[];
  image?: ContentImage;
}

export const contentSection = defineType({
  name: "contentSection",
  title: "Content Section",
  type: "object",
  fields: [
    defineField({
      name: "text",
      title: "Text",
      type: "localeRichText",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "image",
      title: "Image",
      type: "image",
      options: { hotspot: true },
    }),
    defineField({
      name: "imageAlt",
      title: "Image Alt Text",
      type: "localeString",
      hidden: ({ parent }) => !parent?.image?.asset,
    }),
  ],
  preview: {
    select: {
      title: "text.hr",
      media: "image",
    },
    prepare({ title, media }) {
      const firstBlock = (title || []).find(
        (block: { _type: string }) => block._type === "block",
      );
      return {
        title: firstBlock
          ? firstBlock.children.map((c: { text: string }) => c.text).join("")
          : "No text",
        media,
      };
    },
  },
});
