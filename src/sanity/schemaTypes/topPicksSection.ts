import { defineField, defineType } from 'sanity';

export const topPicksSection = defineType({
  name: 'topPicksSection',
  title: 'Top Picks Displayer',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'localeString',
      validation: (rule) => rule.required(),
    }),
  ],
  preview: {
    prepare() {
      return {
        title: "Top Picks Displayer",
      };
    },
  },
});
