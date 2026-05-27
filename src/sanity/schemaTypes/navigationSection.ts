import { defineField, defineType } from "sanity";

export const navigationSection = defineType({
  name: "navigationSection",
  title: "Navigation Section",
  type: "document",
  fields: [
    defineField({
      name: "links",
      title: "Navigation Links",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            defineField({
              name: "title",
              title: "Title",
              type: "localeString",
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: "href",
              title: "Link (e.g., /about)",
              type: "string",
              validation: (rule) => rule.required(),
            }),
          ],
        },
      ],
    }),
    defineField({
      name: "ctaButton",
      title: "CTA Button",
      type: "object",
      fields: [
        defineField({
          name: "title",
          title: "Title",
          type: "localeString",
          validation: (rule) => rule.required(),
        }),
        defineField({
          name: "href",
          title: "Link (e.g., /kontakt)",
          type: "string",
          validation: (rule) => rule.required(),
        }),
      ],
    }),
  ],
  preview: {
    prepare() {
      return {
        title: "Navigation Section",
      };
    },
  },
});
