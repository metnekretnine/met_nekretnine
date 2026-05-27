import { defineField, defineType } from 'sanity';

export const categoriesFilterSection = defineType({
  name: 'categoriesFilterSection',
  title: 'Categories Filter Displayer',
  type: 'document',
  fields: [
    defineField({
      name: 'allCategoriesText',
      title: 'All Categories Text',
      type: 'localeString',
      validation: (rule) => rule.required(),
    }),
  ],
  preview: {
    prepare() {
      return {
        title: "Categories Filter Displayer",
      };
    },
  },
});
