import { defineField, defineType } from 'sanity';

export const recentPostsSection = defineType({
  name: 'recentPostsSection',
  title: 'Recent Posts Section',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'localeString',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'viewAllLabel',
      title: 'View All Label',
      type: 'localeString',
      validation: (rule) => rule.required(),
    }),
  ],
  preview: {
    prepare() {
      return {
        title: "Recent Posts Section",
      };
    },
  },
});
