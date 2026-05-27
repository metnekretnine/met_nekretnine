import { defineField, defineType } from "sanity";

export const clientsSection = defineType({
  name: "clientsSection",
  title: "Clients Displayer",
  type: "document",
  hidden: true,
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'localeString',
    }),
    defineField({
      name: 'logos',
      title: 'Logos',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            defineField({
              name: 'image',
              title: 'Image',
              type: 'image',
              options: {
                hotspot: true,
              },
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: 'imageAlt',
              title: 'Image Alt Text',
              type: 'localeString',
              validation: (rule) => rule.required(),
            }),
          ],
          preview: {
            select: {
              title: 'imageAlt.hr',
              media: 'image',
            },
            prepare({ title, media }) {
              return {
                title: title,
                media: media,
              };
            },
          },
        },
      ],
    }),
  ],
  preview: {
    prepare() {
      return {
        title: "Clients Displayer",
      };
    },
  },
});
