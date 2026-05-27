import { defineField, defineType } from "sanity";

export const footerSection = defineType({
  name: "footerSection",
  title: "Footer",
  type: "document",
  fields: [
    defineField({
      name: "companyName",
      title: "Company Name",
      type: "localeString",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "tagline",
      title: "Tagline",
      type: "localeString",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "linkedin",
      title: "LinkedIn",
      type: "object",
      fields: [
        defineField({
          name: "href",
          title: "Href",
          type: "string",
          validation: (rule) => rule.required(),
        }),
        defineField({
          name: "ariaLabel",
          title: "Aria Label",
          type: "string",
          validation: (rule) => rule.required(),
        }),
      ],
    }),
    defineField({
      name: "instagram",
      title: "Instagram",
      type: "object",
      fields: [
        defineField({
          name: "href",
          title: "Href",
          type: "string",
          validation: (rule) => rule.required(),
        }),
        defineField({
          name: "ariaLabel",
          title: "Aria Label",
          type: "string",
          validation: (rule) => rule.required(),
        }),
      ],
    }),
    defineField({
      name: "sections",
      title: "Sections",
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
              name: "links",
              title: "Links",
              type: "array",
              of: [
                {
                  type: "object",
                  fields: [
                    defineField({
                      name: "text",
                      title: "Text",
                      type: "localeString",
                      validation: (rule) => rule.required(),
                    }),
                    defineField({
                      name: "href",
                      title: "Href",
                      type: "string",
                      validation: (rule) => rule.required(),
                    }),
                  ],
                },
              ],
            }),
          ],
          preview: {
            select: {
              title: "title.hr",
            },
          },
        },
      ],
    }),
    defineField({
      name: "copyright",
      title: "Copyright",
      type: "localeString",
      validation: (rule) => rule.required(),
    }),
  ],
  preview: {
    prepare() {
      return {
        title: "Footer",
      };
    },
  },
});
