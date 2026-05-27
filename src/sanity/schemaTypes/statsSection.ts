import { defineField, defineType } from 'sanity';

export const statsSection = defineType({
  name: 'statsSection',
  title: 'Stats Displayer',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'localeString',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'stats',
      title: 'Statistics',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            defineField({
              name: 'value',
              title: 'Value',
              type: 'number',
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: 'label',
              title: 'Label',
              type: 'localeString',
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: 'suffix',
              title: 'Suffix',
              type: 'string',
            }),
          ],
          preview: {
            select: {
              title: 'label.hr',
              subtitle: 'value',
            },
            prepare({ title, subtitle }) {
              return {
                title: title,
                subtitle: subtitle,
              };
            },
          },
        },
      ],
      validation: (rule) => rule.required().min(1).max(4),
    }),
  ],
  preview: {
    prepare() {
      return {
        title: "Stats Displayer",
      };
    },
  },
});
