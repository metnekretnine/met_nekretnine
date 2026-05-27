import { defineField, defineType } from 'sanity';

export const blogCategoryPage = defineType({
  name: 'blogCategoryPage',
  title: 'Blog Category Page',
  type: 'document',
  fields: [
    defineField({
      name: 'metaDescription',
      title: 'Meta Description (Prefix for Category Name)',
      type: 'localeString',
      description: 'This will be prefixed to the category name (e.g., "Read our latest articles and news on [Category Name]").',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'metaOgImage',
      title: 'Meta Open Graph Image',
      type: 'image',
      options: {
        hotspot: true,
      },
    }),
  ],
  preview: {
    prepare() {
      return {
        title: "Blog Category Page",
      };
    },
  },
});
