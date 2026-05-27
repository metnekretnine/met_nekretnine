import { defineField, defineType } from 'sanity';

export const blogPostsSection = defineType({
  name: 'blogPostsSection',
  title: 'Blog Posts Displayer',
  type: 'document',
  fields: [
    defineField({
      name: 'noArticlesFoundText',
      title: 'No Articles Found Text',
      type: 'localeString',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'loadMoreButtonText',
      title: 'Load More Button Text',
      type: 'localeString',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'loadingButtonText',
      title: 'Loading Button Text',
      type: 'localeString',
      validation: (rule) => rule.required(),
    }),
  ],
  preview: {
    prepare() {
      return {
        title: "Blog Posts Displayer",
      };
    },
  },
});
